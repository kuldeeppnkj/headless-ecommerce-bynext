<?php
/**
 * Orders REST endpoints (Phase 6).
 *
 * @package OurAPI
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register orders REST routes.
 */
add_action( 'rest_api_init', 'our_register_orders_routes' );
function our_register_orders_routes() {
	$namespace = defined( 'OUR_API_NAMESPACE' ) ? OUR_API_NAMESPACE : 'our/v1';

	// GET /our/v1/orders
	register_rest_route(
		$namespace,
		'/orders',
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'our_handle_get_orders',
			'permission_callback' => 'our_require_jwt',
		]
	);

	// GET /our/v1/orders/:id
	register_rest_route(
		$namespace,
		'/orders/(?P<id>\d+)',
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'our_handle_get_order_detail',
			'permission_callback' => 'our_require_jwt',
			'args'                => [
				'id' => [
					'validate_callback' => function( $param ) {
						return is_numeric( $param ) && (int) $param > 0;
					},
				],
			],
		]
	);

	// POST /our/v1/orders/:id/cancel
	register_rest_route(
		$namespace,
		'/orders/(?P<id>\d+)/cancel',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'our_handle_cancel_order',
			'permission_callback' => 'our_require_jwt',
			'args'                => [
				'id' => [
					'validate_callback' => function( $param ) {
						return is_numeric( $param ) && (int) $param > 0;
					},
				],
			],
		]
	);
}

/**
 * Helper to format a single line item for API responses.
 *
 * @param WC_Order_Item_Product $item Line item object.
 * @return array
 */
function our_format_order_line_item( $item ) {
	$product   = $item->get_product();
	$image_url = '';

	if ( $product ) {
		$image_id = $product->get_image_id();
		if ( ! $image_id && $product->is_type( 'variation' ) ) {
			$parent = wc_get_product( $product->get_parent_id() );
			if ( $parent ) {
				$image_id = $parent->get_image_id();
			}
		}
		if ( $image_id ) {
			$image_url = wp_get_attachment_image_url( $image_id, 'medium' );
		}
	}

	if ( empty( $image_url ) && function_exists( 'wc_placeholder_img_src' ) ) {
		$image_url = wc_placeholder_img_src( 'medium' );
	}

	$meta_data = [];
	foreach ( $item->get_formatted_meta_data() as $meta ) {
		$meta_data[] = [
			'key'   => $meta->key,
			'label' => $meta->display_key,
			'value' => wp_strip_all_tags( $meta->display_value ),
		];
	}

	$qty   = (float) $item->get_quantity();
	$total = (float) $item->get_total();
	$price = $qty > 0 ? ( $total / $qty ) : 0;

	return [
		'id'           => $item->get_id(),
		'name'         => $item->get_name(),
		'product_id'   => $item->get_product_id(),
		'variation_id' => $item->get_variation_id(),
		'quantity'     => $qty,
		'subtotal'     => wc_format_decimal( $item->get_subtotal(), 2 ),
		'total'        => wc_format_decimal( $item->get_total(), 2 ),
		'price'        => wc_format_decimal( $price, 2 ),
		'image_url'    => (string) $image_url,
		'meta'         => $meta_data,
	];
}

/**
 * Handle GET /our/v1/orders.
 * Supports: page, per_page (default 10, max 50), status.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response
 */
function our_handle_get_orders( WP_REST_Request $request ) {
	$user_id = get_current_user_id();
	$user    = get_userdata( $user_id );

	$page     = max( 1, (int) $request->get_param( 'page' ) );
	$per_page = (int) $request->get_param( 'per_page' );
	if ( $per_page <= 0 ) {
		$per_page = 10;
	}
	if ( $per_page > 50 ) {
		$per_page = 50;
	}

	$status_param = $request->get_param( 'status' );
	$status       = 'any';
	if ( ! empty( $status_param ) ) {
		$status = array_map( 'trim', explode( ',', sanitize_text_field( $status_param ) ) );
	}

	// Query orders for this customer (matches by customer ID or billing email)
	$customer_identifiers = [ $user_id ];
	if ( ! empty( $user->user_email ) ) {
		$customer_identifiers[] = $user->user_email;
	}

	$query_args = [
		'customer' => $customer_identifiers,
		'status'   => $status,
		'paginate' => true,
		'page'     => $page,
		'limit'    => $per_page,
		'orderby'  => 'date',
		'order'    => 'DESC',
	];

	$results = wc_get_orders( $query_args );

	$orders_list = [];
	if ( ! empty( $results->orders ) ) {
		foreach ( $results->orders as $order ) {
			// Auto-link order to customer if unlinked and email matches
			if ( 0 === (int) $order->get_customer_id() && ! empty( $user->user_email ) && strcasecmp( $order->get_billing_email(), $user->user_email ) === 0 ) {
				$order->set_customer_id( $user_id );
				$order->save();
			}

			$items = [];
			foreach ( $order->get_items() as $item ) {
				$items[] = our_format_order_line_item( $item );
			}

			$currency_code   = $order->get_currency();
			$currency_symbol = function_exists( 'get_woocommerce_currency_symbol' ) ? html_entity_decode( get_woocommerce_currency_symbol( $currency_code ) ) : '$';

			$orders_list[] = [
				'id'              => $order->get_id(),
				'order_number'    => $order->get_order_number(),
				'status'          => $order->get_status(),
				'status_label'    => wc_get_order_status_name( $order->get_status() ),
				'currency'        => $currency_code,
				'currency_symbol' => $currency_symbol,
				'total'           => wc_format_decimal( $order->get_total(), 2 ),
				'date_created'    => $order->get_date_created() ? $order->get_date_created()->date( 'c' ) : '',
				'items_count'     => $order->get_item_count(),
				'items'           => $items,
				'line_items'      => $items,
			];
		}
	}

	$data = [
		'orders'       => $orders_list,
		'total'        => (int) $results->total,
		'total_pages'  => (int) $results->max_num_pages,
		'current_page' => $page,
		'per_page'     => $per_page,
	];

	return our_response( $data, 'Orders retrieved successfully.', 200 );
}

/**
 * Handle GET /our/v1/orders/:id.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function our_handle_get_order_detail( WP_REST_Request $request ) {
	$order_id = (int) $request->get_param( 'id' );
	$order    = wc_get_order( $order_id );

	if ( ! $order ) {
		return our_error( 'Order not found.', 404, 'order_not_found' );
	}

	$user_id = get_current_user_id();
	$user    = get_userdata( $user_id );

	// Verify order belongs to the authenticated user
	$order_customer_id = (int) $order->get_customer_id();
	$order_email       = $order->get_billing_email();

	if ( $order_customer_id !== $user_id && strcasecmp( $order_email, $user->user_email ) !== 0 ) {
		return our_error( 'You do not have permission to view this order.', 403, 'forbidden' );
	}

	// Auto-link order to customer if previously unlinked
	if ( 0 === $order_customer_id && ! empty( $user->user_email ) && strcasecmp( $order_email, $user->user_email ) === 0 ) {
		$order->set_customer_id( $user_id );
		$order->save();
	}

	// Format line items
	$line_items = [];
	foreach ( $order->get_items() as $item ) {
		$line_items[] = our_format_order_line_item( $item );
	}

	// Format shipping lines
	$shipping_lines = [];
	foreach ( $order->get_shipping_methods() as $item_id => $shipping_item ) {
		$shipping_lines[] = [
			'id'           => $item_id,
			'method_id'    => $shipping_item->get_method_id(),
			'method_title' => $shipping_item->get_method_title(),
			'total'        => wc_format_decimal( $shipping_item->get_total(), 2 ),
		];
	}

	// Format coupon lines
	$coupon_lines = [];
	foreach ( $order->get_coupons() as $item_id => $coupon_item ) {
		$coupon_lines[] = [
			'id'       => $item_id,
			'code'     => $coupon_item->get_code(),
			'discount' => wc_format_decimal( $coupon_item->get_discount(), 2 ),
		];
	}

	$order_detail = [
		'id'                   => $order->get_id(),
		'order_number'         => $order->get_order_number(),
		'status'               => $order->get_status(),
		'status_label'         => wc_get_order_status_name( $order->get_status() ),
		'date_created'         => $order->get_date_created() ? $order->get_date_created()->date( 'c' ) : '',
		'date_modified'        => $order->get_date_modified() ? $order->get_date_modified()->date( 'c' ) : '',
		'currency'             => $order->get_currency(),
		'currency_symbol'      => function_exists( 'get_woocommerce_currency_symbol' ) ? html_entity_decode( get_woocommerce_currency_symbol( $order->get_currency() ) ) : '$',
		'total'                => wc_format_decimal( $order->get_total(), 2 ),
		'subtotal'             => wc_format_decimal( $order->get_subtotal(), 2 ),
		'shipping_total'       => wc_format_decimal( $order->get_shipping_total(), 2 ),
		'discount_total'       => wc_format_decimal( $order->get_discount_total(), 2 ),
		'tax_total'            => wc_format_decimal( $order->get_total_tax(), 2 ),
		'payment_method'       => $order->get_payment_method(),
		'payment_method_title' => $order->get_payment_method_title(),
		'customer_note'        => (string) $order->get_customer_note(),
		'billing'              => [
			'first_name' => (string) $order->get_billing_first_name(),
			'last_name'  => (string) $order->get_billing_last_name(),
			'company'    => (string) $order->get_billing_company(),
			'address_1'  => (string) $order->get_billing_address_1(),
			'address_2'  => (string) $order->get_billing_address_2(),
			'city'       => (string) $order->get_billing_city(),
			'state'      => (string) $order->get_billing_state(),
			'postcode'   => (string) $order->get_billing_postcode(),
			'country'    => (string) $order->get_billing_country(),
			'email'      => (string) $order->get_billing_email(),
			'phone'      => (string) $order->get_billing_phone(),
		],
		'shipping'             => [
			'first_name' => (string) $order->get_shipping_first_name(),
			'last_name'  => (string) $order->get_shipping_last_name(),
			'company'    => (string) $order->get_shipping_company(),
			'address_1'  => (string) $order->get_shipping_address_1(),
			'address_2'  => (string) $order->get_shipping_address_2(),
			'city'       => (string) $order->get_shipping_city(),
			'state'      => (string) $order->get_shipping_state(),
			'postcode'   => (string) $order->get_shipping_postcode(),
			'country'    => (string) $order->get_shipping_country(),
			'phone'      => (string) $order->get_shipping_phone(),
		],
		'items'                => $line_items,
		'line_items'           => $line_items,
		'shipping_lines'       => $shipping_lines,
		'coupon_lines'         => $coupon_lines,
	];

	return our_response( $order_detail, 'Order details retrieved successfully.', 200 );
}

/**
 * Handle POST /our/v1/orders/:id/cancel.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function our_handle_cancel_order( WP_REST_Request $request ) {
	$order_id = (int) $request->get_param( 'id' );
	$order    = wc_get_order( $order_id );

	if ( ! $order ) {
		return our_error( 'Order not found.', 404, 'order_not_found' );
	}

	$user_id = get_current_user_id();
	$user    = get_userdata( $user_id );

	// Verify order belongs to the authenticated user
	$order_customer_id = (int) $order->get_customer_id();
	$order_email       = $order->get_billing_email();

	if ( $order_customer_id !== $user_id && strcasecmp( $order_email, $user->user_email ) !== 0 ) {
		return our_error( 'You do not have permission to cancel this order.', 403, 'forbidden' );
	}

	// Validate status: only allowed if pending or processing or on-hold
	$current_status = $order->get_status();
	$cancellable    = [ 'pending', 'processing', 'on-hold' ];

	if ( ! in_array( $current_status, $cancellable, true ) ) {
		return our_error(
			sprintf( 'Order with status "%s" cannot be cancelled.', wc_get_order_status_name( $current_status ) ),
			400,
			'order_not_cancellable'
		);
	}

	// Update status to cancelled (triggers WooCommerce restock hooks)
	$order->update_status( 'cancelled', __( 'Order cancelled by customer via Headless API.', 'our-api' ) );

	$data = [
		'order_id'     => $order->get_id(),
		'status'       => 'cancelled',
		'status_label' => wc_get_order_status_name( 'cancelled' ),
	];

	return our_response( $data, 'Order cancelled.', 200 );
}

