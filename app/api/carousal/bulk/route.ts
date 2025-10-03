import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';

// PUT - Bulk update image orders
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body; // Array of { id, sort_order }

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, error: 'Updates array is required' },
        { status: 400 }
      );
    }

    // Validate all updates have required fields
    for (const update of updates) {
      if (!update.id || update.sort_order === undefined) {
        return NextResponse.json(
          { success: false, error: 'Each update must have id and sort_order' },
          { status: 400 }
        );
      }
    }

    // Update all images in a transaction
    const result = await prisma.$transaction(
      updates.map(update =>
        prisma.carousel_images.update({
          where: { id: parseInt(update.id) },
          data: {
            sort_order: update.sort_order,
            updated_at: new Date()
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: `${result.length} images updated successfully`
    });

  } catch (error) {
    console.error('Error bulk updating carousel images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update image orders' },
      { status: 500 }
    );
  }
}

// POST - Clear all images from a section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectionName } = body;

    if (!sectionName) {
      return NextResponse.json(
        { success: false, error: 'Section name is required' },
        { status: 400 }
      );
    }

    // Find section
    const section = await prisma.carousel_sections.findUnique({
      where: { name: sectionName },
      include: {
        carousel_images: {
          where: { is_active: true }
        }
      }
    });

    if (!section) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    // Delete all images from the section (mark as inactive instead of hard delete)
    const result = await prisma.carousel_images.updateMany({
      where: { 
        section_id: section.id,
        is_active: true 
      },
      data: {
        is_active: false,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: { deletedCount: result.count },
      message: `Cleared ${result.count} images from ${sectionName} section`
    });

  } catch (error) {
    console.error('Error clearing section images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear section images' },
      { status: 500 }
    );
  }
}

// DELETE - Bulk delete multiple images
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageIds } = body; // Array of image IDs

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Image IDs array is required' },
        { status: 400 }
      );
    }

    // Find all images to be deleted
    const images = await prisma.carousel_images.findMany({
      where: { 
        id: { in: imageIds.map(id => parseInt(id)) }
      }
    });

    if (images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No images found' },
        { status: 404 }
      );
    }

    // Delete from database
    const result = await prisma.carousel_images.deleteMany({
      where: { 
        id: { in: imageIds.map(id => parseInt(id)) }
      }
    });

    return NextResponse.json({
      success: true,
      data: { deletedCount: result.count },
      message: `${result.count} images deleted successfully`
    });

  } catch (error) {
    console.error('Error bulk deleting carousel images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete images' },
      { status: 500 }
    );
  }
}
