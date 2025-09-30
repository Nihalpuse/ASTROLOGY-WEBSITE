'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Phone, Video, X, MessageCircle, RefreshCw, AlertCircle, Mic, MicOff, Camera, CameraOff } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { getCurrentUser, getAuthToken } from '@/lib/auth-client';
import ConfirmEndChatModal from './ConfirmEndChatModal';
import RatingModal from './RatingModal';

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

interface UserChatProps {
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
}

export default function UserChat({ 
  bookingId, 
  astrologer, 
  onClose, 
  onPaymentRequired
}: UserChatProps) {
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
  const [sendingMessages, setSendingMessages] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const [showConfirmEndModal, setShowConfirmEndModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  // Video call states
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<Array<{ message: string; timestamp: number }>>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 2000;
  const TYPING_TIMEOUT = 3000;

  console.log('UserChat mounted with bookingId:', bookingId);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Get user authentication data
  const getUserAuthData = useCallback(async () => {
    try {
      console.log('Getting user authentication data...');
      
      const authResult = await getCurrentUser();
      console.log('Auth result:', authResult);
      
      if (!authResult.user || !authResult.user.id) {
        console.log('No authenticated user found in auth result');
        throw new Error('No authenticated user found. Please log in and try again.');
      }

      const clientId = authResult.user.id;
      console.log('Found authenticated user with ID:', clientId);
      
      setCurrentUserId(clientId);

      const token = await getAuthToken();
      console.log('Token obtained:', token ? 'Yes' : 'No');
      
      if (!token) {
        throw new Error('Failed to get authentication token. Please log in again.');
      }

      console.log('Successfully obtained authentication token');
      return { clientId, token };
    } catch (error) {
      console.error('Failed to get user auth data:', error);
      throw error;
    }
  }, []);

  // Initialize socket connection
  const initializeSocket = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError('');

      const { clientId, token } = await getUserAuthData();

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      console.log('Initializing socket connection...');
        
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        auth: { 
          token,
          userId: clientId,
          userRole: 'client'
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
          
        if (bookingId) {
          console.log('Joining booking room:', bookingId);
          socketInstance.emit('join-booking', { bookingId });
        }

        if (messageQueueRef.current.length > 0) {
          console.log('Processing queued messages:', messageQueueRef.current.length);
          messageQueueRef.current.forEach(({ message, timestamp }) => {
            if (Date.now() - timestamp < 30000) {
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
        
        setMessages(prev => {
          const messageExists = prev.some(msg => msg.id === message.id);
          if (messageExists) {
            console.log('Message already exists, skipping duplicate:', message.id);
            return prev;
          }
        
          if (message.id > lastMessageId) {
            setLastMessageId(message.id);
          }
          
          const filteredPrev = prev.filter(msg => 
            !(msg.id < 0 && msg.message === message.message && msg.senderType === message.senderType)
          );
          
          return [...filteredPrev, message];
        });

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

      // Video call events
      socketInstance.on('video-call-request', (data) => {
        console.log('Received video call request:', data);
        if (data.type === 'video') {
          handleIncomingVideoCall();
        } else if (data.type === 'voice') {
          handleIncomingVoiceCall();
        }
      });

      socketInstance.on('video-call-accepted', (data) => {
        console.log('Video call accepted:', data);
        startVideoCall();
      });

      socketInstance.on('video-call-rejected', (data) => {
        console.log('Video call rejected:', data);
        setError('Video call was rejected by the astrologer');
      });

      socketInstance.on('video-call-ended', (data) => {
        console.log('Video call ended:', data);
        endVideoCall();
      });

      socketInstance.on('session-ended', (data) => {
        console.log('Session ended by:', data.endedBy);
        // Don't automatically close or show error - let the user close manually
        // The chat will just become read-only since chatEnabled will be false
      });

      socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
        if (error.message?.includes('not paid')) {
          onPaymentRequired();
        } else {
          setError(error.message || 'Connection error');
        }
      });

      socketInstance.on('message-error', (error) => {
        console.error('Message sending error:', error);
        setError('Failed to send message: ' + (error.message || 'Unknown error'));
        setMessages(prev => prev.filter(msg => msg.id >= 0));
      });

      socketRef.current = socketInstance;
      setSocket(socketInstance);

    } catch (error) {
      console.error('Socket initialization error:', error);
      setIsConnecting(false);
      setError(error instanceof Error ? error.message : 'Failed to connect to chat');
    }
  }, [bookingId, currentUserId, lastMessageId, onPaymentRequired, reconnectAttempts, getUserAuthData]);

  // Load booking data and messages
  const loadBookingData = useCallback(async () => {
    try {
      console.log('Loading booking data for bookingId:', bookingId);
      setIsLoading(true);
      setError('');
      
      const { clientId, token } = await getUserAuthData();
  
      if (!bookingId) return;
  
      const bookingResponse = await axios.get(`/api/user/booking?clientId=${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!bookingId) return;
      
      const bookingData = bookingResponse.data.bookings?.find((b: { id: number; isPaid: boolean; chatEnabled: boolean }) => b.id === bookingId);
      
      if (!bookingData) {
        throw new Error('Booking not found');
      }
  
      console.log('Booking data loaded:', bookingData);
  
      if (!bookingData.isPaid) {
        throw new Error('Payment required to start chat');
      }
  
      if (!bookingData.chatEnabled) {
        throw new Error('Chat is not enabled for this booking');
      }
  
      setBooking(bookingData);
  
      const messagesResponse = await axios.get(`/api/user/chat?bookingId=${bookingId}&clientId=${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (messagesResponse.data.messages && bookingId) {
        const loadedMessages = messagesResponse.data.messages;
        setMessages(loadedMessages);
        
        if (loadedMessages.length > 0) {
          const maxId = Math.max(...loadedMessages.map((m: Message) => m.id));
          setLastMessageId(maxId);
        }
      }
  
    } catch (error: unknown) {
      console.error('Failed to load booking data:', error);
      if (!bookingId) return;
      
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.error || axiosError.message || 'Failed to load booking data';
      setError(errorMessage);
      
      if (errorMessage.includes('Payment required')) {
        onPaymentRequired();
      }
    } finally {
      if (bookingId) {
        setIsLoading(false);
      }
    }
  }, [bookingId, getUserAuthData, onPaymentRequired]);

  // Enhanced WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10
  };

  // Video call functions with proper WebRTC signaling
  const startVideoCall = useCallback(async () => {
    try {
      console.log('Starting video call with WebRTC signaling...');
      
      // Request user media with fallback options
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (mediaError) {
        console.warn('Failed to get video+audio, trying audio only:', mediaError);
        stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      }
      
      setLocalStream(stream);
      setIsVideoCallActive(true);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Initialize WebRTC peer connection
      const peerConnection = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = peerConnection;
      
      console.log('Created peer connection for video call');
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
        console.log('Added track to peer connection:', track.kind);
      });
      
      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('Received remote stream in video call');
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          console.log('Sending ICE candidate from video call');
          socket.emit('ice-candidate', {
            bookingId,
            candidate: event.candidate
          });
        }
      };
      
      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Video call connection state:', peerConnection.connectionState);
        
        switch (peerConnection.connectionState) {
          case 'connected':
            console.log('Video call connected successfully');
            break;
          case 'disconnected':
            console.log('Video call disconnected');
            break;
          case 'failed':
            console.log('Video call failed');
            setError('Video call connection failed');
            break;
        }
      };
      
      // Socket event listeners for WebRTC signaling
      if (socket) {
        socket.on('video-offer', async (data: { offer: RTCSessionDescriptionInit }) => {
          try {
            console.log('Received video offer in chat component');
            
            if (peerConnection.signalingState !== 'stable') {
              console.log('Signaling state not stable, ignoring offer');
              return;
            }
            
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            socket.emit('video-answer', {
              bookingId,
              answer
            });
            console.log('Sent video answer from chat component');
          } catch (error) {
            console.error('Error handling video offer in chat:', error);
            setError('Failed to establish video call');
          }
        });

        socket.on('video-answer', async (data: { answer: RTCSessionDescriptionInit }) => {
          try {
            console.log('Received video answer in chat component');
            
            if (peerConnection.signalingState !== 'have-local-offer') {
              console.log('Signaling state not have-local-offer, ignoring answer');
              return;
            }
            
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
          } catch (error) {
            console.error('Error handling video answer in chat:', error);
            setError('Failed to establish video call');
          }
        });

        socket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit }) => {
          try {
            console.log('Received ICE candidate in chat component');
            
            if (peerConnection.remoteDescription) {
              await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
          } catch (error) {
            console.error('Error adding ICE candidate in chat:', error);
          }
        });
      }
      
      // Create and send offer after a short delay
      setTimeout(async () => {
        try {
          console.log('Creating video offer from chat component...');
          const offer = await peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          await peerConnection.setLocalDescription(offer);
          
          if (socket) {
            socket.emit('video-offer', {
              bookingId,
              offer
            });
            console.log('Sent video offer from chat component');
          }
        } catch (error) {
          console.error('Error creating offer in chat:', error);
          setError('Failed to start video call');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start video call:', error);
      setError('Failed to access camera/microphone. Please check permissions.');
    }
  }, [bookingId, socket, rtcConfig]);

  const endVideoCall = useCallback(() => {
    console.log('Ending video call and cleaning up WebRTC resources...');
    
    // Remove socket listeners for WebRTC
    if (socket) {
      socket.off('video-offer');
      socket.off('video-answer');
      socket.off('ice-candidate');
    }
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      setLocalStream(null);
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      console.log('Closed peer connection');
      peerConnectionRef.current = null;
    }
    
    // Reset states
    setIsVideoCallActive(false);
    setIsVoiceCallActive(false);
    setRemoteStream(null);
    setIsMuted(false);
    setIsVideoOff(false);
    
    console.log('Video call cleanup completed');
  }, [localStream, socket]);

  const handleIncomingVideoCall = useCallback(() => {
    // Handle incoming video call request
    console.log('Incoming video call');
  }, []);

  const handleIncomingVoiceCall = useCallback(() => {
    // Handle incoming voice call request
    console.log('Incoming voice call');
  }, []);

  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }, [localStream]);

  const requestVideoCall = useCallback(() => {
    if (!socket || !isConnected) {
      setError('Not connected to chat server');
      return;
    }
    
    socket.emit('video-call-request', {
      bookingId,
      type: 'video'
    });
  }, [socket, isConnected, bookingId]);

  const requestVoiceCall = useCallback(() => {
    if (!socket || !isConnected) {
      setError('Not connected to chat server');
      return;
    }
    
    socket.emit('video-call-request', {
      bookingId,
      type: 'voice'
    });
  }, [socket, isConnected, bookingId]);

  // Message functions
  const markMessageAsRead = useCallback(async (messageId: number) => {
    try {
      const { clientId, token } = await getUserAuthData();
      
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

  const handleTyping = useCallback((isTyping: boolean) => {
    if (!socket || !isConnected) return;

    if (isTyping) {
      socket.emit('typing-start', { bookingId });
    } else {
      socket.emit('typing-stop', { bookingId });
    }
  }, [socket, isConnected, bookingId]);

  const handleMessageChange = useCallback((value: string) => {
    setNewMessage(value);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    handleTyping(true);
    
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, TYPING_TIMEOUT);
  }, [handleTyping]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !socket || !isConnected || isSending) return;
  
    const messageToSend = newMessage.trim();
    const messageKey = `${messageToSend}-${Date.now()}`;
    const tempMessageId = -Date.now();
    
    setIsSending(true);
    setSendingMessages(prev => new Set(prev).add(messageKey));
    setNewMessage('');
    handleTyping(false);
  
    try {
      const tempMessage: Message = {
        id: tempMessageId,
        senderId: currentUserId!,
        senderType: 'client',
        message: messageToSend,
        messageType: 'text',
        createdAt: new Date().toISOString(),
        isRead: false
      };
  
      setMessages(prev => [...prev, tempMessage]);
  
      socket.emit('send-message', {
        bookingId,
        message: messageToSend,
        messageType: 'text'
      });
  
      console.log('Message sent via socket:', messageToSend);
  
    } catch (error) {
      console.error('Failed to send message:', error);
      
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      
      messageQueueRef.current.push({
        message: messageToSend,
        timestamp: Date.now()
      });
      
      setError('Failed to send message. Will retry when reconnected.');
    } finally {
      setTimeout(() => {
        setSendingMessages(prev => {
          const newSet = new Set(prev);
          newSet.delete(messageKey);
          return newSet;
        });
        
        setSendingMessages(currentSending => {
          if (currentSending.size <= 1) {
            setIsSending(false);
          }
          const newSet = new Set(currentSending);
          newSet.delete(messageKey);
          return newSet;
        });
      }, 1000);
    }
  }, [newMessage, socket, isConnected, bookingId, currentUserId, handleTyping, isSending]);
  
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleReconnect = useCallback(() => {
    setReconnectAttempts(0);
    setError('');
    initializeSocket();
  }, [initializeSocket]);

  // Handle end session confirmation
  const handleEndSession = useCallback(async () => {
    try {
      setShowConfirmEndModal(false);
      
      // Emit end session event to socket
      if (socket && isConnected) {
        socket.emit('end-session', { bookingId });
      }
      
      // Show rating modal
      setShowRatingModal(true);
    } catch (error) {
      console.error('Failed to end session:', error);
      setError('Failed to end session');
    }
  }, [socket, isConnected, bookingId]);

  // Handle rating submission
  const handleRatingSubmit = useCallback(async (rating: number, review: string) => {
    try {
      const { token } = await getUserAuthData();
      
      // Submit rating to API
      await axios.post('/api/user/rating', {
        bookingId,
        rating,
        review: review || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Rating submitted successfully');
      
      // Close rating modal and chat
      setShowRatingModal(false);
      
      // Wait a bit before closing to show success
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      throw new Error('Failed to submit rating. Please try again.');
    }
  }, [bookingId, getUserAuthData, onClose]);

  // Effects
  useEffect(() => {
    if (bookingId && bookingId > 0) {
      loadBookingData();
    } else {
      setError('Invalid booking ID');
      setIsLoading(false);
    }
  }, [bookingId, getUserAuthData, onPaymentRequired]);

  useEffect(() => {
    if (booking && currentUserId && !socket) {
      initializeSocket();
    }
  }, [booking, currentUserId, socket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endVideoCall();
      if (socket) {
        socket.disconnect();
      }
    };
  }, [endVideoCall, socket]);

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

  // Video call overlay
  if (isVideoCallActive) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="relative w-full h-full">
          {/* Remote video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Local video */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} text-white`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} text-white`}
            >
              {isVideoOff ? <CameraOff className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
            </button>
            
            <button
              onClick={endVideoCall}
              className="p-4 rounded-full bg-red-500 text-white"
            >
              <Phone className="w-6 h-6" />
            </button>
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
                onClick={requestVoiceCall}
                disabled={!booking?.videoEnabled || !isConnected}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={requestVideoCall}
                disabled={!booking?.videoEnabled || !isConnected}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowConfirmEndModal(true)}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                title="End Chat"
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
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => handleMessageChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? (isSending ? "Sending message..." : "Type your message...") : "Connecting..."}
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
          {!isConnected && (
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

        {/* Confirm End Chat Modal */}
        <ConfirmEndChatModal
          isOpen={showConfirmEndModal}
          onConfirm={handleEndSession}
          onCancel={() => setShowConfirmEndModal(false)}
          astrologerName={`${astrologer.firstName} ${astrologer.lastName}`}
        />

        {/* Rating Modal */}
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            onClose();
          }}
          onSubmit={handleRatingSubmit}
          astrologer={astrologer}
          bookingId={bookingId}
        />
      </div>
    </div>
  );
}
