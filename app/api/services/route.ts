import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Create a new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('API received service data:', body);
    
    const {
      title,
      description,
      price,
      duration,
      delivery_type,
      is_active = true,
      images = []
    } = body;

    // Validate required fields
    if (!title || !description || !price) {
      return NextResponse.json(
        { error: 'Title, description, and price are required' },
        { status: 400 }
      );
    }

    // Create the service
    const serviceData = {
      title,
      description,
      price: parseFloat(price),
      duration: duration || null,
      delivery_type: delivery_type || null,
      is_active,
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    };
    
    console.log('Creating service with data:', serviceData);
    
    const newService = await prisma.services.create({
      data: serviceData
    });

    console.log('Service created successfully:', newService);

    // Store images in service_media table if images are provided
    if (images && images.length > 0) {
      try {
        const mediaData = images.map((imageUrl: string, index: number) => ({
          media_type: 'image',
          media_url: imageUrl,
          alt_text: `${title} image ${index + 1}`,
          title: `${title} image ${index + 1}`,
          sort_order: index,
          is_primary: index === 0, // First image is primary
          is_active: true
        }));

        const mediaResponse = await fetch(`${request.nextUrl.origin}/api/services/${newService.id}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ media: mediaData })
        });

        if (mediaResponse.ok) {
          const mediaResult = await mediaResponse.json();
          console.log('Service media stored successfully:', mediaResult);
        } else {
          console.error('Failed to store service media:', await mediaResponse.json());
        }
      } catch (mediaError) {
        console.error('Error storing service media:', mediaError);
        // Don't fail the service creation if media storage fails
      }
    }
    
    return NextResponse.json({
      success: true,
      service: newService,
      message: 'Service created successfully'
    });

  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Failed to create service', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Fetch all services with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const delivery_type = searchParams.get('delivery_type');
    const is_active = searchParams.get('is_active');

    const skip = (page - 1) * limit;

    const where: {
      is_active?: boolean;
      delivery_type?: string;
      OR?: {
        title?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }[];
    } = {};

    // Filter by active status
    if (is_active !== null && is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    // Filter by delivery type
    if (delivery_type) {
      where.delivery_type = delivery_type;
    }

    // Search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [services, total] = await Promise.all([
      prisma.services.findMany({
        where,
        include: {
          service_media: {
            where: {
              is_active: true
            },
            orderBy: {
              sort_order: 'asc'
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.services.count({ where })
    ]);

    return NextResponse.json({
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
