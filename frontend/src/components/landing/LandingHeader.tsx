import React, { useState } from 'react';
import { Github, Menu, X, Sun, Moon, Shield } from 'lucide-react';
import { useTheme } from '../../lib/theme';

export interface LandingHeaderProps {
  onNavigateHome?: () => void;
  onNavigateToApp: () => void;
  onNavigateDocs?: () => void;
  onNavigateVerify?: () => void;
}

export function ZiniPayLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="4" y="5" width="24" height="4.5" rx="2.25" fill="#00E599" />
      <path
        d="M24 7.5L8 24.5"
        stroke="#00E599"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <rect x="4" y="22.5" width="24" height="4.5" rx="2.25" fill="#00E599" />
    </svg>
  );
}

export function LandingHeader({
  onNavigateHome,
  onNavigateToApp,
  onNavigateDocs,
  onNavigateVerify,
}: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleHome = () => {
    setMobileMenuOpen(false);
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleApp = () => {
    setMobileMenuOpen(false);
    onNavigateToApp();
  };

  const handleDocs = () => {
    setMobileMenuOpen(false);
    if (onNavigateDocs) {
      onNavigateDocs();
    } else {
      window.location.href = '/docs';
    }
  };

  const handleVerify = () => {
    setMobileMenuOpen(false);
    if (onNavigateVerify) {
      onNavigateVerify();
    } else {
      window.location.href = '/verify';
    }
  };

  return (
    <header className="relative z-50 w-full px-4 sm:px-6 pt-4 pb-2">
      {/* Floating Glassmorphic Pill Container */}
      <div className="relative max-w-6xl mx-auto rounded-2xl bg-white/85 dark:bg-[#0F1C18]/80 backdrop-blur-md border border-emerald-600/20 dark:border-emerald-500/20 shadow-sm dark:shadow-[0_0_25px_rgba(16,185,129,0.1)] px-5 sm:px-7 py-3 flex items-center justify-between gap-4 transition-all duration-300">
        
        {/* Left: Green geometric "Z" logo icon next to bold "ZiniPay" text */}
        <button
          type="button"
          onClick={handleHome}
          className="flex items-center gap-2.5 cursor-pointer text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg py-1"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ZiniPayLogo className="w-7 h-7 drop-shadow-[0_0_8px_rgba(0,229,153,0.5)]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-sans text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              ZiniPay
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono text-emerald-700 dark:text-[#00EC97] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              NEAR Testnet
            </span>
          </div>
        </button>

        {/* Center: Navigation links with active "Home" indicator */}
        <nav className="hidden md:flex items-center gap-7 relative">
          <button
            type="button"
            onClick={handleHome}
            className="relative py-1 text-sm font-medium text-slate-900 dark:text-white transition-colors cursor-pointer group flex flex-col items-center"
          >
            <span>Home</span>
            <span className="absolute -bottom-3 w-8 h-[2px] bg-[#00E599] rounded-full shadow-[0_0_8px_#00E599]" />
          </button>

          <button
            type="button"
            onClick={handleApp}
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Public Board
          </button>

          <button
            type="button"
            onClick={handleVerify}
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            <Shield size={13} className="text-[#00E599]" />
            <span>Verification</span>
          </button>

          <button
            type="button"
            onClick={handleDocs}
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Docs
          </button>

          <a
            href="https://github.com/kellycryptos/ZiniPay"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 group"
          >
            <Github size={15} className="group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
            <span>GitHub</span>
          </a>
        </nav>

        {/* Right: Theme switch, neon green CTA, and mobile hamburger */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Theme Toggle Switch */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#12221D]/90 border border-slate-200 dark:border-emerald-500/20 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-inner"
          >
            <Sun
              size={13}
              className={`${
                theme === 'light' ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'
              } transition-colors`}
            />
            <Moon
              size={13}
              className={`${
                theme === 'dark' ? 'text-emerald-400' : 'text-slate-400 dark:text-slate-500'
              } transition-colors`}
            />
          </button>

          {/* Bright Neon Green CTA Button: Open Board → */}
          <button
            type="button"
            onClick={handleApp}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-[#00E599] hover:bg-[#00ffaa] text-[#070D0C] font-semibold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(0,229,153,0.5)] hover:shadow-[0_0_30px_rgba(0,229,153,0.7)] cursor-pointer active:scale-[0.98]"
          >
            <span>Open Board</span>
            <span className="font-bold text-base leading-none">→</span>
          </button>

          {/* Mobile Menu Hamburger / Close Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl bg-white/95 dark:bg-[#0F1C18]/95 backdrop-blur-xl border border-emerald-600/20 dark:border-emerald-500/20 shadow-xl flex flex-col gap-3 z-50">
            <button
              type="button"
              onClick={handleHome}
              className="text-left text-sm font-semibold text-emerald-600 dark:text-[#00E599] py-1.5 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={handleApp}
              className="text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-1.5 transition-colors cursor-pointer"
            >
              Public Board
            </button>
            <button
              type="button"
              onClick={handleVerify}
              className="text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-1.5 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Shield size={14} className="text-[#00E599]" />
              <span>Verification Suite</span>
            </button>
            <button
              type="button"
              onClick={handleDocs}
              className="text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-1.5 transition-colors cursor-pointer"
            >
              Docs
            </button>
            <a
              href="https://github.com/kellycryptos/ZiniPay"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-1.5 transition-colors"
            >
              <Github size={16} />
              <span>GitHub</span>
            </a>
            <button
              type="button"
              onClick={handleApp}
              className="mt-2 w-full py-2.5 rounded-xl bg-[#00E599] hover:bg-[#00ffaa] text-[#070D0C] font-semibold text-sm text-center shadow-[0_0_15px_rgba(0,229,153,0.4)] transition-all cursor-pointer active:scale-[0.98]"
            >
              Open Public Board →
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
