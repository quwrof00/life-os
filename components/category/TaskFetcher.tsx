'use client';

import { useEffect, useState, useCallback } from 'react';
import { Message } from '@prisma/client';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import { debounce } from 'lodash';
import DeleteButton from '../DeleteButton';

interface TaskDetails {
  messageId: string;
  deadline: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  labels: string[];
}

const calculateDaysRemaining = (deadline: string | null) => {
  if (!deadline) return null;

  const deadlineDate = new Date(deadline);
  const currentDate = new Date();
  
  currentDate.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffMs = deadlineDate.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export default function TaskFetcher() {
  const [tasks, setTasks] = useState<Message[]>([]);
  const [taskDetails, setTaskDetails] = useState<Record<string, TaskDetails>>({});
  const [labelInputs, setLabelInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/messages/get?type=TASK');
        const data = await res.json();
        if (data.success) {
          const validTasks = (data.messages || []).filter((msg: Message) => typeof msg.id === 'string');
          setTasks(validTasks);

          const detailsEntries = await Promise.all(
            validTasks.map(async (task: Message) => {
              try {
                const res = await fetch(`/api/task/${task.id}`);
                const data = await res.json();
                if (data.success) {
                  return [
                    task.id,
                    {
                      messageId: task.id,
                      deadline: data.task?.deadline
                        ? new Date(data.task.deadline).toISOString().split('T')[0]
                        : null,
                      priority: data.task?.priority || null,
                      labels: data.task?.labels || [],
                    },
                  ];
                }
              } catch {
                console.warn(`Failed to fetch details for task ${task.id}`);
              }
              return [task.id, null];
            })
          );

          const details = Object.fromEntries(detailsEntries.filter(([, v]) => v));
          const labels = Object.fromEntries(
            Object.entries(details).map(([id, d]) => [id, d?.labels.join(', ') || ''])
          );
          setTaskDetails(details);
          setLabelInputs(labels);
        } else {
          setError(data.error || 'Failed to fetch tasks');
        }
      } catch {
        setError('Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const toggleComplete = async (id: string, completed: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));
    try {
      await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
    } catch {
      setError('Failed to update task');
    }
  };

  const debouncedSaveLabels = useCallback(
    debounce((messageId: string, labels: string[]) => {
      handleTaskUpdate(messageId, 'labels', labels);
    }, 1000),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSaveLabels.cancel();
    };
  }, [debouncedSaveLabels]);

  const handleTaskUpdate = async (
    messageId: string, 
    field: 'deadline' | 'priority' | 'labels', 
    value: string | string[] | null
  ) => {
    setSaving(messageId);
    setSaveError((prev) => ({ ...prev, [messageId]: '' }));
    
    try {
      const payload = field === 'deadline' && value instanceof Date 
        ? { [field]: value.toISOString() } 
        : { [field]: value };

      const res = await fetch(`/api/task/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setTaskDetails((prev) => ({
          ...prev,
          [messageId]: {
            ...prev[messageId],
            [field]: value,
          },
        }));
      }
    } catch {
      setSaveError((prev) => ({ ...prev, [messageId]: 'Failed to save' }));
    } finally {
      setSaving(null);
    }
  };

  const handleLabelChange = (messageId: string, value: string) => {
    setLabelInputs((prev) => ({ ...prev, [messageId]: value }));
    const labels = value
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l);
    debouncedSaveLabels(messageId, labels);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 flex items-center justify-center p-6">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
      >
        <h1 className="text-3xl font-extrabold text-white mb-6 text-center drop-shadow-lg">
          📝 Quest Tasks ⚔️
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
        ) : tasks.length === 0 ? (
          <p className="text-gray-400 text-center font-medium">
            No quests yet. Start your adventure! 🚀
          </p>
        ) : (
        <ul className="space-y-4">
  {tasks.map((task) => {
    const daysLeft = calculateDaysRemaining(taskDetails[task.id]?.deadline);

    return (
      <motion.li
        key={task.id}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={clsx(
          "flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-xl shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all duration-300 relative overflow-hidden",
          task.completed 
            ? "bg-gray-700/50 border-gray-500" 
            : daysLeft === null 
              ? "bg-gray-800/50 border-neon-blue/30"
              : daysLeft < 0 
                ? "bg-red-900/30 border-red-500"
                : daysLeft <= 3 
                  ? "bg-yellow-900/30 border-yellow-500"
                  : "bg-gray-800/50 border-neon-blue/30"
        )}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
        {/* Delete Button */}
        <DeleteButton
          messageId={task.id}
          className="absolute top-2 right-2 z-20"
        />
        <div className="flex items-center space-x-4 flex-1 pr-10 sm:pr-12">
          <motion.input
            type="checkbox"
            checked={!!task.completed}
            onChange={() => toggleComplete(task.id, !!task.completed)}
            className="w-6 h-6 rounded-full border-neon-blue text-neon-blue focus:ring-neon-blue/50 cursor-pointer relative z-10"
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          />
          <span
            className={clsx(
              'text-white font-medium relative z-10 flex-1',
              task.completed ? 'line-through text-gray-400' : 'text-neon-blue'
            )}
          >
            {task.content}
            {taskDetails[task.id]?.deadline && (
              <span className="ml-2 text-xs font-normal">
                {task.completed ? (
                  <span className="text-green-400">✓ Completed</span>
                ) : daysLeft === null ? null : daysLeft < 0 ? (
                  <span className="text-red-400">⚠️ Failed ({Math.abs(daysLeft)} days ago)</span>
                ) : (
                  <span className="text-yellow-300">⏳ {daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
                )}
              </span>
            )}
          </span>
        </div>
        {taskDetails[task.id] && (
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center pr-10 sm:pr-12">
            <motion.div
              className="relative z-10"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            >
              <input
                type="date"
                value={taskDetails[task.id].deadline || ''}
                onChange={(e) =>
                  handleTaskUpdate(task.id, 'deadline', e.target.value)
                }
                className="p-2 bg-gray-900/50 border border-neon-blue/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
              />
            </motion.div>
            <motion.div
              className="relative z-10"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            >
              <select
                value={taskDetails[task.id].priority || ''}
                onChange={(e) =>
                  handleTaskUpdate(task.id, 'priority', e.target.value)
                }
                className="p-2 bg-gray-900/50 border border-neon-blue/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
              >
                <option value="" disabled>
                  Select Priority
                </option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </motion.div>
            <motion.div
              className="relative z-10"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            >
              <input
                type="text"
                value={labelInputs[task.id] || ''}
                onChange={(e) => handleLabelChange(task.id, e.target.value)}
                placeholder="Enter labels (comma-separated)"
                className="p-2 bg-gray-900/50 border border-neon-blue/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-neon-blue/50 w-full sm:w-40"
              />
            </motion.div>
          </div>
        )}
        {saveError[task.id] && (
          <p className="text-neon-red text-sm mt-2 relative z-10">
            {saveError[task.id]}
          </p>
        )}
        {saving === task.id && (
          <p className="text-neon-blue text-sm mt-2 relative z-10 animate-pulse">
            Saving…
          </p>
        )}
      </motion.li>
    );
  })}
</ul> )}
      </motion.div>
    </div>
  );
}