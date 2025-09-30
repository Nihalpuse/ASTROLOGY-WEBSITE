'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Send, Phone, Video, MessageCircle, Clock, User } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import RealTimeChat from '../../components/RealTimeChat';
import VideoCall from '../../components/VideoCall';

interface Chat {
  id: number;
  client: string;
  clientId: number;
  bookingId: number;
  lastMessage: string;
  timestamp: string;
  isPaid: boolean;
  chatEnabled: boolean;
  videoEnabled: boolean;
  status: 'active' | 'ended' | 'pending';
}

interface Message {
  id: number;
  senderId: number;
  senderType: 'client' | 'astrologer';
  message: string;
  messageType: string;
  createdAt: string;
}

const ConsultationsPage = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{ id: number; client: { id: number; name: string } } | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [astrologer, setAstrologer] = useState<{ 
    id: number; 
    name: string; 
    email: string; 
    firstName?: string; 
    lastName?: string; 
    profileImage?: string; 
    pricePerChat?: number; 
  } | null>(null);
  const [astrologerId, setAstrologerId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAstrologerData();
    fetchBookings();
    initializeSocket();

    // Cleanup function to disconnect socket when component unmounts
    return () => {
      if (socket) {
        console.log('Cleaning up socket connection on unmount');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, []);

  const fetchAstrologerData = async () => {
    try {
      const token = localStorage.getItem('astrologerToken');
      if (!token) {
        console.error('Astrologer not authenticated');
        setError('Please log in as an astrologer');
        return;
      }

      console.log('Fetching astrologer data with token:', token.substring(0, 20) + '...');

      const response = await axios.get('/api/astrologer/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Astrologer profile response:', response.data);

      if (response.data.astrologer) {
        setAstrologer(response.data.astrologer);
        console.log('Astrologer data set:', response.data.astrologer);
      } else {
        console.error('No astrologer data in response');
        setError('Failed to fetch astrologer data');
      }
    } catch (error) {
      console.error('Failed to fetch astrologer data:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError(`Failed to fetch astrologer data: ${error.response?.data?.error || error.message}`);
        }
      } else {
        setError('Failed to fetch astrologer data');
      }
    }
  };

  const initializeSocket = async () => {
    try {
      // Get astrologer token from localStorage
      const astrologerToken = localStorage.getItem('astrologerToken');
      if (!astrologerToken) {
        console.error('Astrologer not authenticated');
        setError('Please log in as an astrologer');
        return;
      }

      // Disconnect existing socket if any
      if (socket) {
        console.log('Disconnecting existing socket');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }

      // Get astrologer data to get the ID
      const astrologerResponse = await axios.get('/api/astrologer/profile', {
        headers: { Authorization: `Bearer ${astrologerToken}` }
      });
      
      const astrologerData = astrologerResponse.data.astrologer;
      setAstrologerId(astrologerData.id);
      console.log('Astrologer data for socket:', astrologerData);

      // Connect to socket server
      const { io } = await import('socket.io-client');
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        auth: { 
          token: astrologerToken,
          userId: astrologerData.id,
          userRole: 'astrologer'
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000
      });

      socketInstance.on('connect', () => {
        console.log('Connected to chat server with socket ID:', socketInstance.id);
        setError(''); // Clear any previous errors
        setIsConnected(true);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        console.error('Socket error details:', {
          message: error.message,
          type: 'type' in error ? (error as { type: string }).type : 'unknown',
          description: 'description' in error ? (error as { description: string }).description : 'unknown'
        });
        setError(`Connection failed: ${error.message}`);
        setIsConnected(false);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Disconnected from chat server:', reason);
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          // Server disconnected us, try to reconnect
          setTimeout(() => {
            socketInstance.connect();
          }, 2000);
        }
      });

      socketInstance.on('error', (error) => {
        console.error('Socket error event:', error);
        setError(`Socket error: ${error.message || 'Unknown error'}`);
        setIsConnected(false);
      });

      socketInstance.on('new-message', (message) => {
        console.log('Received new message:', message);
        // Update chat list with new message
        setChats(prev => prev.map(chat => {
          if (chat.bookingId === message.bookingId) {
            return {
              ...chat,
              lastMessage: message.message,
              timestamp: message.createdAt
            };
          }
          return chat;
        }));
        
        // If this is a new booking that's not in our list, refresh the bookings
        const existingChat = chats.find(chat => chat.bookingId === message.bookingId);
        if (!existingChat) {
          console.log('New booking detected, refreshing bookings list');
          fetchBookings();
        }
      });

      socketInstance.on('session-ended', (data) => {
        console.log('Session ended in consultations page:', data);
        // Update the chat status to ended
        setChats(prev => prev.map(chat => {
          if (chat.bookingId === data.bookingId) {
            return {
              ...chat,
              status: 'ended'
            };
          }
          return chat;
        }));
        
        // Refresh bookings to get updated status
        fetchBookings();
      });

      socketInstance.on('joined-booking', (data) => {
        console.log('Successfully joined booking:', data);
      });

      socketInstance.on('session-ended', (data) => {
        console.log('Session ended:', data);
        setError('Session has ended');
      });

      setSocket(socketInstance);
    } catch (error) {
      console.error('Socket initialization error:', error);
      setError(`Failed to initialize socket: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsConnected(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      
      // Get astrologer token
      const token = localStorage.getItem('astrologerToken');
      if (!token) {
        console.error('Astrologer not authenticated');
        setError('Please log in as an astrologer');
        return;
      }

      console.log('Fetching bookings with token:', token.substring(0, 20) + '...');

      const response = await axios.get('/api/astrologer/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Bookings response:', response.data);
      
      if (response.data.success && response.data.bookings) {
        const chatData = response.data.bookings.map((booking: { 
          id: number; 
          client: { name: string }; 
          clientId: number; 
          lastMessage?: string; 
          timestamp: string; 
          isPaid: boolean; 
          chatEnabled: boolean; 
          videoEnabled: boolean; 
          status: string 
        }) => ({
          id: booking.id,
          client: booking.client.name,
          clientId: booking.clientId,
          bookingId: booking.id,
          lastMessage: booking.lastMessage || 'No messages yet',
          timestamp: booking.timestamp,
          isPaid: booking.isPaid,
          chatEnabled: booking.chatEnabled,
          videoEnabled: booking.videoEnabled,
          status: booking.status
        }));

        console.log('Processed chat data:', chatData);
        setChats(chatData);
      } else {
        console.log('No bookings found or invalid response');
        setChats([]);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (error.response?.status === 404) {
          // API endpoint not found, set empty chats
          console.log('Bookings API not found, setting empty chats');
          setChats([]);
        } else {
          setError(`Failed to fetch bookings: ${error.response?.data?.error || error.message}`);
        }
      } else {
        setError('Failed to fetch bookings');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = (chat: Chat) => {
    setSelectedBooking({
      id: chat.bookingId,
      client: {
        id: chat.clientId,
        name: chat.client
      }
    });
    setShowChat(true);
  };

  const handleStartVideoCall = (chat: Chat) => {
    setSelectedBooking({
      id: chat.bookingId,
      client: {
        id: chat.clientId,
        name: chat.client
      }
    });
    setShowVideoCall(true);
  };

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="text-lg font-medium text-slate-600">Loading consultations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Consultations Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your active consultations and chat with clients
          </p>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {isConnected ? 'Connected to Chat Server' : 'Disconnected'}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isConnected ? 'Ready to receive messages' : 'Unable to connect to chat server'}
                  </p>
                </div>
              </div>
              {!isConnected && (
                <button 
                  onClick={() => {
                    setError(null);
                    initializeSocket();
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Reconnect
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Connection Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                <button 
                  onClick={() => {
                    setError(null);
                    initializeSocket();
                  }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Consultations List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Active Consultations
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {chats.length} consultation{chats.length !== 1 ? 's' : ''} available
                </p>
              </div>
              
              <div className="p-4">
                {chats.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Active Consultations
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      When clients book consultations, they will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {chat.client}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                chat.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                chat.status === 'ended' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              )}>
                                {chat.status}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(chat.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                          {chat.lastMessage}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {chat.isPaid && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Paid
                              </span>
                            )}
                            {!chat.isPaid && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                Unpaid
                              </span>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            {chat.isPaid && chat.chatEnabled && (
                              <button
                                onClick={() => handleStartChat(chat)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-medium"
                              >
                                <MessageCircle className="w-3 h-3" />
                                Chat
                              </button>
                            )}
                            
                            {chat.isPaid && chat.videoEnabled && (
                              <button
                                onClick={() => handleStartVideoCall(chat)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                              >
                                <Video className="w-3 h-3" />
                                Video
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[600px] flex flex-col">
              {activeChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Chat with {activeChat.client}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Consultation ID: #{activeChat.bookingId}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          activeChat.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        )}>
                          {activeChat.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="text-center text-gray-500 py-12">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Start the Conversation</h3>
                      <p className="text-sm">Click the chat button to begin messaging with {activeChat.client}</p>
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        disabled
                      />
                      <button
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        disabled
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Select a Consultation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                      Choose a consultation from the list to start chatting with your client
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Chat Modal */}
      {showChat && selectedBooking && astrologer && (
        <RealTimeChat
          bookingId={selectedBooking.id}
          astrologer={{
            id: astrologer.id,
            firstName: astrologer.firstName || '',
            lastName: astrologer.lastName || '',
            profileImage: astrologer.profileImage || '/placeholder-user.jpg',
            pricePerChat: astrologer.pricePerChat || 0
          }}
          onClose={() => setShowChat(false)}
          onPaymentRequired={() => setShowChat(false)}
          onVideoCall={() => {
            setShowChat(false);
            setShowVideoCall(true);
          }}
        />
      )}

      {/* Video Call Modal */}
      {showVideoCall && selectedBooking && socket && astrologer && (
        <VideoCall
          bookingId={selectedBooking.id}
          astrologer={{
            id: astrologer.id,
            firstName: astrologer.firstName || '',
            lastName: astrologer.lastName || '',
            profileImage: astrologer.profileImage || '/placeholder-user.jpg'
          }}
          onClose={() => setShowVideoCall(false)}
          socket={socket}
        />
      )}
    </div>
  );
};

export default ConsultationsPage;
