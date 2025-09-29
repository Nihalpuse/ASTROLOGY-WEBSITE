import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const astrologerId = Number(req.query.id);
  if (req.method === 'GET') {
    try {
      const astrologer = await prisma.astrologer.findUnique({
        where: { id: astrologerId },
        select: {
          isOnline: true,
          lastOnlineAt: true,
          verificationStatus: true,
        }
      });
      
      if (!astrologer) {
        return res.status(404).json({ error: 'Astrologer not found' });
      }
      
      return res.status(200).json({ 
        isOnline: astrologer.isOnline,
        lastOnlineAt: astrologer.lastOnlineAt,
        isAvailable: astrologer.isOnline && ['verified', 'approved'].includes(astrologer.verificationStatus)
      });
    } catch {
      return res.status(500).json({ error: 'Failed to fetch availability' });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
} 