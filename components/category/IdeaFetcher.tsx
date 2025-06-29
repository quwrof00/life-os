'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';

type Message = {
  id: string;
  content: string;
  summary: string | null;
  createdAt: string;
};

type IdeaDetails = {
  messageId: string;
  why: string | null;
  how: string | null;
  when: string | null;
};

export default function IdeaFetcher() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [ideaDetails, setIdeaDetails] = useState<Record<string, IdeaDetails>>({});
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [why, setWhy] = useState('');
  const [how, setHow] = useState('');
  const [when, setWhen] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState<Record<string, string>>({});
  const prefersReducedMotion = useReducedMotion();

  // Fetch ideas and their details parallely
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const res = await fetch('/api/messages/get?type=IDEA');
        const data = await res.json();

        if (data.success) {
          const validMessages = (data.messages || []).filter((msg: Message) => {
            if (!msg.id || typeof msg.id !== 'string') {
              console.warn('Invalid message ID detected: ', msg);
              return false;
            }
            return true;
          });
          setMessages(validMessages);
          const detailsEntries = await Promise.all(
            validMessages.map(async (msg: Message) => {
              try {
                const ideaRes = await fetch(`/api/idea/${msg.id}`);
                const ideaData = await ideaRes.json();

                if (ideaData.success) {
                  return [
                    msg.id,
                    {
                      messageId: msg.id,
                      why: ideaData.idea?.why || '',
                      how: ideaData.idea?.how || '',
                      when: ideaData.idea?.when || '',
                    } as IdeaDetails
                  ];
                }
              } catch {
                console.warn(`Failed to fetch idea details for message ${msg.id}`)
              }
              return [msg.id, null];
            })
          );

          const details = Object.fromEntries(detailsEntries.filter(entry => entry[1] !== null));
          setIdeaDetails(details);
        } else {
          setError('Failed to fetch ideas');
        }
      } catch {
        setError('Failed to fetch ideas');
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, []);

  // Update form fields when an idea is selected
  useEffect(() => {
    if (selectedIdeaId && ideaDetails[selectedIdeaId]) {
      setWhy(ideaDetails[selectedIdeaId].why || '');
      setHow(ideaDetails[selectedIdeaId].how || '');
      setWhen(ideaDetails[selectedIdeaId].when || '');
      setSaveError((prev) => ({ ...prev, [selectedIdeaId]: '' }));
    }
  }, [selectedIdeaId, ideaDetails]);

  const handleSave = async (messageId: string) => {
    setSaving(messageId);
    setSaveError((prev) => ({ ...prev, [messageId]: '' }));
    try {
      const res = await fetch(`/api/idea/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ why, how, when }),
      });
      const data = await res.json();
      if (data.success) {
        setIdeaDetails((prev) => ({
          ...prev,
          [messageId]: { messageId, why, how, when },
        }));
      } else {
        setSaveError((prev) => ({
          ...prev,
          [messageId]: data.error || 'Failed to save',
        }));
      }
    } catch {
      setSaveError((prev) => ({ ...prev, [messageId]: 'Failed to save' }));
    } finally {
      setSaving(null);
    }
  };

  const toggleSidebar = (messageId: string) => {
    setSelectedIdeaId(selectedIdeaId === messageId ? null : messageId);
  };

  return (
    <div className="min-h-screen flex justify-center p-6 bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl w-full mx-auto"
      >
        <h1 className="text-3xl font-extrabold text-white mb-8 text-center drop-shadow-lg">
          💡 Spark of Genius ✨
        </h1>

        {loading && (
          <p className="text-neon-blue text-center font-medium">
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-neon-blue" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Igniting Ideas...
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

        {!loading && !error && messages.length === 0 && (
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-center font-medium"
          >
            No ideas yet. Light up a spark! 🚀
          </motion.p>
        )}

        {!loading && !error && messages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div
                  className={clsx(
                    'p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 border rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all duration-300 cursor-pointer',
                    selectedIdeaId === message.id ? 'border-neon-blue/80' : 'border-neon-blue/40'
                  )}
                  onClick={() => toggleSidebar(message.id)}
                >
                  <div className="relative pl-8 pr-4">
                    <svg
                      className="absolute top-4 left-2 w-5 h-5 text-neon-yellow/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <p className="text-sm text-white line-clamp-3 mb-3">{message.content}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Detail Panel */}
                {selectedIdeaId === message.id && ideaDetails[message.id] && (
                  <motion.div
                    initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-full bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-b-2xl p-6 shadow-2xl z-10 w-full"
                  >
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-neon-blue">Refine Idea</h2>
                        <button
                          onClick={() => setSelectedIdeaId(null)}
                          className="text-white/50 hover:text-white transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                      <div>
                        <label className="text-white font-medium mb-2 block">Why?</label>
                        <textarea
                          value={why}
                          onChange={(e) => setWhy(e.target.value)}
                          placeholder="Why is this idea important?"
                          className="w-full p-3 bg-gray-800/50 border border-neon-blue/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 resize-none"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-white font-medium mb-2 block">How?</label>
                        <textarea
                          value={how}
                          onChange={(e) => setHow(e.target.value)}
                          placeholder="How will you implement it?"
                          className="w-full p-3 bg-gray-800/50 border border-neon-blue/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 resize-none"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-white font-medium mb-2 block">When?</label>
                        <textarea
                          value={when}
                          onChange={(e) => setWhen(e.target.value)}
                          placeholder="When will it happen?"
                          className="w-full p-3 bg-gray-800/50 border border-neon-blue/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 resize-none"
                          rows={3}
                        />
                      </div>
                      {saveError[message.id] && (
                        <p className="text-neon-red text-sm">{saveError[message.id]}</p>
                      )}
                      <motion.button
                        onClick={() => handleSave(message.id)}
                        disabled={saving === message.id}
                        className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.5)] hover:shadow-[0_0_25px_rgba(0,240,255,0.8)] disabled:opacity-50 transition-all duration-300 relative overflow-hidden"
                        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                        <span className="relative z-10 flex items-center justify-center">
                          {saving === message.id ? (
                            <>
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
                            </>
                          ) : (
                            'Save Idea! 💾'
                          )}
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}