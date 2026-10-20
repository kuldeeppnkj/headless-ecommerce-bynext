<?php
/**
 * CORS handling and preflight responses for Headless WooCommerce API.
 *
 * @package OurAPI
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Check if the provided origin is allowed.
 *
 * @param string $origin Incoming origin.
 * @return bool
 */
function our_is_origin_allowed( $origin ) {
	if ( empty( $origin ) ) {
		return false;
	}

	$frontend_url = defined( 'OUR_FRONTEND_URL' ) ? rtrim( OUR_FRONTEND_URL, '/' ) : 'http://localhost:3000';
	$origin_clean = rtrim( $origin, '/' );

	// Exact match
	if ( strcasecmp( $origin_clean, $frontend_url ) === 0 ) {
		return true;
	}

	// Local development fallback: if frontend URL contains 'localhost', allow any port on localhost or 127.0.0.1
	if ( strpos( $frontend_url, 'localhost' ) !== false || strpos( $frontend_url, '127.0.0.1' ) !== false ) {
		$parsed = wp_parse_url( $origin );
		$host   = isset( $parsed['host'] ) ? strtolower( $parsed['host'] ) : '';
		if ( in_array( $host, [ 'localhost', '127.0.0.1' ], true ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Attach CORS headers and handle preflight OPTIONS.
 */
function our_handle_cors_headers() {
	$origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? trim( $_SERVER['HTTP_ORIGIN'] ) : '';

	if ( our_is_origin_allowed( $origin ) ) {
		header( 'Access-Control-Allow-Origin: ' . $origin );
		header( 'Access-Control-Allow-Credentials: true' );
		header( 'Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS' );
		header( 'Access-Control-Allow-Headers: Content-Type, Authorization, Cart-Token, Nonce, X-WC-Store-API-Nonce' );
		header( 'Access-Control-Expose-Headers: Cart-Token, Nonce, X-WC-Store-API-Nonce, X-RateLimit-Remaining, X-RateLimit-Reset' );
	}

	// Preflight OPTIONS handling
	if ( isset( $_SERVER['REQUEST_METHOD'] ) && 'OPTIONS' === strtoupper( $_SERVER['REQUEST_METHOD'] ) ) {
		status_header( 200 );
		exit;
	}
}

// Hook into init and rest_api_init
add_action( 'init', 'our_handle_cors_headers', 1 );
add_action( 'rest_api_init', 'our_handle_cors_headers', 1 );

/**
 * Filter REST API response headers to ensure CORS is present on all REST requests.
 */
add_filter( 'rest_pre_serve_request', 'our_rest_cors_headers', 10, 4 );
function our_rest_cors_headers( $served, $result, $request, $server ) {
	$origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? trim( $_SERVER['HTTP_ORIGIN'] ) : '';

	if ( our_is_origin_allowed( $origin ) ) {
		$server->send_header( 'Access-Control-Allow-Origin', $origin );
		$server->send_header( 'Access-Control-Allow-Credentials', 'true' );
		$server->send_header( 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS' );
		$server->send_header( 'Access-Control-Allow-Headers', 'Content-Type, Authorization, Cart-Token, Nonce, X-WC-Store-API-Nonce' );
		$server->send_header( 'Access-Control-Expose-Headers', 'Cart-Token, Nonce, X-WC-Store-API-Nonce, X-RateLimit-Remaining, X-RateLimit-Reset' );
	}

	return $served;
}

/**
 * Ensure WordPress REST allowed & exposed headers include Cart-Token and Nonce.
 */
add_filter( 'rest_allowed_cors_headers', 'our_filter_allowed_cors_headers', 20 );
function our_filter_allowed_cors_headers( $headers ) {
	$headers[] = 'Cart-Token';
	$headers[] = 'Nonce';
	$headers[] = 'Authorization';
	$headers[] = 'X-WC-Store-API-Nonce';
	return array_unique( $headers );
}

add_filter( 'rest_exposed_cors_headers', 'our_filter_exposed_cors_headers', 20 );
function our_filter_exposed_cors_headers( $headers ) {
	$headers[] = 'Cart-Token';
	$headers[] = 'Nonce';
	$headers[] = 'X-WC-Store-API-Nonce';
	return array_unique( $headers );
}

