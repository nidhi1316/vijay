import { useState, useCallback } from 'react';
import { User, LoginCredentials } from '../types/auth';
import authService from '../services/auth/AuthService';

export const useAuth = (initialUser?: User) => {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login({
        identifier: credentials.email || credentials.citizenId || '',
        password: credentials.password || '',
      });
      if (response.success && response.user) {
        setUser(response.user);
        setIsLoading(false);
        return response.user;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login error');
      setIsLoading(false);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    if (user?.token) {
      await authService.logout(user.token);
    }
    setUser(null);
  }, [user]);

  return {
    user,
    setUser,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
  };
};

export default useAuth;
