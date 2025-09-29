import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    let decoded: { id: number; role: string; email: string };
    
    try {
      decoded = jwt.verify(token, jwtSecret) as { id: number; role: string; email: string };
    } catch (jwtError) {
      // Try with jose for astrologer tokens
      try {
        const { jwtVerify } = await import('jose');
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, secret);
        decoded = {
          id: payload.id as number,
          role: payload.role as string,
          email: payload.email as string
        };
      } catch (joseError) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    if (decoded.role !== 'astrologer') {
      return res.status(403).json({ error: 'Access denied. Astrologer role required.' });
    }

    const astrologerId = decoded.id;

    // Get astrologer's active bookings with client information and last message
    const bookings = await prisma.booking.findMany({
      where: {
        astrologerId: astrologerId,
        isPaid: true,
        chatEnabled: true
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        chatmessage: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            id: true,
            message: true,
            createdAt: true,
            senderType: true
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format the response
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      client: {
        id: booking.users.id,
        name: booking.users.name,
        email: booking.users.email
      },
      clientId: booking.clientId,
      lastMessage: booking.chatmessage[0]?.message || 'No messages yet',
      timestamp: booking.chatmessage[0]?.createdAt || booking.updatedAt,
      isPaid: booking.isPaid,
      chatEnabled: booking.chatEnabled,
      videoEnabled: booking.videoEnabled,
      status: booking.sessionEnd ? 'ended' : 'active',
      payment: booking.payment[0] || null,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));

    return res.status(200).json({
      success: true,
      bookings: formattedBookings,
      count: formattedBookings.length
    });

  } catch (error) {
    console.error('Error fetching astrologer bookings:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch bookings',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
}
