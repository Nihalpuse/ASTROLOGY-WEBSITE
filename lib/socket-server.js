// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createServer } = require('http');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Server } = require('socket.io');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jwt = require('jsonwebtoken');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// Add health check endpoint
httpServer.on('request', (req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      activeConnections: io.engine.clientsCount,
      uptime: process.uptime()
    }));
    return;
  }
  
  // Default response for other routes
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Store active sessions and rooms
const activeSessions = new Map();
const userSessions = new Map();
const bookingRooms = new Map();
const typingUsers = new Map(); // bookingId -> Set of typing user IDs

// Middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const providedUserId = socket.handshake.auth.userId;
    const userRole = socket.handshake.auth.userRole;
    
    console.log('Socket auth attempt - token received:', !!token);
    console.log('Socket auth attempt - provided userId:', providedUserId);
    console.log('Socket auth attempt - provided userRole:', userRole);
    
    if (!token) {
      console.log('Socket auth failed - no token provided');
      return next(new Error('Authentication required'));
    }

    // Ensure token is a string
    if (typeof token !== 'string') {
      console.error('JWT verification failed: jwt must be a string, received:', typeof token);
      return next(new Error('Invalid token format'));
    }

    let userId, role, email;

    // Try to decode the token first (for user tokens using jsonwebtoken)
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, jwtSecret);
      console.log('JWT token decoded successfully:', { id: decoded.id, role: decoded.role });
      
      userId = providedUserId || decoded.id;
      role = userRole || decoded.role || 'client';
      email = decoded.email;
    } catch (jwtError) {
      console.log('JWT verification failed, trying astrologer token with jose...');
      
      // If JWT fails, this might be an astrologer token using jose
      try {
        const { jwtVerify } = await import('jose');
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
        const { payload } = await jwtVerify(token, secret);
        
        console.log('Astrologer token decoded successfully:', payload);
        
        userId = providedUserId || payload.id;
        role = userRole || payload.role || 'astrologer';
        email = payload.email;
      } catch (joseError) {
        console.log('Both JWT and jose verification failed');
        
        // If both fail, but we have provided userId and userRole, use them
        if (providedUserId && userRole) {
          console.log('Using provided userId and userRole for astrologer');
          userId = providedUserId;
          role = userRole;
          email = null;
        } else {
          console.error('All token verification methods failed');
          return next(new Error('Invalid token - authentication failed'));
        }
      }
    }

    console.log('Socket auth success - final user info:', { userId, role, email });
    
    // Store user info in socket
    socket.userId = userId;
    socket.userRole = role;
    socket.userEmail = email;
    
    next();
  } catch (error) {
    console.error('Socket auth error:', error.message);
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId} (${socket.userRole}) with socket ID: ${socket.id}`);

  // Store the socket connection
  activeSessions.set(socket.id, {
    userId: socket.userId,
    userRole: socket.userRole,
    connectedAt: new Date(),
    socketId: socket.id
  });

  // Join booking room with enhanced validation
  socket.on('join-booking', async (data) => {
    try {
      const { bookingId } = data;
      console.log(`Socket ${socket.id} trying to join booking ${bookingId}`);
      
      if (!bookingId) {
        socket.emit('error', { message: 'Booking ID required' });
        return;
      }

      // Verify booking access
      const booking = await prisma.booking.findUnique({
        where: { id: parseInt(bookingId) },
        include: { 
          astrologer: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
          users: { select: { id: true, name: true, email: true } }
        }
      });

      if (!booking) {
        console.log(`Booking ${bookingId} not found`);
        socket.emit('error', { message: 'Booking not found' });
        return;
      }

      console.log('Booking data for socket:', {
        id: booking.id,
        date: booking.date,
        isPaid: booking.isPaid,
        clientId: booking.clientId,
        astrologerId: booking.astrologerId,
        chatEnabled: booking.chatEnabled,
        videoEnabled: booking.videoEnabled
      });

      // Check if user has access to this booking
      const socketUserId = Number(socket.userId);
      const hasAccess = (socket.userRole === 'client' && booking.clientId === socketUserId) ||
                       (socket.userRole === 'astrologer' && booking.astrologerId === socketUserId);
      
      console.log('Access check:', {
        socketRole: socket.userRole,
        socketUserId: socketUserId,
        bookingClientId: booking.clientId,
        bookingAstrologerId: booking.astrologerId,
        hasAccess: hasAccess
      });

      if (!hasAccess) {
        console.log(`Access denied for user ${socketUserId} to booking ${bookingId}`);
        socket.emit('error', { message: 'Access denied to this booking' });
        return;
      }

      // Check if booking is paid
      if (!booking.isPaid) {
        console.log(`Booking ${bookingId} not paid`);
        socket.emit('error', { message: 'Payment required to access this booking' });
        return;
      }

      // Check if session has been explicitly ended
      if (booking.sessionEnd) {
        const now = new Date();
        const sessionEndTime = new Date(booking.sessionEnd);
        if (sessionEndTime <= now) {
          console.log(`Booking ${bookingId} session has ended`);
          socket.emit('error', { message: 'This session has ended' });
          return;
        }
      }

      // Allow access as long as booking is paid and chat is enabled
      // Remove strict time window validation to allow flexible chat sessions

      // Join the booking room
      const roomName = `booking-${bookingId}`;
      socket.join(roomName);
      userSessions.set(socket.userId, bookingId);
      
      // Initialize room data if not exists
      if (!bookingRooms.has(bookingId)) {
        bookingRooms.set(bookingId, {
          participants: new Set(),
          messages: [],
          lastActivity: new Date()
        });
      }
      
      const roomData = bookingRooms.get(bookingId);
      roomData.participants.add(socket.userId);
      roomData.lastActivity = new Date();
      
      console.log(`Socket ${socket.id} joined room ${roomName}`);

      // Update session status only if not already started
      if (!booking.sessionStart) {
        await prisma.booking.update({
          where: { id: parseInt(bookingId) },
          data: {
            sessionStart: now,
            chatEnabled: true,
            videoEnabled: true
          }
        });
        console.log(`Updated booking ${bookingId} session start time`);
      }

      socket.emit('joined-booking', { 
        bookingId,
        chatEnabled: booking.chatEnabled || true,
        videoEnabled: booking.videoEnabled || true,
        astrologer: booking.astrologer,
        client: booking.users
      });

      console.log(`Emitted joined-booking event for booking ${bookingId}`);

      // Notify other participants
      socket.to(roomName).emit('user-joined', {
        userId: socket.userId,
        userRole: socket.userRole,
        userInfo: socket.userRole === 'astrologer' ? booking.astrologer : booking.users
      });

      console.log(`User ${socketUserId} successfully joined booking ${bookingId}`);

    } catch (error) {
      console.error('Join booking error:', error);
      socket.emit('error', { message: 'Failed to join booking: ' + error.message });
    }
  });

  // Handle chat messages with enhanced features
  socket.on('send-message', async (data) => {
    try {
      const { bookingId, message, messageType = 'text' } = data;
      
      if (!bookingId || !message) {
        socket.emit('message-error', { message: 'Booking ID and message required' });
        return;
      }
      
      console.log(`Received message from user ${socket.userId} in booking ${bookingId}:`, message.substring(0, 50) + '...');
      
      // Verify booking access
      const booking = await prisma.booking.findUnique({
        where: { id: parseInt(bookingId) },
        include: { astrologer: true, users: true }
      });

      if (!booking || !booking.chatEnabled) {
        socket.emit('message-error', { message: 'Chat not available for this booking' });
        return;
      }

      // Verify user has access to this booking
      const socketUserId = parseInt(socket.userId);
      const hasAccess = (socket.userRole === 'client' && booking.clientId === socketUserId) ||
                       (socket.userRole === 'astrologer' && booking.astrologerId === socketUserId);

      if (!hasAccess) {
        socket.emit('message-error', { message: 'Unauthorized access to this booking' });
        return;
      }

      // Determine sender type
      let senderType;
      if (socketUserId === booking.astrologerId) {
        senderType = 'astrologer';
      } else if (socketUserId === booking.clientId) {
        senderType = 'client';
      } else {
        socket.emit('message-error', { message: 'Unauthorized access' });
        return;
      }

      // Save message to database
      const chatMessage = await prisma.chatmessage.create({
        data: {
          bookingId: parseInt(bookingId),
          senderId: socketUserId,
          senderType: senderType,
          message: message.trim(),
          messageType,
          isRead: false
        }
      });

      console.log(`Saved message to database with ID: ${chatMessage.id}, senderType: ${senderType}`);

      // Create message object for broadcasting
      const messageObject = {
        id: chatMessage.id,
        senderId: socketUserId,
        senderType: senderType,
        message: message.trim(),
        messageType,
        createdAt: chatMessage.createdAt,
        isRead: false
      };

      // Broadcast message to all participants in the booking
      const roomName = `booking-${bookingId}`;
      io.to(roomName).emit('new-message', messageObject);

      // Update room activity
      if (bookingRooms.has(bookingId)) {
        const roomData = bookingRooms.get(bookingId);
        roomData.messages.push(messageObject);
        roomData.lastActivity = new Date();
      }

      console.log(`Broadcasted message to booking ${bookingId} room`);

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('message-error', { message: 'Failed to send message: ' + error.message });
    }
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    const { bookingId } = data;
    if (!bookingId) return;

    const roomName = `booking-${bookingId}`;
    
    if (!typingUsers.has(bookingId)) {
      typingUsers.set(bookingId, new Set());
    }
    
    typingUsers.get(bookingId).add(socket.userId);
    
    socket.to(roomName).emit('typing-start', {
      userId: socket.userId,
      userRole: socket.userRole
    });
  });

  socket.on('typing-stop', (data) => {
    const { bookingId } = data;
    if (!bookingId) return;

    const roomName = `booking-${bookingId}`;
    
    if (typingUsers.has(bookingId)) {
      typingUsers.get(bookingId).delete(socket.userId);
    }
    
    socket.to(roomName).emit('typing-stop', {
      userId: socket.userId,
      userRole: socket.userRole
    });
  });

  // Handle message read receipts
  socket.on('mark-message-read', async (data) => {
    try {
      const { messageId, bookingId } = data;
      
      if (!messageId || !bookingId) {
        socket.emit('error', { message: 'Message ID and booking ID required' });
        return;
      }

      // Verify user has access to this booking
      const booking = await prisma.booking.findUnique({
        where: { id: parseInt(bookingId) }
      });

      if (!booking) {
        socket.emit('error', { message: 'Booking not found' });
        return;
      }

      const socketUserId = parseInt(socket.userId);
      const hasAccess = (socket.userRole === 'client' && booking.clientId === socketUserId) ||
                       (socket.userRole === 'astrologer' && booking.astrologerId === socketUserId);

      if (!hasAccess) {
        socket.emit('error', { message: 'Unauthorized access' });
        return;
      }

      // Update message as read
      await prisma.chatmessage.update({
        where: { id: parseInt(messageId) },
        data: { isRead: true }
      });

      // Notify other participants
      const roomName = `booking-${bookingId}`;
      socket.to(roomName).emit('message-read', {
        messageId: parseInt(messageId),
        readBy: socket.userId
      });

    } catch (error) {
      console.error('Mark message read error:', error);
      socket.emit('error', { message: 'Failed to mark message as read' });
    }
  });

  // Handle video call requests with enhanced signaling
  socket.on('video-call-request', (data) => {
    const { bookingId, type } = data;
    console.log(`Video call request from user ${socket.userId} in booking ${bookingId}, type: ${type}`);
    
    const roomName = `booking-${bookingId}`;
    socket.to(roomName).emit('video-call-request', {
      fromUserId: socket.userId,
      fromUserRole: socket.userRole,
      type: type
    });
  });

  // Enhanced WebRTC signaling with validation
  socket.on('video-offer', (data) => {
    try {
      const { bookingId, offer } = data;
      console.log(`Video offer from user ${socket.userId} in booking ${bookingId}`);
      
      if (!bookingId || !offer) {
        console.error('Invalid video offer data:', data);
        return;
      }
      
      const roomName = `booking-${bookingId}`;
      socket.to(roomName).emit('video-offer', {
        offer,
        fromUserId: socket.userId
      });
      
      console.log(`Forwarded video offer to room ${roomName}`);
    } catch (error) {
      console.error('Error handling video offer:', error);
    }
  });

  socket.on('video-answer', (data) => {
    try {
      const { bookingId, answer } = data;
      console.log(`Video answer from user ${socket.userId} in booking ${bookingId}`);
      
      if (!bookingId || !answer) {
        console.error('Invalid video answer data:', data);
        return;
      }
      
      const roomName = `booking-${bookingId}`;
      socket.to(roomName).emit('video-answer', {
        answer,
        fromUserId: socket.userId
      });
      
      console.log(`Forwarded video answer to room ${roomName}`);
    } catch (error) {
      console.error('Error handling video answer:', error);
    }
  });

  socket.on('ice-candidate', (data) => {
    try {
      const { bookingId, candidate } = data;
      console.log(`ICE candidate from user ${socket.userId} in booking ${bookingId}`);
      
      if (!bookingId || !candidate) {
        console.error('Invalid ICE candidate data:', data);
        return;
      }
      
      const roomName = `booking-${bookingId}`;
      socket.to(roomName).emit('ice-candidate', {
        candidate,
        fromUserId: socket.userId
      });
      
      console.log(`Forwarded ICE candidate to room ${roomName}`);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  });

  // Handle session end
  socket.on('end-session', async (data) => {
    try {
      const { bookingId } = data;
      
      if (!bookingId) return;

      // Update booking session end time
      await prisma.booking.update({
        where: { id: parseInt(bookingId) },
        data: { 
          sessionEnd: new Date(),
          chatEnabled: false,
          videoEnabled: false
        }
      });

      // Notify all participants
      const roomName = `booking-${bookingId}`;
      io.to(roomName).emit('session-ended', {
        bookingId,
        endedBy: socket.userId
      });

      // Clean up room data
      bookingRooms.delete(bookingId);
      typingUsers.delete(bookingId);

    } catch (error) {
      console.error('End session error:', error);
    }
  });

  // Handle disconnection with cleanup
  socket.on('disconnect', async (reason) => {
    console.log(`User disconnected: ${socket.userId} with socket ID: ${socket.id}, reason: ${reason}`);
    
    // Clean up session
    activeSessions.delete(socket.id);
    
    const bookingId = userSessions.get(socket.userId);
    if (bookingId) {
      const roomName = `booking-${bookingId}`;
      
      // Notify other participants
      socket.to(roomName).emit('user-left', {
        userId: socket.userId,
        userRole: socket.userRole
      });
      
      // Clean up typing indicator
      if (typingUsers.has(bookingId)) {
        typingUsers.get(bookingId).delete(socket.userId);
      }
      
      // Clean up room data if no participants left
      if (bookingRooms.has(bookingId)) {
        const roomData = bookingRooms.get(bookingId);
        roomData.participants.delete(socket.userId);
        
        if (roomData.participants.size === 0) {
          bookingRooms.delete(bookingId);
          typingUsers.delete(bookingId);
        }
      }
      
      userSessions.delete(socket.userId);
    }
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

module.exports = { io, httpServer }; 