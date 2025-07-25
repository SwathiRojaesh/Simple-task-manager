import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

interface User { id: string; name: string | null; email: string; }

export default function AssignPage() {
  const { status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [deadline, setDeadline] = useState('');
  const [aiKeyword, setAiKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchUsers = async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/users');
          if (!res.ok) throw new Error('Failed to fetch users.');
          const data = await res.json();
          setUsers(data);
        } catch (error) {
          toast.error((error as Error).message);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [status]);

  const handleGetAiSuggestions = async () => {
    if (!aiKeyword.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/suggest-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: aiKeyword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      const suggestions = await res.json();
      if (suggestions.length > 0) {
        setTaskTitle(suggestions[0]);
        if (suggestions.length > 1) {
          setTaskDescription(suggestions.slice(1, 3).join('\n'));
        }
        toast.success('AI suggestion populated!');
      } else {
        toast.error('AI returned no suggestions.');
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return toast.error('Task title is required.');
    if (selectedUserIds.length === 0) return toast.error('Please select at least one user.');

    setIsSubmitting(true);
    const toastId = toast.loading('Assigning task...');
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          assignedToUserIds: selectedUserIds,
          deadline: deadline || null,
        }),
      });
      toast.success('Task assigned!', { id: toastId });
      router.push('/task');
    } catch (error) {
      toast.error((error as Error).message, { id: toastId });
      setIsSubmitting(false);
    }
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <button onClick={() => router.push('/task')} className="text-indigo-600 font-semibold hover:text-indigo-800 transition mb-4">
            &larr; Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Assign a New Task</h1>
          <p className="text-gray-500 mt-1">Create a task and assign it to one or more users.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleAssignTask} className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
            <div>
              <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input id="taskTitle" type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g., Prepare quarterly report"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea id="taskDescription" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder="Add more details..." rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">Deadline (Optional)</label>
              <input id="deadline" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white p-3 rounded-md font-semibold hover:bg-indigo-700 transition text-base disabled:opacity-50">
              {isSubmitting ? 'Assigning...' : 'Assign Task'}
            </button>
          </form>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Generate with AI</h3>
              <div className="flex gap-2">
                <input type="text" value={aiKeyword} onChange={(e) => setAiKeyword(e.target.value)} placeholder="Keyword..."
                  className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button type="button" onClick={handleGetAiSuggestions} disabled={isAiLoading} className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 transition disabled:opacity-50">
                  {isAiLoading ? '...' : 'Go'}
                </button>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Assign To:</h3>
              {loading ? <p className="text-gray-500">Loading users...</p> : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                  {users.length > 0 ? users.map(user => (
                    <label key={user.id} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                      <input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={() => handleUserSelection(user.id)}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </label>
                  )) : <p className="text-gray-500">No other users found.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}