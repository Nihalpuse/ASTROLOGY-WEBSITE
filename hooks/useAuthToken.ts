import { useEffect, useState } from "react";

export function useAuthToken(tokenKey = "astrologerToken") {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔑 [useAuthToken] Checking for token with key:', tokenKey);
    
    // Try to get the token immediately
    const t = localStorage.getItem(tokenKey);
    console.log('🔑 [useAuthToken] Token from localStorage:', t ? `EXISTS (${t.length} chars)` : 'NOT FOUND');
    
    if (t) {
      setToken(t);
      return;
    }
    // Listen for storage events (in case login happens in another tab)
    function handleStorage() {
      const t = localStorage.getItem(tokenKey);
      if (t) setToken(t);
    }
    window.addEventListener("storage", handleStorage);
    // Poll every 100ms until token is found
    let interval: NodeJS.Timeout | null = null;
    if (!t) {
      console.log('🔑 [useAuthToken] Starting polling for token...');
      interval = setInterval(() => {
        const t = localStorage.getItem(tokenKey);
        if (t) {
          console.log('🔑 [useAuthToken] Token found via polling:', `EXISTS (${t.length} chars)`);
          setToken(t);
          if (interval) clearInterval(interval);
        }
      }, 100);
    }
    return () => {
      window.removeEventListener("storage", handleStorage);
      if (interval) clearInterval(interval);
    };
  }, [tokenKey]);

  return token;
} 