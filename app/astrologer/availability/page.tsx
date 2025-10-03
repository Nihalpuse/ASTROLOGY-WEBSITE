"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import React from "react";

interface AstrologerStatus {
  isOnline: boolean;
  lastOnlineAt: string | null;
  firstName: string;
  lastName: string;
  areasOfExpertise: string;
  pricePerChat: number | null;
}

type APIErrorResponse = { error?: string };

const AvailabilityPage = () => {
  const [status, setStatus] = useState<AstrologerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch status on mount
  React.useEffect(() => {
    const token = localStorage.getItem('astrologerToken');
    if (!token) return;
    setLoading(true);
    fetch('/api/astrologer/availability', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setStatus(data);
        }
      })
      .catch(() => setError('Failed to load status'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleStatus = async () => {
    if (!status) return;
    setError("");
    const token = localStorage.getItem('astrologerToken');
    if (!token) return setError('Not authenticated');
    
    setLoading(true);
    try {
      const res: Response = await fetch('/api/astrologer/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isOnline: !status.isOnline })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(data);
      } else {
        const errorData = data as APIErrorResponse;
        setError(errorData.error || 'Failed to update status');
      }
    } catch {
      setError('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full mx-auto bg-amber dark:bg-black p-5 sm:p-8 rounded-xl shadow"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h1 className="text-2xl font-bold mb-4">Online Status</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300">Toggle your online status to let clients know when you&apos;re available for consultations.</p>
      
      {error && <div className="text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">{error}</div>}
      {loading && <div className="text-gray-500 mb-4">Loading...</div>}
      
      {status && (
        <div className="space-y-6">
          {/* Status Card */}
          <motion.div
            className="bg-white dark:bg-midnight-black border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold mb-1">Current Status</h2>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${status.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className={`font-medium ${status.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                    {status.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleStatus}
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  status.isOnline 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {status.isOnline ? 'Go Offline' : 'Go Online'}
              </motion.button>
            </div>
            
            {status.lastOnlineAt && (
              <div className="text-sm text-gray-500">
                Last online: {new Date(status.lastOnlineAt).toLocaleString()}
              </div>
            )}
          </motion.div>

          {/* Profile Info */}
          <motion.div
            className="bg-white dark:bg-midnight-black border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
                <p className="text-gray-900 dark:text-white">{status.firstName} {status.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Areas of Expertise</label>
                <p className="text-gray-900 dark:text-white">{status.areasOfExpertise}</p>
              </div>
              {status.pricePerChat && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Price per Chat</label>
                  <p className="text-gray-900 dark:text-white">₹{status.pricePerChat}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default AvailabilityPage;
