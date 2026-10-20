<?php
/**
 * Headless Next.js Dynamic Page Builder & Tabbed Theme Settings using Carbon Fields.
 *
 * Implements:
 * PART 1: Tabbed Theme Settings (Global & Layout, Header & Announcement, Color Palette,
 *         Homepage Sections, Footer Settings, Shop & Products, Contact & Laboratory Info, Import / Export).
 * PART 2: Page Sections Flexible Content via Complex Field (hero, product_grid, about_story, cta_banner).
 * PART 3: REST API Exposure (custom_sections on Pages & nested /our/v1/theme-settings endpoint).
 *
 * @package TwentyTwentyFive
 */

use Carbon_Fields\Container;
use Carbon_Fields\Field;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * =========================================================================
 * PART 1: THEME SETTINGS (TABBED STRUCTURE) & PART 2: PAGE SECTIONS
 * =========================================================================
 */
add_action( 'carbon_fields_register_fields', 'our_register_carbon_fields' );
function our_register_carbon_fields() {

	// -------------------------------------------------------------------------
	// PART 1: THEME SETTINGS (Container with 8 Organized Tabs)
	// -------------------------------------------------------------------------
	Container::make( 'theme_options', __( 'Theme Settings' ) )
		->set_page_menu_title( __( 'Theme Settings' ) )
		->set_icon( 'dashicons-admin-generic' )

		// 1. TAB: Global & Layout
		->add_tab( __( 'Global & Layout' ), [
			Field::make( 'image', 'logo', __( 'Logo' ) )
				->set_help_text( __( 'Primary brand logo for dark/standard headers.' ) ),
			Field::make( 'image', 'logo_light', __( 'Logo Light Version' ) )
				->set_help_text( __( 'Light/white logo for transparent or dark background headers.' ) ),
			Field::make( 'image', 'favicon', __( 'Favicon' ) )
				->set_help_text( __( 'Site favicon (recommended 32x32 PNG or ICO).' ) ),
			Field::make( 'select', 'container_width', __( 'Container Width' ) )
				->set_options( [
					'1280px' => 'Standard (1280px)',
					'1440px' => 'Wide (1440px)',
					'1600px' => 'Extra Wide (1600px)',
					'100%'   => 'Full Width (100%)',
				] )
				->set_default_value( '1440px' ),
			Field::make( 'select', 'site_layout', __( 'Site Layout' ) )
				->set_options( [
					'wide'  => 'Wide',
					'boxed' => 'Boxed',
				] )
				->set_default_value( 'wide' ),
			Field::make( 'complex', 'social_links', __( 'Social Links' ) )
				->set_layout( 'grid' )
				->add_fields( [
					Field::make( 'text', 'network', __( 'Network Name' ) )
						->set_help_text( __( 'e.g. Instagram, Pinterest, Twitter, Facebook' ) ),
					Field::make( 'text', 'url', __( 'URL' ) ),
					Field::make( 'text', 'icon', __( 'Icon Class/SVG' ) )
						->set_help_text( __( 'Icon identifier (e.g. instagram, pinterest, twitter)' ) ),
				] ),
		] )

		// 2. TAB: Header & Announcement
		->add_tab( __( 'Header & Announcement' ), [
			Field::make( 'checkbox', 'enable_top_bar', __( 'Enable Top Bar' ) )
				->set_option_value( 'yes' )
				->set_default_value( true )
				->set_help_text( __( 'Toggle top announcement notification strip.' ) ),
			Field::make( 'text', 'announcement_text', __( 'Announcement Text' ) )
				->set_default_value( 'Complimentary Worldwide Express Shipping on Orders Above $500' ),
			Field::make( 'text', 'announcement_link', __( 'Announcement Link' ) )
				->set_default_value( '/shop' ),
			Field::make( 'color', 'announcement_bg_color', __( 'Background Color' ) )
				->set_default_value( '#463F3A' ),
			Field::make( 'select', 'header_layout', __( 'Header Layout' ) )
				->set_options( [
					'default' => 'Default (Centered Navigation)',
					'left'    => 'Logo Left / Nav Right',
					'minimal' => 'Minimal Fullscreen Drawer',
				] )
				->set_default_value( 'default' ),
			Field::make( 'checkbox', 'sticky_header', __( 'Sticky Header' ) )
				->set_option_value( 'yes' )
				->set_default_value( true )
				->set_help_text( __( 'Fix header to top on scrolling.' ) ),
			Field::make( 'complex', 'nav_items', __( 'Header Navigation' ) )
				->set_layout( 'grid' )
				->add_fields( [
					Field::make( 'text', 'label', __( 'Label' ) ),
					Field::make( 'text', 'url', __( 'URL' ) ),
				] ),
		] )

		// 3. TAB: Color Palette
		->add_tab( __( 'Color Palette' ), [
			Field::make( 'color', 'primary_color', __( 'Primary Color' ) )
				->set_default_value( '#463F3A' )
				->set_help_text( __( 'Brand signature primary color (default: #463F3A).' ) ),
			Field::make( 'color', 'accent_color', __( 'Accent / Secondary Color' ) )
				->set_default_value( '#E0AFA0' )
				->set_help_text( __( 'Brand warm blush accent color (default: #E0AFA0).' ) ),
			Field::make( 'color', 'bg_color', __( 'Background Color' ) )
				->set_default_value( '#F4F3EE' )
				->set_help_text( __( 'App background foundation color (default: #F4F3EE).' ) ),
			Field::make( 'color', 'text_color', __( 'Text Color' ) )
				->set_default_value( '#1B1C19' )
				->set_help_text( __( 'Primary text color.' ) ),
			Field::make( 'color', 'border_color', __( 'Border Color' ) )
				->set_default_value( '#E8E6E1' )
				->set_help_text( __( 'Subtle outline and divider color.' ) ),
		] )

		// 4. TAB: Homepage Sections
		->add_tab( __( 'Homepage Sections' ), [
			Field::make( 'checkbox', 'enable_newsletter_popup', __( 'Enable Newsletter Popup' ) )
				->set_option_value( 'yes' )
				->set_default_value( false ),
			Field::make( 'text', 'newsletter_heading', __( 'Newsletter Heading' ) )
				->set_default_value( 'Join the Atelier Circle' ),
			Field::make( 'textarea', 'newsletter_subheading', __( 'Newsletter Subheading' ) )
				->set_default_value( 'Receive private access to seasonal capsules and private previews.' ),
			Field::make( 'text', 'footer_cta_title', __( 'Footer CTA Title' ) )
				->set_default_value( 'Elevate Your Wardrobe Today' ),
			Field::make( 'text', 'footer_cta_button_text', __( 'Footer CTA Button Text' ) )
				->set_default_value( 'Explore All Products' ),
			Field::make( 'text', 'footer_cta_button_url', __( 'Footer CTA Button URL' ) )
				->set_default_value( '/shop' ),
		] )

		// 5. TAB: Footer Settings
		->add_tab( __( 'Footer Settings' ), [
			Field::make( 'color', 'footer_bg_color', __( 'Footer Background Color' ) )
				->set_default_value( '#1b140f' ),
			Field::make( 'image', 'footer_logo', __( 'Footer Logo' ) ),
			Field::make( 'text', 'footer_brand_name', __( 'Footer Brand Name (if no logo)' ) )
				->set_default_value( 'MadrissCosmoderma' ),
			Field::make( 'textarea', 'footer_about_text', __( 'About / Bio Text' ) )
				->set_default_value( 'Biomimetic dermatological skincare engineered with medical-grade actives, clinical trial precision, and plant-derived apothecary science.' ),
			Field::make( 'complex', 'footer_cols', __( 'Navigation Columns (Columns 2 & 3)' ) )
				->set_layout( 'grid' )
				->add_fields( [
					Field::make( 'text', 'title', __( 'Column Title' ) ),
					Field::make( 'complex', 'links', __( 'Links' ) )
						->set_layout( 'grid' )
						->add_fields( [
							Field::make( 'text', 'label', __( 'Label' ) ),
							Field::make( 'text', 'url', __( 'URL' ) ),
						] ),
				] ),
			Field::make( 'text', 'footer_newsletter_heading', __( 'Newsletter / Bulletin Heading' ) )
				->set_default_value( 'Clinical Bulletin' ),
			Field::make( 'textarea', 'footer_newsletter_text', __( 'Newsletter Description' ) )
				->set_default_value( 'Subscribe for clinical dermatology insights, formulation previews, and private apothecary releases.' ),
			Field::make( 'text', 'footer_newsletter_btn_text', __( 'Newsletter Button Text' ) )
				->set_default_value( 'JOIN' ),
			Field::make( 'text', 'footer_newsletter_disclaimer', __( 'Newsletter Consent Disclaimer' ) )
				->set_default_value( 'By joining you agree to receive medical skincare publications.' ),
			Field::make( 'complex', 'footer_bottom_links', __( 'Bottom Bar Policy Links' ) )
				->set_layout( 'grid' )
				->add_fields( [
					Field::make( 'text', 'label', __( 'Label' ) ),
					Field::make( 'text', 'url', __( 'URL' ) ),
				] ),
			Field::make( 'text', 'copyright_text', __( 'Copyright Text' ) )
				->set_default_value( '© 2026 MADRISSCOSMODERMA. ALL RIGHTS RESERVED.' ),
		] )

		// 6. TAB: Shop & Products
		->add_tab( __( 'Shop & Products' ), [
			Field::make( 'text', 'products_per_page', __( 'Products per page' ) )
				->set_attribute( 'type', 'number' )
				->set_default_value( '12' ),
			Field::make( 'checkbox', 'enable_wishlist', __( 'Enable Wishlist' ) )
				->set_option_value( 'yes' )
				->set_default_value( true )
				->set_help_text( __( 'Enable customer wishlist & favorites functionality.' ) ),
		] )

		// 7. TAB: Contact & Laboratory Info
		->add_tab( __( 'Contact & Laboratory Info' ), [
			Field::make( 'text', 'contact_phone', __( 'Phone' ) )
				->set_default_value( '+1 (800) 555-0199' ),
			Field::make( 'text', 'contact_email', __( 'Email' ) )
				->set_default_value( 'concierge@epureatelier.com' ),
			Field::make( 'textarea', 'contact_address', __( 'Physical Address' ) )
				->set_default_value( "12 Place Vendôme\n75001 Paris\nFrance" ),
			Field::make( 'textarea', 'contact_map_embed', __( 'Google Map Embed Code' ) ),
		] )

		// 8. TAB: Import / Export
		->add_tab( __( 'Import / Export' ), [
			Field::make( 'html', 'import_export_info', __( 'Import / Export Information' ) )
				->set_html( '
					<div style="padding: 18px; background: #faf9f4; border: 1px solid #e0afa0; border-radius: 6px; max-width: 700px; color: #1b1c19;">
						<h3 style="margin-top: 0; color: #463f3a;">Headless Configuration & Backups</h3>
						<p>All theme options are persisted in WordPress under Carbon Fields prefix <code>_carbon_fields_*</code>.</p>
						<p>The structured configuration can be retrieved at any time as JSON via the Headless REST endpoint:</p>
						<p style="background: #1b1c19; color: #e0afa0; padding: 10px 14px; border-radius: 4px; font-family: monospace; font-size: 13px;">
							GET /wp-json/our/v1/theme-settings
						</p>
					</div>
				' ),
		] );

	// -------------------------------------------------------------------------
	// PART 2: PAGE SECTIONS (Post Meta Container assigned to Pages)
	// -------------------------------------------------------------------------
	Container::make( 'post_meta', __( 'Page Sections' ) )
		->where( 'post_type', '=', 'page' )
		->add_fields( [
			Field::make( 'complex', 'sections', __( 'Sections' ) )
				->set_collapsed( true ) // Collapse groups by default for cleaner admin UI
				->add_fields( 'hero', __( 'Hero' ), [
					Field::make( 'text', 'collection_tag', __( 'Collection Eyebrow Tag' ) )
						->set_default_value( 'Autumn / Winter 2024 Collection' ),
					Field::make( 'text', 'heading', __( 'Heading' ) )
						->set_default_value( 'Modern Luxury Redefined' ),
					Field::make( 'textarea', 'subheading', __( 'Subheading / Description' ) )
						->set_default_value( 'Sculptural tailoring and unyielding materiality, conceived for longevity in form and presence.' ),
					Field::make( 'image', 'bg_image', __( 'Background Image' ) )
						->set_default_value( 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoxbI-Q0S1tXfHHsJNdxD2OgSBqhi1JHjSczy35ltKizBS49Po5iGlnjrmb3RJP2iQrIyVLO9Gv-CD9JOopnNZcpMbNesauogiMrceXPsxtqEpfxdidbKHm3RRdOia9SaHJiTlqHj_pPne5xlIqze8Hw-0BmSm6U5LUKmzmepx2Z01aT0TcI7EyoS6QLqzQjBUmKc_zZzPZrSRHbK7sz9WcbGOzTzeZ0whkDU2Ufh5KHs3_btBtMOE' ),
					Field::make( 'text', 'bg_image_alt', __( 'Background Image Alt / Description' ) )
						->set_default_value( 'Editorial fashion campaign photograph featuring an elegant female model in a structured architectural beige double-faced wool coat.' ),
					Field::make( 'text', 'button_text', __( 'Primary Button Text' ) )
						->set_default_value( 'Shop New Arrivals' ),
					Field::make( 'text', 'button_url', __( 'Primary Button URL' ) )
						->set_default_value( '/shop' ),
					Field::make( 'text', 'secondary_button_text', __( 'Secondary Button Text' ) )
						->set_default_value( 'View Lookbook N°08' ),
					Field::make( 'text', 'secondary_button_url', __( 'Secondary Button URL' ) )
						->set_default_value( '/lookbook' ),
					Field::make( 'text', 'edition_label', __( 'Edition Label (Bottom Right)' ) )
						->set_default_value( 'Edition Nº 04/24' ),
					Field::make( 'text', 'edition_locations', __( 'Edition Locations (Bottom Right)' ) )
						->set_default_value( 'Paris — Florence — Kyoto' ),
				] )
				->add_fields( 'value_anchors', __( 'Value Anchors (Brand Pillars)' ), [
					Field::make( 'color', 'bg_color', __( 'Background Color' ) )
						->set_default_value( '#f5f4ef' )
						->set_help_text( __( 'Background color for this bar (default: #f5f4ef).' ) ),
					Field::make( 'complex', 'items', __( 'Pillar Items' ) )
						->set_layout( 'grid' )
						->add_fields( [
							Field::make( 'text', 'label', __( 'Eyebrow Label' ) )
								->set_default_value( 'Material Origin' ),
							Field::make( 'text', 'headline', __( 'Headline / Value' ) )
								->set_default_value( '100% Traceable' ),
						] ),
				] )
				->add_fields( 'curated_collection', __( 'Curated Collection (3-Card Showcase)' ), [
					Field::make( 'text', 'eyebrow', __( 'Eyebrow Tag' ) )
						->set_default_value( 'Discover Essentials' ),
					Field::make( 'text', 'heading', __( 'Heading' ) )
						->set_default_value( 'Curated For You' ),
					Field::make( 'complex', 'cards', __( 'Collection Cards' ) )
						->set_layout( 'grid' )
						->add_fields( [
							Field::make( 'text', 'category', __( 'Category / Subtitle' ) ),
							Field::make( 'text', 'title', __( 'Card Title' ) ),
							Field::make( 'image', 'image', __( 'Card Image' ) ),
							Field::make( 'text', 'image_alt', __( 'Image Alt Description' ) ),
							Field::make( 'text', 'link_url', __( 'Link URL' ) )
								->set_default_value( '/shop' ),
							Field::make( 'text', 'link_label', __( 'Link Label' ) )
								->set_default_value( 'Explore' ),
						] ),
				] )
				->add_fields( 'product_grid', __( 'Product Grid / The Icons (Dynamic WooCommerce)' ), [
					Field::make( 'text', 'eyebrow', __( 'Eyebrow' ) )
						->set_default_value( 'Signature Silhouettes' ),
					Field::make( 'text', 'title', __( 'Title' ) )
						->set_default_value( 'The Icons' ),
					Field::make( 'text', 'subtitle', __( 'Subtitle / Monograph' ) )
						->set_default_value( 'Permanent wardrobe staples' ),
					Field::make( 'text', 'view_all_label', __( 'View All Label' ) )
						->set_default_value( 'View All (18)' ),
					Field::make( 'text', 'view_all_url', __( 'View All URL' ) )
						->set_default_value( '/shop' ),
					Field::make( 'select', 'category', __( 'WooCommerce Category (Optional)' ) )
						->set_options( 'our_carbon_get_product_category_options' ),
					Field::make( 'text', 'limit', __( 'Product Limit' ) )
						->set_attribute( 'type', 'number' )
						->set_default_value( '4' ),
				] )
				->add_fields( 'about_story', __( 'About Story / Brand Heritage' ), [
					Field::make( 'text', 'eyebrow', __( 'Eyebrow / Overline' ) )
						->set_default_value( 'Origin & Heritage' ),
					Field::make( 'text', 'title', __( 'Title' ) )
						->set_default_value( 'Craftsmanship Without Compromise' ),
					Field::make( 'textarea', 'content', __( 'Narrative Body' ) )
						->set_default_value( 'We believe everyday garments should be designed with precision and tailored to perfection.' ),
					Field::make( 'textarea', 'quote_text', __( 'Pull Quote' ) )
						->set_default_value( '“True luxury does not clamor for attention; it commands presence through silence and immaculate cut.”' ),
					Field::make( 'text', 'quote_author', __( 'Quote Attribution' ) )
						->set_default_value( '— Atelier Épure Archives' ),
					Field::make( 'image', 'image', __( 'Editorial Visual' ) ),
					Field::make( 'text', 'image_alt', __( 'Image Alt Description' ) ),
					Field::make( 'select', 'image_position', __( 'Image Position' ) )
						->set_options( [
							'left'  => __( 'Left' ),
							'right' => __( 'Right' ),
						] )
						->set_default_value( 'left' ),
					Field::make( 'text', 'badge_location', __( 'Floating Badge Location' ) )
						->set_default_value( '7ème Arrondissement' ),
					Field::make( 'text', 'badge_tagline', __( 'Floating Badge Subtitle' ) )
						->set_default_value( 'Hand-Draped & Finished' ),
					Field::make( 'text', 'badge_label', __( 'Floating Badge Pill' ) )
						->set_default_value( 'Master Atelier' ),
				] )
				->add_fields( 'testimonials', __( 'Testimonials Slider' ), [
					Field::make( 'text', 'heading', __( 'Section Heading (Optional)' ) ),
					Field::make( 'color', 'bg_color', __( 'Background Color' ) )
						->set_default_value( '#efeee9' ),
					Field::make( 'checkbox', 'autoplay', __( 'Enable Auto-slide' ) )
						->set_option_value( 'yes' )
						->set_default_value( 'yes' ),
					Field::make( 'text', 'autoplay_interval', __( 'Auto-slide Interval (Seconds)' ) )
						->set_attribute( 'type', 'number' )
						->set_default_value( '6' ),
					Field::make( 'complex', 'testimonials', __( 'Testimonials Slides' ) )
						->set_layout( 'tabbed-vertical' )
						->add_fields( [
							Field::make( 'textarea', 'quote', __( 'Quote Text' ) )
								->set_rows( 4 ),
							Field::make( 'text', 'author', __( 'Author Name' ) )
								->set_default_value( 'Sarah M.' ),
							Field::make( 'text', 'verified_text', __( 'Patron Status / Badge' ) )
								->set_default_value( 'Verified Patron • Private Client since 2021' ),
							Field::make( 'checkbox', 'is_verified', __( 'Show Verified Badge' ) )
								->set_option_value( 'yes' )
								->set_default_value( 'yes' ),
						] ),
				] )
				->add_fields( 'cta_banner', __( 'CTA Banner' ), [
					Field::make( 'text', 'title', __( 'Title' ) ),
					Field::make( 'text', 'button_text', __( 'Button Text' ) ),
					Field::make( 'text', 'button_url', __( 'Button URL' ) ),
				] ),
		] );
}

/**
 * Helper to fetch WooCommerce product categories for the product_grid layout dropdown.
 */
function our_carbon_get_product_category_options() {
	$options = [ '' => __( 'All Categories' ) ];
	if ( taxonomy_exists( 'product_cat' ) ) {
		$terms = get_terms( [
			'taxonomy'   => 'product_cat',
			'hide_empty' => false,
		] );
		if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
			foreach ( $terms as $term ) {
				$options[ $term->slug ] = $term->name;
			}
		}
	}
	return $options;
}

/**
 * =========================================================================
 * PART 3: REST API EXPOSURE
 * =========================================================================
 */
add_action( 'rest_api_init', 'our_register_carbon_rest_api' );
function our_register_carbon_rest_api() {

	// -------------------------------------------------------------------------
	// 1. PAGE SECTIONS EXPOSURE: register_rest_field('page', 'custom_sections')
	// -------------------------------------------------------------------------
	register_rest_field(
		'page',
		'custom_sections',
		[
			'get_callback'    => 'our_get_carbon_page_custom_sections',
			'update_callback' => null,
			'schema'          => [
				'description' => 'Dynamic Page Sections via Carbon Fields Complex',
				'type'        => 'array',
				'context'     => [ 'view', 'edit' ],
			],
		]
	);

	// -------------------------------------------------------------------------
	// 2. THEME SETTINGS ENDPOINT: GET /wp-json/our/v1/theme-settings
	// -------------------------------------------------------------------------
	register_rest_route(
		'our/v1',
		'/theme-settings',
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'our_get_carbon_theme_settings_response',
			'permission_callback' => '__return_true',
		]
	);

	// 3. PAYMENT GATEWAYS ENDPOINT: GET /wp-json/our/v1/payment-gateways
	register_rest_route(
		'our/v1',
		'/payment-gateways',
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'our_get_carbon_payment_gateways_response',
			'permission_callback' => '__return_true',
		]
	);
}

/**
 * Callback for 'custom_sections' REST field on Pages.
 * Returns carbon_get_post_meta($post->ID, 'sections') preserving the '_type' key.
 */
function our_get_carbon_page_custom_sections( $post_object ) {
	$post_id = is_array( $post_object ) ? ( $post_object['id'] ?? 0 ) : ( $post_object->ID ?? 0 );
	if ( ! $post_id || ! function_exists( 'carbon_get_post_meta' ) ) {
		return [];
	}

	$sections = carbon_get_post_meta( $post_id, 'sections' );
	if ( empty( $sections ) || ! is_array( $sections ) ) {
		return [];
	}

	// Ensure image fields resolve to full URLs if stored as attachment IDs, preserving _type
	foreach ( $sections as &$section ) {
		if ( isset( $section['bg_image'] ) && is_numeric( $section['bg_image'] ) && (int) $section['bg_image'] > 0 ) {
			$url = wp_get_attachment_image_url( (int) $section['bg_image'], 'full' );
			if ( $url ) {
				$section['bg_image'] = $url;
			}
		}
		if ( isset( $section['image'] ) && is_numeric( $section['image'] ) && (int) $section['image'] > 0 ) {
			$url = wp_get_attachment_image_url( (int) $section['image'], 'full' );
			if ( $url ) {
				$section['image'] = $url;
			}
		}
		if ( ! empty( $section['cards'] ) && is_array( $section['cards'] ) ) {
			foreach ( $section['cards'] as &$card ) {
				if ( isset( $card['image'] ) && is_numeric( $card['image'] ) && (int) $card['image'] > 0 ) {
					$url = wp_get_attachment_image_url( (int) $card['image'], 'full' );
					if ( $url ) {
						$card['image'] = $url;
					}
				}
			}
		}
		if ( ! empty( $section['custom_products'] ) && is_array( $section['custom_products'] ) ) {
			foreach ( $section['custom_products'] as &$c_prod ) {
				if ( isset( $c_prod['image'] ) && is_numeric( $c_prod['image'] ) && (int) $c_prod['image'] > 0 ) {
					$url = wp_get_attachment_image_url( (int) $c_prod['image'], 'full' );
					if ( $url ) {
						$c_prod['image'] = $url;
					}
				}
			}
		}
		if ( ! empty( $section['items'] ) && is_array( $section['items'] ) ) {
			foreach ( $section['items'] as &$sub_item ) {
				if ( isset( $sub_item['image'] ) && is_numeric( $sub_item['image'] ) && (int) $sub_item['image'] > 0 ) {
					$url = wp_get_attachment_image_url( (int) $sub_item['image'], 'full' );
					if ( $url ) {
						$sub_item['image'] = $url;
					}
				}
			}
		}

		// Dynamic WooCommerce product query for product_grid layout
		if ( ( $section['_type'] ?? '' ) === 'product_grid' ) {
			$limit         = ! empty( $section['limit'] ) ? (int) $section['limit'] : 4;
			$category_slug = ! empty( $section['category'] ) ? sanitize_title( $section['category'] ) : '';

			$query_args = [
				'status'  => 'publish',
				'limit'   => $limit > 0 ? $limit : 4,
				'orderby' => 'menu_order title',
				'order'   => 'ASC',
			];

			if ( ! empty( $category_slug ) && $category_slug !== 'all' ) {
				$query_args['category'] = [ $category_slug ];
			}

			$wc_products = function_exists( 'wc_get_products' ) ? wc_get_products( $query_args ) : [];
			if ( empty( $wc_products ) && function_exists( 'wc_get_products' ) ) {
				$wc_products = wc_get_products( [
					'status'  => 'publish',
					'limit'   => $limit > 0 ? $limit : 4,
					'orderby' => 'menu_order title',
					'order'   => 'ASC',
				] );
			}

			$dynamic_products = [];
			$index = 1;
			foreach ( $wc_products as $wc_prod ) {
				$pid      = $wc_prod->get_id();
				$thumb_id = $wc_prod->get_image_id();
				$img_url  = $thumb_id ? wp_get_attachment_image_url( $thumb_id, 'full' ) : '';
				$alt_text = $thumb_id ? get_post_meta( $thumb_id, '_wp_attachment_image_alt', true ) : '';
				if ( empty( $alt_text ) ) {
					$alt_text = $wc_prod->get_name();
				}

				// Material from WooCommerce category name or product attributes
				$cats     = wp_get_post_terms( $pid, 'product_cat', [ 'fields' => 'names' ] );
				$material = ! empty( $cats ) ? $cats[0] : '';

				$raw_price       = $wc_prod->get_price();
				$formatted_price = $raw_price ? ( '$' . number_format( (float) $raw_price, 0 ) ) : '';

				$dynamic_products[] = [
					'product_id'   => $pid,
					'badge'        => sprintf( 'Icon %02d', $index ),
					'material'     => $material,
					'product_name' => $wc_prod->get_name(),
					'name'         => $wc_prod->get_name(),
					'title'        => $wc_prod->get_name(),
					'price'        => $formatted_price,
					'image'        => $img_url,
					'image_alt'    => $alt_text,
					'url'          => '/product/' . $wc_prod->get_slug(),
				];
				$index++;
			}

			$section['products']        = $dynamic_products;
			$section['custom_products'] = $dynamic_products;
		}

		// Handle testimonials layout
		if ( ( $section['_type'] ?? '' ) === 'testimonials' || ( $section['_type'] ?? '' ) === 'testimonials_slider' ) {
			if ( empty( $section['testimonials'] ) && ! empty( $section['items'] ) ) {
				$section['testimonials'] = $section['items'];
			}
		}
	}

	return $sections;
}

/**
 * Helper to resolve Carbon Fields image option (URL or attachment ID).
 */
function our_resolve_carbon_img( $val, $fallback = '' ) {
	if ( is_numeric( $val ) && (int) $val > 0 ) {
		$url = wp_get_attachment_image_url( (int) $val, 'full' );
		if ( $url ) {
			return $url;
		}
	}
	return ! empty( $val ) && is_string( $val ) ? $val : $fallback;
}

/**
 * Ensure Carbon Fields admin UI can find attachment ID from URL if stored as URL.
 */
add_filter( 'carbon_fields_attachment_id_from_url', 'our_carbon_fields_attachment_id_from_url', 10, 2 );
function our_carbon_fields_attachment_id_from_url( $attachment_id, $url ) {
	if ( $attachment_id ) {
		return $attachment_id;
	}
	if ( ! empty( $url ) && is_string( $url ) ) {
		$found = attachment_url_to_postid( $url );
		if ( $found ) {
			return $found;
		}
	}
	return $attachment_id;
}

/**
 * Ensure Carbon Fields admin UI displays previews even if an image was stored as an external URL.
 */
add_filter( 'carbon_fields_attachment_not_found_metadata', 'our_carbon_fields_fallback_attachment_metadata', 10, 3 );
function our_carbon_fields_fallback_attachment_metadata( $metadata, $id, $type ) {
	if ( ! empty( $id ) && is_string( $id ) && ( str_starts_with( $id, 'http://' ) || str_starts_with( $id, 'https://' ) || str_starts_with( $id, '//' ) ) ) {
		return [
			'id'        => $id,
			'thumb_url' => $id,
			'file_url'  => $id,
			'file_type' => 'image',
			'file_name' => wp_basename( parse_url( $id, PHP_URL_PATH ) ?: 'image.jpg' ),
		];
	}
	return $metadata;
}

/**
 * Callback for /our/v1/theme-settings endpoint.
 * Returns nested JSON object grouped by the 8 tabs from Part 1.
 */
function our_get_carbon_theme_settings_response( WP_REST_Request $request ) {
	if ( ! function_exists( 'carbon_get_theme_option' ) ) {
		return new WP_Error( 'carbon_fields_missing', 'Carbon Fields is not initialized.', [ 'status' => 500 ] );
	}

	$site_url = get_site_url();

	// 1. TAB: Global & Layout
	$logo       = our_resolve_carbon_img( carbon_get_theme_option( 'logo' ), '' );
	$logo_light = our_resolve_carbon_img( carbon_get_theme_option( 'logo_light' ), '' );
	$favicon    = our_resolve_carbon_img( carbon_get_theme_option( 'favicon' ), '' );

	$global_group = [
		'logo'            => $logo,
		'logo_light'      => $logo_light,
		'favicon'         => $favicon,
		'container_width' => carbon_get_theme_option( 'container_width' ) ?: '1440px',
		'site_layout'     => carbon_get_theme_option( 'site_layout' ) ?: 'wide',
	];

	// 2. TAB: Header & Announcement
	$enable_top_bar = carbon_get_theme_option( 'enable_top_bar' );
	$sticky_header  = carbon_get_theme_option( 'sticky_header' );

	$header_group = [
		'enable_top_bar'        => ( $enable_top_bar === 'yes' || $enable_top_bar === true || $enable_top_bar === '1' ),
		'announcement_text'     => carbon_get_theme_option( 'announcement_text' ) ?: 'Complimentary Worldwide Express Shipping on Orders Above $500',
		'announcement_link'     => carbon_get_theme_option( 'announcement_link' ) ?: '/shop',
		'announcement_bg_color' => carbon_get_theme_option( 'announcement_bg_color' ) ?: '#463F3A',
		'header_layout'         => carbon_get_theme_option( 'header_layout' ) ?: 'default',
		'sticky_header'         => ( $sticky_header === 'yes' || $sticky_header === true || $sticky_header === '1' ),
	];

	// Header Navigation list
	$raw_nav    = carbon_get_theme_option( 'nav_items' );
	$header_nav = [];
	if ( ! empty( $raw_nav ) && is_array( $raw_nav ) ) {
		foreach ( $raw_nav as $item ) {
			$header_nav[] = [
				'label' => ! empty( $item['label'] ) ? (string) $item['label'] : '',
				'url'   => ! empty( $item['url'] ) ? (string) $item['url'] : '',
			];
		}
	}
	if ( empty( $header_nav ) ) {
		$header_nav = [
			[ 'label' => 'Home', 'url' => '/' ],
			[ 'label' => 'Shop', 'url' => '/shop' ],
			[ 'label' => 'About', 'url' => '/about' ],
			[ 'label' => 'Cart', 'url' => '/cart' ],
		];
	}
	$header_group['navigation'] = $header_nav;

	// 3. TAB: Color Palette
	$colors_group = [
		'primary'    => carbon_get_theme_option( 'primary_color' ) ?: '#463F3A',
		'accent'     => carbon_get_theme_option( 'accent_color' ) ?: '#E0AFA0',
		'background' => carbon_get_theme_option( 'bg_color' ) ?: '#F4F3EE',
		'text'       => carbon_get_theme_option( 'text_color' ) ?: '#1B1C19',
		'border'     => carbon_get_theme_option( 'border_color' ) ?: '#E8E6E1',
	];

	// Social Links
	$raw_social = carbon_get_theme_option( 'social_links' );
	$social     = [];
	if ( ! empty( $raw_social ) && is_array( $raw_social ) ) {
		foreach ( $raw_social as $item ) {
			$social[] = [
				'network' => $item['network'] ?? '',
				'url'     => $item['url'] ?? '',
				'icon'    => $item['icon'] ?? '',
			];
		}
	}
	if ( empty( $social ) ) {
		$social = [
			[ 'network' => 'Instagram', 'url' => 'https://instagram.com', 'icon' => 'instagram' ],
			[ 'network' => 'Facebook', 'url' => 'https://facebook.com', 'icon' => 'facebook' ],
			[ 'network' => 'Twitter / X', 'url' => 'https://x.com', 'icon' => 'twitter' ],
			[ 'network' => 'LinkedIn', 'url' => 'https://linkedin.com', 'icon' => 'linkedin' ],
		];
	}

	// 4. TAB: Homepage Sections
	$homepage_sections_group = [
		'enable_newsletter_popup' => ( carbon_get_theme_option( 'enable_newsletter_popup' ) === 'yes' ),
		'newsletter_heading'      => carbon_get_theme_option( 'newsletter_heading' ) ?: 'Join the Atelier Circle',
		'newsletter_subheading'   => carbon_get_theme_option( 'newsletter_subheading' ) ?: 'Receive private access to seasonal capsules and private previews.',
		'footer_cta_title'        => carbon_get_theme_option( 'footer_cta_title' ) ?: 'Elevate Your Wardrobe Today',
		'footer_cta_button_text'  => carbon_get_theme_option( 'footer_cta_button_text' ) ?: 'Explore All Products',
		'footer_cta_button_url'   => carbon_get_theme_option( 'footer_cta_button_url' ) ?: '/shop',
	];

	// 5. TAB: Footer Settings
	$footer_logo = our_resolve_carbon_img( carbon_get_theme_option( 'footer_logo' ), '' );
	$raw_footer  = carbon_get_theme_option( 'footer_cols' );
	$footer_cols = [];
	if ( ! empty( $raw_footer ) && is_array( $raw_footer ) ) {
		foreach ( $raw_footer as $col ) {
			$col_title = $col['title'] ?? ( $col['column_title'] ?? '' );
			$links     = [];
			if ( ! empty( $col['links'] ) && is_array( $col['links'] ) ) {
				foreach ( $col['links'] as $link ) {
					$links[] = [
						'label' => $link['label'] ?? '',
						'url'   => $link['url'] ?? '',
					];
				}
			}
			$footer_cols[] = [
				'title' => $col_title,
				'links' => $links,
			];
		}
	}
	if ( empty( $footer_cols ) ) {
		$footer_cols = [
			[
				'title' => 'Quick Links',
				'links' => [
					[ 'label' => 'Shop', 'url' => '/shop' ],
					[ 'label' => 'Best Sellers', 'url' => '/shop' ],
					[ 'label' => 'Product Categories', 'url' => '/shop' ],
					[ 'label' => 'About Us', 'url' => '/about' ],
				],
			],
			[
				'title' => 'Customer Care',
				'links' => [
					[ 'label' => 'Shipping & Delivery', 'url' => '/shipping' ],
					[ 'label' => 'Return & Refund Policy', 'url' => '/returns' ],
					[ 'label' => 'Blogs', 'url' => '/blog' ],
				],
			],
		];
	}

	$raw_bottom_links = carbon_get_theme_option( 'footer_bottom_links' );
	$bottom_links     = [];
	if ( ! empty( $raw_bottom_links ) && is_array( $raw_bottom_links ) ) {
		foreach ( $raw_bottom_links as $b_link ) {
			$bottom_links[] = [
				'label' => $b_link['label'] ?? '',
				'url'   => $b_link['url'] ?? '',
			];
		}
	}
	if ( empty( $bottom_links ) ) {
		$bottom_links = [
			[ 'label' => 'Privacy Policy', 'url' => '/privacy' ],
			[ 'label' => 'Terms of Service', 'url' => '/terms' ],
			[ 'label' => 'Accessibility', 'url' => '/accessibility' ],
		];
	}

	$footer_group = [
		'bg_color'              => carbon_get_theme_option( 'footer_bg_color' ) ?: '#1b140f',
		'logo'                  => $footer_logo,
		'brand_name'            => carbon_get_theme_option( 'footer_brand_name' ) ?: 'MadrissCosmoderma',
		'about_text'            => carbon_get_theme_option( 'footer_about_text' ) ?: 'Biomimetic dermatological skincare engineered with medical-grade actives, clinical trial precision, and plant-derived apothecary science.',
		'newsletter_heading'    => carbon_get_theme_option( 'footer_newsletter_heading' ) ?: 'Clinical Bulletin',
		'newsletter_text'       => carbon_get_theme_option( 'footer_newsletter_text' ) ?: 'Subscribe for clinical dermatology insights, formulation previews, and private apothecary releases.',
		'newsletter_btn_text'   => carbon_get_theme_option( 'footer_newsletter_btn_text' ) ?: 'JOIN',
		'newsletter_disclaimer' => carbon_get_theme_option( 'footer_newsletter_disclaimer' ) ?: 'By joining you agree to receive medical skincare publications.',
		'copyright'             => carbon_get_theme_option( 'copyright_text' ) ?: '© 2026 MADRISSCOSMODERMA. ALL RIGHTS RESERVED.',
		'columns'               => $footer_cols,
		'bottom_links'          => $bottom_links,
	];

	// 6. TAB: Shop & Products
	$shop_group = [
		'products_per_page' => (int) ( carbon_get_theme_option( 'products_per_page' ) ?: 12 ),
		'enable_wishlist'   => ( carbon_get_theme_option( 'enable_wishlist' ) !== 'no' ),
	];

	// 7. TAB: Contact & Laboratory Info
	$contact_group = [
		'phone'      => carbon_get_theme_option( 'contact_phone' ) ?: '+1 (800) 555-0199',
		'email'      => carbon_get_theme_option( 'contact_email' ) ?: 'concierge@epureatelier.com',
		'address'    => carbon_get_theme_option( 'contact_address' ) ?: "12 Place Vendôme\n75001 Paris\nFrance",
		'map_embed'  => carbon_get_theme_option( 'contact_map_embed' ) ?: '',
	];

	// Assemble final structured response: nested tabs + backward-compatible flat aliases
	$response_data = [
		'global'            => $global_group,
		'header'            => $header_group,
		'colors'            => $colors_group,
		'social'            => $social,
		'homepage_sections' => $homepage_sections_group,
		'footer'            => $footer_group,
		'shop'              => $shop_group,
		'contact'           => $contact_group,

		// Backward-compatible top-level properties for existing Next.js frontend code
		'logo'              => $logo,
		'primary_color'     => $colors_group['primary'],
		'accent_color'      => $colors_group['accent'],
		'header_nav'        => $header_nav,
		'footer_cols'       => $footer_cols,
	];

	return rest_ensure_response( $response_data );
}

/**
 * REST API Callback for GET /wp-json/our/v1/payment-gateways
 * Dynamically returns all available WooCommerce payment gateways,
 * including Stripe public publishable key and testmode if Stripe is active.
 */
function our_get_carbon_payment_gateways_response() {
	if ( ! function_exists( 'WC' ) || ! WC()->payment_gateways() ) {
		return rest_ensure_response( [] );
	}

	$available = WC()->payment_gateways()->get_available_payment_gateways();
	$gateways_data = [];

	foreach ( $available as $id => $gateway ) {
		$item = [
			'id'          => $id,
			'title'       => $gateway->get_title(),
			'description' => $gateway->get_description(),
			'icon'        => $gateway->get_icon(),
			'supports'    => $gateway->supports,
		];

		if ( 'stripe' === $id ) {
			$stripe_settings = get_option( 'woocommerce_stripe_settings', [] );
			$testmode        = ( $stripe_settings['testmode'] ?? 'no' ) === 'yes';
			$publishable_key = $testmode
				? ( $stripe_settings['test_publishable_key'] ?? '' )
				: ( $stripe_settings['publishable_key'] ?? '' );

			$item['stripe_params'] = [
				'publishable_key' => $publishable_key,
				'testmode'        => $testmode,
			];
		}

		$gateways_data[] = $item;
	}

	return rest_ensure_response( $gateways_data );
}

/**
 * Ensure Store API payment context has payment_method and Stripe UPE selected type
 * so WooCommerce Stripe Gateway never fails with 'The selected payment method type is invalid'.
 */
add_action( 'woocommerce_rest_checkout_process_payment_with_context', function( $context, &$result ) {
	$data = $context->payment_data;
	if ( empty( $data['payment_method'] ) && ! empty( $context->payment_method ) ) {
		$data['payment_method'] = $context->payment_method;
	}
	if ( 'stripe' === $context->payment_method && empty( $data['wc_stripe_selected_upe_payment_type'] ) ) {
		$data['wc_stripe_selected_upe_payment_type'] = 'card';
	}
	$context->set_payment_data( $data );
}, 1, 2 );

/**
 * Headless: Ensure WooCommerce session cart is emptied when an order is placed via Store API.
 * Also link customer ID to registered user if billing email matches.
 */
add_action( 'woocommerce_store_api_checkout_order_processed', function( $order ) {
	if ( $order instanceof WC_Order ) {
		if ( ! $order->get_customer_id() && $order->get_billing_email() ) {
			$user = get_user_by( 'email', $order->get_billing_email() );
			if ( $user ) {
				$order->set_customer_id( $user->ID );
				$order->save();
			}
		}
	}
	if ( function_exists( 'WC' ) && WC()->cart ) {
		WC()->cart->empty_cart();
	}
}, 10 );

add_action( 'woocommerce_checkout_order_processed', function( $order_id ) {
	$order = wc_get_order( $order_id );
	if ( $order instanceof WC_Order ) {
		if ( ! $order->get_customer_id() && $order->get_billing_email() ) {
			$user = get_user_by( 'email', $order->get_billing_email() );
			if ( $user ) {
				$order->set_customer_id( $user->ID );
				$order->save();
			}
		}
	}
	if ( function_exists( 'WC' ) && WC()->cart ) {
		WC()->cart->empty_cart();
	}
}, 10 );

// Disable external telemetry tracking during Store API checkout to reduce latency
add_filter( 'woocommerce_apply_tracking', '__return_false' );

/**
 * =========================================================================
 * AUTO-SEEDING: Populate initial Carbon Fields data for Pages & Options
 * =========================================================================
 */
add_action( 'carbon_fields_register_fields', 'our_seed_carbon_sample_data', 99 );
function our_seed_carbon_sample_data() {
	if ( get_option( 'our_carbon_seeded_v11' ) ) {
		return;
	}

	$site_url = get_site_url();

	// Helper to only seed theme options if empty or still on placeholder
	$seed_option_if_empty = function( $key, $fallback_val ) {
		$val = carbon_get_theme_option( $key );
		if ( empty( $val ) ) {
			carbon_set_theme_option( $key, $fallback_val );
		}
	};

	// 1. Seed Tabbed Theme Options safely
	// If logo was set to placeholder logo.svg, check if user uploaded paradiselogo (ID 28)
	$current_logo = carbon_get_theme_option( 'logo' );
	if ( empty( $current_logo ) || str_contains( (string) $current_logo, 'uploads/logo.svg' ) ) {
		$uploaded_logo = get_post( 28 );
		if ( $uploaded_logo && $uploaded_logo->post_type === 'attachment' ) {
			carbon_set_theme_option( 'logo', 28 );
		} else {
			$seed_option_if_empty( 'logo', $site_url . '/wp-content/uploads/logo.svg' );
		}
	}

	$seed_option_if_empty( 'logo_light', $site_url . '/wp-content/uploads/logo-light.svg' );
	$seed_option_if_empty( 'favicon', $site_url . '/wp-content/uploads/favicon.ico' );
	$seed_option_if_empty( 'container_width', '1440px' );
	$seed_option_if_empty( 'site_layout', 'wide' );

	$seed_option_if_empty( 'social_links', [
		[ 'network' => 'Instagram', 'url' => 'https://instagram.com', 'icon' => 'instagram' ],
		[ 'network' => 'Facebook', 'url' => 'https://facebook.com', 'icon' => 'facebook' ],
		[ 'network' => 'Twitter / X', 'url' => 'https://x.com', 'icon' => 'twitter' ],
		[ 'network' => 'LinkedIn', 'url' => 'https://linkedin.com', 'icon' => 'linkedin' ],
	] );

	$seed_option_if_empty( 'enable_top_bar', 'yes' );
	$seed_option_if_empty( 'announcement_text', 'Complimentary Worldwide Express Shipping on Orders Above $500' );
	$seed_option_if_empty( 'announcement_link', '/shop' );
	$seed_option_if_empty( 'announcement_bg_color', '#463F3A' );
	$seed_option_if_empty( 'header_layout', 'default' );
	$seed_option_if_empty( 'sticky_header', 'yes' );

	$seed_option_if_empty( 'primary_color', '#463F3A' );
	$seed_option_if_empty( 'accent_color', '#E0AFA0' );
	$seed_option_if_empty( 'bg_color', '#F4F3EE' );
	$seed_option_if_empty( 'text_color', '#1B1C19' );
	$seed_option_if_empty( 'border_color', '#E8E6E1' );

	$seed_option_if_empty( 'nav_items', [
		[ 'label' => 'Home', 'url' => '/' ],
		[ 'label' => 'Shop', 'url' => '/shop' ],
		[ 'label' => 'About', 'url' => '/about' ],
		[ 'label' => 'Cart', 'url' => '/cart' ],
	] );

	$seed_option_if_empty( 'enable_newsletter_popup', 'no' );
	$seed_option_if_empty( 'newsletter_heading', 'Join the Atelier Circle' );
	$seed_option_if_empty( 'newsletter_subheading', 'Receive private access to seasonal capsules and private previews.' );
	$seed_option_if_empty( 'footer_cta_title', 'Elevate Your Wardrobe Today' );
	$seed_option_if_empty( 'footer_cta_button_text', 'Explore All Products' );
	$seed_option_if_empty( 'footer_cta_button_url', '/shop' );

	$seed_option_if_empty( 'footer_bg_color', '#1b140f' );
	$seed_option_if_empty( 'footer_logo', '' );
	$seed_option_if_empty( 'footer_brand_name', 'MadrissCosmoderma' );
	$seed_option_if_empty( 'footer_about_text', 'Biomimetic dermatological skincare engineered with medical-grade actives, clinical trial precision, and plant-derived apothecary science.' );
	$seed_option_if_empty( 'copyright_text', '© 2026 MADRISSCOSMODERMA. ALL RIGHTS RESERVED.' );
	$seed_option_if_empty( 'footer_newsletter_heading', 'Clinical Bulletin' );
	$seed_option_if_empty( 'footer_newsletter_text', 'Subscribe for clinical dermatology insights, formulation previews, and private apothecary releases.' );
	$seed_option_if_empty( 'footer_newsletter_btn_text', 'JOIN' );
	$seed_option_if_empty( 'footer_newsletter_disclaimer', 'By joining you agree to receive medical skincare publications.' );

	$seed_option_if_empty( 'footer_cols', [
		[
			'title' => 'Quick Links',
			'links' => [
				[ 'label' => 'Shop', 'url' => '/shop' ],
				[ 'label' => 'Best Sellers', 'url' => '/shop' ],
				[ 'label' => 'Product Categories', 'url' => '/shop' ],
				[ 'label' => 'About Us', 'url' => '/about' ],
			],
		],
		[
			'title' => 'Customer Care',
			'links' => [
				[ 'label' => 'Shipping & Delivery', 'url' => '/shipping' ],
				[ 'label' => 'Return & Refund Policy', 'url' => '/returns' ],
				[ 'label' => 'Blogs', 'url' => '/blog' ],
			],
		],
	] );

	$seed_option_if_empty( 'footer_bottom_links', [
		[ 'label' => 'Privacy Policy', 'url' => '/privacy' ],
		[ 'label' => 'Terms of Service', 'url' => '/terms' ],
		[ 'label' => 'Accessibility', 'url' => '/accessibility' ],
	] );

	$seed_option_if_empty( 'products_per_page', '12' );
	$seed_option_if_empty( 'enable_wishlist', 'yes' );

	$seed_option_if_empty( 'contact_phone', '+1 (800) 555-0199' );
	$seed_option_if_empty( 'contact_email', 'concierge@epureatelier.com' );
	$seed_option_if_empty( 'contact_address', "12 Place Vendôme\n75001 Paris\nFrance" );

	// 2. Default Seed Home Page Sections
	$default_home_sections = [
		[
			'_type'                  => 'hero',
			'collection_tag'         => 'Autumn / Winter 2024 Collection',
			'heading'                => 'Modern Luxury Redefined',
			'subheading'             => 'Sculptural tailoring and unyielding materiality, conceived for longevity in form and presence.',
			'bg_image'               => 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoxbI-Q0S1tXfHHsJNdxD2OgSBqhi1JHjSczy35ltKizBS49Po5iGlnjrmb3RJP2iQrIyVLO9Gv-CD9JOopnNZcpMbNesauogiMrceXPsxtqEpfxdidbKHm3RRdOia9SaHJiTlqHj_pPne5xlIqze8Hw-0BmSm6U5LUKmzmepx2Z01aT0TcI7EyoS6QLqzQjBUmKc_zZzPZrSRHbK7sz9WcbGOzTzeZ0whkDU2Ufh5KHs3_btBtMOE',
			'bg_image_alt'           => 'Editorial fashion campaign photograph featuring an elegant female model in a structured architectural beige double-faced wool coat. She is positioned against a warm concrete and travertine modernist brutalist gallery interior. Soft cinematic daylight streams from the side, delicate parchment neutral tones, desaturated warm palette with muted espresso undertones, quiet luxury minimalist styling.',
			'button_text'            => 'Shop New Arrivals',
			'button_url'             => '/shop',
			'secondary_button_text'  => 'View Lookbook N°08',
			'secondary_button_url'   => '/lookbook',
			'edition_label'          => 'Edition Nº 04/24',
			'edition_locations'      => 'Paris — Florence — Kyoto',
		],
		[
			'_type'    => 'value_anchors',
			'bg_color' => '#f5f4ef',
			'items'    => [
				[
					'label'    => 'Material Origin',
					'headline' => '100% Traceable',
				],
				[
					'label'    => 'Atelier Standard',
					'headline' => 'Small Batch Run',
				],
				[
					'label'    => 'Shipping',
					'headline' => 'Carbon Neutral',
				],
				[
					'label'    => 'Client Experience',
					'headline' => 'Private Concierge',
				],
			],
		],
		[
			'_type'   => 'curated_collection',
			'eyebrow' => 'Discover Essentials',
			'heading' => 'Curated For You',
			'cards'   => [
				[
					'category'       => 'Outerwear',
					'title'          => 'The Architectural Coat',
					'image'          => 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw1ILVYS-T3BQnE81f55JUV0dYc-Iy9C-pScFDVpjl4nMwKh2QunRsgIUIgPcYu2DdB6hvLGdPLJ2k-ZFJGTmMDnGMwNXwGrfrjNTThvXWY-KGOSWsMGfyzR5KB0XsPZ6pUWcbsdimtrzTDc9Zktvbreyeux8UPjLGmE13JPghK5_D31DTFuC6m4VIx71_VasYDEr0CwaxCOjjUkJOSSAbbhD0w3njKdgf0kmz5X34yDPJ5y_6le50',
					'image_alt'      => 'Editorial look of an oversized camel and oatmeal alpaca-wool trench coat on a model in a minimal sunlit studio space. Muted warm earth tones, serene posture, tactile textural weave visible in fine detail, high-fashion campaign photography.',
					'link_url'       => '/shop',
					'link_label'     => 'Explore',
					'stagger_offset' => false,
				],
				[
					'category'       => 'Essentials',
					'title'          => 'Foundational Separates',
					'image'          => 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZpaRnczbCAzM12FZswQnW5fZSubIECJTSHewP7YN6A1AiGsAcT9AcsQkaHvizwKAD2Xm0tZGKMGIwi3MpzZHTSNhX0Dq9hIFvtrI5lt3BxJ_2vMDPM2RjkAmKW9rJ2okdUl2TXFZdjAQP-idCdSWFiX-cVGsG1hmBtS7t_UhGBj92brJKo8uroKGARjhNNGuklpAywO0usKxrZfrkgN8-mxvcLwmEN4CqT_BKsXt23skO6yjLNS_U',
					'image_alt'      => 'Minimal studio portrait showcasing a model draped in a high-neck raw ivory silk blouse paired with crisp pleated wide-leg trousers. Soft sculptural shadows, clean architectural composition, warm monochrome aesthetic, luxury editorial lighting.',
					'link_url'       => '/shop',
					'link_label'     => 'Explore',
					'stagger_offset' => true,
				],
				[
					'category'       => 'Evening',
					'title'          => 'Twilight Monologues',
					'image'          => 'https://lh3.googleusercontent.com/aida-public/AB6AXuDleN-iT2hsnTmx_JwZos1Z02kHJ2bMSGBbU7eU9s9ADOvdgx9G90OYMAesqqppdfWZb2dGyHyVmfvgdsMQYGJmN319AV9bb9541GjNekiXlHgO1B3QF3AgkNxxXs7YzVfoNVmeagrrM9ATd0NkSuyRHrfE8yTD_5lctXVnhmLDpVBP85PrVnjD-3_3cs2plLRQew6ynbSeyAdD3gUVdANeSFFYP6r_FXOBWFlyKxSM3Ci2mI8HEX5H',
					'image_alt'      => 'Editorial full-length photograph of an understated evening gown in deep espresso crepe de chine. Dramatic fluid silhouette with backless drape against a warm limestone wall with subtle morning light. Refined, poetic luxury.',
					'link_url'       => '/shop',
					'link_label'     => 'Explore',
					'stagger_offset' => false,
				],
			],
		],
		[
			'_type'          => 'product_grid',
			'eyebrow'        => 'Signature Silhouettes',
			'title'          => 'The Icons',
			'subtitle'       => 'Permanent wardrobe staples',
			'view_all_label' => 'View All (18)',
			'view_all_url'   => '/shop',
			'category'       => '',
			'limit'          => 4,
		],
		[
			'_type'             => 'testimonials',
			'heading'           => '',
			'bg_color'          => '#efeee9',
			'autoplay'          => 'yes',
			'autoplay_interval' => '6',
			'testimonials'      => [
				[
					'_type'         => '_',
					'quote'         => '“The craftsmanship and subtle silhouette of these pieces speak for themselves. Truly timeless design in every stitch.”',
					'author'        => 'Sarah M.',
					'verified_text' => 'Verified Patron • Private Client since 2021',
					'is_verified'   => 'yes',
				],
				[
					'_type'         => '_',
					'quote'         => '“An exquisite balance between masculine architecture and fluid femininity. The cashmere coat is an heirloom piece.”',
					'author'        => 'Elena V.',
					'verified_text' => 'Verified Patron • Milan / Paris Atelier',
					'is_verified'   => 'yes',
				],
				[
					'_type'         => '_',
					'quote'         => '“Uncompromising materiality. You can feel the tactile integrity the moment you slip on the double-faced wool blazer.”',
					'author'        => 'Julian K.',
					'verified_text' => 'Verified Patron • Private Client since 2022',
					'is_verified'   => 'yes',
				],
			],
		],
		[
			'_type'          => 'about_story',
			'eyebrow'        => 'Origin & Heritage',
			'title'          => 'Craftsmanship Without Compromise',
			'content'        => 'We believe everyday garments should be designed with precision and tailored to perfection.',
			'quote_text'     => '“True luxury does not clamor for attention; it commands presence through silence and immaculate cut.”',
			'quote_author'   => '— Atelier Épure Archives',
			'image'          => 50,
			'image_alt'      => 'Craftsmanship Without Compromise',
			'image_position' => 'left',
			'badge_location' => '7ème Arrondissement',
			'badge_tagline'  => 'Hand-Draped & Finished',
			'badge_label'    => 'Master Atelier',
		],
		[
			'_type'       => 'cta_banner',
			'title'       => 'Elevate Your Wardrobe Today',
			'button_text' => 'Explore All Products',
			'button_url'  => '/shop',
		],
	];

	$home_page = get_page_by_path( 'home' );
	if ( $home_page ) {
		$existing_sections = carbon_get_post_meta( $home_page->ID, 'sections' );
		if ( empty( $existing_sections ) || ! is_array( $existing_sections ) ) {
			carbon_set_post_meta( $home_page->ID, 'sections', $default_home_sections );
		} else {
			// Safely update product_grid fields to dynamic WooCommerce configuration
			$updated = false;
			foreach ( $existing_sections as &$sec ) {
				if ( ( $sec['_type'] ?? '' ) === 'product_grid' ) {
					unset( $sec['custom_products'] );
					$sec['eyebrow']        = ! empty( $sec['eyebrow'] ) ? $sec['eyebrow'] : 'Signature Silhouettes';
					$sec['title']          = ( ! empty( $sec['title'] ) && $sec['title'] !== 'Trending Essentials' ) ? $sec['title'] : 'The Icons';
					$sec['subtitle']       = ! empty( $sec['subtitle'] ) ? $sec['subtitle'] : 'Permanent wardrobe staples';
					$sec['view_all_label'] = ! empty( $sec['view_all_label'] ) ? $sec['view_all_label'] : 'View All (18)';
					$sec['view_all_url']   = ! empty( $sec['view_all_url'] ) ? $sec['view_all_url'] : '/shop';
					$sec['limit']          = ! empty( $sec['limit'] ) ? $sec['limit'] : 4;
					$updated               = true;
				}
				if ( ( $sec['_type'] ?? '' ) === 'about_story' ) {
					$sec['eyebrow']        = ! empty( $sec['eyebrow'] ) ? $sec['eyebrow'] : 'Origin & Heritage';
					$sec['title']          = ! empty( $sec['title'] ) ? $sec['title'] : 'Craftsmanship Without Compromise';
					$sec['content']        = ! empty( $sec['content'] ) ? $sec['content'] : 'We believe everyday garments should be designed with precision and tailored to perfection.';
					$sec['quote_text']     = ! empty( $sec['quote_text'] ) ? $sec['quote_text'] : '“True luxury does not clamor for attention; it commands presence through silence and immaculate cut.”';
					$sec['quote_author']   = ! empty( $sec['quote_author'] ) ? $sec['quote_author'] : '— Atelier Épure Archives';
					$sec['image']          = ! empty( $sec['image'] ) ? $sec['image'] : 50;
					$sec['image_alt']      = ! empty( $sec['image_alt'] ) ? $sec['image_alt'] : 'Craftsmanship Without Compromise';
					$sec['image_position'] = ! empty( $sec['image_position'] ) ? $sec['image_position'] : 'left';
					$sec['badge_location'] = ! empty( $sec['badge_location'] ) ? $sec['badge_location'] : '7ème Arrondissement';
					$sec['badge_tagline']  = ! empty( $sec['badge_tagline'] ) ? $sec['badge_tagline'] : 'Hand-Draped & Finished';
					$sec['badge_label']    = ! empty( $sec['badge_label'] ) ? $sec['badge_label'] : 'Master Atelier';
					$updated               = true;
				}
			}
			unset( $sec );

			// Ensure testimonials slider is inserted between product_grid and about_story
			$existing_types = array_column( $existing_sections, '_type' );
			if ( ! in_array( 'testimonials', $existing_types, true ) && ! in_array( 'testimonials_slider', $existing_types, true ) ) {
				$pgrid_idx = array_search( 'product_grid', $existing_types, true );
				$new_testi = [
					'_type'             => 'testimonials',
					'heading'           => '',
					'bg_color'          => '#efeee9',
					'autoplay'          => 'yes',
					'autoplay_interval' => '6',
					'testimonials'      => [
						[
							'_type'         => '_',
							'quote'         => '“The craftsmanship and subtle silhouette of these pieces speak for themselves. Truly timeless design in every stitch.”',
							'author'        => 'Sarah M.',
							'verified_text' => 'Verified Patron • Private Client since 2021',
							'is_verified'   => 'yes',
						],
						[
							'_type'         => '_',
							'quote'         => '“An exquisite balance between masculine architecture and fluid femininity. The cashmere coat is an heirloom piece.”',
							'author'        => 'Elena V.',
							'verified_text' => 'Verified Patron • Milan / Paris Atelier',
							'is_verified'   => 'yes',
						],
						[
							'_type'         => '_',
							'quote'         => '“Uncompromising materiality. You can feel the tactile integrity the moment you slip on the double-faced wool blazer.”',
							'author'        => 'Julian K.',
							'verified_text' => 'Verified Patron • Private Client since 2022',
							'is_verified'   => 'yes',
						],
					],
				];
				if ( $pgrid_idx !== false ) {
					array_splice( $existing_sections, $pgrid_idx + 1, 0, [ $new_testi ] );
				} else {
					$existing_sections[] = $new_testi;
				}
				$updated = true;
			}

			// CRITICAL: NEVER overwrite user data or images!
			// Only append new section layouts if they do not exist yet.
			$existing_types = array_column( $existing_sections, '_type' );
			foreach ( $default_home_sections as $new_sec ) {
				$sec_type = $new_sec['_type'] ?? '';
				if ( $sec_type && ! in_array( $sec_type, $existing_types, true ) ) {
					$existing_sections[] = $new_sec;
					$updated = true;
				}
			}
			if ( $updated ) {
				carbon_set_post_meta( $home_page->ID, 'sections', $existing_sections );
			}
		}
	}

	// 3. Seed About Page Sections safely
	$about_page = get_page_by_path( 'about' );
	if ( $about_page ) {
		$existing_about_sections = carbon_get_post_meta( $about_page->ID, 'sections' );
		if ( empty( $existing_about_sections ) || ! is_array( $existing_about_sections ) ) {
			$about_sections = [
				[
					'_type'       => 'hero',
					'heading'     => 'Our Heritage & Vision',
					'subheading'  => 'Discover the story behind Paradise and our dedication to mindful design.',
					'bg_image'    => $site_url . '/wp-content/uploads/about-hero.jpg',
					'button_text' => 'Learn More',
					'button_url'  => '#story',
				],
				[
					'_type'          => 'about_story',
					'title'          => 'Sustainable From Day One',
					'content'        => '<p>From raw fiber to finished cut, every step respects our artisans and planet.</p>',
					'image'          => $site_url . '/wp-content/uploads/about-craft.jpg',
					'image_position' => 'right',
				],
				[
					'_type'       => 'cta_banner',
					'title'       => 'Join Our Sustainable Journey',
					'button_text' => 'Browse The Shop',
					'button_url'  => '/shop',
				],
			];
			carbon_set_post_meta( $about_page->ID, 'sections', $about_sections );
		}
	}

	update_option( 'our_carbon_seeded_v11', '1' );
}
