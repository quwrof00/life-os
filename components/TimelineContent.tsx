'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import DeleteButton from './DeleteButton';

interface Message {
  id: string;
  content: string;
  type: string | null;
  createdAt: string | Date;
}

interface TimelineContentProps {
  date: Date;
  messages: Message[];
  prevDayUrl: string;
  nextDayUrl: string;
}

export default function TimelineContent({
  date,
  messages,
  prevDayUrl,
  nextDayUrl,
}: TimelineContentProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        router.push(prevDayUrl);
      } else if (e.key === 'ArrowRight') {
        router.push(nextDayUrl);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [router, prevDayUrl, nextDayUrl]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={format(date, 'yyyy-MM-dd')}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 mx-auto"
      >
        <h1 className="text-2xl font-extrabold text-white mb-4 drop-shadow-lg">
          Messages for {format(date, 'do MMMM yyyy')}
        </h1>

        {messages.length === 0 ? (
          <p className="text-gray-400 italic">No messages found for this day.</p>
        ) : (
          <ul className="space-y-4">
            {messages.map((msg) => (
  <li
    key={msg.id}
    className="bg-gray-800/50 border border-neon-blue/30 p-4 rounded-xl shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all duration-300 relative overflow-hidden"
  >
    <span className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
    {/* Delete Button */}
    <DeleteButton
      messageId={msg.id}
      className="absolute bottom-2 right-2 z-20"
    />
    <p className="text-white font-medium relative z-10 pr-10">{msg.content}</p>
    <p className="text-sm text-gray-400 mt-1 relative z-10 pr-10">
      {msg.type ?? 'No category (API Rate Limit Exceeded!)'} • {format(new Date(msg.createdAt), 'hh:mm a')}
    </p>
  </li>
))}
          </ul>
        )}

        <div className="mt-6 flex justify-between">
          <Link href={prevDayUrl} scroll={false}>
            <button className="px-6 py-3 bg-neon-blue/20 text-neon-blue font-semibold rounded-xl hover:bg-neon-blue/30 transition-all duration-300">
              ← Previous Day
            </button>
          </Link>
          <Link href={nextDayUrl} scroll={false}>
            <button className="px-6 py-3 bg-neon-blue/20 text-neon-blue font-semibold rounded-xl hover:bg-neon-blue/30 transition-all duration-300">
              Next Day →
            </button>
          </Link>
        </div>

        <p className="mt-2 text-sm text-center text-gray-500 italic">
          Use ← and → arrow keys to navigate
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
