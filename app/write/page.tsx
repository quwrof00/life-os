'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function WritePage() {
  const { user } = useCurrentUser();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
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

  const handleGenerateSummary = async () => {
    if (!user?.id) return;
    
    setSummaryLoading(true);
    try {
      const res = await fetch('/api/summary');
      const data = await res.json();
      
      if (res.ok) {
        setSummary(data.summary);
        setShowSummaryModal(true);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      setStatus('error');
    } finally {
      setSummaryLoading(false);
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

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              type="submit"
              className="flex-1 py-3 px-6 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.5)] hover:shadow-[0_0_25px_rgba(0,240,255,0.8)] disabled:opacity-50 transition-all duration-300 relative overflow-hidden"
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

            <motion.button
              type="button"
              onClick={handleGenerateSummary}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(74,222,128,0.5)] hover:shadow-[0_0_25px_rgba(74,222,128,0.8)] disabled:opacity-50 transition-all duration-300 relative overflow-hidden"
              disabled={summaryLoading}
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-teal-400/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
              {summaryLoading ? (
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
                  Generating...
                </span>
              ) : (
                'Generate Weekly Summary 📊'
              )}
            </motion.button>
          </div>
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

      {/* Summary Modal */}
      <AnimatePresence>
        {showSummaryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowSummaryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-teal-400/30 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowSummaryModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <h2 className="text-2xl font-bold text-teal-400 mb-4">Your Summary 📊</h2>
              {summary ? (
                <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-line">{summary}</p>
                </div>
              ) : (
                <p className="text-gray-400">No summary available</p>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}