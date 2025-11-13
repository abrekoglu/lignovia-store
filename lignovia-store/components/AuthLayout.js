import Image from "next/image";
import { useEffect, useState } from "react";

export default function AuthLayout({ children, brandMessage = "Crafted experiences, built with precision." }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex">
      {/* Left Panel - Brand Visual Area */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-surface-light to-bg-light dark:from-surface-dark dark:to-bg-dark relative overflow-hidden">
        {/* Optional subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='%23000'/%3E%3Cpath d='M0 0l100 100M100 0L0 100' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px'
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 py-16 animate-fade-in-slow">
          {/* Large Logo */}
          <div className="mb-8 transform transition-all duration-500" style={{ animationDelay: '100ms' }}>
            <Image
              src="/images/logo/logo.png"
              alt="LIGNOVIA"
              width={300}
              height={120}
              className="h-20 lg:h-28 xl:h-32 w-auto"
              priority
            />
          </div>

          {/* Brand Message */}
          <p className="text-lg lg:text-xl xl:text-2xl font-light text-text-secondary-light dark:text-text-secondary-dark text-center max-w-md leading-relaxed animate-fade-in-slow" style={{ animationDelay: '300ms' }}>
            {brandMessage}
          </p>

          {/* Optional decorative element */}
          <div className="mt-12 w-24 h-px bg-accent/30 dark:bg-accent/20 animate-fade-in-slow" style={{ animationDelay: '500ms' }} />
        </div>
      </div>

      {/* Right Panel - Forms Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 lg:px-8 lg:py-16 bg-bg-light dark:bg-bg-dark">
        <div 
          className={`w-full max-w-[460px] bg-bg-light dark:bg-bg-dark rounded-2xl p-8 lg:p-10 xl:p-12 relative transition-all duration-300 auth-form-card ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Small Logo (hidden on mobile when left panel is visible) */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Image
              src="/images/logo/logo.png"
              alt="LIGNOVIA"
              width={200}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-slow {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-slow {
          animation: fade-in-slow 0.6s ease-out forwards;
          opacity: 0;
        }
        .auth-form-card {
          box-shadow: 0 4px 20px rgba(60, 48, 38, 0.08), 0 1px 3px rgba(60, 48, 38, 0.05);
        }
        :global(.dark) .auth-form-card {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}

