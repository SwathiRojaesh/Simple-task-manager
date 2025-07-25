'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function TaskInput() {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return alert('Task title is required.');
    if (!session?.user?.email) return alert('You must be logged in.');

    setLoading(true);
    try {
      const res = await fetch('/api/tasks/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: desc,
          userEmail: session.user.email,
        }),
      });

      if (!res.ok) throw new Error('Failed to add task');
      setTitle('');
      setDesc('');
      router.refresh(); // Re-fetch tasks after adding
    } catch (err) {
      console.error(err);
      alert('Error adding task. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAddTask} className="space-y-2">
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black dark:text-white dark:bg-gray-800"
      />
      <input
        type="text"
        placeholder="Optional description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="w-full p-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black dark:text-white dark:bg-gray-800"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white font-semibold py-2 rounded-md hover:bg-purple-700 transition disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  );
}
