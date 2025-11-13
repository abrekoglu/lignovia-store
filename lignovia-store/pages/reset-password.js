import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setValidatingToken(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/auth/validate-reset-token?token=${token}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setTokenValid(true);
      } else {
        setError(data.error || "Invalid or expired reset token");
      }
    } catch (err) {
      setError("Failed to validate reset token");
    } finally {
      setValidatingToken(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Failed to reset password. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <AuthLayout brandMessage="Validating your reset request...">
        <div className="text-center">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">Validating reset token...</p>
        </div>
      </AuthLayout>
    );
  }

  if (!token || !tokenValid) {
    return (
      <>
        <Head>
          <title>Reset Password - LIGNOVIA</title>
          <meta name="description" content="Reset your LIGNOVIA password" />
        </Head>

        <AuthLayout brandMessage="We'll help you get back to your workspace.">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error-light/10 dark:bg-error-dark/10 border border-error-light dark:border-error-dark rounded-soft">
              <p className="text-sm text-error-light dark:text-error-dark text-center">{error}</p>
            </div>
          )}

          {/* Invalid Token Message */}
          <div className="text-center mb-8">
            <h2 className="text-xl lg:text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
              Invalid Reset Link
            </h2>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>

          {/* Back to Forgot Password Link */}
          <div className="text-center space-y-4">
            <Link
              href="/forgot-password"
              className="inline-block w-full bg-accent hover:bg-[#B8916E] text-white font-semibold py-3 px-4 rounded-soft transition-all duration-200 text-center"
            >
              Request New Reset Link
            </Link>
            <Link
              href="/login"
              className="block text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-accent transition-colors duration-200"
            >
              Back to Login
            </Link>
          </div>
        </AuthLayout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Reset Password - LIGNOVIA</title>
        <meta name="description" content="Reset your LIGNOVIA password" />
      </Head>

      <AuthLayout brandMessage="Create a new password for your workspace.">
        {!success ? (
          <>
            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark text-center mb-3">
              Reset your password
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark text-center mb-8">
              Please enter your new password below.
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-error-light/10 dark:bg-error-dark/10 border border-error-light dark:border-error-dark rounded-soft">
                <p className="text-sm text-error-light dark:text-error-dark">{error}</p>
              </div>
            )}

            {/* Password Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="input w-full"
                  placeholder="••••••••"
                />
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="input w-full"
                  placeholder="••••••••"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-[#B8916E] text-white font-semibold py-3 px-4 rounded-soft transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-8 text-center border-t border-border-light dark:border-border-dark pt-6">
              <Link
                href="/login"
                className="text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-accent transition-colors duration-200"
              >
                Back to Login
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Success Message */}
            <div className="text-center animate-success-message">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark border-2 border-success-light dark:border-success-dark">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Success Title */}
              <h2 className="text-xl lg:text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
                Password Updated
              </h2>

              {/* Success Message */}
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-8">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>

              {/* Return to Login Button */}
              <Link
                href="/login"
                className="inline-block w-full bg-accent hover:bg-[#B8916E] text-white font-semibold py-3 px-4 rounded-soft transition-all duration-200 text-center"
              >
                Return to Login
              </Link>
            </div>
          </>
        )}
      </AuthLayout>

      <style jsx>{`
        @keyframes success-message {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-success-message {
          animation: success-message 0.4s ease-out;
        }
      `}</style>
    </>
  );
}
