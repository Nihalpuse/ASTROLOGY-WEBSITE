import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Enhanced helper to get clientId from multiple sources
function getClientId(req: NextApiRequest): number | null {
  console.log('Payment API - Getting clientId from request:', {
    body: req.body,
    query: req.query,
    hasAuthHeader: !!req.headers['authorization']
  });

  // First try to get from request body (for POST requests)
  if (req.body?.clientId) {
    const id = Number(req.body.clientId);
    if (!isNaN(id)) {
      console.log('Payment API - Found clientId in body:', id);
      return id;
    }
  }

  // Try to get from query params (for GET requests)
  if (req.query?.clientId) {
    const id = Number(req.query.clientId);
    if (!isNaN(id)) {
      console.log('Payment API - Found clientId in query:', id);
      return id;
    }
  }

  // Try JWT token from Authorization header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      if (typeof payload === 'object' && payload !== null && 'id' in payload) {
        const id = (payload as { id: unknown }).id;
        if (typeof id === 'number') {
          console.log('Payment API - Found clientId in JWT token:', id);
          return id;
        }
        if (typeof id === 'string' && !isNaN(Number(id))) {
          const numId = Number(id);
          console.log('Payment API - Found clientId in JWT token (converted):', numId);
          return numId;
        }
      }
    } catch (jwtError) {
      console.log('Payment API - JWT verification failed:', jwtError);
    }
  }

  // Try to get from localStorage token (if passed in body)
  if (req.body?.token) {
    try {
      const payload = jwt.verify(req.body.token, process.env.JWT_SECRET || 'your-secret-key');
      if (typeof payload === 'object' && payload !== null && 'id' in payload) {
        const id = (payload as { id: unknown }).id;
        if (typeof id === 'number') {
          console.log('Payment API - Found clientId in body token:', id);
          return id;
        }
        if (typeof id === 'string' && !isNaN(Number(id))) {
          const numId = Number(id);
          console.log('Payment API - Found clientId in body token (converted):', numId);
          return numId;
        }
      }
    } catch (jwtError) {
      console.log('Payment API - Body token verification failed:', jwtError);
    }
  }

  console.log('Payment API - No clientId found in any source');
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { bookingId } = req.query;
      const clientId = getClientId(req);
      
      console.log('Payment API GET - clientId:', clientId, 'bookingId:', bookingId);
      
      if (!clientId) {
        return res.status(401).json({ error: 'Unauthorized - No valid client ID found' });
      }

      if (!bookingId) {
        return res.status(400).json({ error: 'Booking ID required' });
      }

      // Get booking details
      const booking = await prisma.booking.findFirst({
        where: {
          id: Number(bookingId),
          clientId: clientId
        },
        include: {
          astrologer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              pricePerChat: true
            }
          }
        }
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      return res.status(200).json({ 
        booking,
        astrologer: booking.astrologer
      });

    } catch (error) {
      console.error('Get payment info error:', error);
      return res.status(500).json({ error: 'Failed to get payment info' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { astrologerId, amount, paymentMethod, type = 'chat' } = req.body;
      const clientId = getClientId(req);
      
      console.log('Payment API POST - received:', { 
        astrologerId, 
        amount, 
        paymentMethod, 
        type,
        clientId,
        body: req.body 
      });
      
      if (!clientId) {
        console.log('Payment API POST - No clientId found, returning 401');
        return res.status(401).json({ 
          error: 'Unauthorized - Please ensure you are logged in and try again',
          details: 'No valid client ID found in request'
        });
      }

      if (!astrologerId || !amount) {
        return res.status(400).json({ error: 'Astrologer ID and amount required' });
      }

      // Verify astrologer exists and is online
      const astrologer = await prisma.astrologer.findUnique({
        where: { id: Number(astrologerId) },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          pricePerChat: true,
          isOnline: true,
          verificationStatus: true
        }
      });

      if (!astrologer) {
        return res.status(404).json({ error: 'Astrologer not found' });
      }

      if (!astrologer.isOnline) {
        return res.status(409).json({ error: 'Astrologer is currently offline' });
      }

      if (!['verified', 'approved'].includes(astrologer.verificationStatus)) {
        return res.status(409).json({ error: 'Astrologer is not verified' });
      }

      // Create booking first
      const booking = await prisma.booking.create({
        data: {
          astrologerId: Number(astrologerId),
          clientId: clientId,
          date: new Date(),
          type,
          status: 'upcoming',
          updatedAt: new Date()
        }
      });

      console.log('Payment API POST - Created booking:', booking);

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: parseFloat(amount),
          currency: 'INR',
          status: 'completed',
          paymentMethod: paymentMethod || 'mock',
          transactionId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          updatedAt: new Date()
        }
      });

      console.log('Payment API POST - Created payment:', payment);

      // Update booking to mark as paid and enable chat/video
      const updatedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          isPaid: true,
          paymentId: payment.id.toString(),
          chatEnabled: true,
          videoEnabled: true,
          sessionStart: new Date(),
          sessionEnd: null // Don't set session end until chat actually ends
        }
      });

      console.log('Payment API POST - Updated booking:', updatedBooking);

      return res.status(200).json({ 
        success: true,
        payment,
        booking: updatedBooking,
        astrologer,
        message: 'Payment processed successfully'
      });

    } catch (error) {
      console.error('Process payment error:', error);
      return res.status(500).json({ 
        error: 'Failed to process payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 