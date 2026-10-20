<?php
/**
 * Checkout REST endpoints (Phase 6).
 *
 * @package OurAPI
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register checkout REST routes.
 */
add_action( 'rest_api_init', 'our_register_checkout_routes' );
function our_register_checkout_routes() {
	$namespace = defined( 'OUR_API_NAMESPACE' ) ? OUR_API_NAMESPACE : 'our/v1';

	// POST /our/v1/checkout
	register_rest_route(
		$namespace,
		'/checkout',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'our_handle_checkout',
			'permission_callback' => '__return_true', // Supports both authenticated and guest checkout
		]
	);
}

/**
 * Handle POST /our/v1/checkout.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function our_handle_checkout( WP_REST_Request $request ) {
	// 1. Identify user (authenticated or guest)
	$user_id = 0;
	$token   = our_get_bearer_token( $request );
	if ( $token ) {
		$decoded = our_validate_jwt( $token );
		if ( ! is_wp_error( $decoded ) && isset( $decoded->data->user->id ) ) {
			$user_id = (int) $decoded->data->user->id;
			wp_set_current_user( $user_id );
		}
	} elseif ( is_user_logged_in() ) {
		$user_id = get_current_user_id();
	}

	// 2. Load active cart session
	if ( function_exists( 'our_ensure_cart_session' ) ) {
		our_ensure_cart_session();
	} elseif ( function_exists( 'WC' ) && ! WC()->cart ) {
		wc_load_cart();
	}

	if ( ! function_exists( 'WC' ) || ! WC()->cart || WC()->cart->is_empty() ) {
		return our_error( 'Your cart is empty. Add products to cart before checkout.', 400, 'cart_empty' );
	}

	// 3. Extract and validate parameters
	$params = $request->get_json_params();
	if ( ! is_array( $params ) ) {
		$params = $request->get_params();
	}

	$billing_raw  = isset( $params['billing_address'] ) && is_array( $params['billing_address'] ) ? $params['billing_address'] : [];
	$shipping_raw = isset( $params['shipping_address'] ) && is_array( $params['shipping_address'] ) ? $params['shipping_address'] : [];
	$note         = isset( $params['customer_note'] ) ? sanitize_textarea_field( $params['customer_note'] ) : '';
	$pay_method   = isset( $params['payment_method'] ) ? strtolower( trim( sanitize_text_field( $params['payment_method'] ) ) ) : 'cod';

	// Validate billing address required fields
	$required_billing = [
		'first_name' => 'Billing First Name',
		'last_name'  => 'Billing Last Name',
		'address_1'  => 'Billing Street Address',
		'city'       => 'Billing City',
		'postcode'   => 'Billing Postcode/ZIP',
		'country'    => 'Billing Country',
		'email'      => 'Billing Email',
		'phone'      => 'Billing Phone Number',
	];

	$billing_errors = [];
	foreach ( $required_billing as $field => $label ) {
		if ( empty( $billing_raw[ $field ] ) || ! is_string( $billing_raw[ $field ] ) || '' === trim( $billing_raw[ $field ] ) ) {
			$billing_errors[] = sprintf( '%s is required.', $label );
		}
	}

	if ( ! empty( $billing_raw['email'] ) && ! is_email( $billing_raw['email'] ) ) {
		$billing_errors[] = 'Billing email is not a valid email address.';
	}

	if ( ! empty( $billing_errors ) ) {
		return our_error( implode( ' ', $billing_errors ), 400, 'invalid_billing_address', [ 'errors' => $billing_errors ] );
	}

	// Clean billing address
	$billing_address = [
		'first_name' => sanitize_text_field( $billing_raw['first_name'] ),
		'last_name'  => sanitize_text_field( $billing_raw['last_name'] ),
		'company'    => isset( $billing_raw['company'] ) ? sanitize_text_field( $billing_raw['company'] ) : '',
		'address_1'  => sanitize_text_field( $billing_raw['address_1'] ),
		'address_2'  => isset( $billing_raw['address_2'] ) ? sanitize_text_field( $billing_raw['address_2'] ) : '',
		'city'       => sanitize_text_field( $billing_raw['city'] ),
		'state'      => isset( $billing_raw['state'] ) ? sanitize_text_field( $billing_raw['state'] ) : '',
		'postcode'   => sanitize_text_field( $billing_raw['postcode'] ),
		'country'    => sanitize_text_field( $billing_raw['country'] ),
		'email'      => sanitize_email( $billing_raw['email'] ),
		'phone'      => sanitize_text_field( $billing_raw['phone'] ),
	];

	// Clean or fallback shipping address
	if ( ! empty( $shipping_raw ) && is_array( $shipping_raw ) && ! empty( $shipping_raw['first_name'] ) ) {
		$shipping_address = [
			'first_name' => sanitize_text_field( $shipping_raw['first_name'] ),
			'last_name'  => isset( $shipping_raw['last_name'] ) ? sanitize_text_field( $shipping_raw['last_name'] ) : '',
			'company'    => isset( $shipping_raw['company'] ) ? sanitize_text_field( $shipping_raw['company'] ) : '',
			'address_1'  => isset( $shipping_raw['address_1'] ) ? sanitize_text_field( $shipping_raw['address_1'] ) : '',
			'address_2'  => isset( $shipping_raw['address_2'] ) ? sanitize_text_field( $shipping_raw['address_2'] ) : '',
			'city'       => isset( $shipping_raw['city'] ) ? sanitize_text_field( $shipping_raw['city'] ) : '',
			'state'      => isset( $shipping_raw['state'] ) ? sanitize_text_field( $shipping_raw['state'] ) : '',
			'postcode'   => isset( $shipping_raw['postcode'] ) ? sanitize_text_field( $shipping_raw['postcode'] ) : '',
			'country'    => isset( $shipping_raw['country'] ) ? sanitize_text_field( $shipping_raw['country'] ) : '',
			'phone'      => isset( $shipping_raw['phone'] ) ? sanitize_text_field( $shipping_raw['phone'] ) : '',
		];
	} else {
		// Default shipping to billing
		$shipping_address = [
			'first_name' => $billing_address['first_name'],
			'last_name'  => $billing_address['last_name'],
			'company'    => $billing_address['company'],
			'address_1'  => $billing_address['address_1'],
			'address_2'  => $billing_address['address_2'],
			'city'       => $billing_address['city'],
			'state'      => $billing_address['state'],
			'postcode'   => $billing_address['postcode'],
			'country'    => $billing_address['country'],
			'phone'      => $billing_address['phone'],
		];
	}

	// 4. Validate payment method (COD only for now)
	if ( 'cod' !== $pay_method ) {
		return our_error( 'Only Cash on Delivery ("cod") payment method is currently supported.', 400, 'unsupported_payment_method' );
	}

	$gateways = WC()->payment_gateways ? WC()->payment_gateways->get_available_payment_gateways() : [];
	if ( ! isset( $gateways['cod'] ) ) {
		return our_error( 'Cash on Delivery payment method is not available or disabled.', 400, 'cod_disabled' );
	}

	// 5. Create WooCommerce Order
	try {
		$order = wc_create_order( [
			'customer_id'   => $user_id > 0 ? $user_id : 0,
			'customer_note' => $note,
		] );

		if ( is_wp_error( $order ) || ! $order ) {
			return our_error( 'Failed to initialize order: ' . ( is_wp_error( $order ) ? $order->get_error_message() : 'Unknown error' ), 500, 'order_creation_failed' );
		}

		// Set Addresses
		$order->set_address( $billing_address, 'billing' );
		$order->set_address( $shipping_address, 'shipping' );

		// Add Line Items from Cart
		foreach ( WC()->cart->get_cart() as $cart_item_key => $values ) {
			$product   = $values['data'];
			$quantity  = (float) $values['quantity'];
			$variation = isset( $values['variation'] ) && is_array( $values['variation'] ) ? $values['variation'] : [];

			$item_args = [
				'variation' => $variation,
				'totals'    => [
					'subtotal'     => $values['line_subtotal'],
					'subtotal_tax' => $values['line_subtotal_tax'],
					'total'        => $values['line_total'],
					'tax'          => $values['line_tax'],
					'tax_data'     => $values['line_tax_data'],
				],
			];

			$item_id = $order->add_product( $product, $quantity, $item_args );
			if ( ! $item_id ) {
				throw new \Exception( sprintf( 'Failed to add item "%s" to order.', $product->get_name() ) );
			}
		}

		// Add Applied Coupons
		foreach ( WC()->cart->get_applied_coupons() as $coupon_code ) {
			$order->apply_coupon( $coupon_code );
		}

		// Add Shipping Method (Free Shipping default or from cart session)
		$shipping_rate = new WC_Shipping_Rate( 'free_shipping:1', 'Free Shipping', 0, [], 'free_shipping' );
		$order_shipping = new WC_Order_Item_Shipping();
		$order_shipping->set_props( [
			'method_title' => $shipping_rate->get_label(),
			'method_id'    => $shipping_rate->get_id(),
			'total'        => wc_format_decimal( $shipping_rate->get_cost() ),
			'taxes'        => $shipping_rate->get_taxes(),
		] );
		$order->add_item( $order_shipping );

		// Set Payment Method (COD)
		$order->set_payment_method( 'cod' );
		$order->set_payment_method_title( $gateways['cod']->get_title() );

		// Calculate Totals
		$order->calculate_totals();

		// Reduce Stock
		wc_reduce_stock_levels( $order->get_id() );

		// For Cash on Delivery, order is placed directly in "processing" status
		$order->update_status( 'processing', __( 'Order placed via Headless REST API with Cash on Delivery.', 'our-api' ) );

		// Persist Order
		$order->save();

		// Empty Cart Session
		WC()->cart->empty_cart();
		if ( WC()->session && method_exists( WC()->session, 'save_data' ) ) {
			WC()->session->save_data();
		}

		$order_data = [
			'order_id'             => $order->get_id(),
			'order_number'         => $order->get_order_number(),
			'status'               => $order->get_status(),
			'status_label'         => wc_get_order_status_name( $order->get_status() ),
			'currency'             => $order->get_currency(),
			'total'                => wc_format_decimal( $order->get_total(), 2 ),
			'payment_method'       => $order->get_payment_method(),
			'payment_method_title' => $order->get_payment_method_title(),
			'date_created'         => $order->get_date_created() ? $order->get_date_created()->date( 'c' ) : gmdate( 'c' ),
		];

		return our_response( $order_data, 'Order placed successfully.', 201 );

	} catch ( \Exception $e ) {
		return our_error( 'Failed to place order: ' . $e->getMessage(), 500, 'order_processing_error' );
	}
}

/**
 * Filter Store API GET /wc/store/v1/checkout response to ensure payment_methods is present in the root payload.
 */
add_filter( 'rest_request_after_callbacks', 'our_inject_checkout_payment_methods', 10, 3 );
function our_inject_checkout_payment_methods( $response, $handler, $request ) {
	if ( is_wp_error( $response ) || ! ( $response instanceof WP_REST_Response ) ) {
		return $response;
	}

	$route = $request->get_route();
	if ( strpos( $route, '/wc/store/' ) !== false && strpos( $route, '/checkout' ) !== false && $request->get_method() === 'GET' ) {
		$data = $response->get_data();
		if ( is_array( $data ) ) {
			$available_gateways = WC()->payment_gateways->get_available_payment_gateways();
			$payment_methods    = [];

			foreach ( $available_gateways as $gateway_id => $gateway ) {
				$payment_methods[] = [
					'id'          => $gateway_id,
					'title'       => $gateway->get_title(),
					'description' => $gateway->get_description(),
					'supports'    => array_values( $gateway->supports ),
				];
			}

			// Ensure payment_methods array is in the root checkout payload
			$data['payment_methods']     = $payment_methods;
			$data['payment_method_ids'] = array_keys( $available_gateways );
			$response->set_data( $data );
		}
	}

	return $response;
}


