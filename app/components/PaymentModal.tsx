'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import { getCurrentUser, getAuthToken, User } from '@/lib/auth-client';

interface PaymentModalProps {
  bookingId: number;
  astrologer: {
    id: number;
    firstName: string;
    lastName: string;
    pricePerChat: number;
  };
  onPaymentSuccess: (bookingData?: { booking?: { id: number } }) => void;
  onClose: () => void;
}

export default function PaymentModal({ 
  bookingId, 
  astrologer, 
  onPaymentSuccess, 
  onClose 
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // Check for invalid booking ID when modal opens
  useEffect(() => {
    if (!bookingId || bookingId === 0) {
      setError('Invalid booking ID. Please try booking again.');
    } else {
      setError('');
    }
  }, [bookingId]);

  // Get user authentication data using the auth utility
  useEffect(() => {
    const loadUser = async () => {
      try {
        setUserLoading(true);
        const authResult = await getCurrentUser();
        
        if (authResult.user) {
          setUser(authResult.user);
        } else {
          setUser(null);
          if (authResult.error) {
            console.error('Auth error:', authResult.error);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    };

    loadUser();
  }, []);

  const [paymentMethod, setPaymentMethod] = useState('mock');

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      // Validate booking ID
      if (!bookingId || bookingId === 0) {
        setError('Invalid booking ID. Please try booking again.');
        return;
      }

      // Check if user is authenticated
      if (!user || !user.id) {
        setError('User not authenticated. Please log in and try again.');
        return;
      }

      console.log('User data for payment:', user);
      
      const clientId = user.id;
      console.log('Extracted clientId:', clientId);

      // Get authentication token for API calls
      const token = await getAuthToken();
      if (!token) {
        setError('Unable to authenticate. Please log in again.');
        return;
      }

      const paymentData = {
        astrologerId: astrologer.id,
        amount: astrologer.pricePerChat,
        paymentMethod,
        clientId,
        type: 'chat'
      };

      console.log('Sending payment data:', paymentData);

      // Make API call with authorization header
      const response = await axios.post('/api/user/payment', paymentData, {
        headers: { Authorization: `Bearer ${token as string}` }
      });

      console.log('Payment response:', response.data);

      if (response.data.success) {
        onPaymentSuccess(response.data);
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Payment error details:', error);
      
      // Type guard for axios error
      const axiosError = error as { response?: { data?: { error?: string }; status?: number } };
      console.error('Payment error response:', axiosError.response?.data);
      
      if (axiosError.response?.status === 401) {
        setError('Authentication failed. Please log in again and try the payment.');
      } else if (axiosError.response?.status === 400) {
        setError(axiosError.response.data?.error || 'Invalid payment request.');
      } else {
        setError(axiosError.response?.data?.error || 'Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state while getting user data
  if (userLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <span>Loading payment...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user || !user.id) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">Please log in to complete payment</div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.location.href = '/signin'}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Go to Login
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="h-96 overflow-y-scroll bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-full">
              <CreditCard className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Complete Payment</h3>
              <p className="text-sm text-gray-500">Unlock chat and video call access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-green-900 mb-1">Authenticated User</h4>
            <p className="text-sm text-green-700">
              {user.name || user.email} (ID: {user.id})
            </p>
          </div>

          {/* Astrologer Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">
              Session with {astrologer.firstName} {astrologer.lastName}
            </h4>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Chat & Video Call Access</span>
              <span className="font-medium">₹{astrologer.pricePerChat}</span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700">Real-time chat messaging</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700">HD video calling</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700">Voice calling</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700">Secure end-to-end communication</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mock"
                  checked={paymentMethod === 'mock'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-indigo-600"
                />
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium">Mock Payment (Demo)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Secure Payment</h4>
                <p className="text-sm text-blue-700">
                  This is a demo payment. In production, this would integrate with secure payment gateways like Stripe or Razorpay.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between py-4 border-t">
            <span className="text-lg font-semibold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-indigo-600">₹{astrologer.pricePerChat}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing || !bookingId || bookingId === 0}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pay Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 