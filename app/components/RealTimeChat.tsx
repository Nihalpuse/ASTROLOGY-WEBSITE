'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Phone, Video, X, MessageCircle, RefreshCw, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { getCurrentUser, getAuthToken } from '@/lib/auth-client';
import SessionEndedModal from './SessionEndedModal';

interface Message {
  id: number;
  senderId: number;
  senderType: 'client' | 'astrologer';
  message: string;
  messageType: string;
  createdAt: string;
  isRead?: boolean;
}

interface Booking {
  id: number;
  isPaid: boolean;
  chatEnabled: boolean;
  videoEnabled: boolean;
  sessionStart: string | null;
  sessionEnd: string | null;
  astrologer: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage: string;
    pricePerChat: number;
  };
}

interface RealTimeChatProps {
  bookingId: number;
  astrologer: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage: string;
    pricePerChat: number;
  };
  onClose: () => void;
  onPaymentRequired: () => void;
  onVideoCall?: () => void;
}

export default function RealTimeChat({ 
  bookingId, 
  astrologer, 
  onClose, 
  onPaymentRequired,
  onVideoCall 
}: RealTimeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastMessageId, setLastMessageId] = useState<number>(0);
  const [sendingMessages, setSendingMessages] = useState<Set<string>>(new Set()); // Track messages being sent
  const [isSending, setIsSending] = useState(false); // Global sending state
  const [showSessionEndedModal, setShowSessionEndedModal] = useState(false);
  const [sessionEndedBy, setSessionEndedBy] = useState<'user' | 'astrologer'>('user');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<Array<{ message: string; timestamp: number }>>([]);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 2000;
  const TYPING_TIMEOUT = 3000;

  console.log('RealTimeChat mounted with bookingId:', bookingId);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Get user authentication data using the auth utility
  const getUserAuthData = useCallback(async () => {
    try {
      console.log('Getting user authentication data...');
      
      // Check if this is an astrologer (they have astrologerToken in localStorage)
      const astrologerToken = localStorage.getItem('astrologerToken');
      if (astrologerToken) {
        console.log('Detected astrologer token, using astrologer authentication');
        
        // Get astrologer data
        const astrologerResponse = await axios.get('/api/astrologer/profile', {
          headers: { Authorization: `Bearer ${astrologerToken}` }
        });
        
        const astrologerData = astrologerResponse.data.astrologer;
        if (!astrologerData || !astrologerData.id) {
          throw new Error('Failed to get astrologer data');
        }
        
        console.log('Astrologer data:', astrologerData);
        setCurrentUserId(astrologerData.id);
        
        return { 
          clientId: astrologerData.id, 
          token: astrologerToken,
          isAstrologer: true
        };
      }
      
      // Use the auth utility to get current user (for clients)
      const authResult = await getCurrentUser();
      console.log('Auth result:', authResult);
      
      if (!authResult.user || !authResult.user.id) {
        console.log('No authenticated user found in auth result');
        throw new Error('No authenticated user found. Please log in and try again.');
      }

      const clientId = authResult.user.id;
      console.log('Found authenticated user with ID:', clientId);
      
      setCurrentUserId(clientId);

      // Get or create token using the auth utility
      const token = await getAuthToken();
      console.log('Token obtained:', token ? 'Yes' : 'No');
      
      if (!token) {
        throw new Error('Failed to get authentication token. Please log in again.');
      }

      console.log('Successfully obtained authentication token');
      return { clientId, token, isAstrologer: false };
    } catch (error) {
      console.error('Failed to get user auth data:', error);
      throw error;
    }
  }, []);

  // Initialize socket connection with reconnection logic
  const initializeSocket = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError('');

      const { clientId, token, isAstrologer } = await getUserAuthData();

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      console.log('Initializing socket connection...');
        
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
          auth: { 
            token,
          userId: clientId,
          userRole: isAstrologer ? 'astrologer' : 'client'
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: RECONNECT_DELAY,
        reconnectionDelayMax: 10000
        });

        socketInstance.on('connect', () => {
        console.log('Socket connected successfully');
          setIsConnected(true);
        setIsConnecting(false);
        setReconnectAttempts(0);
        setError('');
          
        // Join booking room
          if (bookingId) {
            console.log('Joining booking room:', bookingId);
            socketInstance.emit('join-booking', { bookingId });
          }

        // Process any queued messages
        if (messageQueueRef.current.length > 0) {
          console.log('Processing queued messages:', messageQueueRef.current.length);
          messageQueueRef.current.forEach(({ message, timestamp }) => {
            if (Date.now() - timestamp < 30000) { // Only send messages from last 30 seconds
              socketInstance.emit('send-message', {
                bookingId,
                message,
                messageType: 'text'
              });
            }
          });
          messageQueueRef.current = [];
        }
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
          setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server disconnected us, try to reconnect
          setTimeout(() => {
            socketInstance.connect();
          }, RECONNECT_DELAY);
        }
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnecting(false);
        setError('Connection failed. Retrying...');
        
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          setReconnectAttempts(prev => prev + 1);
          reconnectTimeoutRef.current = setTimeout(() => {
            initializeSocket();
          }, RECONNECT_DELAY * (reconnectAttempts + 1));
        } else {
          setError('Failed to connect after multiple attempts. Please refresh the page.');
          }
        });

        socketInstance.on('joined-booking', (data) => {
          console.log('Successfully joined booking:', data);
          setBooking(prev => prev ? { ...prev, ...data } : null);
        });

      socketInstance.on('new-message', (message: Message) => {
        console.log('Received new message:', message.id, message.senderType, message.message);
        
        // Check for duplicates
        setMessages(prev => {
          const messageExists = prev.some(msg => msg.id === message.id);
          if (messageExists) {
            console.log('Message already exists, skipping duplicate:', message.id);
            return prev;
          }
        
          // Update last message ID
          if (message.id > lastMessageId) {
            setLastMessageId(message.id);
          }
          
          // Remove any temporary messages with the same content
          const filteredPrev = prev.filter(msg => 
            !(msg.id < 0 && msg.message === message.message && msg.senderType === message.senderType)
          );
          
          return [...filteredPrev, message];
        });

        // Mark message as read if from astrologer
        if (message.senderType === 'astrologer' && currentUserId) {
          markMessageAsRead(message.id);
        }
      });

      socketInstance.on('typing-start', (data) => {
        if (data.userId !== currentUserId) {
          setTypingUsers(prev => new Set(prev).add(data.userId));
        }
      });

      socketInstance.on('typing-stop', (data) => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
        });

        socketInstance.on('video-call-request', (data) => {
          console.log('Received video call request:', data);
        if (onVideoCall) {
          onVideoCall();
        }
      });

      socketInstance.on('session-ended', (data) => {
        console.log('Session ended event received:', data);
        // Show modal that user has ended the chat
        setSessionEndedBy(data.endedBy === currentUserId ? 'astrologer' : 'user');
        setShowSessionEndedModal(true);
        
        // Update booking state to reflect session ended
        setBooking(prev => prev ? { ...prev, chatEnabled: false, sessionEnd: new Date().toISOString() } : null);
      });

      socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
        if (error.message?.includes('not paid')) {
          onPaymentRequired();
        } else {
          setError(error.message || 'Connection error');
        }
      });

      // Handle message sending errors
      socketInstance.on('message-error', (error) => {
        console.error('Message sending error:', error);
        setError('Failed to send message: ' + (error.message || 'Unknown error'));
        
        // Remove any temporary messages that failed to send
        setMessages(prev => prev.filter(msg => msg.id >= 0));
      });

      socketRef.current = socketInstance;
        setSocket(socketInstance);

      } catch (error) {
        console.error('Socket initialization error:', error);
      setIsConnecting(false);
      setError(error instanceof Error ? error.message : 'Failed to connect to chat');
    }
  }, [bookingId, currentUserId, lastMessageId, onPaymentRequired, onVideoCall, onClose, reconnectAttempts, getUserAuthData]);

  // Load booking data and messages
  const loadBookingData = useCallback(async () => {
    try {
      console.log('Loading booking data for bookingId:', bookingId);
      setIsLoading(true);
      setError('');
      
      const { clientId, token, isAstrologer } = await getUserAuthData();
  
      // Check if component is still mounted
      if (!bookingId) return;
  
      let bookingData;
      
      if (isAstrologer) {
        // Use astrologer API for astrologers - fetch specific booking by ID
        console.log('Using astrologer API to fetch booking data for bookingId:', bookingId);
        const bookingResponse = await axios.get(`/api/astrologer/bookings?bookingId=${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Since we're fetching a specific booking, it should be the first (and only) item
        bookingData = bookingResponse.data.bookings?.[0];
        
        // Transform the booking data to match the expected format
        if (bookingData) {
          // For astrologers viewing their own bookings, we need to get the astrologer info from the booking
          // But the booking.astrologer in this case is the astrologer's own data
          bookingData = {
            ...bookingData,
            astrologer: astrologer // Use the astrologer prop passed to this component
          };
        }
      } else {
        // Use client API for clients
        console.log('Using client API to fetch booking data');
        const bookingResponse = await axios.get(`/api/user/booking?clientId=${clientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        bookingData = bookingResponse.data.bookings?.find((b: { id: number; isPaid: boolean; chatEnabled: boolean }) => b.id === bookingId);
      }
      
      // Check again before state updates
      if (!bookingId) return;
      
      if (!bookingData) {
        throw new Error('Booking not found');
      }
  
      console.log('Booking data loaded:', bookingData);
  
      if (!bookingData.isPaid) {
        throw new Error('Payment required to start chat');
      }
  
      // Check if chat is currently enabled
      // Only throw error if chat was never enabled or if session has definitively ended
      if (!bookingData.chatEnabled) {
        // Check if session has ended
        if (bookingData.sessionEnd) {
          const sessionEndTime = new Date(bookingData.sessionEnd);
          const now = new Date();
          if (sessionEndTime <= now) {
            throw new Error('This chat session has ended');
          }
        } else {
          throw new Error('Chat is not enabled for this booking');
        }
      }
  
      setBooking(bookingData);
  
      // Load messages - use appropriate API based on user type
      const messagesEndpoint = isAstrologer 
        ? `/api/astrologer/chat?bookingId=${bookingId}`
        : `/api/user/chat?bookingId=${bookingId}&clientId=${clientId}`;
      
      const messagesResponse = await axios.get(messagesEndpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (messagesResponse.data.messages && bookingId) { // Check again
        const loadedMessages = messagesResponse.data.messages;
        setMessages(loadedMessages);
        
        if (loadedMessages.length > 0) {
          const maxId = Math.max(...loadedMessages.map((m: Message) => m.id));
          setLastMessageId(maxId);
        }
      }
  
    } catch (error: unknown) {
      console.error('Failed to load booking data:', error);
      if (!bookingId) return; // Don't update state if component unmounted
      
      // Type guard for axios error
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.error || axiosError.message || 'Failed to load booking data';
      setError(errorMessage);
      
      if (errorMessage.includes('Payment required')) {
        onPaymentRequired();
      }
    } finally {
      if (bookingId) { // Only update if still mounted
        setIsLoading(false);
      }
    }
  }, [bookingId, getUserAuthData, onPaymentRequired]);

  const debouncedReconnect = useCallback(
    debounce(() => {
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setReconnectAttempts(prev => prev + 1);
        initializeSocket();
      }
    }, 1000),
    [reconnectAttempts, initializeSocket]
  );
  
  function debounce(func: (...args: unknown[]) => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: unknown[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  useEffect(() => {
    if (bookingId && bookingId > 0) {
      loadBookingData();
    } else {
      setError('Invalid booking ID');
      setIsLoading(false);
    }
  }, [bookingId, getUserAuthData, onPaymentRequired]);

  useEffect(() => {
    // Initialize socket only after booking data is loaded and user is authenticated
    if (booking && currentUserId && !socket) {
      initializeSocket();
    }
  }, [booking, currentUserId, socket]);

  // Mark message as read
  const markMessageAsRead = useCallback(async (messageId: number) => {
    try {
      const { clientId, token, isAstrologer } = await getUserAuthData();
      
      if (isAstrologer) {
        // For astrologers, we might not need to mark messages as read, or use a different endpoint
        console.log('Astrologer marking message as read:', messageId);
        // TODO: Implement astrologer-specific message read marking if needed
        return;
      }
      
      // For clients, use the existing endpoint
      await axios.patch(`/api/user/chat/mark-read`, {
        messageId,
        clientId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  }, [getUserAuthData]);

  // Handle typing indicator
  const handleTyping = useCallback((isTyping: boolean) => {
    if (!socket || !isConnected) return;

    if (isTyping) {
      socket.emit('typing-start', { bookingId });
    } else {
      socket.emit('typing-stop', { bookingId });
    }
  }, [socket, isConnected, bookingId]);

  // Handle message input change
  const handleMessageChange = useCallback((value: string) => {
    setNewMessage(value);
    
    // Handle typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    handleTyping(true);
    
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, TYPING_TIMEOUT);
  }, [handleTyping]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !socket || !isConnected || isSending) return;
  
    const messageToSend = newMessage.trim();
    const messageKey = `${messageToSend}-${Date.now()}`;
    const tempMessageId = -Date.now();
    
    // Set global sending state
    setIsSending(true);
    
    // Add to sending messages set
    setSendingMessages(prev => new Set(prev).add(messageKey));
    
    // Clear input and typing
    setNewMessage('');
    handleTyping(false);
  
    try {
      // Get user auth data to determine if this is an astrologer
      const { isAstrologer } = await getUserAuthData();
      
      // Add temporary message for better UX
      const tempMessage: Message = {
        id: tempMessageId,
        senderId: currentUserId!,
        senderType: isAstrologer ? 'astrologer' : 'client',
        message: messageToSend,
        messageType: 'text',
        createdAt: new Date().toISOString(),
        isRead: false
      };
  
      setMessages(prev => [...prev, tempMessage]);
  
      // Send via socket
      socket.emit('send-message', {
        bookingId,
        message: messageToSend,
        messageType: 'text'
      });
  
      console.log('Message sent via socket:', messageToSend);
  
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      
      // Queue message for retry
      messageQueueRef.current.push({
        message: messageToSend,
        timestamp: Date.now()
      });
      
      setError('Failed to send message. Will retry when reconnected.');
    } finally {
      // Remove from sending messages set after a delay
      setTimeout(() => {
        setSendingMessages(prev => {
          const newSet = new Set(prev);
          newSet.delete(messageKey);
          return newSet;
        });
        
        // Clear global sending state - check current size, not old state
        setSendingMessages(currentSending => {
          if (currentSending.size <= 1) { // Will be 0 after this message is removed
            setIsSending(false);
          }
          const newSet = new Set(currentSending);
          newSet.delete(messageKey);
          return newSet;
        });
      }, 1000);
    }
  }, [newMessage, socket, isConnected, bookingId, currentUserId, handleTyping, isSending, getUserAuthData]);
  
  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Handle video call
  const handleVideoCall = useCallback(() => {
    if (!booking?.videoEnabled) {
      setError('Video calls not available for this session');
      return;
    }
    
    if (!socket || !isConnected) {
      setError('Not connected to chat server');
      return;
    }
    
    socket.emit('video-call-request', {
      bookingId,
      type: 'video'
    });
    
    if (onVideoCall) {
      onVideoCall();
    }
  }, [booking?.videoEnabled, socket, isConnected, bookingId, onVideoCall]);

  // Handle voice call
  const handleVoiceCall = useCallback(() => {
    if (!booking?.videoEnabled) {
      setError('Voice calls not available for this session');
      return;
    }
    
    if (!socket || !isConnected) {
      setError('Not connected to chat server');
      return;
    }
    
    socket.emit('video-call-request', {
      bookingId,
      type: 'voice'
    });
  }, [booking?.videoEnabled, socket, isConnected, bookingId]);

  // Manual reconnect
  const handleReconnect = useCallback(() => {
    setReconnectAttempts(0);
    setError('');
    initializeSocket();
  }, [initializeSocket]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <span>Loading chat...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !isConnecting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleReconnect}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            <button
              onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl h-[700px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Chat with {astrologer.firstName} {astrologer.lastName}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
                  <span className="text-sm text-indigo-100">
                    {isConnecting ? 'Connecting...' : isConnected ? 'Online' : 'Disconnected'}
                  </span>
                  <span className="text-xs text-indigo-200">
                    Consultation #{bookingId}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleVoiceCall}
                disabled={!booking?.videoEnabled || !isConnected}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={handleVideoCall}
                disabled={!booking?.videoEnabled || !isConnected}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Start the Conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Begin chatting with {astrologer.firstName} to get your consultation started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isClientMessage = message.senderType === 'client';
                const isAstrologerMessage = message.senderType === 'astrologer';
                const isTemporaryMessage = message.id < 0;
                const isCurrentUserMessage = message.senderId === currentUserId;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUserMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      isCurrentUserMessage
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                    } ${isTemporaryMessage ? 'opacity-70' : ''}`}>
                      <p className="text-sm leading-relaxed font-medium">
                        {message.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {isTemporaryMessage && ' • sending...'}
                        </span>
                        {isClientMessage && !isTemporaryMessage && (
                          <div className="flex items-center gap-1">
                            {message.isRead ? (
                              <div className="text-xs opacity-70">✓✓</div>
                            ) : (
                              <div className="text-xs opacity-70">✓</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing indicator */}
              {typingUsers.size > 0 && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-700 rounded-2xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {astrologer.firstName} is typing...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Global sending indicator */}
              {isSending && (
                <div className="flex justify-end">
                  <div className="bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl px-4 py-3 border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                        Sending message...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6">
          {/* Session Ended Banner */}
          {booking && !booking.chatEnabled && (
            <div className="mb-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                  This chat session has ended. You can view messages but cannot send new ones.
                </p>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => handleMessageChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                !booking?.chatEnabled 
                  ? "Chat session has ended" 
                  : isConnected 
                    ? (isSending ? "Sending message..." : "Type your message...") 
                    : "Connecting..."
              }
              disabled={!isConnected || !booking?.chatEnabled || isSending}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed font-medium"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected || !booking?.chatEnabled || isSending}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[80px] font-semibold"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Connection status */}
          {!isConnected && booking?.chatEnabled && (
            <div className="mt-3 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Disconnected. Trying to reconnect...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Session Ended Modal */}
        <SessionEndedModal
          isOpen={showSessionEndedModal}
          onClose={() => {
            setShowSessionEndedModal(false);
            onClose();
          }}
          endedBy={sessionEndedBy}
          clientName={booking?.astrologer ? `${booking.astrologer.firstName} ${booking.astrologer.lastName}` : 'Client'}
        />
      </div>
    </div>
  );
} 