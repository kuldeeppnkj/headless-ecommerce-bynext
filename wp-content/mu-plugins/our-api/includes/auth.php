<?php
/**
 * Authentication REST endpoints (Phase 1).
 *
 * @package OurAPI
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register authentication routes.
 */
add_action( 'rest_api_init', 'our_register_auth_routes' );
function our_register_auth_routes() {
	$namespace = defined( 'OUR_API_NAMESPACE' ) ? OUR_API_NAMESPACE : 'our/v1';

	// POST /our/v1/register
	register_rest_route(
		$namespace,
		'/register',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'our_handle_register',
			'permission_callback' => '__return_true',
		]
	);

	// POST /our/v1/login
	register_rest_route(
		$namespace,
		'/login',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'our_handle_login',
			'permission_callback' => '__return_true',
		]
	);

	// POST /our/v1/refresh
	register_rest_route(
		$namespace,
		'/refresh',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'our_handle_refresh_token',
			'permission_callback' => '__return_true',
		]
	);

	// POST /our/v1/logout
	register_rest_route(
		$namespace,
		'/logout',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'our_handle_logout',
			'permission_callback' => 'our_require_jwt',
		]
	);

	// GET /our/v1/me
	register_rest_route(
		$namespace,
		'/me',
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'our_handle_get_me',
			'permission_callback' => 'our_require_jwt',
		]
	);
}

/**
 * Handle user registration.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function our_handle_register( WP_REST_Request $request ) {
	$max_requests = defined( 'OUR_RATE_LIMIT_REGISTER' ) ? (int) OUR_RATE_LIMIT_REGISTER : 3;
	$rate_check   = our_rate_limit_check( 'register', $max_requests, 60 );
	if ( is_wp_error( $rate_check ) ) {
		return $rate_check;
	}

	$first_name = sanitize_text_field( $request->get_param( 'first_name' ) );
	$last_name  = sanitize_text_field( $request->get_param( 'last_name' ) );
	$email      = sanitize_email( $request->get_param( 'email' ) );
	$password   = (string) $request->get_param( 'password' );
	$phone      = sanitize_text_field( $request->get_param( 'phone' ) );

	if ( empty( $email ) || empty( $password ) ) {
		return our_error( 'Email and password are required.', 400, 'missing_required_fields' );
	}

	if ( empty( $first_name ) || empty( $last_name ) ) {
		return our_error( 'First name and last name are required.', 400, 'missing_required_fields' );
	}

	if ( ! is_email( $email ) ) {
		return our_error( 'Invalid email address format.', 400, 'invalid_email' );
	}

	if ( strlen( $password ) < 8 ) {
		return our_error( 'Password must be at least 8 characters long.', 400, 'weak_password' );
	}

	if ( email_exists( $email ) ) {
		return our_error( 'An account with this email address already exists.', 409, 'email_exists' );
	}

	$username = $email;
	if ( username_exists( $username ) ) {
		$username = sanitize_user( current( explode( '@', $email ) ) ) . '_' . wp_rand( 100, 999 );
	}

	$user_id = wp_insert_user(
		[
			'user_login'   => $username,
			'user_email'   => $email,
			'user_pass'    => $password,
			'first_name'   => $first_name,
			'last_name'    => $last_name,
			'display_name' => trim( $first_name . ' ' . $last_name ),
			'role'         => 'customer',
		]
	);

	if ( is_wp_error( $user_id ) ) {
		return our_error( $user_id->get_error_message(), 500, 'user_creation_failed' );
	}

	// Update phone & default customer metadata
	if ( ! empty( $phone ) ) {
		update_user_meta( $user_id, 'billing_phone', $phone );
		update_user_meta( $user_id, 'phone', $phone );
	}
	update_user_meta( $user_id, 'billing_first_name', $first_name );
	update_user_meta( $user_id, 'billing_last_name', $last_name );
	update_user_meta( $user_id, 'billing_email', $email );

	// Send welcome email via wp_mail
	$site_name = wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES );
	$subject   = sprintf( 'Welcome to %s', $site_name );
	$message   = sprintf(
		"Hi %s,\n\nThank you for creating an account at %s. You can now log in using your email address (%s).\n\nBest regards,\nThe %s Team",
		$first_name,
		$site_name,
		$email,
		$site_name
	);
	$headers   = [ 'Content-Type: text/plain; charset=UTF-8' ];
	@wp_mail( $email, $subject, $message, $headers );

	// Generate JWT and refresh token
	$token         = our_generate_jwt( $user_id );
	if ( is_wp_error( $token ) ) {
		return $token;
	}

	$refresh_token = our_generate_refresh_token( $user_id );
	$expires_in    = our_get_token_ttl();

	return our_response(
		[
			'user'          => our_get_user_data( $user_id ),
			'token'         => $token,
			'refresh_token' => $refresh_token,
			'expires_in'    => $expires_in,
		],
		'User registered successfully.',
		201
	);
}

/**
 * Handle user login.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function our_handle_login( WP_REST_Request $request ) {
	$max_requests = defined( 'OUR_RATE_LIMIT_LOGIN' ) ? (int) OUR_RATE_LIMIT_LOGIN : 30;
	$rate_check   = our_rate_limit_check( 'login', $max_requests, 60 );
	if ( is_wp_error( $rate_check ) ) {
		return $rate_check;
	}

	$identifier = sanitize_text_field( $request->get_param( 'username' ) ?: $request->get_param( 'email' ) );
	$password   = (string) $request->get_param( 'password' );

	if ( empty( $identifier ) || empty( $password ) ) {
		return our_error( 'Invalid credentials.', 401, 'invalid_credentials' );
	}

	// Authenticate user via core WordPress (supports username or email)
	$user = wp_authenticate( $identifier, $password );

	if ( is_wp_error( $user ) ) {
		// Generic error message to prevent user enumeration
		return our_error( 'Invalid credentials.', 401, 'invalid_credentials' );
	}

	$token         = our_generate_jwt( $user->ID );
	if ( is_wp_error( $token ) ) {
		return $token;
	}

	$refresh_token = our_generate_refresh_token( $user->ID );
	$expires_in    = our_get_token_ttl();

	return our_response(
		[
			'user'          => our_get_user_data( $user->ID ),
			'token'         => $token,
			'refresh_token' => $refresh_token,
			'expires_in'    => $expires_in,
		],
		'Login successful.',
		200
	);
}

/**
 * Handle refresh token request.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function our_handle_refresh_token( WP_REST_Request $request ) {
	$refresh_token = sanitize_text_field( $request->get_param( 'refresh_token' ) );

	if ( empty( $refresh_token ) ) {
		return our_error( 'Refresh token is required.', 400, 'missing_refresh_token' );
	}

	$user_id = our_verify_and_consume_refresh_token( $refresh_token );
	if ( is_wp_error( $user_id ) ) {
		return $user_id;
	}

	$new_token         = our_generate_jwt( $user_id );
	if ( is_wp_error( $new_token ) ) {
		return $new_token;
	}

	$new_refresh_token = our_generate_refresh_token( $user_id );
	$expires_in        = our_get_token_ttl();

	return our_response(
		[
			'token'         => $new_token,
			'refresh_token' => $new_refresh_token,
			'expires_in'    => $expires_in,
		],
		'Token refreshed successfully.',
		200
	);
}

/**
 * Handle user logout and blacklist current JWT.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response
 */
function our_handle_logout( WP_REST_Request $request ) {
	$token = our_get_bearer_token( $request );
	if ( $token ) {
		$user_id    = get_current_user_id();
		$decoded    = our_validate_jwt( $token );
		$expires_at = ( ! is_wp_error( $decoded ) && isset( $decoded->exp ) ) ? (int) $decoded->exp : ( time() + our_get_token_ttl() );
		our_revoke_jwt( $token, $user_id, $expires_at );
	}

	return our_response(
		[
			'success' => true,
		],
		'Logged out successfully.',
		200
	);
}

/**
 * Handle GET /me route.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response
 */
function our_handle_get_me( WP_REST_Request $request ) {
	$user_id = get_current_user_id();

	return our_response(
		our_get_user_data( $user_id ),
		'Current user profile retrieved successfully.',
		200
	);
}

