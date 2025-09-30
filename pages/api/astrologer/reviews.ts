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

    // Get query parameters for filtering and sorting
    const { rating, sortBy = 'newest' } = req.query;

    // Build where clause
    const whereClause: {
      astrologerId: number;
      rating?: number;
    } = {
      astrologerId: astrologerId
    };

    if (rating) {
      whereClause.rating = parseInt(rating as string);
    }

    // Build orderBy clause
    let orderBy: Record<string, string> = { createdAt: 'desc' };
    
    if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sortBy === 'highest') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'lowest') {
      orderBy = { rating: 'asc' };
    }

    // Get reviews for this astrologer
    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        booking: {
          select: {
            id: true,
            type: true,
            date: true,
            createdAt: true
          }
        }
      },
      orderBy: orderBy
    });

    // Calculate ratings statistics
    const ratingsCount = await prisma.review.groupBy({
      by: ['rating'],
      where: { astrologerId: astrologerId },
      _count: {
        rating: true
      }
    });

    // Format ratings data for frontend
    const ratingsBreakdown = [
      { stars: 5, count: 0 },
      { stars: 4, count: 0 },
      { stars: 3, count: 0 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 }
    ];

    ratingsCount.forEach((item) => {
      const index = ratingsBreakdown.findIndex(r => r.stars === item.rating);
      if (index !== -1) {
        ratingsBreakdown[index].count = item._count.rating;
      }
    });

    // Calculate average rating
    const totalRatings = ratingsBreakdown.reduce((sum, r) => sum + r.count, 0);
    const totalScore = ratingsBreakdown.reduce((sum, r) => sum + (r.stars * r.count), 0);
    const averageRating = totalRatings > 0 ? (totalScore / totalRatings).toFixed(1) : '0.0';

    // Format reviews for response
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      review: review.review,
      context: review.booking.type,
      date: review.createdAt,
      bookingId: review.bookingId,
      user: {
        id: review.users.id,
        name: review.users.name
      },
      bookingDate: review.booking.date
    }));

    return res.status(200).json({
      success: true,
      reviews: formattedReviews,
      statistics: {
        averageRating: parseFloat(averageRating),
        totalRatings: totalRatings,
        ratingsBreakdown: ratingsBreakdown
      },
      count: formattedReviews.length
    });

  } catch (error) {
    console.error('Error fetching astrologer reviews:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch reviews',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
}

