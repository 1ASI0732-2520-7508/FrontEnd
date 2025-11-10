import { useState, useEffect } from "react";
import {User, LoginCredentials, AuthState, SignupCredentials} from "../types/auth";

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const LOGIN_URL = `${API_URL}/api/auth/token/`;

  // On mount, check for existing user in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("inventoryUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem("inventoryUser");
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (
    credentials: LoginCredentials,
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    console.log(credentials);
    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        // Extract user info from JWT claims
        const payload = JSON.parse(atob(data.access.split(".")[1]));
        console.log(payload);
        // decode JWT
        const user: User = {
          id: payload.user_id,
          username: payload.username,
          email: payload.email,
          group: payload.groups[0] as "Admin" | "Manager" | "Employee",
        };

        console.log(user, "payload");

        localStorage.setItem("inventoryUser", JSON.stringify(user));
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        setAuthState({ user, isAuthenticated: true, isLoading: false });
        return { success: true };
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return { success: false, error: data.detail || "Invalid credentials" };
      }
    } catch {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { success: false, error: "Network error" };
    }
  };

  const signup = async (
      credentials: SignupCredentials
  ): Promise<{ success: boolean; error?: string }> => {
    console.log('Credentials: ',credentials);
    try {
      const response = await fetch(`${API_URL}/api/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.email,
          password: credentials.password,
          email: credentials.email,
          group: Number(credentials.group),
          company: Number(credentials.company),
        }),
      });

      const data = await response.json();

      console.log('SignUp response', data);

      if (response.ok) {
        return { success: true};
      } else {
        return { success: false, error: data.detail || "Registration failed" };
      }
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("inventoryUser");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  };

  return { ...authState, login, logout, signup };
};
