import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('🚪 [LOGOUT API] Logging out astrologer');
    console.log('🚪 [LOGOUT API] Current cookies:', req.headers.cookie);
    
    // Clear the astrologer token cookie
    const clearCookie = 'astrologerToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict';
    console.log('🍪 [LOGOUT API] Clearing cookie:', clearCookie);
    
    res.setHeader('Set-Cookie', [clearCookie]);

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: unknown) {
    console.error('❌ [LOGOUT API] Logout error:', error);
    return res.status(500).json({ message: 'Logout failed' });
  }
}
