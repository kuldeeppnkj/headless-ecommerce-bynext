<?php
/**
 * Password Reset REST endpoints (Phase 3).
 *
 * @package OurAPI
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register password reset routes.
 */
add_action( 'rest_api_init', 'our_register_password_reset_routes' );
function our_register_password_reset_routes() {
	$namespace = defined( 'OUR_API_NAMESPACE' ) ? OUR_API_NAMESPACE : 'our/v1';

	// POST /our/v1/forgot-password
	register_rest_route(
		$namespace,
		'/forgot-password',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'our_handle_forgot_password',
			'permission_callback' => '__return_true',
		]
	);

	// POST /our/v1/verify-reset-token
	register_rest_route(
		$namespace,
		'/verify-reset-token',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'our_handle_verify_reset_token',
			'permission_callback' => '__return_true',
		]
	);

	// POST /our/v1/reset-password
	register_rest_route(
		$namespace,
		'/reset-password',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'our_handle_reset_password',
			'permission_callback' => '__return_true',
		]
	);
}

/**
 * Filter retrieve password message to link directly to the headless frontend.
 */
add_filter( 'retrieve_password_message', 'our_customize_retrieve_password_message', 10, 4 );
function our_customize_retrieve_password_message( $message, $key, $user_login, $user_data ) {
	$frontend_url = defined( 'OUR_FRONTEND_URL' ) ? rtrim( OUR_FRONTEND_URL, '/' ) : 'http://localhost:3000';
	$reset_url    = $frontend_url . '/reset-password?key=' . rawurlencode( $key ) . '&login=' . rawurlencode( $user_login );

	$site_name = wp_specialchars_decode( get_option( 'blogname' ), ENT_QUOTES );

	$custom_message  = sprintf( "Hi %s,\r\n\r\n", $user_data->first_name ?: $user_login );
	$custom_message .= sprintf( "A password reset request was made for your account on %s.\r\n\r\n", $site_name );
	$custom_message .= "You can reset your password by clicking or visiting the following link:\r\n";
	$custom_message .= $reset_url . "\r\n\r\n";
	$custom_message .= "If you did not make this request, you can safely ignore this email.\r\n\r\n";
	$custom_message .= sprintf( "Best regards,\r\nThe %s Team", $site_name );

	return $custom_message;
}

/**
 * Store the latest reset key in transient for headless testing when WP_DEBUG is true.
 */
add_action( 'retrieve_password_key', 'our_record_password_reset_key', 10, 2 );
function our_record_password_reset_key( $user_login, $key ) {
	set_transient( 'our_debug_reset_key_' . md5( $user_login ), $key, 300 );
}

/**
 * Handle POST /forgot-password route.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function our_handle_forgot_password( WP_REST_Request $request ) {
	// Rate limiting: reuse OUR_RATE_LIMIT_REGISTER
	$max_requests = defined( 'OUR_RATE_LIMIT_REGISTER' ) ? (int) OUR_RATE_LIMIT_REGISTER : 3;
	$rate_check   = our_rate_limit_check( 'forgot_password', $max_requests, 60 );
	if ( is_wp_error( $rate_check ) ) {
		return $rate_check;
	}

	$email = sanitize_email( $request->get_param( 'email' ) );

	if ( empty( $email ) || ! is_email( $email ) ) {
		return our_error( 'A valid email address is required.', 400, 'invalid_email' );
	}

	// Call core WordPress retrieve_password()
	retrieve_password( $email );

	// Always return uniform success response to prevent user enumeration
	return our_response(
		null,
		'If the email exists, a reset link has been sent.',
		200
	);
}

/**
 * Helper to resolve actual user_login from login or email string.
 *
 * @param string $login Username or email.
 * @return WP_User|false
 */
function our_find_user_for_reset( $login ) {
	$login = sanitize_text_field( wp_unslash( $login ) );
	if ( empty( $login ) ) {
		return false;
	}

	$user = get_user_by( 'login', $login );
	if ( ! $user && is_email( $login ) ) {
		$user = get_user_by( 'email', $login );
	}

	return $user;
}

/**
 * Handle POST /verify-reset-token route.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response
 */
function our_handle_verify_reset_token( WP_REST_Request $request ) {
	$login = sanitize_text_field( $request->get_param( 'login' ) );
	$key   = sanitize_text_field( $request->get_param( 'key' ) );

	if ( empty( $login ) || empty( $key ) ) {
		return our_response(
			[
				'valid'      => false,
				'user_id'    => null,
				'user_email' => null,
			],
			'Reset key and login are required.',
			200
		);
	}

	$user = our_find_user_for_reset( $login );
	if ( ! $user ) {
		return our_response(
			[
				'valid'      => false,
				'user_id'    => null,
				'user_email' => null,
			],
			'Invalid or expired reset token.',
			200
		);
	}

	$check = check_password_reset_key( $key, $user->user_login );

	if ( is_wp_error( $check ) ) {
		return our_response(
			[
				'valid'      => false,
				'user_id'    => null,
				'user_email' => null,
			],
			'Invalid or expired reset token.',
			200
		);
	}

	return our_response(
		[
			'valid'      => true,
			'user_id'    => $user->ID,
			'user_email' => $user->user_email,
		],
		'Reset token is valid.',
		200
	);
}

/**
 * Handle POST /reset-password route.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function our_handle_reset_password( WP_REST_Request $request ) {
	$max_requests = defined( 'OUR_RATE_LIMIT_REGISTER' ) ? (int) OUR_RATE_LIMIT_REGISTER : 3;
	$rate_check   = our_rate_limit_check( 'reset_password', $max_requests, 60 );
	if ( is_wp_error( $rate_check ) ) {
		return $rate_check;
	}

	$login            = sanitize_text_field( $request->get_param( 'login' ) );
	$key              = sanitize_text_field( $request->get_param( 'key' ) );
	$new_password     = (string) $request->get_param( 'new_password' );
	$confirm_password = (string) $request->get_param( 'confirm_password' );

	if ( empty( $login ) || empty( $key ) || empty( $new_password ) || empty( $confirm_password ) ) {
		return our_error( 'Login, reset key, new password, and confirmation password are required.', 400, 'missing_required_fields' );
	}

	if ( strlen( $new_password ) < 8 ) {
		return our_error( 'New password must be at least 8 characters long.', 400, 'weak_password' );
	}

	if ( $new_password !== $confirm_password ) {
		return our_error( 'New password and confirmation password do not match.', 400, 'password_mismatch' );
	}

	$user = our_find_user_for_reset( $login );
	if ( ! $user ) {
		return our_error( 'Invalid or expired reset token.', 400, 'invalid_reset_token' );
	}

	// Validate token again
	$check = check_password_reset_key( $key, $user->user_login );
	if ( is_wp_error( $check ) ) {
		return our_error( 'Invalid or expired reset token.', 400, 'invalid_reset_token' );
	}

	// Reset password using WordPress core
	reset_password( $user, $new_password );

	// Revoke all existing JWTs for this user
	our_revoke_all_user_tokens( $user->ID );

	return our_response(
		[
			'success' => true,
		],
		'Password reset successfully. You can now log in with your new password.',
		200
	);
}

