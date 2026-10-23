import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem('campusevents_token');
    if (!token) {
      setAuthLoading(false);
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch {
      authService.logout();
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    setCurrentUser(res.user);
    return { success: true, user: res.user, token: res.token };
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    setCurrentUser(res.user);
    return { success: true, user: res.user, token: res.token };
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const updateProfile = async (data) => {
    const updated = await authService.updateProfile(data);
    setCurrentUser((prev) => ({ ...prev, ...updated }));
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authLoading,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'ADMIN',
        isOrganizer: currentUser?.role === 'ORGANIZER',
        isUser: currentUser?.role === 'USER',
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
