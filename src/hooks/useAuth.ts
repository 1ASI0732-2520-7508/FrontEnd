import { useState, useEffect } from 'react';
import { User, LoginCredentials, AuthState } from '../types/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // API URLs (Assuming JWT authentication API)
  const API_URL = 'http://localhost:8000'; 
  const LOGIN_URL = `${API_URL}/api/token/`;

  useEffect(() => {
    // Check for stored authentication on app load
    const storedUser = localStorage.getItem('inventoryUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        localStorage.removeItem('inventoryUser');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // API call to authenticate user
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user info and JWT token in localStorage
        const user = { email: credentials.email }; // In a real app, fetch user data from the API here
        localStorage.setItem('inventoryUser', JSON.stringify(user));
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: data.detail || 'An error occurred' };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('inventoryUser');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
};
