"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import AstrologerSidebar from "@/components/astrologer/Sidebar";
// Removed useAuthToken import - letting middleware handle authentication

// Cache for verification status to avoid repeated API calls
let verificationCache: { status: string; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const AstrologerLayout = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [verificationState, setVerificationState] = useState<{
    isChecking: boolean;
    isVerified: boolean;
    hasCheckedOnce: boolean;
  }>({
    isChecking: false,
    isVerified: true,
    hasCheckedOnce: false,
  });

  const router = useRouter();
  const pathname = usePathname();
  // Removed token - letting middleware handle authentication

  // Memoize route checks to prevent recalculation
  const isAuthRoute = useMemo(() => {
    const authRoutes = [
      "/astrologer/auth",
      "/astrologer/register", 
      "/astrologer/reset-password",
      "/astrologer/forgot-password"
    ];
    
    const isAuth = authRoutes.some(route => pathname?.startsWith(route));
   
    return isAuth;
  }, [pathname]);

  const isProfilePage = useMemo(() => pathname === "/astrologer/profile", [pathname]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Simple verification check - no token needed since middleware handles auth
  const checkVerificationStatus = useCallback(async () => {
    // Check cache first
    if (verificationCache && 
        Date.now() - verificationCache.timestamp < CACHE_DURATION) {
      return verificationCache.status;
    }

    try {
    
      const response = await fetch("/api/astrologer/verification");
      
      
      
      if (!response.ok) {
        console.error('❌ [LAYOUT] Verification API failed:', response.status, response.statusText);
        throw new Error(`Verification check failed: ${response.status}`);
      }
      
      const data = await response.json();
            
      const status = data.verification?.status || 'unverified';
      
      // Update cache
      verificationCache = { status, timestamp: Date.now() };
      
      return status;
    } catch (error) {
      console.error('❌ [LAYOUT] Verification check error:', error);
      return 'unverified';
    }
  }, []);

  // Simple verification check - middleware handles authentication
  useEffect(() => {
    
    
    if (isAuthRoute) {
     
      return;
    }

    // If already checked, skip
    if (verificationState.hasCheckedOnce) {
     
      return;
    }

    const performVerificationCheck = async () => {
     
      
      setVerificationState(prev => ({ ...prev, isChecking: true }));

      try {
       
        const verificationStatus = await checkVerificationStatus();
        const isVerified = verificationStatus === "approved";
        
      
        
        setVerificationState({
          isChecking: false,
          isVerified,
          hasCheckedOnce: true,
        });

        // Only redirect if not verified and not on profile page
        if (!isVerified && !isProfilePage) {
                   router.push("/astrologer/profile");
        }
      } catch (error) {
        console.error('❌ [LAYOUT] Verification check failed:', error);
        setVerificationState({
          isChecking: false,
          isVerified: false,
          hasCheckedOnce: true,
        });
      }
    };

    performVerificationCheck();
  }, [isAuthRoute, isProfilePage, router, checkVerificationStatus, verificationState.hasCheckedOnce]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Simple logout - clear cache and redirect
  const handleLogout = useCallback(async () => {
      
    try {
      // Call logout API to clear server-side session
         await fetch('/api/astrologer/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies
      });
    
    } catch (error) {
      console.error('❌ [FRONTEND] Logout API error:', error);
      // Continue with logout even if API call fails
    }
    
    // Clear cache and reset verification state
    console.log('🚪 [FRONTEND] Clearing cache and resetting state');
    verificationCache = null;
    setVerificationState({
      isChecking: false,
      isVerified: false,
      hasCheckedOnce: false,
    });
    
    router.push("/astrologer/auth");
  }, [router]);

  // Map status to allowed values for AstrologerSidebar
  const sidebarStatus = verificationState.isVerified ? 'verified' : (isProfilePage ? 'pending' : undefined);

  // 🔁 If it's an auth-related page, skip layout
  if (isAuthRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  // Show loading spinner while checking verification
  if (verificationState.isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      {/* Sidebar - Only show if verified or on profile page */}
      {(verificationState.isVerified || isProfilePage) && <AstrologerSidebar approvalStatus={sidebarStatus} />}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-amber-new dark:bg-black border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
          <div className="text-lg font-semibold ml-10 md:ml-32 w-full text-center">
            Astrologer Dashboard
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full"
              title="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="text-gray-600 dark:text-gray-300" size={20} />
              ) : (
                <Moon className="text-gray-600" size={20} />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="md:pl-72 flex-1 overflow-y-auto bg-amber-50 dark:bg-midnight-black p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AstrologerLayout;
