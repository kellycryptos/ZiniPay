import React, { useState } from 'react';
import {
  Shield,
  Github,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../../lib/theme';

export interface AppHeaderProps {
  currentPath?: string;
  onNavigateHome?: () => void;
  onNavigateBoard?: () => void;
  onNavigateDocs?: () => void;
  onNavigateVerify?: () => void;
  onOpenVerifyModal?: () => void;
  walletConnected?: boolean;
  walletAccountId?: string | null;
  onConnectWallet?: () => void;
  network?: string;
}

export function AppHeader({
  currentPath = '/',
  onNavigateHome,
  onNavigateBoard,
  onNavigateDocs,
  onNavigateVerify,
  onOpenVerifyModal,
  walletConnected = false,
  walletAccountId = null,
  onConnectWallet,
  network = 'testnet',
}: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const isHome = currentPath === '/';
  const isBoard = currentPath === '/board' || currentPath.startsWith('/board') || currentPath.startsWith('/app');
  const isDocs = currentPath === '/docs' || currentPath.startsWith('/docs');

  const handleNavHome = () => {
    setMobileMenuOpen(false);
    if (onNavigateHome) onNavigateHome();
  };

  const handleNavBoard = () => {
    setMobileMenuOpen(false);
    if (onNavigateBoard) onNavigateBoard();
  };

  const handleNavDocs = () => {
    setMobileMenuOpen(false);
    if (onNavigateDocs) onNavigateDocs();
  };

  const handleOpenVerify = () => {
    setMobileMenuOpen(false);
    if (onNavigateVerify) {
      onNavigateVerify();
    } else if (onOpenVerifyModal) {
      onOpenVerifyModal();
    } else {
      window.location.href = '/verify';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Network Badge */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleNavHome}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <img
              src="/logo.svg"
              alt="ZiniPay Logo"
              className="w-8 h-8 rounded-lg bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] p-1 shrink-0 group-hover:border-[#00EC97]/40 transition-colors"
            />
            <div className="flex items-center gap-2">
              <span className="font-sans text-base font-bold text-[var(--text-primary)] tracking-tight">
                ZiniPay
              </span>
              <span className="hidden md:inline-block text-[11px] font-mono text-[var(--text-secondary)] border-l border-[var(--border-subtle)] pl-2">
                Constrained Agent Layer
              </span>
            </div>
          </button>

          {/* Testnet Badge */}
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-[#00EC97]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97] animate-pulse" />
            <span>NEAR {network === 'mainnet' ? 'Mainnet' : 'Testnet'}</span>
          </span>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            type="button"
            onClick={handleNavHome}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isHome
                ? 'text-[var(--text-primary)] bg-[var(--bg-panel-alt)] font-semibold border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-alt)]'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={handleNavBoard}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isBoard
                ? 'text-[var(--text-primary)] bg-[var(--bg-panel-alt)] font-semibold border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-alt)]'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={handleNavDocs}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isDocs
                ? 'text-[var(--text-primary)] bg-[var(--bg-panel-alt)] font-semibold border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-alt)]'
            }`}
          >
            Docs
          </button>
          <a
            href="https://github.com/kellycryptos/ZiniPay"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-alt)] transition-colors"
          >
            <Github size={14} />
            <span>GitHub</span>
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel-alt)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer flex items-center justify-center shadow-sm"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun size={15} className="text-amber-400" />
            ) : (
              <Moon size={15} className="text-indigo-600 dark:text-indigo-400" />
            )}
          </button>

          {/* Verify On-Chain CTA */}
          <button
            type="button"
            onClick={handleOpenVerify}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-mono text-[#00EC97] transition-all cursor-pointer shadow-sm font-semibold"
            title="View on-chain proof"
          >
            <Shield size={14} />
            <span>Verify on-chain</span>
          </button>

          {/* Primary CTA */}
          {isBoard ? (
            walletConnected && walletAccountId ? (
              <span className="font-mono text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] text-[var(--text-primary)] truncate max-w-[140px] sm:max-w-[180px]">
                {walletAccountId}
              </span>
            ) : onConnectWallet ? (
              <button
                type="button"
                onClick={onConnectWallet}
                className="px-3.5 py-1.5 rounded-lg bg-[#00EC97] hover:bg-[#00c980] text-black font-semibold text-xs transition-colors cursor-pointer"
              >
                Connect Wallet
              </button>
            ) : null
          ) : (
            <button
              type="button"
              onClick={handleNavBoard}
              className="px-3.5 py-1.5 rounded-lg bg-[#00EC97] hover:bg-[#00c980] text-black font-semibold text-xs transition-colors cursor-pointer shadow-sm"
            >
              Open Dashboard
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel-alt)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleNavHome}
            className={`text-left px-3 py-2 rounded-lg text-sm ${
              isHome ? 'bg-[var(--bg-panel-alt)] text-[#00EC97] font-semibold' : 'text-[var(--text-secondary)]'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={handleNavBoard}
            className={`text-left px-3 py-2 rounded-lg text-sm ${
              isBoard ? 'bg-[var(--bg-panel-alt)] text-[#00EC97] font-semibold' : 'text-[var(--text-secondary)]'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={handleNavDocs}
            className={`text-left px-3 py-2 rounded-lg text-sm ${
              isDocs ? 'bg-[var(--bg-panel-alt)] text-[#00EC97] font-semibold' : 'text-[var(--text-secondary)]'
            }`}
          >
            Docs
          </button>
          <a
            href="https://github.com/kellycryptos/ZiniPay"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)]"
          >
            <Github size={14} />
            <span>GitHub</span>
          </a>
        </div>
      )}
    </header>
  );
}
