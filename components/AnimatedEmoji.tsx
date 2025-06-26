'use client';

import { motion } from 'framer-motion';

const moodEmojiMap: Record<string, string> = {
  ANGRY: '😡',
  SAD: '😢',
  HAPPY: '😄',
  NEUTRAL: '😐',
  TIRED: '😴',
  ANXIOUS: '😰',
  EXCITED: '🤩',
  BORED: '🥱',
  REFLECTIVE: '🤔',
};

const moodAnimations: Record<string, any> = {
  ANGRY: { rotate: [0, -10, 10, -10, 0], transition: { repeat: Infinity, duration: 0.6 } },
  SAD: { y: [0, -5, 0], transition: { repeat: Infinity, duration: 1 } },
  HAPPY: { scale: [1, 1.2, 1], transition: { repeat: Infinity, duration: 1 } },
  EXCITED: { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0], transition: { repeat: Infinity, duration: 0.6 } },
  TIRED: { opacity: [1, 0.5, 1], transition: { repeat: Infinity, duration: 1 } },
  ANXIOUS: { x: [0, 3, -3, 0], transition: { repeat: Infinity, duration: 0.5 } },
  BORED: { scale: [1, 0.95, 1], transition: { repeat: Infinity, duration: 1 } },
  REFLECTIVE: { rotate: [0, 5, -5, 0], transition: { repeat: Infinity, duration: 1 } },
  NEUTRAL: {},
};

export function AnimatedEmoji({ mood }: { mood?: string | null }) {
  const emoji = moodEmojiMap[mood ?? 'NEUTRAL'];
  const animation = moodAnimations[mood ?? 'NEUTRAL'];

  return (
    <motion.span className="text-3xl" animate={animation}>
      {emoji}
    </motion.span>
  );
}
