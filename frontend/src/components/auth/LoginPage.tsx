import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useToastContext } from "../../contexts/ToastContext";
import { Button } from "../ui/Button";
const DEFAULT_EMAIL = "admin@example.com";
const DEFAULT_PASSWORD = "password";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const toast = useToastContext();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        const message = error.message || "Invalid email or password";
        setErrors({ general: message });
        toast.error("Login failed", message, 4000);
        return;
      }

      if (data?.user) {
        const userName = data.user.user_metadata?.full_name || "User";
        toast.success(
          `Welcome back, ${userName}!`,
          "Let's make today productive.",
          4000
        );

        setTimeout(() => {
          navigate("/");
        }, 100);
      } else {
        const message = "Unexpected response from server. Please try again.";
        setErrors({ general: message });
        toast.error("Login error", message, 4000);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Connection error. Please try again.";
      setErrors({ general: message });
      toast.error("Connection error", message, 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: "email" | "password", value: string) => {
    if (field === "email") {
      setEmail(value);
    } else {
      setPassword(value);
    }

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };
  
  const handleQuickLogin = async (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword(DEFAULT_PASSWORD);
    // Submit immediately
    setIsLoading(true);
    setErrors({});
    try {
      const { data, error } = await signIn(quickEmail, DEFAULT_PASSWORD);
      if (error) {
        const message = error.message || "Invalid email or password";
        setErrors({ general: message });
        toast.error("Login failed", message, 4000);
        return;
      }
      if (data?.user) {
        const userName = data.user.user_metadata?.full_name || "User";
        toast.success(`Welcome back, ${userName}!`, "Let's make today productive.", 4000);
        setTimeout(() => navigate("/"), 100);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Connection error. Please try again.";
      setErrors({ general: message });
      toast.error("Connection error", message, 4000);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Welcome back to CRM Travel
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-6 px-6 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Demo Accounts (Role-Based Access)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => handleQuickLogin("admin@example.com")} disabled={isLoading}>
              Admin Panel
            </Button>
            <Button variant="outline" onClick={() => handleQuickLogin("customer@example.com")} disabled={isLoading}>
              Customer Panel
            </Button>
            <Button variant="outline" onClick={() => handleQuickLogin("sales@example.com")} disabled={isLoading}>
              Sales Panel
            </Button>
            <Button variant="outline" onClick={() => handleQuickLogin("reservation@example.com")} disabled={isLoading}>
              Reservation Panel
            </Button>
            <Button variant="outline" onClick={() => handleQuickLogin("finance@example.com")} disabled={isLoading}>
              Finance Panel
            </Button>
            <Button variant="outline" onClick={() => handleQuickLogin("operations@example.com")} disabled={isLoading}>
              Operations Panel
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Each role sees different menus, data, and actions. Admin has full access.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <p className="text-sm text-red-800 dark:text-red-300">
                    {errors.general}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                className="w-full py-3 text-base"
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2025 CRM Admin. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
