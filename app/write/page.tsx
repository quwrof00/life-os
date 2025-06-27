'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function WritePage() {
  const { user } = useCurrentUser();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const prefersReducedMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/messages/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          userId: user?.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setContent('');
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Error:', err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 flex items-center justify-center p-4">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
      >
        <h1 className="text-3xl font-extrabold text-white mb-6 text-center drop-shadow-lg">
          Unleash Your Thoughts! 🚀
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full p-4 bg-gray-800/50 text-white border border-neon-blue rounded-xl focus:ring-2 focus:ring-neon-blue focus:outline-none placeholder-gray-400 transition-all duration-300"
            placeholder="Type your epic message here..."
            whileFocus={prefersReducedMotion ? {} : { scale: 1.02 }}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          />

          <motion.button
            type="submit"
            className="w-full py-3 px-6 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.5)] hover:shadow-[0_0_25px_rgba(0,240,255,0.8)] disabled:opacity-50 transition-all duration-300 relative overflow-hidden"
            disabled={loading}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              'Launch Message! ✨'
            )}
          </motion.button>
        </form>

        <AnimatePresence>
          {status === 'success' && (
            <motion.p
              key="success"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-neon-green mt-6 text-center font-medium"
            >
              Message saved and categorized! 🎉
            </motion.p>
          )}
          {status === 'error' && (
            <motion.p
              key="error"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-neon-red mt-6 text-center font-medium"
            >
              Oops, something went wrong. 😕
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}