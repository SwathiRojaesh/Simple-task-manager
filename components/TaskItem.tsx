'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
};

export default function TaskItem({ task }: { task: Task }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleTask = async () => {
    setLoading(true);
    try {
      await fetch(`/api/tasks/toggle?id=${task.id}`, { method: 'PATCH' });
      router.refresh();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setLoading(true);
    try {
      await fetch(`/api/tasks/delete?id=${task.id}`, { method: 'DELETE' });
      router.refresh();
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between bg-purple-100 dark:bg-purple-900 p-4 rounded-lg shadow-md border border-purple-300 dark:border-purple-700">
      {/* Task content */}
      <div className="flex-1">
        <p
          className={`font-semibold mb-1 ${
            task.completed
              ? 'line-through text-purple-400'
              : 'text-purple-900 dark:text-purple-100'
          }`}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-purple-700 dark:text-purple-300">
            {task.description}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex space-x-2 ml-4">
        <button
          onClick={toggleTask}
          disabled={loading}
          className={`px-3 py-1 text-sm rounded-md transition font-semibold ${
            task.completed
              ? 'bg-yellow-500 hover:bg-yellow-600'
              : 'bg-purple-600 hover:bg-purple-700'
          } text-white`}
        >
          {task.completed ? 'Undo' : 'Complete'}
        </button>

        <button
          onClick={deleteTask}
          disabled={loading}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition font-semibold"
          title="Delete"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
