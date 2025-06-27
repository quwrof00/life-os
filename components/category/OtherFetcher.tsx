'use client';

import { useEffect, useState } from 'react';
import { Message } from '@prisma/client';
import { motion, useReducedMotion } from 'framer-motion';

export default function OtherFetcher() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch('/api/messages/get?type=OTHER');
        const data = await res.json();
        if (data.success) {
          const validMessages = (data.messages || []).filter((msg: Message) => {
            if (!msg.id || typeof msg.id !== 'string') {
              console.warn('Invalid message ID detected:', msg);
              return false;
            }
            return true;
          });
          setMessages(validMessages);
          if (validMessages.length < (data.messages || []).length) {
            console.error(
              `Filtered out ${data.messages.length - validMessages.length} messages due to invalid IDs`
            );
          }
        } else {
          setError(data.error || 'Failed to fetch messages');
        }
      } catch {
        setError('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  const renderContent = () => (
    <>
      <h1 className="text-3xl font-extrabold text-white mb-6 text-center drop-shadow-lg">
        🌌 Message Galaxy 🌌
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
            Loading Messages...
          </span>
        </p>
      )}
      {error && (
        <p className="text-neon-red text-center font-medium mb-4">
          {error} 😕
        </p>
      )}
      {!loading && !error && messages.length === 0 ? (
        <p className="text-gray-400 text-center font-medium">
          No messages yet. Start exploring! 🚀
        </p>
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => (
            <motion.li
              key={message.id}
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="p-4 bg-gray-800/50 border border-neon-blue/30 rounded-xl shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all duration-300 relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
              <div className="relative z-10">
                <p className="text-white font-medium text-sm line-clamp-3 mb-2">
                  {message.content}
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                  <span className="text-xs text-neon-blue font-semibold">
                    {message.type}
                  </span>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 flex items-center justify-center p-6">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}