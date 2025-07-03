'use client';

import { useEffect, useState } from 'react';
import { Message } from '@prisma/client';
import { motion, useReducedMotion } from 'framer-motion';
import DeleteButton from '../DeleteButton';

export default function QuoteFetcher() {
  const [quotes, setQuotes] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const res = await fetch('/api/messages/get?type=QUOTE');
        const data = await res.json();
        if (data.success) {
          const validQuotes = (data.messages || []).filter((msg: Message) => {
            if (!msg.id || typeof msg.id !== 'string') {
              console.warn('Invalid message ID detected:', msg);
              return false;
            }
            return true;
          });
          setQuotes(validQuotes);
          if (validQuotes.length < (data.messages || []).length) {
            console.error(
              `Filtered out ${data.messages.length - validQuotes.length} messages due to invalid IDs`
            );
          }
        } else {
          setError(data.error || 'Failed to fetch quotes');
        }
      } catch {
        setError('Failed to fetch quotes');
      } finally {
        setLoading(false);
      }
    }
    fetchQuotes();
  }, []);

  const renderContent = () => (
    <>
      <h1 className="text-3xl font-extrabold text-white mb-8 text-center drop-shadow-lg font-serif">
        💬 Words of Wisdom ✨
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
            Uncovering Epic Quotes...
          </span>
        </p>
      )}

      {error && (
        <p className="text-neon-red text-center font-medium mb-4">
          {error} 😕
        </p>
      )}

      {!loading && !error && quotes.length === 0 ? (
  <p className="text-gray-400 text-center font-medium italic font-serif">
    No quotes yet. Share your wisdom! 📜
  </p>
) : (
  <ul className="space-y-6">
    {quotes.map((quote) => (
      <motion.li
        key={quote.id}
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative p-8 bg-gray-800 border border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"></span>
        {/* Delete Button */}
        <DeleteButton
          messageId={quote.id}
          className="absolute top-2 right-2 z-20"
        />
        <div className="relative z-10 pl-10 pr-10">
          <p className="text-lg text-white italic font-serif leading-relaxed tracking-wide mb-3">
            {quote.content}
          </p>
          <svg
            onClick={() => {
              navigator.clipboard.writeText(quote.content);
              setCopiedId(quote.id);
              setTimeout(() => {
                setCopiedId(null);
              }, 2000);
            }}
            className="absolute bottom-4 right-2 w-6 h-6 text-neon-blue/40 transform rotate-180 cursor-pointer hover:text-neon-blue/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
            />
          </svg>
          <div className="h-px bg-gray-600 my-4" />
          <p className="text-sm text-gray-300">{quote.summary}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(quote.createdAt).toLocaleString()}
          </p>
          {copiedId === quote.id && (
            <span className="text-green-200 text-sm mt-2 block">Copied!</span>
          )}
        </div>
      </motion.li>
    ))}
  </ul>
)}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 flex items-center justify-center p-6">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}
