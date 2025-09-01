import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET single product by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    let product;

    // Check if the ID is numeric or a slug
    if (/^\d+$/.test(id)) {
      // It's a numeric ID
      const numericId = parseInt(id);
      product = await prisma.products.findUnique({
        where: { id: numericId },
      include: {
        category: true,
        zodiac: true,
        product_media: {
          where: {
            is_active: true
          },
          orderBy: {
            sort_order: 'asc'
          }
        },
        product_meta: true,
        product_shipping: true,
        product_stock: {
          take: 1
        }
      }
    });
    } else {
      // It's a slug
      product = await prisma.products.findFirst({
        where: { slug: id },
        include: {
          category: true,
          zodiac: true,
          product_media: {
            where: {
              is_active: true
            },
            orderBy: {
              sort_order: 'asc'
            }
          },
          product_meta: true,
          product_shipping: true,
          product_stock: {
            take: 1
          }
        }
      });
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('Product found with media count:', product.product_media?.length || 0);
    console.log('Product media:', product.product_media);

    return NextResponse.json(product);

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const {
      name,
      description,
      price,
      original_price,
      discount_price,
      sku,
      category_id,
      zodiac_id,
      images = [],
      // Auto-pricing fields
      product_type,
      weight,
      carats,
      quantity,
      quality,
      clarity,
      color,
      mukhi,
      material,
      per_carat_price,
      per_gram_price,
      per_piece_price
    } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !description || !price) {
      return NextResponse.json(
        { error: 'Name, description, and price are required' },
        { status: 400 }
      );
    }

    // Update the product (without images)
    const updatedProduct = await prisma.products.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        original_price: original_price ? parseFloat(original_price) : null,
        discount_price: discount_price ? parseFloat(discount_price) : null,
        sku: sku || null,
        category_id: category_id ? parseInt(category_id) : null,
        zodiac_id: zodiac_id ? parseInt(zodiac_id) : null,
        image_url: null, // Remove image_url from products table
        updated_at: new Date(),
        // Auto-pricing fields
        product_type: product_type || null,
        weight: weight ? parseFloat(weight) : null,
        carats: carats ? parseFloat(carats) : null,
        quantity: quantity ? parseInt(quantity) : null,
        quality: quality || null,
        clarity: clarity || null,
        color: color || null,
        mukhi: mukhi || null,
        material: material || null,
        per_carat_price: per_carat_price ? parseFloat(per_carat_price) : null,
        per_gram_price: per_gram_price ? parseFloat(per_gram_price) : null,
        per_piece_price: per_piece_price ? parseFloat(per_piece_price) : null
      }
    });

    // Update media if images are provided
    if (images && images.length > 0) {
      try {
        const mediaData = {
          media: images.map((imageUrl: string, index: number) => ({
            type: 'image',
            url: imageUrl, // Use 'url' field as expected by media route
            alt_text: `${name} image ${index + 1}`,
            title: `${name} image ${index + 1}`
          }))
        };

        const mediaResponse = await fetch(`${request.nextUrl.origin}/api/products/${id}/media`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mediaData)
        });

        if (mediaResponse.ok) {
          const mediaResult = await mediaResponse.json();
          console.log('Media updated successfully:', mediaResult);
        } else {
          const errorResponse = await mediaResponse.json();
          console.error('Failed to update media:', errorResponse);
          console.error('Media request body:', mediaData);
        }
      } catch (mediaError) {
        console.error('Error updating media:', mediaError);
        // Don't fail the product update if media update fails
      }
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Delete the product (related records will be deleted due to cascade)
    await prisma.products.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
