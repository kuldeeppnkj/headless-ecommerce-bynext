<?php
/**
 * Favourites Endpoints (Phase 2).
 * Stores favourite products and variations in user meta `our_favorites`.
 *
 * @package OurAPI
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register favourites REST routes.
 */
add_action( 'rest_api_init', 'our_register_favourites_routes' );
function our_register_favourites_routes() {
	$namespace = defined( 'OUR_API_NAMESPACE' ) ? OUR_API_NAMESPACE : 'our/v1';

	// GET, POST, DELETE /our/v1/favourites
	register_rest_route(
		$namespace,
		'/favourites',
		[
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'our_handle_get_favourites',
				'permission_callback' => 'our_permission_jwt_auth',
			],
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => 'our_handle_add_favourite',
				'permission_callback' => 'our_permission_jwt_auth',
			],
			[
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => 'our_handle_remove_favourite',
				'permission_callback' => 'our_permission_jwt_auth',
			],
		]
	);
}

/**
 * Helper to fetch raw favourites array for a user.
 *
 * @param int $user_id User ID.
 * @return array
 */
function our_get_user_favorites( $user_id ) {
	$favs = get_user_meta( $user_id, 'our_favorites', true );
	return is_array( $favs ) ? array_values( $favs ) : [];
}

/**
 * Helper to save favourites array for a user.
 *
 * @param int   $user_id User ID.
 * @param array $favorites Favorites list.
 * @return bool
 */
function our_save_user_favorites( $user_id, array $favorites ) {
	return (bool) update_user_meta( $user_id, 'our_favorites', array_values( $favorites ) );
}

/**
 * Handle GET /our/v1/favourites.
 * Fetches user meta and returns full product objects for the frontend.
 */
function our_handle_get_favourites( WP_REST_Request $request ) {
	$user_id = get_current_user_id();
	$favs    = our_get_user_favorites( $user_id );

	$formatted_items = [];
	foreach ( $favs as $fav ) {
		$prod_id = isset( $fav['product_id'] ) ? absint( $fav['product_id'] ) : 0;
		$var_id  = isset( $fav['variation_id'] ) ? absint( $fav['variation_id'] ) : 0;

		$target_id = $var_id ?: $prod_id;
		$product   = wc_get_product( $target_id );

		if ( $product ) {
			$formatted_prod = our_format_product( $product );
			$formatted_items[] = [
				'product_id'   => $prod_id,
				'variation_id' => $var_id,
				'product'      => $formatted_prod,
			];
		}
	}

	return our_response( $formatted_items, 'Favourites retrieved successfully.' );
}

/**
 * Handle POST /our/v1/favourites.
 * Accepts: { product_id: 123, variation_id: 456 }
 */
function our_handle_add_favourite( WP_REST_Request $request ) {
	$user_id = get_current_user_id();
	$params  = $request->get_json_params();
	if ( ! is_array( $params ) ) {
		$params = $request->get_params();
	}

	$prod_id = isset( $params['product_id'] ) ? absint( $params['product_id'] ) : 0;
	$var_id  = isset( $params['variation_id'] ) ? absint( $params['variation_id'] ) : 0;

	if ( ! $prod_id ) {
		return our_error( 'product_id is required.', 400, 'missing_product_id' );
	}

	$product = wc_get_product( $var_id ?: $prod_id );
	if ( ! $product ) {
		return our_error( 'Product not found.', 404, 'product_not_found' );
	}

	$favs   = our_get_user_favorites( $user_id );
	$exists = false;

	foreach ( $favs as $f ) {
		if ( (int) $f['product_id'] === $prod_id && (int) ( $f['variation_id'] ?? 0 ) === $var_id ) {
			$exists = true;
			break;
		}
	}

	if ( ! $exists ) {
		$favs[] = [
			'product_id'   => $prod_id,
			'variation_id' => $var_id,
			'added_at'     => gmdate( 'c' ),
		];
		our_save_user_favorites( $user_id, $favs );
	}

	$formatted = our_format_product( $product );

	return our_response(
		[
			'product_id'   => $prod_id,
			'variation_id' => $var_id,
			'product'      => $formatted,
		],
		'Product added to favourites successfully.',
		201
	);
}

/**
 * Handle DELETE /our/v1/favourites.
 * Accepts: { product_id: 123, variation_id: 456 } in body or query params.
 */
function our_handle_remove_favourite( WP_REST_Request $request ) {
	$user_id = get_current_user_id();
	$params  = $request->get_json_params();
	if ( ! is_array( $params ) ) {
		$params = $request->get_params();
	}

	$prod_id = isset( $params['product_id'] ) ? absint( $params['product_id'] ) : 0;
	$var_id  = isset( $params['variation_id'] ) ? absint( $params['variation_id'] ) : 0;

	if ( ! $prod_id ) {
		return our_error( 'product_id is required.', 400, 'missing_product_id' );
	}

	$favs     = our_get_user_favorites( $user_id );
	$new_list = [];
	$found    = false;

	foreach ( $favs as $f ) {
		if ( (int) $f['product_id'] === $prod_id && (int) ( $f['variation_id'] ?? 0 ) === $var_id ) {
			$found = true;
		} else {
			$new_list[] = $f;
		}
	}

	if ( ! $found ) {
		return our_error( 'Product not in favourites.', 404, 'favourite_not_found' );
	}

	our_save_user_favorites( $user_id, $new_list );

	return our_response(
		[
			'product_id'   => $prod_id,
			'variation_id' => $var_id,
		],
		'Product removed from favourites successfully.'
	);
}

