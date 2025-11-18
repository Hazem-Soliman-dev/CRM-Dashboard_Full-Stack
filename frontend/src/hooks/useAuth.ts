import { useEffect, useState, useCallback } from "react";
import authService, {
  User,
  LoginData,
  RegisterData,
} from "../services/authService";
import { getErrorMessage } from "../types/errors";

// Helper function to decode JWT token and get expiration
const getTokenExpiration = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  } catch {
    return null;
  }
};

// Check if token is expired or will expire soon (within 5 minutes)
const isTokenExpiringSoon = (
  token: string,
  bufferMinutes: number = 5
): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true; // If we can't parse, assume expired

  const bufferMs = bufferMinutes * 60 * 1000;
  return Date.now() >= expiration - bufferMs;
};

// Check if token is expired
const isTokenExpired = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  return Date.now() >= expiration;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Refresh user data from API
  const refreshUserData = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      // If refresh fails, clear stored data
      authService.logout();
      setUser(null);
      return null;
    }
  }, []);

  // Proactive token refresh
  const refreshTokenIfNeeded = useCallback(async () => {
    const token = authService.getStoredToken();
    if (!token) return false;

    // Check if token is expiring soon
    if (isTokenExpiringSoon(token)) {
      try {
        await authService.refreshToken();
        return true;
      } catch (error) {
        console.error("Failed to refresh token:", error);
        return false;
      }
    }
    return true;
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = authService.getStoredUser();
      const token = authService.getStoredToken();

      if (storedUser && token) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          // Token expired, try to refresh
          const refreshed = await refreshTokenIfNeeded();
          if (refreshed) {
            // Refresh user data after token refresh
            await refreshUserData();
          } else {
            // Refresh failed, clear user
            setUser(null);
          }
        } else {
          // Token is valid, use stored user
          setUser(storedUser);

          // Refresh token proactively if needed
          await refreshTokenIfNeeded();

          // Optionally refresh user data to ensure it's up to date
          // Uncomment if you want to always fetch fresh user data on mount
          await refreshUserData();
        }
      }

      setLoading(false);
    };

    initializeAuth();

    // Set up periodic token refresh check (every 5 minutes)
    const refreshInterval = setInterval(() => {
      refreshTokenIfNeeded();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [refreshTokenIfNeeded, refreshUserData]);

  const signIn = async (email: string, password: string) => {
    try {
      const loginData: LoginData = { email, password };
      const { user: apiUser } = await authService.login(loginData);
      setUser(apiUser);

      return {
        data: {
          user: {
            email: apiUser.email,
            user_metadata: {
              full_name: apiUser.full_name,
              role: apiUser.role,
            },
          },
        },
        error: null,
      };
    } catch (error: unknown) {
      return {
        data: null,
        error: { message: getErrorMessage(error) || "Login failed" },
      };
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn("Logout error:", error);
    }

    setUser(null);

    return { error: null };
  };

  const register = async (registerData: RegisterData) => {
    try {
      const { user: apiUser } = await authService.register(registerData);
      setUser(apiUser);

      return {
        data: {
          user: {
            email: apiUser.email,
            user_metadata: {
              full_name: apiUser.full_name,
              role: apiUser.role,
            },
          },
        },
        error: null,
      };
    } catch (error: unknown) {
      return {
        data: null,
        error: { message: getErrorMessage(error) || "Registration failed" },
      };
    }
  };

  const getCurrentUser = () => {
    return user
      ? {
          email: user.email,
          user_metadata: {
            full_name: user.full_name,
            role: user.role,
          },
        }
      : null;
  };

  return {
    user: getCurrentUser(),
    loading,
    signIn,
    signOut,
    register,
    userRole: user?.role || "customer",
    refreshUserData,
    refreshTokenIfNeeded,
  };
};
