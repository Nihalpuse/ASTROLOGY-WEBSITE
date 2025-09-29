import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // --- Helper to get clientId from JWT or body/query ---
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

  // --- Input validation helper ---
  function isValidBookingInput(
    astrologerId: string | number,
    clientId: number | null,
    date: string,
    type: unknown
  ): boolean {
    if (!astrologerId || clientId === null || !date || !type) return false;
    if (isNaN(Number(astrologerId)) || isNaN(Number(clientId))) return false;
    if (typeof type !== 'string') return false;
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return false;
    
    // Allow bookings for current time and future (remove past date restriction for testing)
    // if (d < new Date()) return false;
    
    return true;
  }

  // --- POST: Create a booking ---
  if (req.method === 'POST') {
    const { astrologerId, type } = req.body;
    const clientId = getClientId(req);
    
    if (!astrologerId || !clientId || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (isNaN(Number(astrologerId)) || isNaN(Number(clientId))) {
      return res.status(400).json({ error: 'Invalid astrologerId or clientId' });
    }
    
    try {
      // Check if astrologer is online and verified
      const astrologer = await prisma.astrologer.findUnique({
        where: { id: Number(astrologerId) },
        select: {
          isOnline: true,
          verificationStatus: true,
        }
      });
      
      if (!astrologer) {
        return res.status(404).json({ error: 'Astrologer not found' });
      }
      
      if (!astrologer.isOnline) {
        return res.status(409).json({ error: 'Astrologer is currently offline' });
      }
      
      if (astrologer.verificationStatus !== 'verified') {
        return res.status(409).json({ error: 'Astrologer is not verified' });
      }
      
      // Check if user already has an active booking with this astrologer
      const existingBooking = await prisma.booking.findFirst({
        where: {
          astrologerId: Number(astrologerId),
          clientId: Number(clientId),
          status: { in: ['upcoming', 'in_progress'] },
        },
      });
      
      if (existingBooking) {
        return res.status(409).json({ error: 'You already have an active booking with this astrologer' });
      }
      
      const booking = await prisma.booking.create({
        data: {
          astrologerId: Number(astrologerId),
          clientId: Number(clientId),
          date: new Date(), // Current time for immediate booking
          type,
          status: 'upcoming',
          updatedAt: new Date(),
        },
      });
      
      return res.status(201).json({ 
        success: true,
        booking 
      });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to create booking', details: e instanceof Error ? e.message : e });
    }
  }

  // --- GET: List all bookings for a client ---
  if (req.method === 'GET' && !req.query.availableSlots) {
    const clientId = getClientId(req);
    console.log('GET /api/user/booking - clientId:', clientId, 'type:', typeof clientId);
    
    if (clientId === null || isNaN(Number(clientId))) {
      console.log('GET /api/user/booking - invalid clientId');
      return res.status(400).json({ error: 'Missing or invalid clientId' });
    }
    
    try {
      console.log('GET /api/user/booking - querying database with clientId:', Number(clientId));
      const bookings = await prisma.booking.findMany({
        where: { clientId: Number(clientId) },
        orderBy: { date: 'desc' },
        include: { astrologer: true },
      });
      console.log('GET /api/user/booking - found bookings:', bookings.length);
      return res.status(200).json({ bookings });
    } catch (e) {
      console.error('GET /api/user/booking - database error:', e);
      return res.status(500).json({ error: 'Failed to fetch bookings', details: e instanceof Error ? e.message : e });
    }
  }

 // --- GET: Check astrologer availability (user-side, no auth) ---
if (req.method === 'GET' && req.query.availableSlots === '1') {
  const { astrologerId } = req.query;
  if (!astrologerId || isNaN(Number(astrologerId))) {
    return res.status(400).json({ error: 'Missing or invalid astrologerId' });
  }
  
  try {
    const astrologer = await prisma.astrologer.findUnique({
      where: { id: Number(astrologerId) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        isOnline: true,
        lastOnlineAt: true,
        areasOfExpertise: true,
        pricePerChat: true,
        verificationStatus: true,
      }
    });
    
    if (!astrologer) {
      return res.status(404).json({ error: 'Astrologer not found' });
    }
    
    return res.status(200).json({
      astrologer,
      isAvailable: astrologer.isOnline && astrologer.verificationStatus === 'verified'
    });
    
  } catch (e) {
    return res.status(500).json({ 
      error: 'Failed to check availability', 
      details: e instanceof Error ? e.message : e 
    });
  }
}

  // --- PATCH: Update a booking (rate or cancel) ---
  if (req.method === 'PATCH') {
    const { bookingId, action, rating } = req.body;
    if (!bookingId || !action) {
      return res.status(400).json({ error: 'Missing bookingId or action' });
    }
    try {
      const booking = await prisma.booking.findUnique({ where: { id: Number(bookingId) } });
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      if (action === 'cancel') {
        if (booking.status !== 'upcoming') {
          return res.status(400).json({ error: 'Only upcoming bookings can be cancelled' });
        }
        await prisma.booking.update({ where: { id: Number(bookingId) }, data: { status: 'cancelled' } });
        return res.status(200).json({ message: 'Booking cancelled' });
      }
      if (action === 'rate') {
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
          return res.status(400).json({ error: 'Invalid rating' });
        }
        if (booking.status !== 'completed') {
          return res.status(400).json({ error: 'Can only rate completed bookings' });
        }
        // await prisma.booking.update({ where: { id: Number(bookingId) }, data: { rating } });
        // Note: Rating field not implemented in schema yet
        return res.status(200).json({ message: 'Rating functionality not implemented yet' });
        return res.status(200).json({ message: 'Booking rated' });
      }
      return res.status(400).json({ error: 'Invalid action' });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to update booking', details: e instanceof Error ? e.message : e });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 
