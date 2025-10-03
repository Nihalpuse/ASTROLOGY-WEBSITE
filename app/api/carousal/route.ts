import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import cloudinary, { uploadImage, deleteImage } from '@/lib/cloudinary';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// GET - Fetch all carousel sections with images
export async function GET() {
  try {
    const sections = await prisma.carousel_sections.findMany({
      where: { is_active: true },
      include: {
        carousel_images: {
          where: { is_active: true },
          orderBy: { sort_order: 'asc' }
        }
      },
      orderBy: { sort_order: 'asc' }
    });

    // Transform to match frontend format
    const carousals = sections.reduce((acc, section) => {
      acc[section.name] = section.carousel_images.map(img => img.image_url);
      return acc;
    }, {} as Record<string, string[]>);

    return NextResponse.json({ success: true, data: carousals });
  } catch (error) {
    console.error('Error fetching carousel:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch carousel data' },
      { status: 500 }
    );
  }
}

// POST - Upload image to specific section
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sectionName = formData.get('section') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const altText = formData.get('altText') as string || '';
    const title = formData.get('title') as string || '';

    if (!sectionName) {
      return NextResponse.json(
        { success: false, error: 'Section name is required' },
        { status: 400 }
      );
    }

    // Find or create section
    let section = await prisma.carousel_sections.findUnique({
      where: { name: sectionName }
    });

    if (!section) {
      // Create section if it doesn't exist
      section = await prisma.carousel_sections.create({
        data: {
          name: sectionName,
          title: sectionName.charAt(0).toUpperCase() + sectionName.slice(1),
          sort_order: 0
        }
      });
    }

    let uploadedUrl = '';
    let fileSize = null;
    let fileType = null;
    let isUploaded = false;

    if (file) {
      // Handle file upload
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create temporary file
      const tempPath = join(tmpdir(), `carousel_${Date.now()}_${file.name}`);
      await writeFile(tempPath, buffer);
      
      try {
        // Upload to Cloudinary
        uploadedUrl = await cloudinary.uploader.upload(tempPath, {
          folder: 'carousel-images',
          public_id: `carousel_${sectionName}_${Date.now()}`,
          resource_type: 'image',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        }).then(result => result.secure_url);

        fileSize = file.size;
        fileType = file.type;
        isUploaded = true;
      } finally {
        // Clean up temporary file
        await unlink(tempPath).catch(() => {});
      }
    } else if (imageUrl) {
      // Handle URL input
      uploadedUrl = imageUrl;
      isUploaded = false;
    } else {
      return NextResponse.json(
        { success: false, error: 'Either file or imageUrl is required' },
        { status: 400 }
      );
    }

    // Get next sort order
    const lastImage = await prisma.carousel_images.findFirst({
      where: { section_id: section.id },
      orderBy: { sort_order: 'desc' }
    });

    const nextSortOrder = lastImage ? lastImage.sort_order + 1 : 0;

    // Save to database
    const newImage = await prisma.carousel_images.create({
      data: {
        section_id: section.id,
        image_url: uploadedUrl,
        alt_text: altText,
        title: title,
        sort_order: nextSortOrder,
        is_uploaded: isUploaded,
        file_size: fileSize,
        file_type: fileType
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newImage.id,
        image_url: newImage.image_url,
        alt_text: newImage.alt_text,
        title: newImage.title,
        sort_order: newImage.sort_order,
        is_uploaded: newImage.is_uploaded
      }
    });

  } catch (error) {
    console.error('Error uploading carousel image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// DELETE - Delete specific image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('id');

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Find the image record
    const image = await prisma.carousel_images.findUnique({
      where: { id: parseInt(imageId) },
      include: { carousel_sections: true }
    });

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete from Cloudinary if it was uploaded
    if (image.is_uploaded && image.image_url) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = image.image_url.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        const folder = 'carousel-images';
        const fullPublicId = `${folder}/${publicId}`;
        
        await deleteImage(fullPublicId);
        console.log(`Deleted image from Cloudinary: ${fullPublicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete from database
    await prisma.carousel_images.delete({
      where: { id: parseInt(imageId) }
    });

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting carousel image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

// PUT - Update image order or details
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageId, sortOrder, altText, title, isActive } = body;

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: 'Image ID is required' },
        { status: 400 }
      );
    }

    const updateData: {
      sort_order?: number;
      alt_text?: string;
      title?: string;
      is_active?: boolean;
      updated_at: Date;
    } = {
      updated_at: new Date()
    };

    if (sortOrder !== undefined) updateData.sort_order = sortOrder;
    if (altText !== undefined) updateData.alt_text = altText;
    if (title !== undefined) updateData.title = title;
    if (isActive !== undefined) updateData.is_active = isActive;

    const updatedImage = await prisma.carousel_images.update({
      where: { id: parseInt(imageId) },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: updatedImage
    });

  } catch (error) {
    console.error('Error updating carousel image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update image' },
      { status: 500 }
    );
  }
}
