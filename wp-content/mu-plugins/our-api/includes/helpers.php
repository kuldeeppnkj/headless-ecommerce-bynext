<?php
/**
 * Helper utilities, response envelopes, JWT helpers, and authentication middleware.
 *
 * @package OurAPI
 */

use Tmeister\Firebase\JWT\JWT;
use Tmeister\Firebase\JWT\Key;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Standard API response envelope.
 *
 * @param mixed  $data    Response payload.
 * @param string $message Human-readable message.
 * @param int    $status  HTTP status code.
 * @return WP_REST_Response
 */
function our_response( $data = null, $message = '', $status = 200 ) {
	$envelope = [
		'success' => ( $status >= 200 && $status < 300 ),
		'data'    => $data,
		'message' => $message,
	];

	return new WP_REST_Response( $envelope, $status );
}

/**
 * Standard API error response envelope.
 *
 * @param string $message Error message.
 * @param int    $status  HTTP status code.
 * @param string $code    Machine-readable error code.
 * @param mixed  $data    Optional extra error data.
 * @return WP_Error
 */
function our_error( $message, $status = 400, $code = 'our_error', $data = null ) {
	return new WP_Error(
		$code,
		$message,
		[
			'status'  => $status,
			'data'    => $data,
			'message' => $message,
		]
	);
}

/**
 * Enforce standard response envelope for all endpoints within OUR_API_NAMESPACE.
 */
add_filter( 'rest_post_dispatch', 'our_standardize_rest_response', 10, 3 );
function our_standardize_rest_response( $response, $server, $request ) {
	$namespace = defined( 'OUR_API_NAMESPACE' ) ? OUR_API_NAMESPACE : 'our/v1';
	$route     = $request->get_route();

	// Only process routes in our namespace
	if ( strpos( $route, '/' . $namespace ) !== 0 ) {
		return $response;
	}

	// Bypass envelope for /theme-settings to match required Next.js schema directly
	if ( $route === '/' . $namespace . '/theme-settings' ) {
		return $response;
	}

	if ( $response instanceof WP_REST_Response ) {
		$status = $response->get_status();
		$data   = $response->get_data();

		// Convert any 403 auth errors to 401 for our namespace
		if ( 403 === $status && is_array( $data ) && ( isset( $data['code'] ) && strpos( $data['code'], 'jwt_auth' ) !== false ) ) {
			$status = 401;
			$response->set_status( 401 );
		}

		// Check if already in standard envelope format
		if ( is_array( $data ) && array_key_exists( 'success', $data ) && array_key_exists( 'data', $data ) && array_key_exists( 'message', $data ) ) {
			return $response;
		}

		$is_success = ( $status >= 200 && $status < 300 );
		$message    = $is_success ? 'Success' : 'An error occurred';

		if ( is_array( $data ) ) {
			if ( ! empty( $data['message'] ) && is_string( $data['message'] ) ) {
				$message = $data['message'];
			} elseif ( ! empty( $data['code'] ) && is_string( $data['code'] ) ) {
				$message = $data['code'];
			}
		}

		$envelope = [
			'success' => $is_success,
			'data'    => $data,
			'message' => $message,
		];

		$response->set_data( $envelope );
	}

	return $response;
}

/**
 * Filter rest_pre_dispatch to convert jwt_auth 403 errors into 401 Unauthorized.
 */
add_filter( 'rest_pre_dispatch', 'our_normalize_auth_pre_dispatch_errors', 11, 3 );
function our_normalize_auth_pre_dispatch_errors( $result, $server, $request ) {
	$namespace = defined( 'OUR_API_NAMESPACE' ) ? OUR_API_NAMESPACE : 'our/v1';
	if ( strpos( $request->get_route(), '/' . $namespace ) === 0 ) {
		if ( is_wp_error( $result ) ) {
			$error_data = $result->get_error_data();
			if ( is_array( $error_data ) && isset( $error_data['status'] ) && 403 === $error_data['status'] ) {
				$error_data['status'] = 401;
				$result->add_data( $error_data );
			}
		}
	}
	return $result;
}

/**
 * Get the JWT Secret Key from config.
 *
 * @return string|false
 */
function our_get_jwt_secret() {
	if ( defined( 'JWT_AUTH_SECRET_KEY' ) && ! empty( JWT_AUTH_SECRET_KEY ) ) {
		return JWT_AUTH_SECRET_KEY;
	}

	if ( defined( 'AUTH_KEY' ) && ! empty( AUTH_KEY ) ) {
		return AUTH_KEY;
	}

	return false;
}

/**
 * Get JWT Access Token expiration lifetime in seconds.
 *
 * @return int
 */
function our_get_token_ttl() {
	// Default 7 days (604800 seconds)
	return apply_filters( 'our_jwt_ttl', DAY_IN_SECONDS * 7 );
}

/**
 * Generate a JWT token for a given user ID.
 *
 * @param int $user_id User ID.
 * @return string|WP_Error
 */
function our_generate_jwt( $user_id ) {
	if ( $user_id instanceof WP_User ) {
		$user_id = $user_id->ID;
	}
	$user_id = absint( $user_id );

	$secret = our_get_jwt_secret();
	if ( ! $secret ) {
		return our_error( 'JWT Secret Key is not configured.', 500, 'jwt_secret_missing' );
	}

	$issued_at = time();
	$ttl       = our_get_token_ttl();
	$expire    = $issued_at + $ttl;

	$payload = [
		'iss'  => get_bloginfo( 'url' ),
		'iat'  => $issued_at,
		'nbf'  => $issued_at,
		'exp'  => $expire,
		'data' => [
			'user' => [
				'id' => (int) $user_id,
			],
		],
	];

	try {
		$token = JWT::encode( $payload, $secret, 'HS256' );
		return $token;
	} catch ( \Exception $e ) {
		return our_error( 'Failed to generate token: ' . $e->getMessage(), 500, 'jwt_encode_error' );
	}
}

/**
 * Generate a new refresh token for a user.
 *
 * @param int $user_id User ID.
 * @return string
 */
function our_generate_refresh_token( $user_id ) {
	$raw_token   = bin2hex( random_bytes( 32 ) );
	$token_id    = $user_id . '_' . $raw_token;
	$token_hash  = hash( 'sha256', $raw_token );
	$expires_at  = time() + ( DAY_IN_SECONDS * 30 ); // 30 days validity

	$stored = get_user_meta( $user_id, 'our_refresh_tokens', true );
	if ( ! is_array( $stored ) ) {
		$stored = [];
	}

	// Clean expired refresh tokens for this user
	$now    = time();
	$active = [];
	foreach ( $stored as $t ) {
		if ( isset( $t['expires_at'] ) && $t['expires_at'] > $now ) {
			$active[] = $t;
		}
	}

	// Add new token
	$active[] = [
		'hash'       => $token_hash,
		'expires_at' => $expires_at,
		'created_at' => $now,
	];

	// Keep max 10 active tokens per user
	if ( count( $active ) > 10 ) {
		$active = array_slice( $active, -10 );
	}

	update_user_meta( $user_id, 'our_refresh_tokens', $active );

	return $token_id;
}

/**
 * Verify and consume (invalidate) a refresh token.
 *
 * @param string $token_string Refresh token.
 * @return int|WP_Error User ID on success, WP_Error on failure.
 */
function our_verify_and_consume_refresh_token( $token_string ) {
	if ( empty( $token_string ) || ! is_string( $token_string ) ) {
		return our_error( 'Refresh token is required.', 400, 'missing_refresh_token' );
	}

	$parts = explode( '_', $token_string, 2 );
	if ( count( $parts ) !== 2 ) {
		return our_error( 'Invalid refresh token format.', 401, 'invalid_refresh_token' );
	}

	$user_id   = (int) $parts[0];
	$raw_token = $parts[1];

	if ( ! $user_id || ! get_user_by( 'id', $user_id ) ) {
		return our_error( 'Invalid or expired refresh token.', 401, 'invalid_refresh_token' );
	}

	$stored = get_user_meta( $user_id, 'our_refresh_tokens', true );
	if ( ! is_array( $stored ) || empty( $stored ) ) {
		return our_error( 'Invalid or expired refresh token.', 401, 'invalid_refresh_token' );
	}

	$target_hash = hash( 'sha256', $raw_token );
	$found_index = -1;
	$now         = time();

	foreach ( $stored as $index => $item ) {
		if ( isset( $item['hash'] ) && hash_equals( $item['hash'], $target_hash ) ) {
			if ( isset( $item['expires_at'] ) && $item['expires_at'] > $now ) {
				$found_index = $index;
				break;
			}
		}
	}

	if ( $found_index === -1 ) {
		return our_error( 'Invalid or expired refresh token.', 401, 'invalid_refresh_token' );
	}

	// Invalidate the consumed refresh token (one-time use)
	unset( $stored[ $found_index ] );
	update_user_meta( $user_id, 'our_refresh_tokens', array_values( $stored ) );

	return $user_id;
}

/**
 * Check if a JWT is blacklisted in our_revoked_tokens table.
 *
 * @param string $token JWT token string.
 * @return bool True if blacklisted, false otherwise.
 */
function our_is_token_revoked( $token ) {
	global $wpdb;
	$table      = $wpdb->prefix . 'our_revoked_tokens';
	$token_hash = hash( 'sha256', $token );

	$found = $wpdb->get_var(
		$wpdb->prepare(
			"SELECT 1 FROM {$table} WHERE token_hash = %s LIMIT 1",
			$token_hash
		)
	);

	return ! empty( $found );
}

/**
 * Add a JWT token to the revocation blacklist.
 *
 * @param string   $token      JWT string.
 * @param int|null $user_id    User ID if known.
 * @param int|null $expires_at UNIX timestamp of expiry.
 * @return bool
 */
function our_revoke_jwt( $token, $user_id = null, $expires_at = null ) {
	global $wpdb;
	$table      = $wpdb->prefix . 'our_revoked_tokens';
	$token_hash = hash( 'sha256', $token );

	if ( ! $expires_at ) {
		$expires_at = time() + our_get_token_ttl();
	}

	$expires_at_mysql = gmdate( 'Y-m-d H:i:s', $expires_at );
	$created_at_mysql = gmdate( 'Y-m-d H:i:s', time() );

	$inserted = $wpdb->replace(
		$table,
		[
			'user_id'    => $user_id ? (int) $user_id : 0,
			'token_hash' => $token_hash,
			'expires_at' => $expires_at_mysql,
			'created_at' => $created_at_mysql,
		],
		[ '%d', '%s', '%s', '%s' ]
	);

	return false !== $inserted;
}

/**
 * Revoke all tokens for a specific user (force re-login).
 *
 * @param int $user_id User ID.
 * @return void
 */
function our_revoke_all_user_tokens( $user_id ) {
	// Set timestamp after which tokens must have been issued
	update_user_meta( $user_id, 'our_jwt_revoked_before', time() );

	// Delete all refresh tokens
	delete_user_meta( $user_id, 'our_refresh_tokens' );
}

/**
 * Extract the Bearer token from the incoming request.
 *
 * @param WP_REST_Request|null $request REST request object.
 * @return string|false
 */
function our_get_bearer_token( $request = null ) {
	$auth_header = '';

	if ( $request instanceof WP_REST_Request ) {
		$auth_header = $request->get_header( 'Authorization' );
	}

	if ( empty( $auth_header ) ) {
		if ( ! empty( $_SERVER['HTTP_AUTHORIZATION'] ) ) {
			$auth_header = sanitize_text_field( $_SERVER['HTTP_AUTHORIZATION'] );
		} elseif ( ! empty( $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ) ) {
			$auth_header = sanitize_text_field( $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] );
		} elseif ( function_exists( 'getallheaders' ) ) {
			$headers = getallheaders();
			if ( isset( $headers['Authorization'] ) ) {
				$auth_header = sanitize_text_field( $headers['Authorization'] );
			} elseif ( isset( $headers['authorization'] ) ) {
				$auth_header = sanitize_text_field( $headers['authorization'] );
			}
		}
	}

	if ( empty( $auth_header ) ) {
		return false;
	}

	if ( preg_match( '/Bearer\s+(.*)$/i', $auth_header, $matches ) ) {
		return trim( $matches[1] );
	}

	return false;
}

/**
 * Validate a JWT token and return decoded payload or WP_Error.
 *
 * @param string $token JWT token string.
 * @return object|WP_Error Decoded token object or WP_Error.
 */
function our_validate_jwt( $token ) {
	if ( empty( $token ) ) {
		return our_error( 'Authorization header not found or token missing.', 401, 'unauthorized' );
	}

	// Check if token is blacklisted
	if ( our_is_token_revoked( $token ) ) {
		return our_error( 'Token has been revoked.', 401, 'unauthorized' );
	}

	$secret = our_get_jwt_secret();
	if ( ! $secret ) {
		return our_error( 'JWT Secret Key is not configured.', 500, 'jwt_secret_missing' );
	}

	try {
		$decoded = JWT::decode( $token, new Key( $secret, 'HS256' ) );
	} catch ( \Exception $e ) {
		return our_error( 'Invalid or expired token.', 401, 'unauthorized' );
	}

	// Validate issuer
	$site_url = get_bloginfo( 'url' );
	if ( empty( $decoded->iss ) || $decoded->iss !== $site_url ) {
		return our_error( 'Invalid token issuer.', 401, 'unauthorized' );
	}

	// Validate user ID
	$user_id = isset( $decoded->data->user->id ) ? (int) $decoded->data->user->id : 0;
	if ( ! $user_id || ! get_user_by( 'id', $user_id ) ) {
		return our_error( 'User not found.', 401, 'unauthorized' );
	}

	// Check if all tokens for this user were invalidated before this token was issued
	$revoked_before = (int) get_user_meta( $user_id, 'our_jwt_revoked_before', true );
	if ( $revoked_before && isset( $decoded->iat ) && $decoded->iat < $revoked_before ) {
		return our_error( 'Token has expired due to password change or logout.', 401, 'unauthorized' );
	}

	return $decoded;
}

/**
 * Permission callback for all protected routes.
 *
 * @param WP_REST_Request $request REST request.
 * @return bool|WP_Error True if authorized, WP_Error with 401 if unauthorized.
 */
function our_require_jwt( $request ) {
	$token = our_get_bearer_token( $request );
	if ( ! $token ) {
		return our_error( 'Authorization token is required.', 401, 'unauthorized' );
	}

	$decoded = our_validate_jwt( $token );
	if ( is_wp_error( $decoded ) ) {
		return $decoded;
	}

	$user_id = (int) $decoded->data->user->id;
	wp_set_current_user( $user_id );

	return true;
}

/**
 * Alias for our_require_jwt.
 */
function our_permission_jwt_auth( $request ) {
	return our_require_jwt( $request );
}


/**
 * Format full user object according to specification.
 *
 * @param int $user_id User ID.
 * @return array
 */
function our_get_user_data( $user_id ) {
	$user = get_userdata( $user_id );
	if ( ! $user ) {
		return [];
	}

	$phone = get_user_meta( $user_id, 'billing_phone', true );
	if ( empty( $phone ) ) {
		$phone = get_user_meta( $user_id, 'phone', true );
	}

	// Check custom avatar
	$avatar_id  = get_user_meta( $user_id, 'our_avatar_id', true );
	$avatar_url = '';
	if ( $avatar_id ) {
		$avatar_url = wp_get_attachment_image_url( (int) $avatar_id, 'full' );
	}
	if ( ! $avatar_url ) {
		$avatar_url = get_avatar_url( $user_id, [ 'size' => 256 ] );
	}

	// WooCommerce billing & shipping
	$billing  = [];
	$shipping = [];

	if ( class_exists( 'WC_Customer' ) ) {
		try {
			$customer = new WC_Customer( $user_id );
			$billing  = $customer->get_billing();
			$shipping = $customer->get_shipping();
		} catch ( \Exception $e ) {
			// Fallback to meta if customer object fails
		}
	}

	if ( empty( $billing ) ) {
		$billing = [
			'first_name' => (string) get_user_meta( $user_id, 'billing_first_name', true ),
			'last_name'  => (string) get_user_meta( $user_id, 'billing_last_name', true ),
			'company'    => (string) get_user_meta( $user_id, 'billing_company', true ),
			'address_1'  => (string) get_user_meta( $user_id, 'billing_address_1', true ),
			'address_2'  => (string) get_user_meta( $user_id, 'billing_address_2', true ),
			'city'       => (string) get_user_meta( $user_id, 'billing_city', true ),
			'state'      => (string) get_user_meta( $user_id, 'billing_state', true ),
			'postcode'   => (string) get_user_meta( $user_id, 'billing_postcode', true ),
			'country'    => (string) get_user_meta( $user_id, 'billing_country', true ),
			'email'      => (string) ( get_user_meta( $user_id, 'billing_email', true ) ?: $user->user_email ),
			'phone'      => (string) get_user_meta( $user_id, 'billing_phone', true ),
		];
	}

	if ( empty( $shipping ) ) {
		$shipping = [
			'first_name' => (string) get_user_meta( $user_id, 'shipping_first_name', true ),
			'last_name'  => (string) get_user_meta( $user_id, 'shipping_last_name', true ),
			'company'    => (string) get_user_meta( $user_id, 'shipping_company', true ),
			'address_1'  => (string) get_user_meta( $user_id, 'shipping_address_1', true ),
			'address_2'  => (string) get_user_meta( $user_id, 'shipping_address_2', true ),
			'city'       => (string) get_user_meta( $user_id, 'shipping_city', true ),
			'state'      => (string) get_user_meta( $user_id, 'shipping_state', true ),
			'postcode'   => (string) get_user_meta( $user_id, 'shipping_postcode', true ),
			'country'    => (string) get_user_meta( $user_id, 'shipping_country', true ),
			'phone'      => (string) get_user_meta( $user_id, 'shipping_phone', true ),
		];
	}

	$date_of_birth = get_user_meta( $user_id, 'date_of_birth', true );
	if ( empty( $date_of_birth ) ) {
		$date_of_birth = get_user_meta( $user_id, 'our_date_of_birth', true );
	}

	return [
		'id'            => $user->ID,
		'email'         => $user->user_email,
		'first_name'    => $user->first_name,
		'last_name'     => $user->last_name,
		'display_name'  => $user->display_name,
		'phone'         => (string) $phone,
		'date_of_birth' => (string) $date_of_birth,
		'roles'         => array_values( $user->roles ),
		'avatar_url'    => (string) $avatar_url,
		'billing'       => $billing,
		'shipping'      => $shipping,
	];
}
