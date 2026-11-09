import React, { useState } from 'react';
import { Github, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../lib/theme';

export interface LandingHeaderProps {
  onNavigateHome?: () => void;
  onNavigateToApp: () => void;
  onNavigateDocs?: () => void;
}

export function LandingHeader({
  onNavigateHome,
  onNavigateToApp,
  onNavigateDocs,
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo and Name ONLY (no tagline, no pill) */}
        <button
          type="button"
          onClick={handleHome}
          className="flex items-center gap-2.5 cursor-pointer text-left group"
        >
          <img
            src="/logo.svg"
            alt="ZiniPay Logo"
            className="w-8 h-8 rounded-lg bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] p-1 shrink-0 group-hover:border-[#00EC97]/40 transition-colors"
          />
          <span className="font-sans text-lg font-bold text-[var(--text-primary)] tracking-tight">
            ZiniPay
          </span>
        </button>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            type="button"
            onClick={handleHome}
            className="text-sm font-medium text-[var(--text-primary)] hover:text-[#00EC97] transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={handleApp}
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={handleDocs}
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Docs
          </button>
          <a
            href="https://github.com/kellycryptos/ZiniPay"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
          >
            <Github size={15} />
            <span>GitHub</span>
          </a>
        </nav>

        {/* Right: Theme Toggle and Open Dashboard CTA (No Verify button) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel-alt)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer flex items-center justify-center shadow-sm"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun size={16} className="text-amber-400" />
            ) : (
              <Moon size={16} className="text-indigo-600 dark:text-indigo-400" />
            )}
          </button>

          <button
            type="button"
            onClick={handleApp}
            className="px-4 py-2 rounded-lg bg-[#00EC97] hover:bg-[#00c980] text-black font-semibold text-sm transition-colors cursor-pointer shadow-sm"
          >
            Open Dashboard
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel-alt)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-6 py-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleHome}
            className="text-left text-sm font-medium text-[var(--text-primary)]"
          >
            Home
          </button>
          <button
            type="button"
            onClick={handleApp}
            className="text-left text-sm font-medium text-[var(--text-secondary)]"
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={handleDocs}
            className="text-left text-sm font-medium text-[var(--text-secondary)]"
          >
            Docs
          </button>
          <a
            href="https://github.com/kellycryptos/ZiniPay"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)]"
          >
            <Github size={15} />
            <span>GitHub</span>
          </a>
        </div>
      )}
    </header>
  );
}
