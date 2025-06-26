'use client';

import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { Message } from '@prisma/client';
import { motion } from 'framer-motion';

export function HeatMapChart({ rants }: { rants: Message[] }) {
  const [data, setData] = useState<{ mood: string; count: number }[]>([]);
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(false);

  // Enable animations after mount to improve LCP
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 0); // Minimal delay to prioritize initial render
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const moodCounts: Record<string, number> = {};
    for (const rant of rants) {
      const mood = rant.mood ?? 'NEUTRAL';
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    }
    setData(
      Object.entries(moodCounts).map(([mood, count]) => ({
        mood,
        count,
      }))
    );
  }, [rants]);

  const renderContent = () => (
    <>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis
            dataKey="mood"
            stroke="#ffffff"
            tick={{ fill: '#e0e0e0', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(0, 240, 255, 0.3)' }}
          />
          <YAxis
            stroke="#ffffff"
            tick={{ fill: '#e0e0e0', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(0, 240, 255, 0.3)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '8px',
              color: '#ffffff',
              boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
            }}
            cursor={{ fill: 'rgba(0, 240, 255, 0.1)' }}
          />
          <Bar
            dataKey="count"
            fill="url(#neonGradient)"
            radius={[8, 8, 0, 0]}
            barSize={40}
          />
          <defs>
            <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#cc00ff" stopOpacity={0.9} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
      <style jsx global>{`
        :root {
          --neon-blue: #00f0ff;
          --neon-purple: #cc00ff;
          --neon-green: #00ff85;
          --neon-red: #ff4d4d;
        }
      `}</style>
    </>
  );

  return (
    <div className="w-full h-72 relative">
      {shouldAnimate ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="w-full h-full"
        >
          {renderContent()}
        </motion.div>
      ) : (
        <div className="w-full h-full">
          {renderContent()}
        </div>
      )}
    </div>
  );
}