import React, { useState } from 'react';
import {
  Shield,
  Github,
  Menu,
  X,
  Sun,
  Moon,
  ExternalLink,
  ArrowRight,
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
        {/* Left: Brand & Network Badge (under 768px: ONLY logo and ZiniPay name) */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleNavHome}
            className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0"
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

          {/* Testnet Badge - hidden under 768px wide */}
          <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-[#00EC97] shrink-0 whitespace-nowrap">
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

        {/* Right: Actions (under 768px: ONLY menu button) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Light / Dark Mode Toggle Button - hidden under 768px (lives in mobile menu panel) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden md:flex p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel-alt)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer items-center justify-center shadow-sm shrink-0"
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
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-mono text-[#00EC97] transition-all cursor-pointer shadow-sm font-semibold shrink-0"
            title="View on-chain proof"
          >
            <Shield size={14} />
            <span>Verify on-chain</span>
          </button>

          {/* Primary CTA (Desktop/Tablet only - hidden under 768px) */}
          {isBoard ? (
            walletConnected && walletAccountId ? (
              <span className="hidden md:inline-block font-mono text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] text-[var(--text-primary)] truncate max-w-[140px] sm:max-w-[180px]">
                {walletAccountId}
              </span>
            ) : onConnectWallet ? (
              <button
                type="button"
                onClick={onConnectWallet}
                className="hidden md:inline-flex px-3.5 py-1.5 rounded-lg bg-[#00EC97] hover:bg-[#00c980] text-black font-semibold text-xs transition-colors cursor-pointer shrink-0"
              >
                Connect Wallet
              </button>
            ) : null
          ) : (
            <button
              type="button"
              onClick={handleNavBoard}
              className="hidden md:inline-flex px-3.5 py-1.5 rounded-lg bg-[#00EC97] hover:bg-[#00c980] text-black font-semibold text-xs transition-colors cursor-pointer shadow-sm shrink-0"
            >
              Open Dashboard
            </button>
          )}

          {/* Mobile Menu Toggle (Visible under 768px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel-alt)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-16 z-30 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel (under 768px) */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/98 backdrop-blur-xl p-4 flex flex-col gap-2 shadow-2xl">
          <button
            type="button"
            onClick={handleNavHome}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isHome
                ? 'bg-[var(--bg-panel-alt)] text-[#00EC97] font-semibold border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-alt)]'
            }`}
          >
            <span>Home</span>
            {isHome && <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97]" />}
          </button>

          <button
            type="button"
            onClick={handleNavBoard}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isBoard
                ? 'bg-[var(--bg-panel-alt)] text-[#00EC97] font-semibold border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-alt)]'
            }`}
          >
            <span>Dashboard</span>
            {isBoard && <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97]" />}
          </button>

          <button
            type="button"
            onClick={handleNavDocs}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isDocs
                ? 'bg-[var(--bg-panel-alt)] text-[#00EC97] font-semibold border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-alt)]'
            }`}
          >
            <span>Docs</span>
            {isDocs && <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97]" />}
          </button>

          <a
            href="https://github.com/kellycryptos/ZiniPay"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-alt)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Github size={16} />
              <span>GitHub</span>
            </div>
            <ExternalLink size={13} className="text-[var(--text-muted)]" />
          </a>

          {/* Theme toggle row inside menu panel */}
          <div className="border-t border-[var(--border-subtle)] my-1 pt-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-alt)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Sun size={16} className="text-amber-400" />
                ) : (
                  <Moon size={16} className="text-indigo-400" />
                )}
                <span>Theme</span>
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)] capitalize">
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </span>
            </button>
          </div>

          {/* One Open Dashboard Button inside menu */}
          <div className="pt-1 flex flex-col gap-2">
            {isBoard ? (
              walletConnected && walletAccountId ? (
                <div className="p-2.5 rounded-lg bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--text-secondary)]">Account:</span>
                  <span className="text-[#00EC97] font-semibold truncate max-w-[180px]">{walletAccountId}</span>
                </div>
              ) : onConnectWallet ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onConnectWallet();
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#00EC97] hover:bg-[#00c980] text-black font-semibold text-xs transition-colors cursor-pointer text-center shadow-md"
                >
                  Connect Wallet
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNavBoard}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#00EC97] hover:bg-[#00c980] text-black font-semibold text-xs transition-colors cursor-pointer text-center shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight size={14} />
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={handleNavBoard}
                className="w-full py-2.5 px-4 rounded-lg bg-[#00EC97] hover:bg-[#00c980] text-black font-semibold text-xs transition-colors cursor-pointer text-center shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Open Dashboard</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
