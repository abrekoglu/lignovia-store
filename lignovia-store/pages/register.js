import Head from "next/head";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";

export default function Register() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/");
    }
  }, [status, session, router]);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <AuthLayout brandMessage="Join the LIGNOVIA family of creators.">
        <div className="text-center">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading...</p>
        </div>
      </AuthLayout>
    );
  }

  // Don't render form if already authenticated (will redirect)
  if (status === "authenticated") {
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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

    // Validate terms agreement
    if (!formData.agreeToTerms) {
      setError("Please agree to the Terms of Service");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register - LIGNOVIA</title>
        <meta name="description" content="Create a new LIGNOVIA account" />
      </Head>

      <AuthLayout brandMessage="Join the LIGNOVIA family of creators.">
        {/* Title */}
        <h1 className="text-2xl lg:text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark text-center mb-3">
          Create Account
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark text-center mb-8">
          Start your journey with LIGNOVIA
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-error-light/10 dark:bg-error-dark/10 border border-error-light dark:border-error-dark rounded-soft">
            <p className="text-sm text-error-light dark:text-error-dark">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-success-light/10 dark:bg-success-dark/10 border border-success-light dark:border-success-dark rounded-soft">
            <p className="text-sm text-success-light dark:text-success-dark">{success}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
              Password
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

          {/* Terms Checkbox */}
          <div className="flex items-start">
            <input
              type="checkbox"
              name="agreeToTerms"
              id="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              required
              className="h-4 w-4 mt-1 text-accent focus:ring-accent border-border-light dark:border-border-dark rounded cursor-pointer"
            />
            <label htmlFor="agreeToTerms" className="ml-3 text-sm text-text-primary-light dark:text-text-primary-dark cursor-pointer">
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-accent hover:underline"
              >
                Terms of Service
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-[#B8916E] text-white font-semibold py-3 px-4 rounded-soft transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-8 text-center border-t border-border-light dark:border-border-dark pt-6">
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-accent hover:underline font-medium transition-colors duration-200"
            >
              Sign In
            </Link>
          </p>
        </div>
      </AuthLayout>
    </>
  );
}
