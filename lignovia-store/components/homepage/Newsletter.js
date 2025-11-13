"use client";

import { useState } from "react";

/**
 * Minimal Newsletter Signup Section Component
 * Clean, elegant, minimal design
 */
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    
    // Simulate API call - replace with actual newsletter API
    try {
      // TODO: Implement actual newsletter subscription API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus("success");
      setEmail("");
      
      // Reset success message after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <section className="mb-24 md:mb-32 lg:mb-40">
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface-light dark:bg-surface-dark border border-border-light/30 dark:border-border-dark/30 rounded-[10px] p-8 md:p-12 text-center">
          {/* Simple Title */}
          <h2 className="text-3xl md:text-4xl font-light text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">
            Join Our Community
          </h2>
          
          {/* Small Description */}
          <p className="text-base md:text-lg text-text-secondary-light dark:text-text-secondary-dark font-light mb-8 md:mb-10 leading-relaxed">
            Receive exclusive updates, early access to new collections, and stories from our workshop.
          </p>

          {/* Clean Email Form */}
          <form 
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:border-accent transition-colors duration-300 rounded-[8px] text-base font-light"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 bg-accent text-white font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 rounded-[8px] text-base whitespace-nowrap"
            >
              {status === "loading" ? "Subscribing..." : status === "success" ? "Subscribed" : "Subscribe"}
            </button>
          </form>

          {/* Minimal Status Messages */}
          {status === "success" && (
            <p className="mt-6 text-accent font-light text-sm">
              Thank you for subscribing.
            </p>
          )}
          {status === "error" && (
            <p className="mt-6 text-error-light dark:text-error-dark font-light text-sm">
              Please enter a valid email address.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
