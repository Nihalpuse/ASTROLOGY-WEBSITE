import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Helper to get clientId from JWT or body
function getClientId(req: NextApiRequest): number | null {
  // Try to get from request body
  if (req.body?.clientId) {
    const id = Number(req.body.clientId);
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

  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messageId, bookingId } = req.body;
    const clientId = getClientId(req);
    
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!messageId || !bookingId) {
      return res.status(400).json({ error: 'Message ID and booking ID required' });
    }

    // Verify the booking belongs to this client
    const booking = await prisma.booking.findFirst({
      where: {
        id: Number(bookingId),
        clientId: clientId,
        isPaid: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify the message belongs to this booking
    const message = await prisma.chatmessage.findFirst({
      where: {
        id: Number(messageId),
        bookingId: Number(bookingId)
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only allow marking astrologer messages as read
    if (message.senderType !== 'astrologer') {
      return res.status(400).json({ error: 'Can only mark astrologer messages as read' });
    }

    // Update message as read
    await prisma.chatmessage.update({
      where: { id: Number(messageId) },
      data: { isRead: true }
    });

    return res.status(200).json({ success: true, message: 'Message marked as read' });

  } catch (error) {
    console.error('Mark message read error:', error);
    return res.status(500).json({ error: 'Failed to mark message as read' });
  }
} 