'use client';

import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Paragraph from '@tiptap/extension-paragraph';
import Heading from '@tiptap/extension-heading';
import clsx from 'clsx';

interface StudyEditorProps {
  initialContent: string;
  messageId: string;
  user: { id: string } | null;
}

export default function StudyEditor({ initialContent, messageId, user }: StudyEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [original, setOriginal] = useState(initialContent);
  // const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // AI Chat state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Paragraph,
      Heading.configure({ levels: [1, 2, 3] }),
    ],
    content: initialContent,
    onUpdate({ editor }) {
      setContent(editor.getHTML());
    },
    immediatelyRender: false,
  });

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Save failed');
      } else {
        setOriginal(content);
      }
    } catch {
      setError('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleAI() {
    if (!aiQuery.trim()) return;

    // Validate required fields
    if (!user?.id || !messageId) {
      setAiError('Missing required information. Please try again.');
      return;
    }

    setAiLoading(true);
    setAiError('');

    // Add user question to chat history
    const userMessage = { role: 'user', content: aiQuery };
    setChatHistory((prev) => [...prev, userMessage]);

    try {
      const res = await fetch(`/api/study/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          messageId,
          question: aiQuery.trim(),
        }),
      });

      if (!res.ok) throw new Error('Network response was not ok');

      const data = await res.json();

      if (data.success) {
        setChatHistory((prev) => [...prev, { role: 'assistant', content: data.answer }]);
      } else {
        setAiError(data.error || 'AI query failed');
      }
    } catch (e) {
      setAiError('Failed to connect to AI service');
      console.error('AI request failed:', e);
    } finally {
      setAiLoading(false);
      setAiQuery('');
    }
  }

  if (!editor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-neon-blue text-center font-medium">
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full shadow-[0_0_10px_rgba(0,240,255,0.5)] animate-spin" />
            <span className="ml-2">Loading Quest...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-neon-red text-center font-medium">{error} 😕</div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Main Content */}
      <div
        className={clsx(
          'p-8 transition-all duration-300',
          aiOpen ? 'w-[calc(100%-384px)]' : 'w-full',
        )}
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 mx-auto">
          <h1 className="text-3xl font-extrabold text-white mb-6 text-center drop-shadow-lg">
            Edit Study Quest 📝
          </h1>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              {
                label: 'Bold',
                action: () => editor.chain().focus().toggleBold().run(),
                active: editor.isActive('bold'),
              },
              {
                label: 'Italic',
                action: () => editor.chain().focus().toggleItalic().run(),
                active: editor.isActive('italic'),
              },
              {
                label: 'P',
                action: () => editor.chain().focus().setParagraph().run(),
                active: editor.isActive('paragraph'),
              },
              {
                label: 'H1',
                action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
                active: editor.isActive('heading', { level: 1 }),
              },
              {
                label: 'H2',
                action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
                active: editor.isActive('heading', { level: 2 }),
              },
            ].map(({ label, action, active }) => (
              <button
                key={label}
                onClick={action}
                className={clsx(
                  'px-3 py-1 rounded-xl text-white font-medium transition-all duration-300 relative overflow-hidden',
                  active
                    ? 'bg-gradient-to-r from-neon-blue to-neon-purple shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                    : 'bg-gray-800/50 hover:bg-gray-700/70 hover:shadow-[0_0_10px_rgba(0,240,255,0.3)]',
                )}
              >
                <span
                  className={clsx(
                    'absolute inset-0 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 opacity-0 transition-opacity duration-300',
                    active ? 'opacity-100' : 'hover:opacity-100',
                  )}
                ></span>
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="border border-neon-blue/30 rounded-xl shadow-[0_0_10px_rgba(0,240,255,0.3)] p-4 bg-gray-900 min-h-[200px]">
            <EditorContent editor={editor} className="prose prose-invert max-w-none text-white" />
          </div>

          {/* Save Button */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSave}
              disabled={saving || content === original}
              className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.5)] hover:shadow-[0_0_25px_rgba(0,240,255,0.8)] disabled:opacity-50 transition-all duration-300 relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center justify-center">
                {saving && (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Quest! 💾'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Sidebar */}
      <div
        className={clsx(
          'absolute right-0 top-0 bottom-0 w-96 bg-gray-900/95 backdrop-blur-lg border-l border-white/20 shadow-2xl transition-all duration-300 z-20',
          aiOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-neon-blue">Study AI Assistant</h2>
            <button
              onClick={() => setAiOpen(false)}
              className="text-white/50 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 mb-4 overflow-y-auto space-y-4">
            {chatHistory.length === 0 && !aiLoading && (
              <div className="text-center text-white/50 p-4">
                Ask questions about your study material
              </div>
            )}
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={clsx(
                  'p-3 rounded-lg max-w-[90%] transition-opacity duration-300',
                  message.role === 'user'
                    ? 'bg-neon-blue/10 border border-neon-blue/20 ml-auto'
                    : 'bg-gray-800/70 border border-gray-700 mr-auto',
                )}
              >
                <p className="text-white whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
            {aiLoading && (
              <div className="p-3 bg-gray-800/50 rounded-lg max-w-[90%] mr-auto">
                <div className="flex items-center space-x-2 text-white">
                  <div className="w-2 h-2 rounded-full animate-pulse bg-neon-blue" />
                  <div className="w-2 h-2 rounded-full animate-pulse bg-neon-blue delay-100" />
                  <div className="w-2 h-2 rounded-full animate-pulse bg-neon-blue delay-200" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="mt-auto">
            {aiError && <div className="text-neon-red mb-2 text-sm">{aiError}</div>}
            <div className="relative">
              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAI();
                  }
                }}
                placeholder="Ask about this document..."
                className="w-full p-3 pr-12 bg-gray-800/50 border border-neon-blue/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 resize-none"
                rows={3}
                disabled={aiLoading}
              />
              <button
                onClick={handleAI}
                disabled={aiLoading || !aiQuery.trim()}
                className="absolute right-2 bottom-2 p-1 bg-neon-blue/80 hover:bg-neon-blue rounded-md disabled:opacity-50 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Toggle Button */}
      <button
        onClick={() => setAiOpen(!aiOpen)}
        className={clsx(
          'fixed bg-gradient-to-r from-neon-blue to-neon-purple text-white p-4 rounded-full shadow-lg shadow-neon-blue/30 z-30 transition-all duration-300',
          aiOpen ? 'right-[26rem] bottom-16' : 'right-16 bottom-16',
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>
    </div>
  );
}
