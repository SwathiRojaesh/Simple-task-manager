import { useState } from 'react'
import useTaskStore from '../store/taskStore'

export default function TaskInput() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const addTask = useTaskStore(state => state.addTask);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title, desc);
    setTitle('');
    setDesc('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder="Optional description"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        className="w-full p-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition"
      >
        Add Task
      </button>
    </form>
  );
}
