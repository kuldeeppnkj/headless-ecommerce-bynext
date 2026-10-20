<?php
/**
 * Rate limiting helpers for sensitive authentication routes.
 *
 * @package OurAPI
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Retrieve the client IP address.
 *
 * @return string
 */
function our_get_client_ip() {
	if ( ! empty( $_SERVER['HTTP_CF_CONNECTING_IP'] ) ) {
		return sanitize_text_field( wp_unslash( $_SERVER['HTTP_CF_CONNECTING_IP'] ) );
	}

	if ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
		$ips = explode( ',', sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) );
		return trim( $ips[0] );
	}

	if ( ! empty( $_SERVER['REMOTE_ADDR'] ) ) {
		return sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) );
	}

	return '127.0.0.1';
}

/**
 * Perform transient-based rate limit check.
 *
 * @param string $route          Unique route identifier (e.g. 'login', 'register').
 * @param int    $max            Maximum allowed requests in window.
 * @param int    $window_seconds Window duration in seconds (default 60).
 * @return true|WP_Error True if under limit, WP_Error with 429 if exceeded.
 */
function our_rate_limit_check( $route, $max = 5, $window_seconds = 60 ) {
	$ip  = our_get_client_ip();
	$key = 'rl_' . md5( $ip . $route );

	$data = get_transient( $key );
	$now  = time();

	if ( false === $data || ! is_array( $data ) ) {
		$data = [
			'count'    => 1,
			'reset_at' => $now + $window_seconds,
		];
		set_transient( $key, $data, $window_seconds );
	} else {
		$data['count']++;
		$ttl = max( 1, $data['reset_at'] - $now );
		set_transient( $key, $data, $ttl );
	}

	$remaining = max( 0, $max - $data['count'] );
	$reset     = max( 0, $data['reset_at'] - $now );

	// Send HTTP headers
	if ( ! headers_sent() ) {
		header( 'X-RateLimit-Limit: ' . (int) $max );
		header( 'X-RateLimit-Remaining: ' . (int) $remaining );
		header( 'X-RateLimit-Reset: ' . (int) $reset );
	}

	// Also attach to WP_REST_Response
	add_filter(
		'rest_post_dispatch',
		function ( $response ) use ( $max, $remaining, $reset ) {
			if ( $response instanceof WP_REST_Response ) {
				$response->header( 'X-RateLimit-Limit', (string) $max );
				$response->header( 'X-RateLimit-Remaining', (string) $remaining );
				$response->header( 'X-RateLimit-Reset', (string) $reset );
			}
			return $response;
		}
	);

	if ( $data['count'] > $max ) {
		return our_error(
			'Too many requests. Please try again later.',
			429,
			'rate_limit_exceeded',
			[
				'remaining' => 0,
				'reset_in'  => $reset,
			]
		);
	}

	return true;
}

