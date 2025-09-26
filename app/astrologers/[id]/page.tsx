"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  Shield,
  Award,
  Star,
  MessageCircle,
  Calendar,
  BookOpen,
  User,
  Phone,
  Video,
  Send,
  Clock,
  Heart,
  Globe
} from 'lucide-react';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { LANGUAGE_NAMES } from '../../contexts/LanguageContext';
import RealTimeChat from '../../components/RealTimeChat';
import UserChat from '../../components/UserChat';
import VideoCall from '../../components/VideoCall';
import PaymentModal from '../../components/PaymentModal';

// Add/strengthen types for all state and function parameters
interface Booking {
  id: number;
  date: string;
  time?: string;
  status: string;
  canRate?: boolean;
  rating?: number;
  client?: { name?: string; email?: string };
  isPaid?: boolean;
  chatEnabled?: boolean;
  videoEnabled?: boolean;
  [key: string]: unknown;
}
interface Slot {
  id: number;
  date: string;
  start: string;
  end: string;
  [key: string]: unknown;
}
interface User {
  id: number | string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

interface Astrologer {
  id: string | number;
  firstName: string;
  lastName: string;
  title: string;
  profileImage: string;
  verificationStatus: string;
  yearsOfExperience: number;
  rating: number;
  totalRatings: number;
  orders: number;
  price: number;
  pricePerChat: number;
  areasOfExpertise: string;
  availability: string;
  about: string;
  skills: string[];
  languages: string | string[];
  responseTime: string;
}

const initialMessages = [
  {
    id: 1,
    sender: 'astrologer',
    text: 'Namaste! Welcome to my consultation space. I\'m here to guide you through your spiritual journey. How can I help you today?',
    time: '10:30 AM',
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 2,
    sender: 'user',
    text: 'Hello! I wanted to ask about my career prospects for the coming year.',
    time: '10:32 AM',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2d4b32e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 3,
    sender: 'astrologer',
    text: 'I\'d be happy to help you with career guidance. Could you please share your birth details - date, time, and place of birth?',
    time: '10:33 AM',
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  }
];

const initialBookedSlots = [
  {
    id: 1,
    date: "Dec 15, 2024",
    time: "3:00 PM",
    status: "completed",
    canRate: true,
    rating: 0
  },
  {
    id: 2,
    date: "Dec 12, 2024",
    time: "11:00 AM",
    status: "completed",
    canRate: false,
    rating: 5
  },
  {
    id: 3,
    date: "Dec 20, 2024",
    time: "2:00 PM",
    status: "upcoming",
    canRate: false,
    rating: 0
  }
];

interface TabButtonProps {
  tab: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: (tab: string) => void;
}
const TabButton: React.FC<TabButtonProps> = ({ tab, icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={() => onClick(tab)}
    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all font-medium ${isActive
      ? 'bg-indigo-600 text-white shadow-md'
      : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
      }`}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default function AstrologerProfile() {
  // All hooks at the top
  const params = useParams<{ id: string }>();
  const astrologerIdParam = params?.id || '';
  const [activeTab, setActiveTab] = useState('chat');
  const [bookingStatus, setBookingStatus] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [astrologer, setAstrologer] = useState<Astrologer>({
    id: '1',
    firstName: 'Dr. Yogeshwara',
    lastName: 'Sharma',
    title: 'Vedic Astrologer & Spiritual Guide',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    verificationStatus: 'approved',
    yearsOfExperience: 15,
    rating: 4.8,
    totalRatings: 1250,
    orders: 2500,
    price: 25,
    pricePerChat: 25,
    areasOfExpertise: 'Career,Relationships,Health,Finance',
    availability: 'Online',
    about: 'With over 15 years of experience in Vedic astrology, I specialize in providing accurate predictions and spiritual guidance to help you navigate through life\'s challenges.',
    skills: ['Vedic Astrology', 'Numerology', 'Palmistry', 'Vastu Shastra'],
    languages: ['Hindi', 'English', 'Sanskrit'],
    responseTime: 'Within 2 hours'
  });
  const [astrologerLoading, setAstrologerLoading] = useState(true);
  const [astrologerError, setAstrologerError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<number | null>(null);

  // Payment success handler that gets the real booking ID
  const handlePaymentSuccess = (bookingData?: { booking?: { id: number } }) => {
    setShowPayment(false);
    
    // Use the real booking ID from payment response if available
    if (bookingData?.booking?.id) {
      setCurrentBookingId(bookingData.booking.id);
      setBookingStatus('Payment successful! You can now start chatting.');
      
      // Start chat immediately after payment
      setTimeout(() => {
        setShowChat(true);
      }, 1000);
    } else {
      // Fallback to temporary ID (shouldn't happen with proper payment flow)
      setCurrentBookingId(Date.now());
      setBookingStatus('Payment successful! You can now start chatting.');
      
      setTimeout(() => {
        setShowChat(true);
      }, 1000);
    }
  };

  // 4. Fetch user from localStorage or session using auth utility
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        setUserLoading(true);
        
        // Import the auth utility dynamically to avoid SSR issues
        const { getCurrentUser: getAuthUser } = await import('@/lib/auth-client');
        const authResult = await getAuthUser();
        
        if (authResult.user) {
          console.log('Found authenticated user:', authResult.user);
          setUser(authResult.user as User);
          
          // Store the JWT token for socket authentication if available
          if (authResult.token) {
            localStorage.setItem('token', authResult.token);
            console.log('Stored JWT token for authenticated user');
          }
        } else {
          console.log('No authenticated user found:', authResult.error);
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  // Simple effect to clear booking status after a delay
  useEffect(() => {
    if (bookingStatus) {
      const timeoutId = setTimeout(() => setBookingStatus(''), 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [bookingStatus]);

  // Initialize socket for video calls
  useEffect(() => {
    // Wait for user loading to complete before initializing socket
    if (userLoading) {
      return;
    }
  
    const initializeSocket = async () => {
      try {
        // Get user data and token
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!storedUser || !token) {
          console.log('No user or token found, skipping socket initialization');
          return;
        }
  
        let userData;
        try {
          userData = JSON.parse(storedUser);
        } catch {
          console.log('Failed to parse user data, skipping socket initialization');
          return;
        }
  
        if (!userData.id) {
          console.log('No user ID found, skipping socket initialization');
          return;
        }
  
        console.log('Initializing socket connection for user:', userData.id);
  
        // Disconnect existing socket if any
        if (socket) {
          console.log('Disconnecting existing socket');
          socket.disconnect();
          setSocket(null);
        }
  
        // Import socket.io-client dynamically
        const { io } = await import('socket.io-client');
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
          auth: { 
            token,
            userId: userData.id,
            userRole: 'client'
          },
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true, // Force a new connection
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
          reconnectionDelayMax: 10000
        });
  
        socketInstance.on('connect', () => {
          console.log('Connected to socket server with ID:', socketInstance.id);
          setSocket(socketInstance); // Set socket only after successful connection
          setBookingError(''); // Clear any previous errors
        });
  
        socketInstance.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setBookingError('Socket server not available. Please start the socket server with: npm run socket');
        });
  
        socketInstance.on('disconnect', (reason) => {
          console.log('Disconnected from socket server:', reason);
          setSocket(null);
          if (reason === 'io server disconnect') {
            // Server disconnected us, try to reconnect
            setTimeout(() => {
              socketInstance.connect();
            }, 2000);
          }
        });
  
        socketInstance.on('error', (error) => {
          console.error('Socket error:', error);
          setBookingError('Video service error. Please try again.');
        });
  
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        setBookingError('Failed to initialize video service. Please ensure the socket server is running.');
      }
    };
  
    initializeSocket();
  
    // Cleanup function
    return () => {
      if (socket) {
        console.log('Cleaning up socket connection');
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [userLoading, user?.id]);
  
  // 5. Fetch astrologer details
  useEffect(() => {
    if (!astrologerIdParam || !astrologerIdParam.trim()) return;
    setAstrologerLoading(true);
    setAstrologerError('');
    const controller = new AbortController();
    axios.get(`/api/user/astrologer/${astrologerIdParam}`, { signal: controller.signal })
      .then(res => {
        if (res.data?.astrologer) {
          setAstrologer(res.data.astrologer);
        } else {
          throw new Error('Invalid response format');
        }
      })
      .catch(error => {
        if (!axios.isCancel(error)) {
          setAstrologerError('Failed to load astrologer details');
          console.error('Astrologer fetch error:', error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setAstrologerLoading(false);
        }
      });
    return () => controller.abort();
  }, [astrologerIdParam]);

  // After fetching astrologer, normalize languages if needed
  useEffect(() => {
    if (astrologer && typeof astrologer.languages === 'string') {
      setAstrologer((prev: Astrologer) => ({
        ...prev,
        languages: astrologer.languages ? (astrologer.languages as string).split(',').map((l: string) => l.trim()) : [],
      }));
    }
  }, [astrologer?.languages]);

  // No complex logic needed - just simple tab switching

  // Simple cleanup for booking status

  // 2. Conditional rendering for loading/error
  const LoadingSpinner = ({ size = 'md', text = '' }: { size?: 'sm' | 'md' | 'lg'; text?: string }) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8'
    };
    return (
      <div className="flex items-center justify-center gap-2 py-4">
        <div className={`${sizeClasses[size]} border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}></div>
        {text && <span className="text-slate-600">{text}</span>}
      </div>
    );
  };

  if (userLoading || astrologerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="text-lg font-medium text-slate-600">
            {userLoading ? 'Loading user data...' : 'Loading astrologer details...'}
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if user is not authenticated
  if (!userLoading && !user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Please log in to view astrologer details</div>
          <button
            onClick={() => window.location.href = '/signin'}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (astrologerError || !astrologer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Failed to load astrologer details</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleStartChat = async () => {
    if (!user?.id) {
      setBookingError('Please log in to start chat');
      return;
    }

    // Create a new booking for immediate chat
    setCurrentBookingId(Date.now()); // Temporary ID
    setShowPayment(true);
  };

  const handleStartVideoCall = async () => {
    if (!user?.id) {
      setBookingError('Please log in to start video call');
      return;
    }

    // Create a new booking for immediate video call
    setCurrentBookingId(Date.now()); // Temporary ID
    setShowPayment(true);
  };

  // Create properly typed astrologer objects for components
  const chatAstrologer = {
    id: Number(astrologer.id),
    firstName: astrologer.firstName,
    lastName: astrologer.lastName,
    profileImage: astrologer.profileImage,
    pricePerChat: astrologer.pricePerChat
  };

  const videoAstrologer = {
    id: Number(astrologer.id),
    firstName: astrologer.firstName,
    lastName: astrologer.lastName,
    profileImage: astrologer.profileImage
  };

  // All complex booking logic removed - now just simple pay-to-chat

  // All complex logic removed - simple pay-to-chat flow

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-inter">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
          <div className="flex items-center gap-4 mb-4">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <h1 className="text-2xl font-bold text-slate-800">Astrologer Details</h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Info */}
            <div className="flex gap-4">
              <div className="relative">
                <Image
                  src={astrologer?.profileImage}
                  alt={`${astrologer?.firstName} ${astrologer?.lastName}`}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-amber-300"
                />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-slate-800">{`${astrologer?.firstName} ${astrologer?.lastName}`}</h2>
                  {astrologer?.verificationStatus === 'approved' && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-indigo-600 font-medium mb-2">{astrologer?.title}</p>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    {astrologer?.yearsOfExperience} years exp
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    {(() => {
                      if (Array.isArray(astrologer?.languages)) {
                        return astrologer.languages.map(code =>
                          LANGUAGE_NAMES[code.trim() as keyof typeof LANGUAGE_NAMES] || code.trim()
                        ).join(', ');
                      } else if (typeof astrologer?.languages === 'string') {
                        return astrologer.languages.split(',').map(code =>
                          LANGUAGE_NAMES[code.trim() as keyof typeof LANGUAGE_NAMES] || code.trim()
                        ).join(', ');
                      }
                      return '';
                    })()}
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Online Now</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 lg:ml-auto">
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-lg text-slate-800">4.5</span>
                </div>
                <p className="text-xs text-slate-500">{astrologer?.totalRatings} ratings</p>
              </div>
              {/* <div className="text-center">
                <div className="font-bold text-lg text-slate-800">{astrologer?.orders}</div>
                <p className="text-xs text-slate-500">consultations</p>
              </div> */}
              <div className="text-center">
                <div className="font-bold text-lg text-emerald-600">₹{astrologer?.pricePerChat}</div>
                <p className="text-xs text-slate-500">per chat</p>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="mt-4 flex flex-wrap gap-2">
            {astrologer?.areasOfExpertise?.split(',').map(specialty => (
              <span key={specialty} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200">
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-white rounded-xl shadow-sm border border-slate-200">
          <TabButton tab="chat" icon={MessageCircle} label="Chat" isActive={activeTab === 'chat'} onClick={setActiveTab} />
          <TabButton tab="booked" icon={BookOpen} label="My Sessions" isActive={activeTab === 'booked'} onClick={setActiveTab} />
          <TabButton tab="about" icon={User} label="About" isActive={activeTab === 'about'} onClick={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg min-h-96 border border-slate-200">
          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="h-96 flex flex-col">
              <div className="p-4 border-b bg-indigo-600 text-white rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <Image src={astrologer?.profileImage} alt={`${astrologer?.firstName} ${astrologer?.lastName}`} width={40} height={40} className="w-10 h-10 rounded-full" />
                  <div>
                    <h3 className="font-semibold">{`${astrologer?.firstName} ${astrologer?.lastName}`}</h3>
                    <p className="text-sm text-indigo-200">{astrologer?.availability}</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={handleStartChat}
                      className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                      title="Start Chat"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Video call button clicked in header');
                        handleStartVideoCall();
                      }}
                      className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                      title="Start Video Call"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Simple Status Indicator */}
                {user && (
                  <div className="mt-3 pt-3 border-t border-indigo-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-200">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm">Ready to chat - Pay to start</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-xs opacity-75">{socket?.connected ? 'Connected' : 'Disconnected'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Consultation</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Pay ₹{astrologer?.pricePerChat} to start an instant chat session with {astrologer?.firstName}. 
                    No booking required - start chatting immediately!
                  </p>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-amber-800 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold">Online Now</span>
                    </div>
                    <p className="text-sm text-amber-700">
                      {astrologer?.firstName} is currently online and ready to help you
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => {
                        // Create a new booking for immediate chat
                        setCurrentBookingId(Date.now()); // Temporary ID
                        setShowPayment(true);
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Pay & Start Chat - ₹{astrologer?.pricePerChat}
                    </button>
                    <button
                      onClick={() => {
                        // Create a new booking for video call
                        setCurrentBookingId(Date.now()); // Temporary ID
                        setShowPayment(true);
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      <Video className="w-5 h-5" />
                      Pay & Video Call - ₹{astrologer?.pricePerChat}
                    </button>
                  </div>

                  <div className="mt-6 text-sm text-gray-500">
                    <p>• Instant access after payment</p>
                    <p>• No booking required</p>
                    <p>• Secure payment processing</p>
                  </div>

                  {bookingError && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                      {bookingError}
                    </div>
                  )}
                  {bookingStatus && (
                    <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
                      {bookingStatus}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* My Sessions Tab */}
          {activeTab === 'booked' && (
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Chat History</h3>
              
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Chat History Yet</h4>
                <p className="text-gray-500 mb-6">Start a conversation with {astrologer?.firstName} to see your chat history here.</p>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Start Your First Chat
                </button>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-slate-800">About {astrologer?.firstName} {astrologer?.lastName}</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-slate-600 leading-relaxed">{astrologer?.about}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-slate-800">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {(astrologer?.areasOfExpertise ?? '').split(',').map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm border border-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-slate-800">Languages</h4>
                  <p className="text-slate-600">{
                    Array.isArray(astrologer?.languages)
                      ? astrologer.languages.map((code: string) => LANGUAGE_NAMES[code as keyof typeof LANGUAGE_NAMES] || code).join(', ')
                      : (astrologer?.languages || '').split(',').map((code: string) => LANGUAGE_NAMES[code as keyof typeof LANGUAGE_NAMES] || code).join(', ')
                  }</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-slate-800">Price Per Chat</h4>
                  <p className="text-slate-600">₹{astrologer?.pricePerChat ?? astrologer?.price} per chat</p>
                </div>
                {/* <div>
                  <h4 className="font-semibold mb-2 text-slate-800">Response Time</h4>
                  <p className="text-slate-600">{astrologer?.responseTime}</p>
                </div> */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                  <button className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors">
                    <Heart className="w-4 h-4" />
                    Add to Favorites
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                    <Shield className="w-4 h-4" />
                    Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Chat Modal */}
      {showChat && currentBookingId && (
        <UserChat
          bookingId={currentBookingId}
          astrologer={{
            id: Number(astrologer.id),
            firstName: astrologer.firstName,
            lastName: astrologer.lastName,
            profileImage: astrologer.profileImage,
            pricePerChat: astrologer.pricePerChat
          }}
          onClose={() => setShowChat(false)}
          onPaymentRequired={() => {
            setShowChat(false);
            setShowPayment(true);
          }}
        />
      )}

      {/* Video Call Modal */}
      {showVideoCall && socket && currentBookingId && (
  <div className="fixed inset-0 z-50">
    <VideoCall
      bookingId={currentBookingId}
      astrologer={{
        id: Number(astrologer.id),
        firstName: astrologer.firstName,
        lastName: astrologer.lastName,
        profileImage: astrologer.profileImage
      }}
      onClose={() => {
        console.log('Closing video call modal');
        setShowVideoCall(false);
      }}
      socket={socket}
    />
  </div>
)}

      {/* Debug info for video call */}
      {/* {console.log('Video call modal state:', {
        showVideoCall,
        hasSocket: !!socket,
        currentBookingId,
        astrologerId: astrologer?.id
      })} */}

      {/* Payment Modal */}
      {showPayment && currentBookingId && (
        <PaymentModal
          bookingId={currentBookingId}
          astrologer={{
            id: Number(astrologer.id),
            firstName: astrologer.firstName,
            lastName: astrologer.lastName,
            pricePerChat: astrologer.pricePerChat
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => {
            setShowPayment(false);
            setCurrentBookingId(null);
          }}
        />
      )}
    </div>
  );
}