import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Helper to get astrologerId from JWT or body/query
function getAstrologerId(req: NextApiRequest): number | null {
  // First try to get from request body (for POST requests)
  if (req.body?.astrologerId) {
    const id = Number(req.body.astrologerId);
    if (!isNaN(id)) return id;
  }

  // Try to get from query params (for GET requests)
  if (req.query?.astrologerId) {
    const id = Number(req.query.astrologerId);
    if (!isNaN(id)) return id;
  }

  // Try JWT token from Authorization header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      if (typeof payload === 'object' && payload !== null && 'id' in payload) {
        const id = (payload as { id: unknown }).id;
        if (typeof id === 'number') return id;
        if (typeof id === 'string' && !isNaN(Number(id))) return Number(id);
      }
    } catch {
      // ignore JWT error
    }
  }

  // Try to get from localStorage token (if passed in body)
  if (req.body?.token) {
    try {
      const payload = jwt.verify(req.body.token, process.env.JWT_SECRET || 'your-secret-key');
      if (typeof payload === 'object' && payload !== null && 'id' in payload) {
        const id = (payload as { id: unknown }).id;
        if (typeof id === 'number') return id;
        if (typeof id === 'string' && !isNaN(Number(id))) return Number(id);
      }
    } catch {
      // ignore JWT error
    }
  }

  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { bookingId, limit = '50', offset = '0' } = req.query;
      const astrologerId = getAstrologerId(req);
      
      if (!astrologerId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!bookingId) {
        return res.status(400).json({ error: 'Booking ID required' });
      }

      // Verify the booking belongs to this astrologer
      const booking = await prisma.booking.findFirst({
        where: {
          id: Number(bookingId),
          astrologerId: astrologerId,
          isPaid: true
        },
        include: {
          astrologer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          },
          users: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found or chat not enabled' });
      }

      // Get messages for this booking with pagination
      const messages = await prisma.chatmessage.findMany({
        where: { bookingId: Number(bookingId) },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
        include: {
          booking: {
            include: {
              users: { select: { id: true, name: true } },
              astrologer: { select: { id: true, firstName: true, lastName: true } }
            }
          }
        }
      });

      // Reverse to get chronological order
      const chronologicalMessages = messages.reverse();

      // Mark client messages as read
      const unreadClientMessages = chronologicalMessages.filter(
        (msg: { senderType: string; isRead: boolean }) => msg.senderType === 'client' && !msg.isRead
      );

      if (unreadClientMessages.length > 0) {
        await prisma.chatmessage.updateMany({
          where: {
            id: {
              in: unreadClientMessages.map((msg: { id: number }) => msg.id)
            }
          },
          data: { isRead: true }
        });

        // Update the messages in response
        chronologicalMessages.forEach((msg: { senderType: string; isRead: boolean }) => {
          if (msg.senderType === 'client') {
            msg.isRead = true;
          }
        });
      }

      return res.status(200).json({ 
        messages: chronologicalMessages,
        booking: {
          id: booking.id,
          isPaid: booking.isPaid,
          chatEnabled: booking.chatEnabled,
          videoEnabled: booking.videoEnabled,
          sessionStart: booking.sessionStart,
          sessionEnd: booking.sessionEnd,
          astrologer: booking.astrologer,
          client: booking.users
        }
      });

    } catch (error) {
      console.error('Get chat messages error:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { bookingId, message, messageType = 'text' } = req.body;
      const astrologerId = getAstrologerId(req);
      
      if (!astrologerId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!bookingId || !message) {
        return res.status(400).json({ error: 'Booking ID and message required' });
      }

      // Validate message length
      if (message.trim().length === 0) {
        return res.status(400).json({ error: 'Message cannot be empty' });
      }

      if (message.length > 1000) {
        return res.status(400).json({ error: 'Message too long (max 1000 characters)' });
      }

      // Verify the booking belongs to this astrologer and is paid
      const booking = await prisma.booking.findFirst({
        where: {
          id: Number(bookingId),
          astrologerId: astrologerId,
          isPaid: true,
          chatEnabled: true
        },
        include: {
          astrologer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          },
          users: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found or chat not enabled' });
      }

      // Check if session is still active (within 2 hours of booking time)
      const now = new Date();
      const bookingTime = new Date(booking.date);
      const timeDiff = Math.abs(now.getTime() - bookingTime.getTime());
      const maxTimeDiff = 2 * 60 * 60 * 1000; // 2 hours

      if (timeDiff > maxTimeDiff) {
        return res.status(400).json({ error: 'Chat session has expired' });
      }

      // Create new message
      const newMessage = await prisma.chatmessage.create({
        data: {
          bookingId: Number(bookingId),
          senderId: astrologerId,
          senderType: 'astrologer',
          message: message.trim(),
          messageType,
          isRead: false
        },
        include: {
          booking: {
            include: {
              users: { select: { id: true, name: true } },
              astrologer: { select: { id: true, firstName: true, lastName: true } }
            }
          }
        }
      });

      console.log(`Astrologer message created with ID: ${newMessage.id}, senderType: astrologer, senderId: ${astrologerId}`);

      return res.status(201).json({ 
        message: newMessage,
        booking: {
          id: booking.id,
          isPaid: booking.isPaid,
          chatEnabled: booking.chatEnabled,
          videoEnabled: booking.videoEnabled,
          astrologer: booking.astrologer,
          client: booking.users
        }
      });

    } catch (error) {
      console.error('Send chat message error:', error);
      return res.status(500).json({ error: 'Failed to send message' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 