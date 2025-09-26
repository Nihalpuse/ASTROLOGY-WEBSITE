import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

// Type for JWT payload
interface AstrologerJWTPayload {
  id: number;
  email: string;
  role: string;
  [key: string]: unknown;
}

// Auth helper (from profile.ts)
async function getAstrologerFromRequest(req: NextApiRequest): Promise<AstrologerJWTPayload | null> {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);
    if (
      typeof payload === 'object' &&
      payload !== null &&
      typeof payload.id === 'number' &&
      typeof payload.email === 'string' &&
      payload.role === 'astrologer'
    ) {
      return payload as AstrologerJWTPayload;
    }
    return null;
  } catch (err) {
    console.error('JWT verification error:', err);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getAstrologerFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const astrologerId = user.id;

  try {
    switch (req.method) {
      case 'GET': {
        // Get astrologer's online status
        const astrologer = await prisma.astrologer.findUnique({
          where: { id: astrologerId },
          select: {
            isOnline: true,
            lastOnlineAt: true,
            firstName: true,
            lastName: true,
            areasOfExpertise: true,
            pricePerChat: true,
          }
        });
        return res.status(200).json(astrologer);
      }
      case 'POST': {
        // Toggle online/offline status
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { isOnline } = body;
        
        if (typeof isOnline !== 'boolean') {
          return res.status(400).json({ error: 'isOnline must be a boolean' });
        }

        const updatedAstrologer = await prisma.astrologer.update({
          where: { id: astrologerId },
          data: {
            isOnline,
            lastOnlineAt: isOnline ? new Date() : undefined,
          },
          select: {
            isOnline: true,
            lastOnlineAt: true,
            firstName: true,
            lastName: true,
          }
        });
        
        return res.status(200).json(updatedAstrologer);
      }
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (e: unknown) {
    return res.status(500).json({ error: 'Internal server error', details: (e as Error).message });
  }
} 