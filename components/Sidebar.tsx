'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  const [activeLoading, setActiveLoading] = useState<string | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Enable animations after mount
  useEffect(() => {
    setShouldAnimate(true);
  }, []);

  // Reset loading state when pathname changes
  useEffect(() => {
    setActiveLoading(null);
  }, [pathname]);

  const renderLink = (t: string, index: number) => {
    const href = `/category/${t}`;
    const active = pathname === href;

    return (
      <li key={t}>
        <Link
          href={href}
          onClick={() => setActiveLoading(t)}
          className={clsx(
            'block px-4 py-2 rounded-xl text-white font-medium transition-all duration-300 relative overflow-hidden flex items-center',
            active
              ? 'bg-gradient-to-r from-neon-blue to-neon-purple shadow-[0_0_15px_rgba(0,240,255,0.5)]'
              : 'bg-gray-800/50 hover:bg-gray-700/70 hover:shadow-[0_0_10px_rgba(0,240,255,0.3)]'
          )}
        >
          {activeLoading === t ? (
            <div 
              className="w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"
              aria-label="Loading"
              role="status"
            />
          ) : (
            <span className="relative z-10">{t}</span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <motion.aside
      initial={shouldAnimate ? { opacity: 0, x: -20 } : false}
      animate={shouldAnimate ? { opacity: 1, x: 0 } : false}
      transition={{ duration: 0.5 }}
      className="w-64 p-6 bg-gradient-to-b from-gray-900/90 to-indigo-900/90 backdrop-blur-lg border-r border-white/10 min-h-screen shadow-lg"
    >
      <h2 className="font-extrabold text-2xl text-white mb-6 drop-shadow-lg">
        Quest 🎮 Categories
      </h2>
      <ul className="space-y-3">
        {types.map(renderLink)}
      </ul>
    </motion.aside>
  );
}