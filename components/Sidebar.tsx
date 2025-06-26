'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const types = [
  'STUDY', 'IDEA', 'RANT',
  'TASK', 'LOG', 'MEDIA',
  'QUOTE', 'OTHER',
];

export default function Sidebar() {
  const pathname = usePathname();
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>(
    types.reduce((acc, type) => ({ ...acc, [type]: false }), {})
  );

  // Enable animations after mount to improve LCP
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Handle link click with loading state
  const handleLinkClick = (type: string) => {
    setIsLoading((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setIsLoading((prev) => ({ ...prev, [type]: false }));
    }, 2000); // 1s for demo
  };

  const renderContent = () => (
    <>
      <h2 className="font-extrabold text-2xl text-white mb-6 drop-shadow-lg">
        Quest 🎮 Categories
      </h2>
      <ul className="space-y-3">
        {types.map((t, index) => {
          const href = `/category/${t}`;
          const active = pathname === href;

          return (
            <li key={t}>
              <Link href={href} passHref onClick={() => handleLinkClick(t)}>
                {shouldAnimate ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
                    className={clsx(
                      'block px-4 py-2 rounded-xl text-white font-medium transition-all duration-300 relative overflow-hidden flex items-center',
                      active
                        ? 'bg-gradient-to-r from-neon-blue to-neon-purple shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                        : 'bg-gray-800/50 hover:bg-gray-700/70 hover:shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                    )}
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    whileTap={{ scale: 0.95, rotate: -1 }}
                  >
                    <span
                      className={clsx(
                        'absolute inset-0 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 opacity-0 transition-opacity duration-300',
                        active ? 'opacity-100' : 'hover:opacity-100'
                      )}
                    ></span>
                    {isLoading[t] ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : (
                      <span className="relative z-10">{t}</span>
                    )}
                  </motion.div>
                ) : (
                  <div
                    className={clsx(
                      'block px-4 py-2 rounded-xl text-white font-medium transition-all duration-300 relative overflow-hidden flex items-center',
                      active
                        ? 'bg-gradient-to-r from-neon-blue to-neon-purple shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                        : 'bg-gray-800/50 hover:bg-gray-700/70 hover:shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                    )}
                  >
                    <span
                      className={clsx(
                        'absolute inset-0 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 opacity-0 transition-opacity duration-300',
                        active ? 'opacity-100' : 'hover:opacity-100'
                      )}
                    ></span>
                    {isLoading[t] ? (
                      <div className="w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="relative z-10">{t}</span>
                    )}
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <style jsx global>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );

  return (
    <>
      {shouldAnimate ? (
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="w-64 p-6 bg-gradient-to-b from-gray-900/90 to-indigo-900/90 backdrop-blur-lg border-r border-white/10 min-h-screen shadow-lg"
        >
          {renderContent()}
        </motion.aside>
      ) : (
        <aside
          className="w-64 p-6 bg-gradient-to-b from-gray-900/90 to-indigo-900/90 backdrop-blur-lg border-r border-white/10 min-h-screen shadow-lg"
        >
          {renderContent()}
        </aside>
      )}
    </>
  );
}