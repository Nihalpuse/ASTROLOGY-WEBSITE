import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Add media to a service
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = parseInt(params.id);
    const body = await request.json();
    const { media } = body;

    if (isNaN(serviceId)) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      );
    }

    if (!media || !Array.isArray(media)) {
      return NextResponse.json(
        { error: 'Media array is required' },
        { status: 400 }
      );
    }

    // Check if service exists
    const service = await prisma.services.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Create media records
    const mediaRecords = await Promise.all(
      media.map(async (mediaItem: any) => {
        return await prisma.service_media.create({
          data: {
            service_id: serviceId,
            media_type: mediaItem.type || 'image',
            media_url: mediaItem.url,
            alt_text: mediaItem.alt_text || null,
            title: mediaItem.title || null,
            sort_order: mediaItem.sort_order || 0,
            is_primary: mediaItem.is_primary || false,
            is_active: true
          }
        });
      })
    );

    return NextResponse.json({
      success: true,
      media: mediaRecords,
      message: 'Service media added successfully'
    });

  } catch (error) {
    console.error('Error adding service media:', error);
    return NextResponse.json(
      { error: 'Failed to add service media' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update service media
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = parseInt(params.id);
    const body = await request.json();
    const { media } = body;

    if (isNaN(serviceId)) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      );
    }

    if (!media || !Array.isArray(media)) {
      return NextResponse.json(
        { error: 'Media array is required' },
        { status: 400 }
      );
    }

    // Check if service exists
    const service = await prisma.services.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Delete existing media for this service
    await prisma.service_media.deleteMany({
      where: { service_id: serviceId }
    });

    // Create new media records
    const mediaRecords = await Promise.all(
      media.map(async (mediaItem: any) => {
        return await prisma.service_media.create({
          data: {
            service_id: serviceId,
            media_type: mediaItem.type || 'image',
            media_url: mediaItem.url,
            alt_text: mediaItem.alt_text || null,
            title: mediaItem.title || null,
            sort_order: mediaItem.sort_order || 0,
            is_primary: mediaItem.is_primary || false,
            is_active: true
          }
        });
      })
    );

    return NextResponse.json({
      success: true,
      media: mediaRecords,
      message: 'Service media updated successfully'
    });

  } catch (error) {
    console.error('Error updating service media:', error);
    return NextResponse.json(
      { error: 'Failed to update service media' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete all media for a service
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = parseInt(params.id);

    if (isNaN(serviceId)) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      );
    }

    // Delete all media for this service
    await prisma.service_media.deleteMany({
      where: { service_id: serviceId }
    });

    return NextResponse.json({
      success: true,
      message: 'Service media deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting service media:', error);
    return NextResponse.json(
      { error: 'Failed to delete service media' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
