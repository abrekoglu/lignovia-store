import Head from "next/head";
import { useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Failed to send reset link. Please check your email address.");
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

  return (
    <>
      <Head>
        <title>Forgot Password - LIGNOVIA</title>
        <meta name="description" content="Reset your LIGNOVIA password" />
      </Head>

      <AuthLayout brandMessage="We'll help you get back to your workspace.">
        {!success ? (
          <>
            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark text-center mb-3">
              Forgot your password?
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark text-center mb-8">
              Enter your email and we'll send you a reset link.
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-error-light/10 dark:bg-error-dark/10 border border-error-light dark:border-error-dark rounded-soft">
                <p className="text-sm text-error-light dark:text-error-dark">{error}</p>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input w-full"
                  placeholder="your@email.com"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-[#B8916E] text-white font-semibold py-3 px-4 rounded-soft transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Reset Link"}
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
                <div className="p-4 rounded-full bg-accent/20 text-accent">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
              </div>

              {/* Success Title */}
              <h2 className="text-xl lg:text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
                Check your email
              </h2>

              {/* Success Message */}
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">
                We've sent a password reset link to <span className="font-medium text-text-primary-light dark:text-text-primary-dark">{email}</span>
              </p>

              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-8">
                Please check your inbox and follow the instructions to reset your password.
              </p>

              {/* Back to Login Button */}
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
