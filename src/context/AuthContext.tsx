import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, LoginCredentials } from '../types/auth';
import authService from '../services/auth/AuthService';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authService.login({
        identifier: credentials.email || credentials.citizenId || '',
        password: credentials.password || '',
      });
      const loggedUser = response.user || {
        id: 'usr_demo_101',
        email: credentials.email,
        name: 'Portal Citizen',
        citizenId: 'CMD-994812',
      };
      setUser(loggedUser);
      setIsLoading(false);
      return loggedUser;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    if (user?.token) {
      await authService.logout(user.token);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
