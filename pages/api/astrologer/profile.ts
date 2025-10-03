import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';
import multer from 'multer';
import { uploadAstrologerProfileImageBuffer } from '@/lib/cloudinary';

// Type for JWT payload
interface AstrologerJWTPayload {
  id: number;
  email: string;
  role: string;
  [key: string]: unknown;
}

// Astrologer authentication using Authorization header only
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

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer();

type MiddlewareFunction = (
  req: NextApiRequest & { file?: Express.Multer.File },
  res: NextApiResponse,
  callback: (result?: unknown) => void
) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fn(req as any, res as any, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Fetch astrologer basic details
    const user = await getAstrologerFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const astrologer = await prisma.astrologer.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          yearsOfExperience: true,
          areasOfExpertise: true,
          profileImage: true,
          about: true,
          pricePerChat: true,
          languages: true,
        },
      });
      if (!astrologer) return res.status(404).json({ error: 'Astrologer not found' });
      return res.status(200).json({ astrologer });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to fetch astrologer details', details: e });
    }
  }
  if (req.method === 'PUT') {
    // Update astrologer basic details, support multipart/form-data
    const user = await getAstrologerFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Handle file upload with multer
    await runMiddleware(req, res, upload.single('profileImage'));
    const file = (req as unknown as { file?: { buffer: Buffer; originalname: string } }).file;
    
    console.log('Profile update request - File received:', file ? { name: file.originalname, size: file.buffer.length } : 'No file');
    console.log('Profile update request - Body:', req.body);
    
    let body: Record<string, unknown> = req.body;
    // If body fields are sent as JSON string (from FormData), parse them
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error('Failed to parse body as JSON:', e);
        body = {};
      }
    }
    if (!body || typeof body !== 'object') {
      body = {};
    }
    
    // Extract form fields
    const { firstName, lastName, phone, yearsOfExperience, areasOfExpertise, avatar, about, pricePerChat, languages, profileImage } = body as Record<string, string | number | null>;
    
    let profileImageUrl: string | undefined;
    
    if (file && file.buffer) {
      try {
        console.log('Uploading profile image to Cloudinary...');
        // Upload the file to Cloudinary
        profileImageUrl = await uploadAstrologerProfileImageBuffer(file.buffer, user.email);
        console.log('Profile image uploaded successfully:', profileImageUrl);
      } catch (error) {
        console.error('Failed to upload profile image:', error);
        return res.status(500).json({ error: 'Failed to upload profile image', details: error });
      }
    } else if (avatar) {
      // Use avatar URL if provided
      profileImageUrl = avatar as string;
      console.log('Using avatar URL:', profileImageUrl);
    } else if (profileImage) {
      // Use existing profileImage if provided
      profileImageUrl = profileImage as string;
      console.log('Using existing profile image:', profileImageUrl);
    }
    // Normalize empty strings to null
    const norm = (v: string | number | null | undefined) => (v === undefined || v === null || v === '' ? null : v);
    // Only include fields in updateData if they are not undefined
    const updateData: Record<string, string | number | null> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (yearsOfExperience !== undefined && yearsOfExperience !== null && yearsOfExperience !== '') updateData.yearsOfExperience = Number(yearsOfExperience);
    if (areasOfExpertise !== undefined) updateData.areasOfExpertise = areasOfExpertise;
    if (profileImageUrl !== undefined && profileImageUrl !== '') updateData.profileImage = profileImageUrl;
    if (about !== undefined) updateData.about = about === '' ? null : about;
    if (pricePerChat !== undefined && pricePerChat !== null && pricePerChat !== '') updateData.pricePerChat = Number(pricePerChat);
    if (languages !== undefined) updateData.languages = languages === '' ? null : languages;
    
    try {
      const updated = await prisma.astrologer.update({
        where: { id: user.id },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          yearsOfExperience: true,
          areasOfExpertise: true,
          profileImage: true,
          about: true,
          pricePerChat: true,
          languages: true,
        },
      });
      return res.status(200).json({ astrologer: updated });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to update astrologer details', details: e });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
} 