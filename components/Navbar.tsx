'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useProfileStore } from '@/stores/userStore';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { status } = useSession(); 
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWriteLoading, setIsWriteLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { profile, fetchProfile } = useProfileStore();

  // Load profile on mount
  useEffect(() => {
    if (status === 'authenticated') fetchProfile();
    if (status === 'unauthenticated') useProfileStore.setState({ profile: null });
  }, [status, fetchProfile]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle write link click with loading state
  const handleWriteClick = () => {
    setIsWriteLoading(true);
    setTimeout(() => setIsWriteLoading(false), 1000); // Simulate navigation
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderWriteLink = () => (
    <Link
      href="/write"
      onClick={handleWriteClick}
      className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-neon-blue/50 text-neon-blue hover:scale-105 hover:shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all duration-300"
      aria-label="Write new message"
    >
      {isWriteLoading ? (
        <motion.div
          className="w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full shadow-[0_0_10px_rgba(0,240,255,0.5)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 3l4 4-12 12H3v-6L15 1z" />
          <path d="M15 1l6 6" />
        </svg>
      )}
    </Link>
  );

  const renderProfileDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className="flex items-center focus:outline-none"
        aria-label="Profile menu"
      >
        {isDropdownOpen && isLoggingOut ? (
          <motion.div
            className="w-10 h-10 border-2 border-neon-blue border-t-transparent rounded-full shadow-[0_0_10px_rgba(0,240,255,0.5)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <img
            src={profile?.image || undefined}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-neon-blue/50 object-cover shadow-md hover:scale-105 transition duration-300"
          />
        )}
      </button>
      
      {isDropdownOpen && (
        <div className="absolute top-12 right-0 w-40 bg-white/10 border border-neon-blue/30 rounded-xl shadow-lg p-2 backdrop-blur-lg z-50">
          <Link 
            href="/profile" 
            className="block px-4 py-2 text-sm text-neon-blue font-semibold hover:bg-neon-blue/20 rounded-lg transition"
          >
            {profile?.name || 'Profile'}
          </Link>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-neon-blue/20 text-neon-blue font-bold transition flex items-center justify-between"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                Logging Out
                <motion.div
                  className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full ml-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </>
            ) : 'Log Out'}
          </button>
        </div>
      )}
    </div>
  );

  const renderMobileLogoutButton = () => (
    <button
      onClick={logout}
      className="px-4 py-2 bg-neon-blue/20 text-neon-blue text-sm font-bold rounded-lg border border-neon-blue/50 hover:bg-neon-blue/30 transition flex items-center justify-center gap-2"
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <>
          Logging Out
          <motion.div
            className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </>
      ) : 'Log Out'}
    </button>
  );

  return (
    <nav className="fixed top-0 left-0 w-full z-30 backdrop-blur-lg bg-white/10 border-b border-neon-blue/40 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-3xl font-extrabold tracking-tight text-neon-blue drop-shadow-[0_0_10px_rgba(0,240,255,0.7)]"
        >
          LifeOS
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          {profile && renderWriteLink()}
          {profile ? (
            renderProfileDropdown()
          ) : (
            <>
              <Link
                href="/login"
                className={`text-sm font-bold text-neon-blue hover:underline transition ${
                  pathname === '/login' ? 'underline' : ''
                }`}
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg bg-neon-blue/20 border border-neon-blue/50 text-neon-blue text-sm font-bold hover:bg-neon-blue/30 transition-all duration-300"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-neon-blue focus:outline-none"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <svg
            className={`w-6 h-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-6 py-4 bg-white/10 backdrop-blur-lg border-t border-neon-blue/30">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">{renderWriteLink()}</div>
            {profile ? (
              <>
                <div className="flex items-center gap-3">
                  <img
                    src={profile.image || '/user-placeholder.png'}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-neon-blue/50 object-cover shadow-md"
                  />
                  <span className="text-sm font-semibold text-neon-blue">
                    {profile.name || 'Profile'}
                  </span>
                </div>
                {renderMobileLogoutButton()}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-sm font-bold text-neon-blue hover:underline transition ${
                    pathname === '/login' ? 'underline' : ''
                  }`}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-neon-blue/20 text-neon-blue text-sm font-bold rounded-lg border border-neon-blue/50 hover:bg-neon-blue/30 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}