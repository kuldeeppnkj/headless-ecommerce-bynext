<?php
/**
 * Catalog helpers for formatting WooCommerce Store API responses.
 *
 * @package OurAPI
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Format a raw WooCommerce Store API product into a clean, frontend-friendly shape.
 *
 * @param array|object $raw Raw product data from Store API or WC_Product.
 * @return array
 */
function our_format_product( $raw ) {
	if ( empty( $raw ) ) {
		return [];
	}

	if ( $raw instanceof \WC_Product ) {
		$product = $raw;
		$images  = [];
		$main_id = $product->get_image_id();
		if ( $main_id ) {
			$images[] = [
				'id'        => (int) $main_id,
				'src'       => wp_get_attachment_url( $main_id ) ?: '',
				'thumbnail' => wp_get_attachment_thumb_url( $main_id ) ?: '',
				'alt'       => (string) get_post_meta( $main_id, '_wp_attachment_image_alt', true ),
				'name'      => (string) get_the_title( $main_id ),
			];
		}
		foreach ( $product->get_gallery_image_ids() as $gal_id ) {
			$images[] = [
				'id'        => (int) $gal_id,
				'src'       => wp_get_attachment_url( $gal_id ) ?: '',
				'thumbnail' => wp_get_attachment_thumb_url( $gal_id ) ?: '',
				'alt'       => (string) get_post_meta( $gal_id, '_wp_attachment_image_alt', true ),
				'name'      => (string) get_the_title( $gal_id ),
			];
		}

		$cats = [];
		$raw_cats = wc_get_product_terms( $product->get_id(), 'product_cat', [ 'fields' => 'all' ] );
		if ( ! is_wp_error( $raw_cats ) && is_array( $raw_cats ) ) {
			foreach ( $raw_cats as $cat ) {
				$cats[] = [
					'id'   => (int) $cat->term_id,
					'name' => (string) $cat->name,
					'slug' => (string) $cat->slug,
				];
			}
		}

		$tags = [];
		$raw_tags = wc_get_product_terms( $product->get_id(), 'product_tag', [ 'fields' => 'all' ] );
		if ( ! is_wp_error( $raw_tags ) && is_array( $raw_tags ) ) {
			foreach ( $raw_tags as $tag ) {
				$tags[] = [
					'id'   => (int) $tag->term_id,
					'name' => (string) $tag->name,
					'slug' => (string) $tag->slug,
				];
			}
		}

		$variations = [];
		if ( $product->is_type( 'variable' ) ) {
			foreach ( $product->get_children() as $child_id ) {
				$child = wc_get_product( $child_id );
				if ( $child ) {
					$variations[] = [
						'id'         => (int) $child_id,
						'attributes' => $child->get_variation_attributes(),
					];
				}
			}
		}

		return [
			'id'                => $product->get_id(),
			'name'              => $product->get_name(),
			'slug'              => $product->get_slug(),
			'price'             => (string) $product->get_price(),
			'regular_price'     => (string) $product->get_regular_price(),
			'sale_price'        => (string) $product->get_sale_price(),
			'images'            => $images,
			'categories'        => $cats,
			'tags'              => $tags,
			'attributes'        => array_values( $product->get_attributes() ),
			'variations'        => $variations,
			'stock_status'      => $product->get_stock_status(),
			'description'       => $product->get_description(),
			'short_description' => $product->get_short_description(),
		];
	}

	// Convert object to array if needed for consistent array access
	$data = is_object( $raw ) ? json_decode( wp_json_encode( $raw ), true ) : (array) $raw;

	$id   = isset( $data['id'] ) ? (int) $data['id'] : 0;
	$name = isset( $data['name'] ) ? (string) $data['name'] : '';
	$slug = isset( $data['slug'] ) ? (string) $data['slug'] : '';

	// Pricing extraction and conversion from minor units (e.g. 76800 -> 768.00)
	$prices     = isset( $data['prices'] ) && is_array( $data['prices'] ) ? $data['prices'] : [];
	$minor_unit = isset( $prices['currency_minor_unit'] ) ? (int) $prices['currency_minor_unit'] : 2;

	$calc_price = static function( $val, $minor_unit ) {
		if ( null === $val || '' === $val ) {
			return '';
		}
		$divisor = pow( 10, $minor_unit );
		return number_format( (float) $val / ( $divisor > 0 ? $divisor : 1 ), $minor_unit, '.', '' );
	};

	$price         = isset( $prices['price'] ) ? $calc_price( $prices['price'], $minor_unit ) : '';
	$regular_price = isset( $prices['regular_price'] ) ? $calc_price( $prices['regular_price'], $minor_unit ) : '';
	$sale_price    = isset( $prices['sale_price'] ) ? $calc_price( $prices['sale_price'], $minor_unit ) : '';

	// Fallback if price is directly on product
	if ( '' === $price && isset( $data['price'] ) && is_numeric( $data['price'] ) ) {
		$price = (string) $data['price'];
	}
	if ( '' === $regular_price && isset( $data['regular_price'] ) && is_numeric( $data['regular_price'] ) ) {
		$regular_price = (string) $data['regular_price'];
	}
	if ( '' === $sale_price && isset( $data['sale_price'] ) && is_numeric( $data['sale_price'] ) ) {
		$sale_price = (string) $data['sale_price'];
	}

	// Images
	$images = [];
	if ( ! empty( $data['images'] ) && is_array( $data['images'] ) ) {
		foreach ( $data['images'] as $img ) {
			if ( is_array( $img ) ) {
				$images[] = [
					'id'        => isset( $img['id'] ) ? (int) $img['id'] : 0,
					'src'       => isset( $img['src'] ) ? (string) $img['src'] : '',
					'thumbnail' => isset( $img['thumbnail'] ) ? (string) $img['thumbnail'] : ( $img['src'] ?? '' ),
					'alt'       => isset( $img['alt'] ) ? (string) $img['alt'] : '',
					'name'      => isset( $img['name'] ) ? (string) $img['name'] : '',
				];
			} elseif ( is_string( $img ) ) {
				$images[] = [
					'id'        => 0,
					'src'       => $img,
					'thumbnail' => $img,
					'alt'       => '',
					'name'      => '',
				];
			}
		}
	}

	// Categories
	$categories = [];
	if ( ! empty( $data['categories'] ) && is_array( $data['categories'] ) ) {
		foreach ( $data['categories'] as $cat ) {
			if ( is_array( $cat ) ) {
				$categories[] = [
					'id'   => isset( $cat['id'] ) ? (int) $cat['id'] : 0,
					'name' => isset( $cat['name'] ) ? (string) $cat['name'] : '',
					'slug' => isset( $cat['slug'] ) ? (string) $cat['slug'] : '',
				];
			}
		}
	}

	// Tags
	$tags = [];
	if ( ! empty( $data['tags'] ) && is_array( $data['tags'] ) ) {
		foreach ( $data['tags'] as $tag ) {
			if ( is_array( $tag ) ) {
				$tags[] = [
					'id'   => isset( $tag['id'] ) ? (int) $tag['id'] : 0,
					'name' => isset( $tag['name'] ) ? (string) $tag['name'] : '',
					'slug' => isset( $tag['slug'] ) ? (string) $tag['slug'] : '',
				];
			}
		}
	}

	// Attributes
	$attributes = [];
	if ( ! empty( $data['attributes'] ) && is_array( $data['attributes'] ) ) {
		foreach ( $data['attributes'] as $attr ) {
			if ( is_array( $attr ) ) {
				$terms = [];
				if ( ! empty( $attr['terms'] ) && is_array( $attr['terms'] ) ) {
					foreach ( $attr['terms'] as $t ) {
						if ( is_array( $t ) ) {
							$terms[] = [
								'id'   => isset( $t['id'] ) ? (int) $t['id'] : 0,
								'name' => isset( $t['name'] ) ? (string) $t['name'] : '',
								'slug' => isset( $t['slug'] ) ? (string) $t['slug'] : '',
							];
						}
					}
				}

				$attributes[] = [
					'id'             => isset( $attr['id'] ) ? (int) $attr['id'] : 0,
					'name'           => isset( $attr['name'] ) ? (string) $attr['name'] : '',
					'taxonomy'       => isset( $attr['taxonomy'] ) ? $attr['taxonomy'] : null,
					'has_variations' => ! empty( $attr['has_variations'] ),
					'terms'          => $terms,
				];
			}
		}
	}

	// Variations
	$variations = [];
	if ( ! empty( $data['variations'] ) && is_array( $data['variations'] ) ) {
		foreach ( $data['variations'] as $v ) {
			if ( is_array( $v ) ) {
				$variations[] = [
					'id'         => isset( $v['id'] ) ? (int) $v['id'] : 0,
					'attributes' => isset( $v['attributes'] ) && is_array( $v['attributes'] ) ? $v['attributes'] : [],
				];
			}
		}
	}

	// Stock status
	$stock_status = 'instock';
	if ( ! empty( $data['is_on_backorder'] ) ) {
		$stock_status = 'onbackorder';
	} elseif ( isset( $data['is_in_stock'] ) && false === $data['is_in_stock'] ) {
		$stock_status = 'outofstock';
	} elseif ( ! empty( $data['stock_status'] ) ) {
		$stock_status = (string) $data['stock_status'];
	}

	return [
		'id'                => $id,
		'name'              => $name,
		'slug'              => $slug,
		'price'             => $price,
		'regular_price'     => $regular_price,
		'sale_price'        => $sale_price,
		'images'            => $images,
		'categories'        => $categories,
		'tags'              => $tags,
		'attributes'        => $attributes,
		'variations'        => $variations,
		'stock_status'      => $stock_status,
		'description'       => isset( $data['description'] ) ? (string) $data['description'] : '',
		'short_description' => isset( $data['short_description'] ) ? (string) $data['short_description'] : '',
	];
}

