<?php
/**
 * Profile REST endpoints (Phase 2).
 *
 * @package OurAPI
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register profile routes.
 */
add_action( 'rest_api_init', 'our_register_profile_routes' );
function our_register_profile_routes() {
	$namespace = defined( 'OUR_API_NAMESPACE' ) ? OUR_API_NAMESPACE : 'our/v1';

	// GET /our/v1/profile
	register_rest_route(
		$namespace,
		'/profile',
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'our_handle_get_profile',
			'permission_callback' => 'our_require_jwt',
		]
	);

	// PUT /our/v1/profile (also allow PATCH)
	register_rest_route(
		$namespace,
		'/profile',
		[
			'methods'             => [ 'PUT', 'PATCH' ],
			'callback'            => 'our_handle_update_profile',
			'permission_callback' => 'our_require_jwt',
		]
	);

	// POST /our/v1/change-password
	register_rest_route(
		$namespace,
		'/change-password',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'our_handle_change_password',
			'permission_callback' => 'our_require_jwt',
		]
	);

	// POST /our/v1/upload-avatar
	register_rest_route(
		$namespace,
		'/upload-avatar',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'our_handle_upload_avatar',
			'permission_callback' => 'our_require_jwt',
		]
	);
}

/**
 * Handle GET /profile route.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response
 */
function our_handle_get_profile( WP_REST_Request $request ) {
	$user_id = get_current_user_id();

	return our_response(
		our_get_user_data( $user_id ),
		'Profile retrieved successfully.',
		200
	);
}

/**
 * Handle PUT /profile route.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function our_handle_update_profile( WP_REST_Request $request ) {
	$user_id         = get_current_user_id();
	$user_updates    = [ 'ID' => $user_id ];
	$has_user_update = false;

	$first_name = $request->get_param( 'first_name' );
	if ( null !== $first_name ) {
		$first_name                 = sanitize_text_field( $first_name );
		$user_updates['first_name'] = $first_name;
		update_user_meta( $user_id, 'first_name', $first_name );
		update_user_meta( $user_id, 'billing_first_name', $first_name );
		$has_user_update = true;
	}

	$last_name = $request->get_param( 'last_name' );
	if ( null !== $last_name ) {
		$last_name                 = sanitize_text_field( $last_name );
		$user_updates['last_name'] = $last_name;
		update_user_meta( $user_id, 'last_name', $last_name );
		update_user_meta( $user_id, 'billing_last_name', $last_name );
		$has_user_update = true;
	}

	$display_name = $request->get_param( 'display_name' );
	if ( null !== $display_name ) {
		$display_name                 = sanitize_text_field( $display_name );
		$user_updates['display_name'] = $display_name;
		$has_user_update              = true;
	}

	if ( $has_user_update ) {
		$update_result = wp_update_user( $user_updates );
		if ( is_wp_error( $update_result ) ) {
			return our_error( $update_result->get_error_message(), 500, 'profile_update_failed' );
		}
	}

	$phone = $request->get_param( 'phone' );
	if ( null !== $phone ) {
		$phone = sanitize_text_field( $phone );
		update_user_meta( $user_id, 'billing_phone', $phone );
		update_user_meta( $user_id, 'phone', $phone );
	}

	$date_of_birth = $request->get_param( 'date_of_birth' );
	if ( null !== $date_of_birth ) {
		$date_of_birth = sanitize_text_field( $date_of_birth );
		update_user_meta( $user_id, 'date_of_birth', $date_of_birth );
		update_user_meta( $user_id, 'our_date_of_birth', $date_of_birth );
	}

	$customer = null;
	if ( class_exists( 'WC_Customer' ) ) {
		try {
			$customer = new WC_Customer( $user_id );
		} catch ( \Exception $e ) {
			$customer = null;
		}
	}

	$billing = $request->get_param( 'billing' );
	if ( is_array( $billing ) ) {
		foreach ( $billing as $key => $val ) {
			$clean_key = sanitize_key( $key );
			$clean_val = sanitize_text_field( $val );
			if ( $customer && is_callable( [ $customer, 'set_billing_' . $clean_key ] ) ) {
				$customer->{ 'set_billing_' . $clean_key }( $clean_val );
			}
			update_user_meta( $user_id, 'billing_' . $clean_key, $clean_val );
		}
	}

	$shipping = $request->get_param( 'shipping' );
	if ( is_array( $shipping ) ) {
		foreach ( $shipping as $key => $val ) {
			$clean_key = sanitize_key( $key );
			$clean_val = sanitize_text_field( $val );
			if ( $customer && is_callable( [ $customer, 'set_shipping_' . $clean_key ] ) ) {
				$customer->{ 'set_shipping_' . $clean_key }( $clean_val );
			}
			update_user_meta( $user_id, 'shipping_' . $clean_key, $clean_val );
		}
	}

	if ( $customer ) {
		$customer->save();
	}

	return our_response(
		our_get_user_data( $user_id ),
		'Profile updated successfully.',
		200
	);
}

/**
 * Handle POST /change-password route.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function our_handle_change_password( WP_REST_Request $request ) {
	$current_password = (string) $request->get_param( 'current_password' );
	$new_password     = (string) $request->get_param( 'new_password' );
	$confirm_password = (string) $request->get_param( 'confirm_password' );

	if ( empty( $current_password ) || empty( $new_password ) || empty( $confirm_password ) ) {
		return our_error( 'Current password, new password, and confirmation password are required.', 400, 'missing_required_fields' );
	}

	if ( strlen( $new_password ) < 8 ) {
		return our_error( 'New password must be at least 8 characters long.', 400, 'weak_password' );
	}

	if ( $new_password !== $confirm_password ) {
		return our_error( 'New password and confirmation password do not match.', 400, 'password_mismatch' );
	}

	$user_id = get_current_user_id();
	$user    = get_user_by( 'id', $user_id );

	if ( ! $user || ! wp_check_password( $current_password, $user->user_pass, $user_id ) ) {
		return our_error( 'Current password is incorrect.', 400, 'invalid_current_password' );
	}

	// Update password via WordPress core
	wp_set_password( $new_password, $user_id );

	// Revoke all existing JWTs for this user (force re-login)
	our_revoke_all_user_tokens( $user_id );

	return our_response(
		[ 'success' => true ],
		'Password changed successfully. Please log in again with your new password.',
		200
	);
}

/**
 * Handle POST /upload-avatar route.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function our_handle_upload_avatar( WP_REST_Request $request ) {
	if ( empty( $_FILES['avatar'] ) || ! isset( $_FILES['avatar']['error'] ) || UPLOAD_ERR_OK !== $_FILES['avatar']['error'] ) {
		return our_error( 'No avatar file uploaded or file upload error occurred.', 400, 'missing_avatar' );
	}

	$file = $_FILES['avatar'];

	// 1. Max size: 2MB (2097152 bytes)
	$max_size = 2 * 1024 * 1024;
	if ( $file['size'] > $max_size ) {
		return our_error( 'Avatar file exceeds the maximum allowed size of 2MB.', 400, 'file_too_large' );
	}

	// 2. Validate MIME type (jpg, png, webp)
	$allowed_mimes = [
		'image/jpeg' => 'jpg',
		'image/pjpeg' => 'jpg',
		'image/png'  => 'png',
		'image/webp' => 'webp',
	];

	$file_mime = '';
	if ( function_exists( 'mime_content_type' ) && ! empty( $file['tmp_name'] ) ) {
		$file_mime = mime_content_type( $file['tmp_name'] );
	}

	if ( empty( $file_mime ) || ! array_key_exists( $file_mime, $allowed_mimes ) ) {
		// Fallback to wp_check_filetype
		$wp_filetype = wp_check_filetype( $file['name'], $allowed_mimes );
		if ( empty( $wp_filetype['type'] ) ) {
			return our_error( 'Invalid file type. Allowed formats: JPG, PNG, and WebP.', 400, 'invalid_file_type' );
		}
	}

	require_once ABSPATH . 'wp-admin/includes/image.php';
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';

	$user_id = get_current_user_id();

	// Use media_handle_upload
	$attachment_id = media_handle_upload( 'avatar', 0 );
	if ( is_wp_error( $attachment_id ) ) {
		return our_error( $attachment_id->get_error_message(), 500, 'upload_failed' );
	}

	// Update user meta our_avatar_id
	update_user_meta( $user_id, 'our_avatar_id', $attachment_id );

	$avatar_url = wp_get_attachment_image_url( $attachment_id, 'full' );
	if ( ! $avatar_url ) {
		$avatar_url = wp_get_attachment_url( $attachment_id );
	}

	return our_response(
		[ 'avatar_url' => $avatar_url ],
		'Avatar uploaded successfully.',
		200
	);
}

