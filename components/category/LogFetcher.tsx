'use client';

import { useEffect, useState } from 'react';
import { Message } from '@prisma/client';
import { motion, useReducedMotion } from 'framer-motion';
import { AnimatedEmoji } from '../AnimatedEmoji';

interface ExtendedMessage extends Message {
  log?: { mood: string | null };
}

export function LogFetcher() {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/messages/get?type=LOG');
        const data = await res.json();
        if (data.success) {
          const validMessages = (data.messages || []).filter((msg: ExtendedMessage) => {
            if (!msg.id || typeof msg.id !== 'string') {
              console.warn('Invalid message ID detected:', msg);
              return false;
            }
            return true;
          });
          setMessages(validMessages);
        } else {
          setError(data.error || 'Failed to fetch logs');
        }
      } catch {
        setError('Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) acc[date] = []; //if its the first msg for the day, make a new array
    acc[date].push(msg); //push the msg into the day's array
    return acc;
  }, {} as Record<string, ExtendedMessage[]>);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 flex items-center justify-center p-6">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
      >
        <h1 className="text-3xl font-extrabold text-white mb-6 text-center drop-shadow-lg">
          📖 Cosmic Journal 🌟
        </h1>

        {loading && (
          <p className="text-neon-blue text-center font-medium">
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-neon-blue"
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
              Loading Journal...
            </span>
          </p>
        )}

        {error && (
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-neon-red text-center font-medium mb-4"
          >
            {error} 😕
          </motion.p>
        )}

        {!loading && !error && Object.keys(groupedMessages).length === 0 && (
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-center font-medium"
          >
            No journal entries yet. Start writing! ✍️
          </motion.p>
        )}

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="mb-8">
            <h2 className="text-xl font-semibold text-neon-blue mb-4 sticky top-0 bg-white/5 backdrop-blur-sm py-2 rounded-lg">
              {date}
            </h2>
            <ul className="space-y-4">
              {msgs.map((message) => (
                <motion.li
                  key={message.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-gray-800/50 border border-dashed border-neon-blue/30 rounded-xl shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all duration-300 relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 flex flex-col sm:flex-row gap-4">
                    <p className="text-white text-lg mb-2 flex-1">{message.content}</p>
                    <div className="flex items-center gap-4">
                      <p className="text-xs text-gray-400">
                        {new Date(message.createdAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true,
                        })}
                      </p>
                      <AnimatedEmoji mood={message.mood} />
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </motion.div>
    </div>
  );
}