"use client";

import React, { useState, useEffect } from 'react';

interface AstrologyPreloaderProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AstrologyPreloader({ 
  message = "Connecting to the cosmos...", 
  showProgress = false, 
  progress = 0,
  size = 'md' 
}: AstrologyPreloaderProps) {
  const [loadingText] = useState(message);
  const [dots, setDots] = useState('');

  // Animate loading text with dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: {
      logo: 'w-12 h-12',
      rings: ['w-20 h-20', 'w-24 h-24', 'w-28 h-28'],
      title: 'text-2xl',
      subtitle: 'text-sm',
      container: 'mb-4'
    },
    md: {
      logo: 'w-20 h-20',
      rings: ['w-32 h-32', 'w-40 h-40', 'w-48 h-48'],
      title: 'text-4xl md:text-5xl',
      subtitle: 'text-lg md:text-xl',
      container: 'mb-8'
    },
    lg: {
      logo: 'w-32 h-32',
      rings: ['w-48 h-48', 'w-56 h-56', 'w-64 h-64'],
      title: 'text-5xl md:text-6xl',
      subtitle: 'text-xl md:text-2xl',
      container: 'mb-12'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#FEFBF2' }}>
      {/* Cosmic Background Elements - only for large size */}
      {size === 'lg' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating cosmic orbs */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-amber-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-yellow-200/15 to-amber-200/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-purple-200/10 to-pink-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Twinkling stars */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-purple-300 rounded-full animate-ping" style={{ animationDelay: '2.5s' }}></div>
          <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-green-300 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
        </div>
      )}

      <div className="text-center relative z-10">
        {/* Main Logo Container */}
        <div className={currentSize.container}>
          <div className="relative">
            {/* Actual Logo */}
            <div className="relative z-20">
              <img
                src="https://res.cloudinary.com/dxwspucxw/image/upload/c_crop,w_330,h_330,ar_1:1/v1753773413/NG_logo_te1xtm.jpg"
                alt="Nakshatra Gyaan Logo"
                width={size === 'sm' ? 48 : size === 'md' ? 80 : 128}
                height={size === 'sm' ? 48 : size === 'md' ? 80 : 128}
                style={{ borderRadius: size === 'sm' ? '0.5rem' : size === 'md' ? '1rem' : '1.5rem', objectFit: 'cover', background: '#fff' }}
                className={`inline-block align-middle shadow-lg animate-pulse ${currentSize.logo}`}
              />
            </div>
            
            {/* Orbiting cosmic rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`${currentSize.rings[0]} border-2 border-amber-200/30 rounded-full animate-spin`}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`${currentSize.rings[1]} border border-purple-200/20 rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '8s' }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`${currentSize.rings[2]} border border-green-200/15 rounded-full animate-spin`} style={{ animationDuration: '12s' }}></div>
            </div>
          </div>
        </div>
        
        {/* Brand Text - only for medium and large sizes */}
        {(size === 'md' || size === 'lg') && (
          <div className={currentSize.container}>
            <h1 
              className={`${currentSize.title} font-extrabold mb-2 text-black`}
              style={{ 
                fontFamily: 'Playfair Display, serif',
                letterSpacing: '-0.01em'
              }}
            >
              Nakshatra Gyaan
            </h1>
            <p 
              className={`${currentSize.subtitle} mb-4 opacity-90`}
              style={{ 
                color: '#166534',
                fontFamily: 'Playfair Display, serif'
              }}
            >
              Your Spiritual Journey Begins Here
            </p>
          </div>
        )}
        
        {/* Loading Progress - only for large size */}
        {showProgress && size === 'lg' && (
          <div className="mb-6">
            <div className="w-64 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Cosmic Loading Dots */}
        <div className="flex justify-center space-x-3">
          <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
        </div>
        
        {/* Loading Text */}
        <p 
          className="mt-4 text-sm opacity-70"
          style={{ 
            color: '#166534',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {loadingText}{dots}
        </p>
      </div>
    </div>
  );
}
