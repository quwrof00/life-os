'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Message } from '@prisma/client';

type MediaMessage = Message & {
  title?: string;
  boldness?: 'Cold Take' | 'Mild Take' | 'Hot Take' | 'Nuclear Take';
  boldnessExplanation?: string;
  boldnessConfidence?: number;
};

function chipClasses(level?: MediaMessage['boldness']) {
  const base = 'text-xs font-semibold px-2 py-1 rounded-full';
  switch (level) {
    case 'Cold Take':
      return `${base} bg-blue-700 text-blue-200`;
    case 'Mild Take':
      return `${base} bg-green-700 text-green-200`;
    case 'Hot Take':
      return `${base} bg-yellow-700 text-yellow-100`;
    case 'Nuclear Take':
      return `${base} bg-red-800 text-red-200`;
    default:
      return `${base} bg-gray-600 text-gray-200`;
  }
}

export default function MediaFetcher() {
  const [mediaOpinions, setMediaOpinions] = useState<MediaMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/messages/get?type=MEDIA');
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Fetch failed');
        const cleaned = (data.messages || []).filter(
          (m: MediaMessage) => typeof m.id === 'string' && m.id.length > 0,
        );
        setMediaOpinions(cleaned);
      } catch {
        setError('Failed to fetch media opinions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
      >
        <h1 className="text-3xl font-extrabold text-white mb-8 text-center drop-shadow-lg">
          🎬 Media Opinions 🍿
        </h1>

        {loading && (
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-neon-blue text-center font-medium"
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-neon-blue"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                  className="opacity-75"
                />
              </svg>
              Loading opinions…
            </span>
          </motion.p>
        )}

        {error && (
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-neon-red text-center font-medium"
          >
            {error} 😕
          </motion.p>
        )}

        {!loading && !error && mediaOpinions.length === 0 && (
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-center font-medium"
          >
            No opinions yet. Share your media takes! 🎥
          </motion.p>
        )}

        {!loading && !error && mediaOpinions.length > 0 && (
          <ul className="space-y-4">
            {mediaOpinions.map((op) => (
              <motion.li
                key={op.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                className="relative p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-neon-blue/40 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <svg
                      className="w-6 h-6 text-neon-yellow flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                    {op.boldness && (
                      <div className="flex items-center gap-2">
                        <span className={chipClasses(op.boldness)}>{op.boldness}</span>
                        {typeof op.boldnessConfidence === 'number' && (
                          <span className="text-xs text-gray-400">
                            {op.boldnessConfidence}% sure
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-lg text-gray-100 mb-4 leading-relaxed">{op.content}</p>
                  
                  {op.boldnessExplanation && (
                    <div className="bg-gray-800/50 p-3 rounded-lg mb-3">
                      <p className="text-sm text-gray-300 italic">
                        {op.boldnessExplanation}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 text-right">
                    {new Date(op.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}