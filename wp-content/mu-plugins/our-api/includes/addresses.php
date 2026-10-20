<?php
/**
 * Saved Addresses Endpoints (Phase 2).
 * Stores multiple customer addresses in user meta `our_saved_addresses`.
 *
 * @package OurAPI
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register addresses REST routes.
 */
add_action( 'rest_api_init', 'our_register_address_routes' );
function our_register_address_routes() {
	$namespace = defined( 'OUR_API_NAMESPACE' ) ? OUR_API_NAMESPACE : 'our/v1';

	// GET & POST /our/v1/addresses
	register_rest_route(
		$namespace,
		'/addresses',
		[
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'our_handle_get_addresses',
				'permission_callback' => 'our_permission_jwt_auth',
			],
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => 'our_handle_create_address',
				'permission_callback' => 'our_permission_jwt_auth',
			],
		]
	);

	// GET, PUT, DELETE /our/v1/addresses/:id
	register_rest_route(
		$namespace,
		'/addresses/(?P<id>[a-zA-Z0-9_-]+)',
		[
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'our_handle_get_single_address',
				'permission_callback' => 'our_permission_jwt_auth',
			],
			[
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => 'our_handle_update_address',
				'permission_callback' => 'our_permission_jwt_auth',
			],
			[
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => 'our_handle_delete_address',
				'permission_callback' => 'our_permission_jwt_auth',
			],
		]
	);
}

/**
 * Helper to fetch all saved addresses for a user.
 *
 * @param int $user_id User ID.
 * @return array
 */
function our_get_user_addresses( $user_id ) {
	$saved = get_user_meta( $user_id, 'our_saved_addresses', true );
	return is_array( $saved ) ? array_values( $saved ) : [];
}

/**
 * Helper to save addresses for a user.
 *
 * @param int   $user_id User ID.
 * @param array $addresses Addresses array.
 * @return bool
 */
function our_save_user_addresses( $user_id, array $addresses ) {
	return (bool) update_user_meta( $user_id, 'our_saved_addresses', array_values( $addresses ) );
}

/**
 * Handle GET /our/v1/addresses.
 */
function our_handle_get_addresses( WP_REST_Request $request ) {
	$user_id   = get_current_user_id();
	$addresses = our_get_user_addresses( $user_id );

	return our_response( $addresses, 'Addresses retrieved successfully.' );
}

/**
 * Handle POST /our/v1/addresses.
 */
function our_handle_create_address( WP_REST_Request $request ) {
	$user_id = get_current_user_id();
	$params  = $request->get_json_params();
	if ( ! is_array( $params ) ) {
		$params = $request->get_params();
	}

	$required = [
		'first_name' => 'First name',
		'last_name'  => 'Last name',
		'address_1'  => 'Address line 1',
		'city'       => 'City',
		'postcode'   => 'Postcode',
		'country'    => 'Country',
	];

	$errors = [];
	foreach ( $required as $field => $label ) {
		if ( empty( $params[ $field ] ) || ! is_string( $params[ $field ] ) || '' === trim( $params[ $field ] ) ) {
			$errors[] = sprintf( '%s is required.', $label );
		}
	}

	if ( ! empty( $errors ) ) {
		return our_error( implode( ' ', $errors ), 400, 'validation_error', [ 'errors' => $errors ] );
	}

	$is_default = ! empty( $params['is_default'] );
	$addresses  = our_get_user_addresses( $user_id );

	// If this is the user's first address, force it to be default
	if ( empty( $addresses ) ) {
		$is_default = true;
	}

	// If is_default is true, unset default flag on all existing addresses
	if ( $is_default ) {
		foreach ( $addresses as &$addr ) {
			$addr['is_default'] = false;
		}
		unset( $addr );
	}

	$new_address = [
		'id'         => 'addr_' . bin2hex( random_bytes( 6 ) ),
		'first_name' => sanitize_text_field( $params['first_name'] ),
		'last_name'  => sanitize_text_field( $params['last_name'] ),
		'company'    => isset( $params['company'] ) ? sanitize_text_field( $params['company'] ) : '',
		'address_1'  => sanitize_text_field( $params['address_1'] ),
		'address_2'  => isset( $params['address_2'] ) ? sanitize_text_field( $params['address_2'] ) : '',
		'city'       => sanitize_text_field( $params['city'] ),
		'state'      => isset( $params['state'] ) ? sanitize_text_field( $params['state'] ) : '',
		'postcode'   => sanitize_text_field( $params['postcode'] ),
		'country'    => strtoupper( sanitize_text_field( $params['country'] ) ),
		'phone'      => isset( $params['phone'] ) ? sanitize_text_field( $params['phone'] ) : '',
		'email'      => isset( $params['email'] ) ? sanitize_email( $params['email'] ) : '',
		'is_default' => $is_default,
		'created_at' => gmdate( 'c' ),
		'updated_at' => gmdate( 'c' ),
	];

	$addresses[] = $new_address;
	our_save_user_addresses( $user_id, $addresses );

	return our_response( $new_address, 'Address saved successfully.', 201 );
}

/**
 * Handle GET /our/v1/addresses/:id.
 */
function our_handle_get_single_address( WP_REST_Request $request ) {
	$user_id   = get_current_user_id();
	$addr_id   = sanitize_text_field( $request['id'] );
	$addresses = our_get_user_addresses( $user_id );

	foreach ( $addresses as $addr ) {
		if ( (string) $addr['id'] === $addr_id ) {
			return our_response( $addr, 'Address retrieved successfully.' );
		}
	}

	return our_error( 'Address not found.', 404, 'address_not_found' );
}

/**
 * Handle PUT /our/v1/addresses/:id.
 */
function our_handle_update_address( WP_REST_Request $request ) {
	$user_id   = get_current_user_id();
	$addr_id   = sanitize_text_field( $request['id'] );
	$params    = $request->get_json_params();
	if ( ! is_array( $params ) ) {
		$params = $request->get_params();
	}

	$addresses   = our_get_user_addresses( $user_id );
	$found_index = -1;

	foreach ( $addresses as $idx => $addr ) {
		if ( (string) $addr['id'] === $addr_id ) {
			$found_index = $idx;
			break;
		}
	}

	if ( -1 === $found_index ) {
		return our_error( 'Address not found.', 404, 'address_not_found' );
	}

	$is_default = isset( $params['is_default'] ) ? (bool) $params['is_default'] : $addresses[ $found_index ]['is_default'];

	// If setting this address as default, unset on others
	if ( $is_default ) {
		foreach ( $addresses as &$addr ) {
			$addr['is_default'] = false;
		}
		unset( $addr );
	}

	$updatable = [ 'first_name', 'last_name', 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'phone', 'email' ];
	foreach ( $updatable as $field ) {
		if ( isset( $params[ $field ] ) ) {
			if ( 'email' === $field ) {
				$addresses[ $found_index ][ $field ] = sanitize_email( $params[ $field ] );
			} elseif ( 'country' === $field ) {
				$addresses[ $found_index ][ $field ] = strtoupper( sanitize_text_field( $params[ $field ] ) );
			} else {
				$addresses[ $found_index ][ $field ] = sanitize_text_field( $params[ $field ] );
			}
		}
	}

	$addresses[ $found_index ]['is_default'] = $is_default;
	$addresses[ $found_index ]['updated_at'] = gmdate( 'c' );

	our_save_user_addresses( $user_id, $addresses );

	return our_response( $addresses[ $found_index ], 'Address updated successfully.' );
}

/**
 * Handle DELETE /our/v1/addresses/:id.
 */
function our_handle_delete_address( WP_REST_Request $request ) {
	$user_id   = get_current_user_id();
	$addr_id   = sanitize_text_field( $request['id'] );
	$addresses = our_get_user_addresses( $user_id );

	$new_list     = [];
	$found        = false;
	$was_default  = false;

	foreach ( $addresses as $addr ) {
		if ( (string) $addr['id'] === $addr_id ) {
			$found       = true;
			$was_default = ! empty( $addr['is_default'] );
		} else {
			$new_list[] = $addr;
		}
	}

	if ( ! $found ) {
		return our_error( 'Address not found.', 404, 'address_not_found' );
	}

	// If we deleted the default address and other addresses exist, promote the first one to default
	if ( $was_default && ! empty( $new_list ) ) {
		$new_list[0]['is_default'] = true;
	}

	our_save_user_addresses( $user_id, $new_list );

	return our_response( [ 'deleted_id' => $addr_id ], 'Address deleted successfully.' );
}

