import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch a single service by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      );
    }

    const service = await prisma.services.findUnique({
      where: { id },
      include: {
        service_media: {
          where: {
            is_active: true
          },
          orderBy: {
            sort_order: 'asc'
          }
        }
      }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);

  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update a service
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const {
      title,
      description,
      price,
      duration,
      delivery_type,
      is_active,
      images = []
    } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!title || !description || !price) {
      return NextResponse.json(
        { error: 'Title, description, and price are required' },
        { status: 400 }
      );
    }

    // Update the service
    const updatedService = await prisma.services.update({
      where: { id },
      data: {
        title,
        description,
        price: parseFloat(price),
        duration: duration || null,
        delivery_type: delivery_type || null,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date()
      }
    });

    // Update media if images are provided
    if (images && images.length > 0) {
      try {
        const mediaData = {
          media: images.map((imageUrl: string, index: number) => ({
            type: 'image',
            url: imageUrl,
            alt_text: `${title} image ${index + 1}`,
            title: `${title} image ${index + 1}`,
            sort_order: index,
            is_primary: index === 0
          }))
        };

        const mediaResponse = await fetch(`${request.nextUrl.origin}/api/services/${id}/media`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mediaData)
        });

        if (mediaResponse.ok) {
          const mediaResult = await mediaResponse.json();
          console.log('Service media updated successfully:', mediaResult);
        } else {
          const errorResponse = await mediaResponse.json();
          console.error('Failed to update service media:', errorResponse);
        }
      } catch (mediaError) {
        console.error('Error updating service media:', mediaError);
        // Don't fail the service update if media update fails
      }
    }

    return NextResponse.json({
      success: true,
      service: updatedService,
      message: 'Service updated successfully'
    });

  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete a service
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      );
    }

    // Delete the service (related media will be deleted due to cascade)
    await prisma.services.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
