import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';

// GET - Get all carousel sections
export async function GET() {
  try {
    const sections = await prisma.carousel_sections.findMany({
      include: {
        carousel_images: {
          where: { is_active: true },
          orderBy: { sort_order: 'asc' }
        },
        _count: {
          select: { carousel_images: true }
        }
      },
      orderBy: { sort_order: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: sections
    });

  } catch (error) {
    console.error('Error fetching carousel sections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

// POST - Create new carousel section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, title, description, sortOrder } = body;

    if (!name || !title) {
      return NextResponse.json(
        { success: false, error: 'Name and title are required' },
        { status: 400 }
      );
    }

    // Check if section already exists
    const existingSection = await prisma.carousel_sections.findUnique({
      where: { name }
    });

    if (existingSection) {
      return NextResponse.json(
        { success: false, error: 'Section with this name already exists' },
        { status: 409 }
      );
    }

    const newSection = await prisma.carousel_sections.create({
      data: {
        name,
        title,
        description,
        sort_order: sortOrder || 0
      }
    });

    return NextResponse.json({
      success: true,
      data: newSection,
      message: 'Section created successfully'
    });

  } catch (error) {
    console.error('Error creating carousel section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create section' },
      { status: 500 }
    );
  }
}

// PUT - Update carousel section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, title, description, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Section ID is required' },
        { status: 400 }
      );
    }

    const updateData: {
      name?: string;
      title?: string;
      description?: string;
      sort_order?: number;
      is_active?: boolean;
      updated_at: Date;
    } = {
      updated_at: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (sortOrder !== undefined) updateData.sort_order = sortOrder;
    if (isActive !== undefined) updateData.is_active = isActive;

    const updatedSection = await prisma.carousel_sections.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: updatedSection,
      message: 'Section updated successfully'
    });

  } catch (error) {
    console.error('Error updating carousel section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

// DELETE - Delete carousel section
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('id');

    if (!sectionId) {
      return NextResponse.json(
        { success: false, error: 'Section ID is required' },
        { status: 400 }
      );
    }

    // Check if section has images
    const section = await prisma.carousel_sections.findUnique({
      where: { id: parseInt(sectionId) },
      include: {
        _count: {
          select: { carousel_images: true }
        }
      }
    });

    if (!section) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    if (section._count.carousel_images > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete section with images. Delete all images first.' },
        { status: 400 }
      );
    }

    const deletedSection = await prisma.carousel_sections.delete({
      where: { id: parseInt(sectionId) }
    });

    return NextResponse.json({
      success: true,
      data: deletedSection,
      message: 'Section deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting carousel section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}
