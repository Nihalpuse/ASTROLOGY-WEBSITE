import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // First, find the zodiac sign by slug
    const zodiacSign = await prisma.zodiac_signs.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true }
    });

    if (!zodiacSign) {
      return NextResponse.json(
        { error: 'Zodiac sign not found' },
        { status: 404 }
      );
    }

    // Build the where clause for products
    const where: {
      is_active: boolean;
      zodiac_id: number;
      OR?: {
        name?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }[];
    } = {
      is_active: true,
      zodiac_id: zodiacSign.id
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Fetch products for this zodiac sign
    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
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
          product_stock: {
            take: 1,
            orderBy: { created_at: 'desc' }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.products.count({ where })
    ]);

    // Transform products to match the expected format for ReusableProductCard
    const transformedProducts = products.map(product => ({
      id: product.id.toString(),
      title: product.name,
      description: product.description,
      price: `₹${product.price}`,
      originalPrice: product.original_price ? `₹${product.original_price}` : undefined,
      slug: product.slug,
      image: product.product_media?.[0]?.media_url || product.image_url || '/images/placeholder.jpg',
      category: product.category?.name,
      rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // Random rating for demo
      reviewCount: Math.floor(Math.random() * 200 + 20), // Random review count for demo
      inStock: (product.product_stock?.[0]?.quantity || 0) > 0,
      isNew: new Date(product.created_at!).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000, // New if created within 30 days
      isFeatured: Math.random() > 0.7 // Random featured status for demo
    }));

    return NextResponse.json({
      products: transformedProducts,
      zodiacSign,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching products by zodiac sign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
