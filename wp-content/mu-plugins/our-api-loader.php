<?php
/**
 * Plugin Name: Our Headless API Loader
 * Description: Automatically loads the Our Headless API suite from the our-api directory.
 * Version: 1.0.0
 * Author: Antigravity
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$our_api_entry = __DIR__ . '/our-api/our-api.php';
if ( file_exists( $our_api_entry ) ) {
	require_once $our_api_entry;
}

