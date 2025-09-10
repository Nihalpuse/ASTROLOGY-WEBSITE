import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { Prisma } from '@prisma/client';

// Admin authentication using JWT from cookies
async function getAdminFromRequest(req: NextApiRequest) {
  const token = req.cookies['adminToken'];
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== 'admin') return null;
    return payload;
  } catch {
    return null;
  }
}

const documentKeys = [
  'aadharCard',
  'panCard',
  'selfie',
  'workProof',
  'declarationForm',
  'addressProof',
];

const statusFields = {
  aadharCard: 'aadharStatus',
  panCard: 'panStatus',
  selfie: 'selfieStatus',
  workProof: 'workProofStatus',
  declarationForm: 'declarationStatus',
  addressProof: 'addressStatus',
};

const remarksFields = {
  aadharCard: 'aadharRemarks',
  panCard: 'panRemarks',
  selfie: 'selfieRemarks',
  workProof: 'workProofRemarks',
  declarationForm: 'declarationRemarks',
  addressProof: 'addressRemarks',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return res.status(401).json({ error: 'Unauthorized' });

  const email = req.method === 'GET' ? req.query.email as string : req.body.email;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // GET: Return all verification info
  if (req.method === 'GET') {
    try {
      const astrologer = await prisma.astrologer.findUnique({ where: { email } });
      if (!astrologer) return res.status(404).json({ error: 'Astrologer not found' });
      const verification = await prisma.astrologerverification.findUnique({
        where: { astrologerId: astrologer.id },
        include: {
          astrologer: true,
          astrologercertification: true,
          astrologereducation: true,
        },
      });
      if (!verification) return res.status(404).json({ error: 'Verification not found' });
      return res.status(200).json({ verification });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to fetch verification', details: e });
    }
  }

  // PATCH: Update status/remarks for document, education, or certification
  if (req.method === 'PATCH') {
    const { type, key, status, remarks } = req.body;
    if (!type || !status || (type !== 'profile' && !key)) {
      return res.status(400).json({ error: 'type, status, and (key if not profile) are required' });
    }
    try {
      const astrologer = await prisma.astrologer.findUnique({ where: { email } });
      if (!astrologer) return res.status(404).json({ error: 'Astrologer not found' });
      if (type === 'document') {
        if (!documentKeys.includes(key as string)) {
          return res.status(400).json({ error: 'Invalid document key' });
        }
        // Explicitly type key for TypeScript
        const docKey = key as keyof typeof statusFields;
        const updateData = {
          [statusFields[docKey]]: status,
          [remarksFields[docKey]]: remarks || null,
        };
        const updated = await prisma.astrologerverification.update({
          where: { astrologerId: astrologer.id },
          data: updateData,
        });
        return res.status(200).json({ success: true, updated });
      } else if (type === 'education') {
        // key is education id
        const updated = await prisma.astrologereducation.update({
          where: { id: Number(key) },
          data: {
            status,
            remarks: remarks || null,
          },
        });
        return res.status(200).json({ success: true, updated });
      } else if (type === 'certification') {
        // key is certification id
        const updated = await prisma.astrologercertification.update({
          where: { id: Number(key) },
          data: {
            status,
            remarks: remarks || null,
          },
        });
        return res.status(200).json({ success: true, updated });
      } else if (type === 'profile') {
        // Update overall astrologer verification status and admin remarks
        const updatedAstrologer = await prisma.astrologer.update({
          where: { email },
          data: { verificationStatus: status },
        });
        const updatedVerification = await prisma.astrologerverification.update({
          where: { astrologerId: astrologer.id },
          data: { status, adminRemarks: remarks || null },
        });
        return res.status(200).json({ success: true, updatedAstrologer, updatedVerification });
      } else {
        return res.status(400).json({ error: 'Invalid type' });
      }
    } catch (e) {
      return res.status(500).json({ error: 'Failed to update verification', details: e });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 