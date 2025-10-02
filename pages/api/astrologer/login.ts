import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { comparePassword, signAstrologerJwt } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🚀 [LOGIN API] Login request received:', { method: req.method, email: req.body?.email });
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const astrologer = await prisma.astrologer.findUnique({ where: { email } });
    if (!astrologer) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isValid = await comparePassword(password, astrologer.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = await signAstrologerJwt({ id: astrologer.id, email: astrologer.email, role: 'astrologer' });
    
    console.log('🔑 [LOGIN API] Generated token for astrologer:', { id: astrologer.id, email: astrologer.email });
    console.log('🔑 [LOGIN API] Token length:', token.length);
    
    // Set the token in HTTP-only cookie for middleware compatibility
    const cookieValue = `astrologerToken=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Secure=${process.env.NODE_ENV === 'production'}`;
    console.log('🍪 [LOGIN API] Setting cookie:', cookieValue.substring(0, 50) + '...');
    
    // Set cookie with proper headers
    res.setHeader('Set-Cookie', cookieValue);
    console.log('🍪 [LOGIN API] Cookie header set:', res.getHeader('Set-Cookie'));
    
    return res.status(200).json({ token, astrologer: { id: astrologer.id, email: astrologer.email, firstName: astrologer.firstName } });
  } catch (error: unknown) {
    return res.status(500).json({ message: (error as Error).message || 'Login failed' });
  }
} 