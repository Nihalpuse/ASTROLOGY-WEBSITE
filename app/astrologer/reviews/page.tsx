'use client';

import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { format } from 'date-fns';
import axios from 'axios';

interface Review {
  id: number;
  rating: number;
  review: string | null;
  context: string;
  date: string;
  bookingId: number;
  user: {
    id: number;
    name: string;
  };
  bookingDate: string;
}

interface RatingsBreakdown {
  stars: number;
  count: number;
}

interface ReviewsData {
  reviews: Review[];
  statistics: {
    averageRating: number;
    totalRatings: number;
    ratingsBreakdown: RatingsBreakdown[];
  };
}

const ReviewsPage = () => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  // UI shows capitalized labels; we map to API values when requesting
  const [sortOption, setSortOption] = useState('Newest');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<ReviewsData['statistics']>({
    averageRating: 0,
    totalRatings: 0,
    ratingsBreakdown: [
      { stars: 5, count: 0 },
      { stars: 4, count: 0 },
      { stars: 3, count: 0 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 }
    ]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [selectedRating, sortOption]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('astrologerToken');
      if (!token) {
        setError('Please log in as an astrologer');
        return;
      }

      const params = new URLSearchParams();
      if (selectedRating) {
        params.append('rating', selectedRating.toString());
      }
      // Map UI sort option to API sortBy param
      const sortMap: Record<string, string> = {
        'Newest': 'newest',
        'Oldest': 'oldest',
        'Highest Rated': 'highest',
        'Lowest Rated': 'lowest'
      };
      params.append('sortBy', sortMap[sortOption] || 'newest');

      const response = await axios.get(`/api/astrologer/reviews?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setReviews(response.data.reviews);
        setStatistics(response.data.statistics);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to fetch reviews');
      } else {
        setError('Failed to fetch reviews');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getSentiment = (rating: number): 'Positive' | 'Neutral' | 'Negative' => {
    if (rating >= 4) return 'Positive';
    if (rating === 3) return 'Neutral';
    return 'Negative';
  };

  const maxCount = Math.max(...statistics.ratingsBreakdown.map((r) => r.count), 1);
  const averageRating = statistics.averageRating.toFixed(1);
  const totalRatings = statistics.totalRatings;

  // Prepare reviews with sentiment and optional client-side filtering (API already filters by rating)
  const filteredReviews = reviews
    .filter((r) => (selectedRating ? r.rating === selectedRating : true))
    .map((r) => ({
      ...r,
      sentiment: getSentiment(r.rating) as 'Positive' | 'Neutral' | 'Negative'
    }));

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#FFF5E1] dark:bg-black p-8 rounded-xl shadow text-gray-900 dark:text-white">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="text-lg font-medium">Loading reviews...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FFF5E1] dark:bg-black p-8 rounded-xl shadow text-gray-900 dark:text-white">
      <div className="flex items-center gap-2 text-3xl font-bold mb-6">
        Ratings & Reviews
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}



      {/* Ratings Summary */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
        {/* Average Rating */}
        <div className="flex flex-col items-center md:items-start min-w-[120px]">
          <span className="text-5xl font-bold">{averageRating}</span>
          <div className="flex items-center my-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <FaStar
                key={i}
                className={`w-6 h-6 ${
                  i < Math.round(Number(averageRating))
                    ? 'text-amber-500 dark:text-purple-500'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {totalRatings.toLocaleString()} ratings
          </span>
        </div>

        {/* Ratings Breakdown Bars */}
        <div className="flex-1 flex flex-col gap-2 w-full max-w-md">
          {[5, 4, 3, 2, 1].map((star) => {
            const item = statistics.ratingsBreakdown.find((r) => r.stars === star);
            const percent = maxCount ? (item?.count || 0) / maxCount : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="w-4 text-sm">{star}</span>
                <div className="flex-1 h-3 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 dark:bg-purple-500 transition-all"
                    style={{ width: `${percent * 100}%` }}
                  />
                </div>
                <span className="w-6 text-xs text-gray-600 dark:text-gray-400 text-right">
                  {item?.count || 0}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap mb-10">
        <select
          className="bg-white dark:bg-[#1C1C1C] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg"
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option>Newest</option>
          <option>Oldest</option>
          <option>Highest Rated</option>
          <option>Lowest Rated</option>
        </select>
        <select
          className="bg-white dark:bg-[#1C1C1C] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg"
          onChange={(e) => setSelectedRating(Number(e.target.value) || null)}
        >
          <option value="">All Ratings</option>
          <option value="5">5★</option>
          <option value="4">4★</option>
          <option value="3">3★</option>
          <option value="2">2★</option>
          <option value="1">1★</option>
        </select>
      </div>

      {/* Reviews */}
      <div className="space-y-6">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white dark:bg-midnight-black border border-gray-300 dark:border-gray-700 p-6 rounded-xl"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: review.rating }, (_, i) => (
                    <FaStar key={i} className="w-4 h-4 text-amber-500 dark:text-purple-500" />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({review.rating}★)
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {format(new Date(review.date), 'dd MMM yyyy')}
              </span>
            </div>
            <p className="mb-2">{review.review}</p>
            <div className="flex gap-2 flex-wrap mb-3">
              <span className="bg-gray-200 dark:bg-[#333] text-xs text-gray-800 dark:text-white px-3 py-1 rounded-full">
                #{review.context}
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  review.sentiment === 'Positive'
                    ? 'bg-green-700 text-green-200'
                    : review.sentiment === 'Neutral'
                    ? 'bg-yellow-700 text-yellow-200'
                    : 'bg-red-700 text-red-200'
                }`}
              >
                {review.sentiment}
              </span>
            </div>

            <button className="mt-2 px-4 py-2 bg-amber-500 dark:bg-purple-500 text-white rounded-lg text-sm hover:brightness-110 transition">
              Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;
