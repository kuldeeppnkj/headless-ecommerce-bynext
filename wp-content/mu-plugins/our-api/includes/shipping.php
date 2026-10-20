<?php
/**
 * Shipping Charges Endpoint (Phase 2).
 *
 * @package OurAPI
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register shipping REST routes.
 */
add_action( 'rest_api_init', 'our_register_shipping_routes' );
function our_register_shipping_routes() {
	$namespace = defined( 'OUR_API_NAMESPACE' ) ? OUR_API_NAMESPACE : 'our/v1';

	// POST /our/v1/shipping-charges
	register_rest_route(
		$namespace,
		'/shipping-charges',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'our_handle_shipping_charges',
			'permission_callback' => 'our_permission_jwt_auth',
		]
	);
}

/**
 * Handle POST /our/v1/shipping-charges.
 * Accepts: { destination: { country, state, postcode, city } }
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function our_handle_shipping_charges( WP_REST_Request $request ) {
	$params      = $request->get_json_params();
	$destination = isset( $params['destination'] ) && is_array( $params['destination'] ) ? $params['destination'] : [];

	$country  = isset( $destination['country'] ) ? sanitize_text_field( $destination['country'] ) : ( WC()->countries ? WC()->countries->get_base_country() : 'US' );
	$state    = isset( $destination['state'] ) ? sanitize_text_field( $destination['state'] ) : '';
	$postcode = isset( $destination['postcode'] ) ? sanitize_text_field( $destination['postcode'] ) : '';
	$city     = isset( $destination['city'] ) ? sanitize_text_field( $destination['city'] ) : '';

	if ( empty( $country ) ) {
		return our_error( 'Destination country is required.', 400, 'missing_destination_country' );
	}

	// Ensure WooCommerce session exists for shipping calculation
	if ( function_exists( 'WC' ) && ! WC()->session ) {
		WC()->initialize_session();
	}

	// Prepare package
	$contents      = [];
	$contents_cost = 0;

	if ( function_exists( 'WC' ) && WC()->cart && ! WC()->cart->is_empty() ) {
		$contents      = WC()->cart->get_cart();
		$contents_cost = WC()->cart->get_cart_contents_total();
	}

	$package = [
		'contents'        => $contents,
		'contents_cost'   => $contents_cost,
		'applied_coupons' => WC()->cart ? WC()->cart->get_applied_coupons() : [],
		'user'            => [ 'ID' => get_current_user_id() ],
		'destination'     => [
			'country'   => strtoupper( $country ),
			'state'     => strtoupper( $state ),
			'postcode'  => $postcode,
			'city'      => $city,
			'address'   => '',
			'address_2' => '',
		],
	];

	// Find matching shipping zone
	$zone = WC_Shipping_Zones::get_zone_matching_package( $package );

	// Calculate rates using WooCommerce shipping
	$shipping_packages = WC()->shipping()->calculate_shipping_for_package( $package );
	$rates_list        = [];

	if ( ! empty( $shipping_packages['rates'] ) ) {
		foreach ( $shipping_packages['rates'] as $rate_id => $rate ) {
			$rates_list[] = [
				'id'          => $rate_id,
				'method_id'   => $rate->get_method_id(),
				'instance_id' => $rate->get_instance_id(),
				'label'       => $rate->get_label(),
				'cost'        => wc_format_decimal( $rate->get_cost(), 2 ),
				'taxes'       => $rate->get_taxes(),
			];
		}
	}

	// Also retrieve enabled zone methods
	$zone_methods = [];
	if ( $zone ) {
		foreach ( $zone->get_shipping_methods( true ) as $method ) {
			$zone_methods[] = [
				'id'          => $method->id,
				'instance_id' => $method->instance_id,
				'title'       => $method->get_title(),
				'enabled'     => 'yes' === $method->enabled,
			];
		}
	}

	$data = [
		'destination' => [
			'country'  => strtoupper( $country ),
			'state'    => strtoupper( $state ),
			'postcode' => $postcode,
			'city'     => $city,
		],
		'zone'        => [
			'id'   => $zone ? $zone->get_id() : 0,
			'name' => $zone ? $zone->get_zone_name() : 'Locations not covered by your other zones',
		],
		'rates'       => $rates_list,
		'methods'     => $zone_methods,
	];

	return our_response( $data, 'Shipping charges calculated successfully.' );
}
