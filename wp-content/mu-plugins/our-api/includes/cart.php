<?php
/**
 * Store API Cart Helpers & Session Synchronization.
 * Replaces CoCart with native WooCommerce Store API (/wc/store/v1/).
 *
 * @package OurAPI
 */

use Automattic\WooCommerce\StoreApi\SessionHandler as StoreApiSessionHandler;
use Automattic\WooCommerce\StoreApi\Utilities\CartTokenUtils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Filter session handler class for Store API requests to ensure StoreApiSessionHandler is always used.
 */
add_filter( 'woocommerce_session_handler', 'our_store_api_session_handler_class', 999 );
function our_store_api_session_handler_class( $handler ) {
	$is_store_api = false;

	if ( function_exists( 'WC' ) && WC()->is_store_api_request() ) {
		$is_store_api = true;
	} elseif ( ! empty( $GLOBALS['wp']->query_vars['rest_route'] ) && strpos( $GLOBALS['wp']->query_vars['rest_route'], '/wc/store/' ) === 0 ) {
		$is_store_api = true;
	} elseif ( isset( $_SERVER['REQUEST_URI'] ) && strpos( $_SERVER['REQUEST_URI'], '/wp-json/wc/store/' ) !== false ) {
		$is_store_api = true;
	}

	if ( $is_store_api && class_exists( 'Automattic\WooCommerce\StoreApi\SessionHandler' ) ) {
		return StoreApiSessionHandler::class;
	}

	return $handler;
}

/**
 * Handle Guest-to-User cart migration and persistent user Cart-Token resolution.
 */
add_action( 'rest_api_init', 'our_setup_store_api_cart_sync', 5 );
function our_setup_store_api_cart_sync() {
	$rest_route = isset( $_GET['rest_route'] ) ? $_GET['rest_route'] : ( isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '' );
	if ( strpos( $rest_route, '/wc/store/' ) === false ) {
		return;
	}

	// Check if user is authenticated via JWT Bearer
	$auth_header = isset( $_SERVER['HTTP_AUTHORIZATION'] ) ? $_SERVER['HTTP_AUTHORIZATION'] : ( isset( $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ) ? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] : '' );
	if ( $auth_header && preg_match( '/Bearer\s+(.*)$/i', $auth_header, $matches ) ) {
		$token   = trim( $matches[1] );
		$decoded = function_exists( 'our_validate_jwt' ) ? our_validate_jwt( $token ) : null;
		if ( $decoded && ! is_wp_error( $decoded ) && isset( $decoded->data->user->id ) ) {
			$user_id = (string) $decoded->data->user->id;
			wp_set_current_user( (int) $user_id );

			// Check incoming Cart-Token
			$incoming_cart_token = isset( $_SERVER['HTTP_CART_TOKEN'] ) ? trim( $_SERVER['HTTP_CART_TOKEN'] ) : '';
			$guest_customer_id   = '';

			if ( $incoming_cart_token && class_exists( 'Automattic\WooCommerce\StoreApi\Utilities\CartTokenUtils' ) ) {
				$payload = CartTokenUtils::get_cart_token_payload( $incoming_cart_token );
				if ( ! empty( $payload['user_id'] ) && strpos( (string) $payload['user_id'], 't_' ) === 0 ) {
					$guest_customer_id = (string) $payload['user_id'];
				}
			}

			// If a guest token was passed alongside JWT, merge guest cart into user cart session
			if ( $guest_customer_id ) {
				global $wpdb;
				$table = $wpdb->prefix . 'woocommerce_sessions';

				$guest_session = $wpdb->get_var( $wpdb->prepare( "SELECT session_value FROM {$table} WHERE session_key = %s", $guest_customer_id ) );
				$user_session  = $wpdb->get_var( $wpdb->prepare( "SELECT session_value FROM {$table} WHERE session_key = %s", $user_id ) );

				$guest_data = $guest_session ? maybe_unserialize( $guest_session ) : [];
				$user_data  = $user_session ? maybe_unserialize( $user_session ) : [];

				if ( ! empty( $guest_data['cart'] ) && is_array( $guest_data['cart'] ) ) {
					if ( empty( $user_data['cart'] ) || ! is_array( $user_data['cart'] ) ) {
						$user_data['cart'] = $guest_data['cart'];
					} else {
						foreach ( $guest_data['cart'] as $item_key => $item_val ) {
							if ( ! isset( $user_data['cart'][ $item_key ] ) ) {
								$user_data['cart'][ $item_key ] = $item_val;
							} else {
								$user_data['cart'][ $item_key ]['quantity'] += $item_val['quantity'];
							}
						}
					}

					if ( ! empty( $guest_data['applied_coupons'] ) && is_array( $guest_data['applied_coupons'] ) ) {
						$existing_coupons            = ! empty( $user_data['applied_coupons'] ) && is_array( $user_data['applied_coupons'] ) ? $user_data['applied_coupons'] : [];
						$user_data['applied_coupons'] = array_values( array_unique( array_merge( $existing_coupons, $guest_data['applied_coupons'] ) ) );
					}

					// Update user session and delete guest session
					$expiry = class_exists( 'Automattic\WooCommerce\StoreApi\Utilities\CartTokenUtils' ) ? CartTokenUtils::get_cart_token_expiration() : ( time() + 172800 );
					$wpdb->query(
						$wpdb->prepare(
							"INSERT INTO {$table} (`session_key`, `session_value`, `session_expiry`) VALUES (%s, %s, %d) ON DUPLICATE KEY UPDATE `session_value` = VALUES(`session_value`), `session_expiry` = VALUES(`session_expiry`)",
							$user_id,
							maybe_serialize( $user_data ),
							$expiry
						)
					);
					$wpdb->delete( $table, [ 'session_key' => $guest_customer_id ] );
				}
			}

			// Ensure Store API uses the user's persistent cart token
			if ( class_exists( 'Automattic\WooCommerce\StoreApi\Utilities\CartTokenUtils' ) ) {
				$_SERVER['HTTP_CART_TOKEN'] = CartTokenUtils::get_cart_token( $user_id );
			}
		}
	}
}

/**
 * For JWT-authenticated requests, bypass nonce verification if no Nonce header was provided.
 */
add_filter( 'woocommerce_store_api_disable_nonce_check', 'our_store_api_maybe_disable_nonce', 10 );
function our_store_api_maybe_disable_nonce( $disable ) {
	if ( is_user_logged_in() ) {
		return true;
	}
	return $disable;
}

/**
 * Smart normalizer for Store API add-to-cart data.
 * Accepts:
 *  - Variation product ID directly (e.g. id = 14) and auto-infers variation attributes if omitted.
 *  - Variation attributes formatted as key => value object (e.g. {"size": "L", "color": "Camel Melange"}).
 */
add_filter( 'woocommerce_store_api_add_to_cart_data', 'our_normalize_store_api_add_to_cart_data', 10, 2 );
function our_normalize_store_api_add_to_cart_data( $data, $request ) {
	$product_id = isset( $data['id'] ) ? absint( $data['id'] ) : 0;
	if ( ! $product_id ) {
		return $data;
	}

	$product = wc_get_product( $product_id );
	if ( ! $product ) {
		return $data;
	}

	// Normalize variation array if passed as key => value associative object
	if ( ! empty( $data['variation'] ) && is_array( $data['variation'] ) ) {
		$is_indexed = array_keys( $data['variation'] ) === range( 0, count( $data['variation'] ) - 1 );
		if ( ! $is_indexed ) {
			$formatted = [];
			foreach ( $data['variation'] as $attr => $val ) {
				$formatted[] = [
					'attribute' => (string) $attr,
					'value'     => (string) $val,
				];
			}
			$data['variation'] = $formatted;
		}
	}

	// If product is a variation but variation attributes are empty or incomplete
	if ( $product->is_type( 'variation' ) ) {
		$parent_id        = $product->get_parent_id();
		$parent_product   = wc_get_product( $parent_id );
		$var_attributes   = $product->get_variation_attributes();
		$existing_attrs   = [];

		if ( ! empty( $data['variation'] ) && is_array( $data['variation'] ) ) {
			foreach ( $data['variation'] as $item ) {
				if ( isset( $item['attribute'] ) ) {
					$clean_attr = strtolower( str_replace( 'attribute_', '', $item['attribute'] ) );
					$existing_attrs[ $clean_attr ] = $item['value'];
				}
			}
		}

		if ( $parent_product ) {
			$parent_attributes = $parent_product->get_attributes();
			$final_variation   = [];

			foreach ( $parent_attributes as $attr_slug => $attr_obj ) {
				$clean_slug = strtolower( str_replace( 'pa_', '', $attr_slug ) );

				// Check if supplied in request
				if ( isset( $existing_attrs[ $clean_slug ] ) ) {
					$final_variation[] = [
						'attribute' => $attr_slug,
						'value'     => $existing_attrs[ $clean_slug ],
					];
				} elseif ( isset( $var_attributes[ 'attribute_' . $attr_slug ] ) && '' !== $var_attributes[ 'attribute_' . $attr_slug ] ) {
					$final_variation[] = [
						'attribute' => $attr_slug,
						'value'     => $var_attributes[ 'attribute_' . $attr_slug ],
					];
				}
			}

			if ( ! empty( $final_variation ) ) {
				$data['variation'] = $final_variation;
			}
		}
	}

	return $data;
}

