<?php
/**
 * Home & Categories Endpoints (Phase 2 - Public).
 *
 * @package OurAPI
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register public home & category REST routes.
 */
add_action( 'rest_api_init', 'our_register_home_routes' );
function our_register_home_routes() {
	$namespace = defined( 'OUR_API_NAMESPACE' ) ? OUR_API_NAMESPACE : 'our/v1';

	// GET /our/v1/home
	register_rest_route(
		$namespace,
		'/home',
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'our_handle_get_home',
			'permission_callback' => '__return_true', // Public
		]
	);

	// GET /our/v1/categories
	register_rest_route(
		$namespace,
		'/categories',
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'our_handle_get_categories',
			'permission_callback' => '__return_true', // Public
		]
	);
}

/**
 * Helper to fetch formatted product categories.
 *
 * @param array $args Query arguments for get_terms.
 * @return array
 */
function our_get_formatted_categories( array $args = [] ) {
	$default_args = [
		'taxonomy'   => 'product_cat',
		'hide_empty' => false,
		'orderby'    => 'name',
		'order'      => 'ASC',
	];

	$terms = get_terms( wp_parse_args( $args, $default_args ) );
	if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
		return [];
	}

	$categories = [];
	foreach ( $terms as $term ) {
		// Skip 'Uncategorized' default if needed, or include all
		if ( 'uncategorized' === $term->slug && 0 === $term->count ) {
			continue;
		}

		$thumbnail_id = get_term_meta( $term->term_id, 'thumbnail_id', true );
		$image_url    = $thumbnail_id ? wp_get_attachment_url( $thumbnail_id ) : null;

		$categories[] = [
			'id'          => (int) $term->term_id,
			'name'        => (string) $term->name,
			'slug'        => (string) $term->slug,
			'description' => (string) $term->description,
			'image'       => $image_url ?: null,
			'count'       => (int) $term->count,
			'parent'      => (int) $term->parent,
		];
	}

	return $categories;
}

/**
 * Handle GET /our/v1/home.
 * Aggregates 4 featured products, 4 new arrivals, and active categories.
 */
function our_handle_get_home( WP_REST_Request $request ) {
	// 1. Fetch 4 featured products
	$featured_query = wc_get_products(
		[
			'status'   => 'publish',
			'featured' => true,
			'limit'    => 4,
			'orderby'  => 'date',
			'order'    => 'DESC',
		]
	);

	// Fallback to top products if no products are explicitly marked featured
	if ( empty( $featured_query ) ) {
		$featured_query = wc_get_products(
			[
				'status'  => 'publish',
				'limit'   => 4,
				'orderby' => 'popularity',
				'order'   => 'DESC',
			]
		);
	}

	$featured_products = [];
	foreach ( $featured_query as $prod ) {
		$featured_products[] = our_format_product( $prod );
	}

	// 2. Fetch 4 new arrivals
	$new_arrivals_query = wc_get_products(
		[
			'status'  => 'publish',
			'limit'   => 4,
			'orderby' => 'date',
			'order'   => 'DESC',
		]
	);

	$new_arrivals = [];
	foreach ( $new_arrivals_query as $prod ) {
		$new_arrivals[] = our_format_product( $prod );
	}

	// 3. Fetch active product categories
	$categories = our_get_formatted_categories( [ 'hide_empty' => true ] );
	if ( empty( $categories ) ) {
		$categories = our_get_formatted_categories();
	}

	$data = [
		'featured_products' => $featured_products,
		'new_arrivals'      => $new_arrivals,
		'categories'        => $categories,
	];

	return our_response( $data, 'Home data retrieved successfully.' );
}

/**
 * Handle GET /our/v1/categories.
 */
function our_handle_get_categories( WP_REST_Request $request ) {
	$hide_empty = $request->get_param( 'hide_empty' );
	$args       = [];

	if ( null !== $hide_empty ) {
		$args['hide_empty'] = rest_sanitize_boolean( $hide_empty );
	}

	$categories = our_get_formatted_categories( $args );

	return our_response( $categories, 'Categories retrieved successfully.' );
}

