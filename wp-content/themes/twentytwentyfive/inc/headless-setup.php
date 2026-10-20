<?php
/**
 * Headless Next.js Setup for WordPress & WooCommerce (Phase 1).
 * Registers ACF Options Page, Flexible Content Page Sections, and REST API endpoints.
 *
 * @package TwentyTwentyFive
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * 1. Register ACF Options Page: "Global Settings".
 */
add_action( 'acf/init', 'our_register_acf_options_page' );
function our_register_acf_options_page() {
	if ( function_exists( 'acf_add_options_page' ) ) {
		acf_add_options_page( [
			'page_title'      => 'Global Settings',
			'menu_title'      => 'Global Settings',
			'menu_slug'       => 'global-settings',
			'capability'      => 'manage_options',
			'redirect'        => false,
			'icon_url'        => 'dashicons-admin-generic',
			'position'        => 2,
			'show_in_graphql' => true,
		] );
	}
}

/**
 * 2. Register ACF Field Groups (Options & Page Flexible Content Sections).
 */
add_action( 'acf/init', 'our_register_acf_field_groups' );
function our_register_acf_field_groups() {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	// ----------------------------------------------------
	// A. Global Settings Field Group (Options Page)
	// ----------------------------------------------------
	acf_add_local_field_group( [
		'key'                   => 'group_global_settings',
		'title'                 => 'Global Theme Settings',
		'fields'                => [
			[
				'key'           => 'field_global_logo',
				'label'         => 'Logo',
				'name'          => 'logo',
				'type'          => 'image',
				'return_format' => 'url',
				'preview_size'  => 'medium',
				'library'       => 'all',
			],
			[
				'key'           => 'field_global_primary_color',
				'label'         => 'Primary Color',
				'name'          => 'primary_color',
				'type'          => 'text',
				'default_value' => '#463F3A',
				'placeholder'   => '#463F3A',
			],
			[
				'key'           => 'field_global_accent_color',
				'label'         => 'Accent Color',
				'name'          => 'accent_color',
				'type'          => 'text',
				'default_value' => '#E0AFA0',
				'placeholder'   => '#E0AFA0',
			],
			[
				'key'          => 'field_global_header_nav',
				'label'        => 'Header Navigation',
				'name'         => 'header_nav',
				'type'         => 'repeater',
				'layout'       => 'table',
				'button_label' => 'Add Nav Item',
				'sub_fields'   => [
					[
						'key'   => 'field_header_nav_label',
						'label' => 'Label',
						'name'  => 'label',
						'type'  => 'text',
					],
					[
						'key'   => 'field_header_nav_url',
						'label' => 'URL',
						'name'  => 'url',
						'type'  => 'text',
					],
				],
			],
			[
				'key'          => 'field_global_footer_links',
				'label'        => 'Footer Links',
				'name'         => 'footer_links',
				'type'         => 'repeater',
				'layout'       => 'table',
				'button_label' => 'Add Footer Link',
				'sub_fields'   => [
					[
						'key'   => 'field_footer_link_label',
						'label' => 'Label',
						'name'  => 'label',
						'type'  => 'text',
					],
					[
						'key'   => 'field_footer_link_url',
						'label' => 'URL',
						'name'  => 'url',
						'type'  => 'text',
					],
				],
			],
		],
		'location'              => [
			[
				[
					'param'    => 'options_page',
					'operator' => '==',
					'value'    => 'global-settings',
				],
			],
		],
		'show_in_rest'          => 1,
		'active'                => true,
	] );

	// ----------------------------------------------------
	// B. Page Content Sections (Flexible Content)
	// ----------------------------------------------------
	acf_add_local_field_group( [
		'key'          => 'group_page_sections',
		'title'        => 'Page Content Sections',
		'fields'       => [
			[
				'key'          => 'field_page_sections',
				'label'        => 'Sections',
				'name'         => 'sections',
				'type'         => 'flexible_content',
				'button_label' => 'Add Section',
				'layouts'      => [
					// Layout 1: Hero
					'layout_hero'         => [
						'key'        => 'layout_hero',
						'name'       => 'hero',
						'label'      => 'Hero Section',
						'display'    => 'block',
						'sub_fields' => [
							[
								'key'      => 'field_hero_heading',
								'label'    => 'Heading',
								'name'     => 'heading',
								'type'     => 'text',
								'required' => 1,
							],
							[
								'key'   => 'field_hero_subheading',
								'label' => 'Subheading',
								'name'  => 'subheading',
								'type'  => 'textarea',
								'rows'  => 3,
							],
							[
								'key'           => 'field_hero_bg_image',
								'label'         => 'Background Image',
								'name'          => 'bg_image',
								'type'          => 'image',
								'return_format' => 'url',
							],
							[
								'key'   => 'field_hero_button_text',
								'label' => 'Button Text',
								'name'  => 'button_text',
								'type'  => 'text',
							],
							[
								'key'   => 'field_hero_button_url',
								'label' => 'Button URL',
								'name'  => 'button_url',
								'type'  => 'text',
							],
						],
					],
					// Layout 2: Product Grid
					'layout_product_grid' => [
						'key'        => 'layout_product_grid',
						'name'       => 'product_grid',
						'label'      => 'Product Grid',
						'display'    => 'block',
						'sub_fields' => [
							[
								'key'      => 'field_pgrid_title',
								'label'    => 'Title',
								'name'     => 'title',
								'type'     => 'text',
								'required' => 1,
							],
							[
								'key'         => 'field_pgrid_category',
								'label'       => 'Category Slug',
								'name'        => 'category',
								'type'        => 'text',
								'placeholder' => 'clothing (leave blank for all)',
							],
							[
								'key'           => 'field_pgrid_limit',
								'label'         => 'Limit',
								'name'          => 'limit',
								'type'          => 'number',
								'default_value' => 4,
								'min'           => 1,
								'max'           => 24,
							],
						],
					],
					// Layout 3: About Story
					'layout_about_story'  => [
						'key'        => 'layout_about_story',
						'name'       => 'about_story',
						'label'      => 'About Story',
						'display'    => 'block',
						'sub_fields' => [
							[
								'key'      => 'field_astory_title',
								'label'    => 'Title',
								'name'     => 'title',
								'type'     => 'text',
								'required' => 1,
							],
							[
								'key'   => 'field_astory_content',
								'label' => 'Content',
								'name'  => 'content',
								'type'  => 'textarea',
								'rows'  => 5,
							],
							[
								'key'           => 'field_astory_image',
								'label'         => 'Image',
								'name'          => 'image',
								'type'          => 'image',
								'return_format' => 'url',
							],
							[
								'key'           => 'field_astory_image_pos',
								'label'         => 'Image Position',
								'name'          => 'image_position',
								'type'          => 'select',
								'choices'       => [
									'left'  => 'Left',
									'right' => 'Right',
								],
								'default_value' => 'left',
							],
						],
					],
					// Layout 4: CTA Banner
					'layout_cta_banner'   => [
						'key'        => 'layout_cta_banner',
						'name'       => 'cta_banner',
						'label'      => 'CTA Banner',
						'display'    => 'block',
						'sub_fields' => [
							[
								'key'      => 'field_cta_title',
								'label'    => 'Title',
								'name'     => 'title',
								'type'     => 'text',
								'required' => 1,
							],
							[
								'key'   => 'field_cta_button_text',
								'label' => 'Button Text',
								'name'  => 'button_text',
								'type'  => 'text',
							],
							[
								'key'   => 'field_cta_button_url',
								'label' => 'Button URL',
								'name'  => 'button_url',
								'type'  => 'text',
							],
						],
					],
				],
			],
		],
		'location'     => [
			[
				[
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'page',
				],
			],
		],
		'show_in_rest' => 1,
		'active'       => true,
	] );
}

/**
 * 3. Register REST API Endpoints for Global Settings and Pages.
 */
add_action( 'rest_api_init', 'our_register_headless_rest_routes' );
function our_register_headless_rest_routes() {
	// GET /wp-json/our/v1/options (and /wp-json/acf/v3/options/options alias)
	register_rest_route(
		'our/v1',
		'/options',
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'our_get_headless_options_response',
			'permission_callback' => '__return_true',
		]
	);

	register_rest_route(
		'acf/v3',
		'/options/options',
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'our_get_headless_options_response',
			'permission_callback' => '__return_true',
		]
	);

	// Expose 'acf' and 'sections' on standard Page post type in WP REST API
	register_rest_field(
		'page',
		'acf',
		[
			'get_callback' => 'our_get_page_acf_rest_field',
			'schema'       => [
				'description' => 'ACF Flexible Content Sections for Page',
				'type'        => 'object',
			],
		]
	);

	register_rest_field(
		'page',
		'sections',
		[
			'get_callback' => 'our_get_page_sections_rest_field',
			'schema'       => [
				'description' => 'Direct access array of sections',
				'type'        => 'array',
			],
		]
	);
}

/**
 * Get Global Settings payload.
 */
function our_get_global_settings_data() {
	$logo          = function_exists( 'get_field' ) ? get_field( 'logo', 'option' ) : get_option( 'our_headless_logo' );
	$primary_color = function_exists( 'get_field' ) ? get_field( 'primary_color', 'option' ) : get_option( 'our_headless_primary_color' );
	$accent_color  = function_exists( 'get_field' ) ? get_field( 'accent_color', 'option' ) : get_option( 'our_headless_accent_color' );
	$header_nav    = function_exists( 'get_field' ) ? get_field( 'header_nav', 'option' ) : get_option( 'our_headless_header_nav' );
	$footer_links  = function_exists( 'get_field' ) ? get_field( 'footer_links', 'option' ) : get_option( 'our_headless_footer_links' );

	// Fallback defaults
	if ( empty( $primary_color ) ) {
		$primary_color = '#463F3A';
	}
	if ( empty( $accent_color ) ) {
		$accent_color = '#E0AFA0';
	}
	if ( empty( $header_nav ) || ! is_array( $header_nav ) ) {
		$header_nav = [
			[ 'label' => 'Home', 'url' => '/' ],
			[ 'label' => 'Shop', 'url' => '/shop' ],
			[ 'label' => 'About', 'url' => '/about' ],
			[ 'label' => 'Cart', 'url' => '/cart' ],
		];
	}
	if ( empty( $footer_links ) || ! is_array( $footer_links ) ) {
		$footer_links = [
			[ 'label' => 'Privacy Policy', 'url' => '/privacy' ],
			[ 'label' => 'Terms of Service', 'url' => '/terms' ],
			[ 'label' => 'Contact Us', 'url' => '/contact' ],
		];
	}
	if ( empty( $logo ) ) {
		$logo = 'http://paradise.test/wp-content/uploads/logo.svg';
	}

	return [
		'logo'          => $logo,
		'primary_color' => $primary_color,
		'accent_color'  => $accent_color,
		'header_nav'    => $header_nav,
		'footer_links'  => $footer_links,
	];
}

/**
 * Response callback for Options endpoint.
 */
function our_get_headless_options_response( WP_REST_Request $request ) {
	$data = our_get_global_settings_data();

	// If accessed via /our/v1/options, use standard envelope
	if ( strpos( $request->get_route(), '/our/v1/' ) !== false ) {
		return rest_ensure_response( [
			'success' => true,
			'data'    => $data,
			'message' => 'Global settings retrieved successfully.',
		] );
	}

	// For /acf/v3/options/options standard ACF shape
	return rest_ensure_response( [
		'acf' => $data,
	] );
}

/**
 * Callback to populate 'acf' field on Pages in REST API.
 */
function our_get_page_acf_rest_field( $post_arr ) {
	$post_id  = $post_arr['id'];
	$sections = our_get_page_sections_data( $post_id );

	return [
		'sections' => $sections,
	];
}

/**
 * Callback to populate 'sections' field directly on Pages in REST API.
 */
function our_get_page_sections_rest_field( $post_arr ) {
	$post_id = $post_arr['id'];
	return our_get_page_sections_data( $post_id );
}

/**
 * Helper to retrieve sections from ACF or page meta.
 */
function our_get_page_sections_data( $post_id ) {
	if ( function_exists( 'get_field' ) ) {
		$sections = get_field( 'sections', $post_id );
		if ( ! empty( $sections ) && is_array( $sections ) ) {
			return $sections;
		}
	}

	$stored = get_post_meta( $post_id, 'sections', true );
	if ( ! empty( $stored ) && is_array( $stored ) ) {
		return $stored;
	}

	return [];
}

/**
 * 4. Auto-Seed Sample Pages & Options Data (Home & About) if not present.
 */
add_action( 'init', 'our_seed_headless_sample_data', 20 );
function our_seed_headless_sample_data() {
	// Seed Global Settings in WP options
	if ( ! get_option( 'our_headless_seeded_options' ) ) {
		update_option( 'our_headless_primary_color', '#463F3A' );
		update_option( 'our_headless_accent_color', '#E0AFA0' );
		update_option( 'our_headless_logo', 'http://paradise.test/wp-content/uploads/logo.svg' );
		update_option( 'our_headless_header_nav', [
			[ 'label' => 'Home', 'url' => '/' ],
			[ 'label' => 'Shop', 'url' => '/shop' ],
			[ 'label' => 'About', 'url' => '/about' ],
			[ 'label' => 'Cart', 'url' => '/cart' ],
		] );
		update_option( 'our_headless_footer_links', [
			[ 'label' => 'Privacy Policy', 'url' => '/privacy' ],
			[ 'label' => 'Terms of Service', 'url' => '/terms' ],
			[ 'label' => 'Contact Us', 'url' => '/contact' ],
		] );
		update_option( 'our_headless_seeded_options', '1' );
	}

	// Seed Home Page
	$home_page = get_page_by_path( 'home' );
	if ( ! $home_page ) {
		$home_id = wp_insert_post( [
			'post_title'   => 'Home',
			'post_name'    => 'home',
			'post_status'  => 'publish',
			'post_type'    => 'page',
			'post_content' => 'Headless Next.js Home Page',
		] );

		if ( $home_id && ! is_wp_error( $home_id ) ) {
			$sample_sections = [
				[
					'acf_fc_layout' => 'hero',
					'heading'       => 'Timeless Minimalist Essentials',
					'subheading'    => 'Curated collections engineered for modern life with sustainable, ethical materials.',
					'bg_image'      => 'http://paradise.test/wp-content/uploads/hero-bg.jpg',
					'button_text'   => 'Shop New Arrivals',
					'button_url'    => '/shop',
				],
				[
					'acf_fc_layout' => 'product_grid',
					'title'         => 'Trending Essentials',
					'category'      => '',
					'limit'         => 4,
				],
				[
					'acf_fc_layout'  => 'about_story',
					'title'          => 'Craftsmanship Without Compromise',
					'content'        => 'We believe everyday garments should be designed with precision and tailored to perfection.',
					'image'          => 'http://paradise.test/wp-content/uploads/about-story.jpg',
					'image_position' => 'left',
				],
				[
					'acf_fc_layout' => 'cta_banner',
					'title'         => 'Elevate Your Wardrobe Today',
					'button_text'   => 'Explore All Products',
					'button_url'    => '/shop',
				],
			];

			update_post_meta( $home_id, 'sections', $sample_sections );
			if ( function_exists( 'update_field' ) ) {
				update_field( 'sections', $sample_sections, $home_id );
			}
		}
	}

	// Seed About Page
	$about_page = get_page_by_path( 'about' );
	if ( ! $about_page ) {
		$about_id = wp_insert_post( [
			'post_title'   => 'About Us',
			'post_name'    => 'about',
			'post_status'  => 'publish',
			'post_type'    => 'page',
			'post_content' => 'Headless Next.js About Page',
		] );

		if ( $about_id && ! is_wp_error( $about_id ) ) {
			$about_sections = [
				[
					'acf_fc_layout' => 'hero',
					'heading'       => 'Our Heritage & Vision',
					'subheading'    => 'Discover the story behind Paradise and our dedication to mindful design.',
					'bg_image'      => 'http://paradise.test/wp-content/uploads/about-hero.jpg',
					'button_text'   => 'Learn More',
					'button_url'    => '#story',
				],
				[
					'acf_fc_layout'  => 'about_story',
					'title'          => 'Sustainable From Day One',
					'content'        => 'From raw fiber to finished cut, every step respects our artisans and planet.',
					'image'          => 'http://paradise.test/wp-content/uploads/about-craft.jpg',
					'image_position' => 'right',
				],
				[
					'acf_fc_layout' => 'cta_banner',
					'title'         => 'Join Our Sustainable Journey',
					'button_text'   => 'Browse The Shop',
					'button_url'    => '/shop',
				],
			];

			update_post_meta( $about_id, 'sections', $about_sections );
			if ( function_exists( 'update_field' ) ) {
				update_field( 'sections', $about_sections, $about_id );
			}
		}
	}
}

/**
 * =========================================================================
 * PHASE 7: HEADLESS DRAFT MODE & NEXT.JS PREVIEW
 * =========================================================================
 */

if ( ! defined( 'HEADLESS_FRONTEND_URL' ) ) {
	define( 'HEADLESS_FRONTEND_URL', 'http://localhost:3000' );
}

if ( ! defined( 'HEADLESS_PREVIEW_SECRET' ) ) {
	define( 'HEADLESS_PREVIEW_SECRET', 'paradise_preview_secret_2026' );
}

/**
 * 1. Filter WordPress preview links to redirect through Next.js Draft Mode.
 */
add_filter( 'preview_post_link', 'our_headless_preview_link', 10, 2 );
function our_headless_preview_link( $preview_link, $post ) {
	if ( is_numeric( $post ) ) {
		$post = get_post( $post );
	}
	if ( ! $post || ! is_object( $post ) ) {
		return $preview_link;
	}

	$slug = ! empty( $post->post_name ) ? $post->post_name : '';
	if ( empty( $slug ) && ! empty( $post->post_title ) ) {
		$slug = sanitize_title( $post->post_title );
	}
	if ( empty( $slug ) ) {
		$slug = 'page-' . $post->ID;
	}

	// For designated front page, use 'home'
	$front_id = (int) get_option( 'page_on_front' );
	if ( $front_id > 0 && $front_id === (int) $post->ID ) {
		$slug = 'home';
	}

	return add_query_arg(
		[
			'secret' => HEADLESS_PREVIEW_SECRET,
			'slug'   => $slug,
			'id'     => $post->ID,
		],
		trailingslashit( HEADLESS_FRONTEND_URL ) . 'api/draft'
	);
}

/**
 * 2. Add "Preview in Next.js" button to the Post Edit sidebar.
 */
add_action( 'post_submitbox_misc_actions', 'our_add_headless_preview_button' );
function our_add_headless_preview_button( $post ) {
	if ( ! $post || ! in_array( $post->post_type, [ 'page', 'post' ], true ) ) {
		return;
	}
	$preview_url = our_headless_preview_link( '', $post );
	?>
	<div class="misc-pub-section misc-pub-headless-preview" style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-top:1px solid #dcdcde;">
		<span style="font-weight:600;display:flex;align-items:center;gap:6px;">
			<span class="dashicons dashicons-laptop" style="font-size:18px;"></span> Next.js:
		</span>
		<a href="<?php echo esc_url( $preview_url ); ?>" target="_blank" rel="noopener noreferrer" class="button button-secondary" style="font-size:12px;display:inline-flex;align-items:center;gap:4px;">
			Preview ↗
		</a>
	</div>
	<?php
}

/**
 * 3. Add "Preview in Next.js" node to the WordPress Admin Bar.
 */
add_action( 'admin_bar_menu', 'our_add_headless_admin_bar_preview', 100 );
function our_add_headless_admin_bar_preview( $wp_admin_bar ) {
	if ( is_admin() ) {
		global $post;
		if ( $post && in_array( $post->post_type, [ 'page', 'post' ], true ) ) {
			$preview_url = our_headless_preview_link( '', $post );
			$wp_admin_bar->add_node( [
				'id'    => 'headless-preview-link',
				'title' => '<span class="ab-icon dashicons dashicons-external" style="top:2px;"></span><span class="ab-label">Preview in Next.js</span>',
				'href'  => $preview_url,
				'meta'  => [
					'target' => '_blank',
					'title'  => 'Open Next.js Draft Preview in a new window',
				],
			] );
		}
	}
}

/**
 * 4. Register dedicated preview REST route: GET /wp-json/our/v1/preview-page
 */
add_action( 'rest_api_init', 'our_register_headless_preview_route' );
function our_register_headless_preview_route() {
	register_rest_route(
		'our/v1',
		'/preview-page',
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'our_get_headless_preview_response',
			'permission_callback' => '__return_true',
			'args'                => [
				'slug'   => [ 'type' => 'string' ],
				'id'     => [ 'type' => 'integer' ],
				'secret' => [ 'type' => 'string', 'required' => true ],
			],
		]
	);
}

function our_get_headless_preview_response( WP_REST_Request $request ) {
	$secret = $request->get_param( 'secret' );
	if ( $secret !== HEADLESS_PREVIEW_SECRET ) {
		return new WP_Error( 'unauthorized', 'Invalid preview token', [ 'status' => 401 ] );
	}

	$slug = sanitize_text_field( $request->get_param( 'slug' ) );
	$id   = absint( $request->get_param( 'id' ) );

	$post = null;
	if ( $id > 0 ) {
		$post = get_post( $id );
	} elseif ( ! empty( $slug ) ) {
		if ( 'home' === $slug ) {
			$front_id = get_option( 'page_on_front' );
			if ( $front_id ) {
				$post = get_post( $front_id );
			}
		}
		if ( ! $post ) {
			$posts = get_posts( [
				'name'        => $slug,
				'post_type'   => [ 'page', 'post' ],
				'post_status' => [ 'publish', 'draft', 'pending', 'future', 'private' ],
				'numberposts' => 1,
			] );
			if ( ! empty( $posts ) ) {
				$post = $posts[0];
			}
		}
	}

	if ( ! $post ) {
		return new WP_Error( 'not_found', 'Draft post not found', [ 'status' => 404 ] );
	}

	// Retrieve autosave / revisions if available
	$revisions = wp_get_post_revisions( $post->ID );
	$display_post = $post;
	if ( ! empty( $revisions ) ) {
		$latest_rev = reset( $revisions );
		if ( $latest_rev ) {
			$display_post = $latest_rev;
		}
	}

	// Retrieve ACF sections
	$sections = function_exists( 'get_field' ) ? get_field( 'sections', $post->ID ) : [];
	if ( empty( $sections ) ) {
		$sections = get_post_meta( $post->ID, 'sections', true );
	}
	if ( ! is_array( $sections ) ) {
		$sections = [];
	}

	$data = [
		'id'       => $post->ID,
		'slug'     => $post->post_name,
		'title'    => [
			'rendered' => $display_post->post_title,
		],
		'content'  => [
			'rendered' => apply_filters( 'the_content', $display_post->post_content ),
		],
		'acf'      => [
			'sections' => $sections,
		],
		'sections' => $sections,
	];

	return rest_ensure_response( $data );
}


