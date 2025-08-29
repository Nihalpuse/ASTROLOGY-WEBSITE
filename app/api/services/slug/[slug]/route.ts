import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const service = await prisma.services.findUnique({
      where: { 
        slug,
        is_active: true 
      },
      include: {
        service_media: {
          where: {
            is_active: true
          },
          orderBy: [
            { is_primary: 'desc' },
            { sort_order: 'asc' }
          ]
        }
      }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      service,
      success: true
    });
  } catch (error) {
    console.error('Error fetching service by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
