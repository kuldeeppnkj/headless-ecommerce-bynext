<?php
/**
 * Plugin Name: Our Headless API
 * Description: Production-ready headless API layer for WooCommerce.
 * Version: 1.0.0
 * Author: Antigravity
 *
 * @package OurAPI
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants
define( 'OUR_API_VERSION', '1.0.0' );
define( 'OUR_API_DIR', plugin_dir_path( __FILE__ ) );
define( 'OUR_API_INCLUDES', OUR_API_DIR . 'includes/' );

// Load core dependencies
require_once OUR_API_INCLUDES . 'helpers.php';
require_once OUR_API_INCLUDES . 'cors.php';
require_once OUR_API_INCLUDES . 'rate-limit.php';

// Phase 1: Authentication
if ( file_exists( OUR_API_INCLUDES . 'auth.php' ) ) {
	require_once OUR_API_INCLUDES . 'auth.php';
}

// Phase 2: Profile
if ( file_exists( OUR_API_INCLUDES . 'profile.php' ) ) {
	require_once OUR_API_INCLUDES . 'profile.php';
}

// Phase 3: Password Reset
if ( file_exists( OUR_API_INCLUDES . 'password-reset.php' ) ) {
	require_once OUR_API_INCLUDES . 'password-reset.php';
}

// Phase 4: Catalog Helpers
if ( file_exists( OUR_API_INCLUDES . 'catalog.php' ) ) {
	require_once OUR_API_INCLUDES . 'catalog.php';
}

// Phase 5: Cart Helpers
if ( file_exists( OUR_API_INCLUDES . 'cart.php' ) ) {
	require_once OUR_API_INCLUDES . 'cart.php';
}

// Phase 6: Checkout & Orders
if ( file_exists( OUR_API_INCLUDES . 'checkout.php' ) ) {
	require_once OUR_API_INCLUDES . 'checkout.php';
}
if ( file_exists( OUR_API_INCLUDES . 'orders.php' ) ) {
	require_once OUR_API_INCLUDES . 'orders.php';
}

// Phase 2 New Endpoints: Shipping, Addresses, Favourites, Home & Categories
if ( file_exists( OUR_API_INCLUDES . 'shipping.php' ) ) {
	require_once OUR_API_INCLUDES . 'shipping.php';
}
if ( file_exists( OUR_API_INCLUDES . 'addresses.php' ) ) {
	require_once OUR_API_INCLUDES . 'addresses.php';
}
if ( file_exists( OUR_API_INCLUDES . 'favourites.php' ) ) {
	require_once OUR_API_INCLUDES . 'favourites.php';
}
if ( file_exists( OUR_API_INCLUDES . 'home.php' ) ) {
	require_once OUR_API_INCLUDES . 'home.php';
}

/**
 * Initialize custom database tables.
 */
add_action( 'init', 'our_init_db_tables', 5 );
function our_init_db_tables() {
	global $wpdb;

	$table_name      = $wpdb->prefix . 'our_revoked_tokens';
	$charset_collate = $wpdb->get_charset_collate();

	$sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
		id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
		user_id bigint(20) unsigned NOT NULL,
		token_hash varchar(64) NOT NULL,
		expires_at datetime NOT NULL,
		created_at datetime NOT NULL,
		PRIMARY KEY  (id),
		KEY token_hash (token_hash)
	) {$charset_collate};";

	$wpdb->query( $sql );
}

/**
 * Setup daily cron job for cleaning up expired revoked tokens.
 */
if ( ! wp_next_scheduled( 'our_cleanup_revoked_tokens' ) ) {
	wp_schedule_event( time(), 'daily', 'our_cleanup_revoked_tokens' );
}

add_action( 'our_cleanup_revoked_tokens', 'our_cleanup_revoked_tokens_callback' );
function our_cleanup_revoked_tokens_callback() {
	global $wpdb;
	$table = $wpdb->prefix . 'our_revoked_tokens';
	$wpdb->query( "DELETE FROM {$table} WHERE expires_at < NOW()" );
}
