import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

// Helper to parse comma-separated fields into arrays
function parseCSV(str?: string | null): string[] {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

// Dummy rating/orders for now (replace with real logic if available)
function getAstrologerRating(astrologer: { rating?: number; id: number }): number {
  return astrologer.rating ?? 4.5 + (astrologer.id % 5) * 0.1;
}
function getAstrologerOrders(astrologer: { orders?: number; id: number }): number {
  return astrologer.orders ?? (astrologer.id * 1234) % 20000;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Filters and sorting from query
  const { skill, language, sortBy, search } = req.query;

  try {
    // Fetch only online astrologers
    const astrologers = await prisma.astrologer.findMany({
      where: {
        verificationStatus: { in: ['verified', 'approved'] },
        isOnline: true,
      },
    });

    // Map to public fields and parse skills/languages
    let result = astrologers.map(a => ({
      id: a.id,
      name: `${a.firstName} ${a.lastName}`.trim(),
      skills: parseCSV(a.areasOfExpertise),
      languages: parseCSV(a.languages),
      experience: a.yearsOfExperience ?? 0,
      price: a.pricePerChat ? Number(a.pricePerChat) : 0,
      rating: getAstrologerRating(a),
      orders: getAstrologerOrders(a),
      isNew: !a.yearsOfExperience || a.yearsOfExperience <= 3,
      img: a.profileImage || '/images/placeholder-user.jpg',
      isOnline: a.isOnline,
      lastOnlineAt: a.lastOnlineAt?.toISOString(),
    }));

    // Filtering
    if (skill && typeof skill === 'string') {
      result = result.filter(a => a.skills.includes(skill));
    }
    if (language && typeof language === 'string') {
      result = result.filter(a => a.languages.includes(language));
    }
    if (search && typeof search === 'string') {
      result = result.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
    }

    // Sorting
    switch (sortBy) {
      case 'exp_high':
        result.sort((a, b) => b.experience - a.experience);
        break;
      case 'exp_low':
        result.sort((a, b) => a.experience - b.experience);
        break;
      case 'orders_high':
        result.sort((a, b) => (b.orders || 0) - (a.orders || 0));
        break;
      case 'orders_low':
        result.sort((a, b) => (a.orders || 0) - (b.orders || 0));
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'rating_high':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => (b.orders || 0) - (a.orders || 0));
    }

    return res.status(200).json({ astrologers: result });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch astrologers', details: e instanceof Error ? e.message : e });
  }
} 