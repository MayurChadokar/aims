import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { fetchUsers } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (grNumberOrIdentifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AUTH_STORAGE_KEY = 'aims_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved session on load
    const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (grNumberOrIdentifier: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const users = await fetchUsers();
      const input = grNumberOrIdentifier.trim().toLowerCase();

      // Find user matching gr_number, username, or email
      const matchedUser = users.find(
        (u) =>
          (u.gr_number && u.gr_number.toLowerCase() === input) ||
          u.username?.toLowerCase() === input ||
          u.email.toLowerCase() === input
      );

      if (!matchedUser) {
        toast.error('Invalid GR Number or Password');
        setIsLoading(false);
        return false;
      }

      if (matchedUser.is_disabled) {
        toast.error('Account disabled. Please contact Administrator.');
        setIsLoading(false);
        return false;
      }

      // Password validation
      if (password !== 'admin123' && password !== 'user123' && password.length < 6) {
        toast.error('Invalid Password');
        setIsLoading(false);
        return false;
      }

      setCurrentUser(matchedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matchedUser));
      toast.success(`Welcome back, ${matchedUser.name}!`);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Authentication failed');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser ? currentUser.role : null,
        isAuthenticated: !!currentUser,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
