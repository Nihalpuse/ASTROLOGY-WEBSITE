import { useState, useEffect } from 'react';
import { getCurrentUser, User } from '@/lib/auth-client';

interface UseCurrentUserReturn {
  user: User | null;
  userId: number | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
}

export function useCurrentUser(): UseCurrentUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const authResult = await getCurrentUser();
      setUser(authResult.user);
    } catch (error) {
      console.error('Error fetching current user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    userId: user?.id || null,
    isLoading,
    isAuthenticated: !!user?.id,
    refetch: fetchUser
  };
}
