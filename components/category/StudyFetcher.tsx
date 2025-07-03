'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import DeleteButton from '../DeleteButton';

type Message = {
  id: string;
  content: string;
  createdAt: string;
};

export default function StudyFetcher() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch('/api/messages/get?type=STUDY');
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
          setError(data.error || 'Something went wrong');
        }
      } catch {
        setError('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 flex items-center justify-center p-6">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
      >
        <h1 className="text-3xl font-extrabold text-white mb-6 text-center drop-shadow-lg">
          Study Quest Logs 📚
        </h1>

        {loading ? (
          <div className="text-neon-blue text-center font-medium">
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
              Loading Quests...
            </span>
          </div>
        ) : error ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-neon-red text-center font-medium mb-4"
          >
            {error} 😕
          </motion.p>
        ) : messages.length === 0 ? (
          <p className="text-gray-400 text-center font-medium">
            No study quests yet. Start your journey! 🚀
          </p>
        ) : (
          <ul className="space-y-4">
  {messages.map((msg) => (
    <motion.li
      key={msg.id}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 bg-gray-800/50 border border-neon-blue/30 rounded-xl shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all duration-300 relative overflow-hidden"
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
    >
      <Link href={`/category/STUDY/${msg.id}`} passHref>
        <div className="relative pr-10">
          <span className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
          <p className="text-neon-blue line-clamp-2 font-medium relative z-10 hover:text-neon-cyan transition-colors">
            {msg.content}
          </p>
        </div>
      </Link>
      <p className="text-sm text-gray-400 mt-1 relative z-10 pr-10">
        {new Date(msg.createdAt).toLocaleString()}
      </p>
      {/* Delete Button */}
      <DeleteButton
        messageId={msg.id}
        className="absolute bottom-2 right-2 z-20"
      />
    </motion.li>
  ))}
</ul>
        )}
      </motion.div>
    </div>
  );
}