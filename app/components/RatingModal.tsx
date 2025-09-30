'use client';

import React, { useState } from 'react';
import { Star, X, MessageCircle, Send } from 'lucide-react';
import Image from 'next/image';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => Promise<void>;
  astrologer: {
    firstName: string;
    lastName: string;
    profileImage: string;
  };
  bookingId: number;
}

export default function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  astrologer,
  bookingId
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(rating, review.trim());
      // Reset form
      setRating(0);
      setReview('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit rating');
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setRating(0);
    setReview('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Rate Your Experience</h2>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Astrologer Info */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-indigo-500">
              <Image
                src={astrologer.profileImage || '/placeholder-user.jpg'}
                alt={`${astrologer.firstName} ${astrologer.lastName}`}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {astrologer.firstName} {astrologer.lastName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Consultation #{bookingId}
              </p>
            </div>
          </div>

          {/* Rating Stars */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              How would you rate this consultation?
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all duration-200 transform hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-transparent text-gray-300 dark:text-gray-600'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {rating === 5 && '⭐ Excellent!'}
                {rating === 4 && '😊 Great!'}
                {rating === 3 && '👍 Good'}
                {rating === 2 && '😐 Fair'}
                {rating === 1 && '😞 Poor'}
              </p>
            )}
          </div>

          {/* Review Text Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Share your experience (Optional)
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="What did you like about this consultation? How was your experience?"
                rows={4}
                maxLength={500}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {review.length}/500
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Rating
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
