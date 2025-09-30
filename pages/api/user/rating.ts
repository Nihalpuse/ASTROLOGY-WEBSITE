import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Helper to get clientId from JWT or body/query
function getClientId(req: NextApiRequest): number | null {
  // First try to get from request body (for POST requests)
  if (req.body?.clientId) {
    const id = Number(req.body.clientId);
    if (!isNaN(id)) return id;
  }

  // Try to get from query params (for GET requests)
  if (req.query?.clientId) {
    const id = Number(req.query.clientId);
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
      // ignore error
    }
  }

  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bookingId, rating, review } = req.body;
    const clientId = getClientId(req);

    if (!clientId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID required' });
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify the booking belongs to this client
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
            lastName: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if a review already exists for this booking
    const existingReview = await prisma.review.findFirst({
      where: {
        bookingId: Number(bookingId),
        userId: clientId
      }
    });

    let reviewRecord;

    if (existingReview) {
      // Update existing review
      reviewRecord = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          review: review || null,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new review
      reviewRecord = await prisma.review.create({
        data: {
          bookingId: Number(bookingId),
          astrologerId: booking.astrologerId,
          userId: clientId,
          rating,
          review: review || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    // Calculate average rating for the astrologer
    const astrologerReviews = await prisma.review.findMany({
      where: { astrologerId: booking.astrologerId },
      select: { rating: true }
    });

    const averageRating = astrologerReviews.reduce((sum, r) => sum + r.rating, 0) / astrologerReviews.length;

    // Update astrologer's average rating
    await prisma.astrologer.update({
      where: { id: booking.astrologerId },
      data: { 
        rating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      review: reviewRecord,
      astrologerRating: averageRating
    });

  } catch (error) {
    console.error('Submit rating error:', error);
    return res.status(500).json({ 
      error: 'Failed to submit rating',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
