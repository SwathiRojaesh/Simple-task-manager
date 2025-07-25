import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';

// --- Helper Icons ---
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

// --- Type Definitions ---
interface User { id: string; name: string | null; email: string; }
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdBy: User;
  assignedTo: User[];
  deadline: string | null;
}

export default function TaskPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'assignedToMe' | 'assignedByMe'>('assignedToMe');
  const [loading, setLoading] = useState(true);
  const [aiKeyword, setAiKeyword] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') fetchTasks();
  }, [status]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const toastId = toast.loading('Adding task...');
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle }),
      });
      setNewTaskTitle('');
      await fetchTasks();
      toast.success('Task added!', { id: toastId });
    } catch (error) {
      toast.error((error as Error).message, { id: toastId });
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!task.completed) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, zIndex: 9999 });
        toast.success('Task completed!');
      }
      await fetchTasks();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure?')) return;
    const toastId = toast.loading('Deleting task...');
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      toast.success('Task deleted.', { id: toastId });
      await fetchTasks();
    } catch (error) {
      toast.error((error as Error).message, { id: toastId });
    }
  };

  const handleGetAiSuggestions = async () => {
    if (!aiKeyword.trim()) return;
    setIsAiLoading(true);
    setAiSuggestions([]);
    setSelectedSuggestions([]);
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
      const data = await res.json();
      setAiSuggestions(data);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSuggestionCheckbox = (suggestion: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestion) 
        ? prev.filter(s => s !== suggestion)
        : (prev.length < 3 ? [...prev, suggestion] : (toast.error('Max 3 tasks.'), prev))
    );
  };

  const handleAddSelectedSuggestions = async () => {
    if (selectedSuggestions.length === 0) return;
    const toastId = toast.loading(`Adding ${selectedSuggestions.length} tasks...`);
    try {
      await Promise.all(selectedSuggestions.map(title => 
        fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        })
      ));
      toast.success('AI tasks added!', { id: toastId });
      setAiKeyword('');
      setAiSuggestions([]);
      setSelectedSuggestions([]);
      await fetchTasks();
    } catch (error) {
      toast.error('Failed to add selected tasks.', { id: toastId });
    }
  };

  const filteredTasks = tasks.filter(task => 
    filter === 'assignedToMe'
      ? task.assignedTo.some(user => user.email === session?.user?.email)
      : task.createdBy.email === session?.user?.email
  );

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Sidebar for Actions */}
      <aside className="w-full max-w-md p-8 bg-white/70 backdrop-blur-md border-r border-gray-200 flex flex-col">
        <header className="pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-purple-800">Task Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome, {session?.user?.name}</p>
        </header>
        
        <div className="mt-8 space-y-8 flex-grow">
          <div className="bg-white/80 p-5 rounded-lg shadow-sm border border-purple-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Add a Task</h3>
            <form onSubmit={handleAddTask}>
              <input
                type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter a new task..."
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <button type="submit" className="w-full mt-2 bg-purple-600 text-white p-2 rounded-md font-semibold hover:bg-purple-700 transition text-sm">
                Add Manually
              </button>
            </form>
          </div>
          
          <div className="bg-white/80 p-5 rounded-lg shadow-sm border border-purple-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Generate with AI</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text" value={aiKeyword} onChange={(e) => setAiKeyword(e.target.value)}
                placeholder="Keyword..."
                className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <button onClick={handleGetAiSuggestions} disabled={isAiLoading} className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 transition disabled:opacity-50 text-sm">
                {isAiLoading ? '...' : 'Go'}
              </button>
            </div>
            {aiSuggestions.length > 0 && (
              <div className="space-y-2">
                {aiSuggestions.map((s, i) => (
                  <label key={i} className="flex items-center gap-2 p-2 bg-purple-50 rounded-md text-sm">
                    <input
                      type="checkbox" checked={selectedSuggestions.includes(s)} onChange={() => handleSuggestionCheckbox(s)}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span>{s}</span>
                  </label>
                ))}
                <button onClick={handleAddSelectedSuggestions} className="w-full mt-2 bg-purple-600 text-white p-2 rounded-md font-semibold hover:bg-purple-700 transition text-sm">
                  Add Selected
                </button>
              </div>
            )}
          </div>

          <div className="pt-8">
            <button
              onClick={() => router.push('/assign')}
              className="w-full bg-blue-500 text-white px-4 py-2.5 rounded-md font-semibold text-sm hover:bg-blue-600 transition shadow-sm"
            >
              Assign Task to User
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area for Tasks */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-1 p-1 bg-white/80 backdrop-blur-sm rounded-lg border">
            <button onClick={() => setFilter('assignedToMe')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${filter === 'assignedToMe' ? 'bg-white text-purple-800 shadow-sm' : 'text-gray-600 hover:bg-white/60'}`}>
              Tasks Assigned To Me
            </button>
            <button onClick={() => setFilter('assignedByMe')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${filter === 'assignedByMe' ? 'bg-white text-purple-800 shadow-sm' : 'text-gray-600 hover:bg-white/60'}`}>
              Tasks Assigned By Me
            </button>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="bg-white text-gray-700 px-4 py-2 rounded-md font-semibold text-sm hover:bg-gray-50 transition border border-gray-300"
          >
            Sign Out
          </button>
        </div>
        
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <div key={task.id} className={`backdrop-blur-sm p-4 rounded-xl shadow-sm border flex items-center justify-between transition-all ${task.completed ? 'bg-gray-100/80 opacity-60' : 'bg-purple-50/70 border-purple-200'}`}>
                <div className="flex items-center gap-4">
                  <button onClick={() => handleToggleComplete(task)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-purple-500'}`}>
                    {task.completed && <span className="text-white text-xs">✔</span>}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>{task.title}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1.5"><UserIcon /> {filter === 'assignedToMe' ? task.createdBy.name : `To: ${task.assignedTo.map(u => u.name).join(', ')}`}</span>
                      {task.deadline && (
                        <span className={`flex items-center gap-1.5 ${new Date(task.deadline) < new Date() && !task.completed ? 'text-red-600 font-semibold' : ''}`}>
                          <CalendarIcon /> {format(new Date(task.deadline), 'MMM d, h:mm a')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDeleteTask(task.id)} className="text-gray-400 hover:text-red-500 transition p-2 rounded-full">
                  <TrashIcon />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-lg border">
              <p className="text-gray-600 font-medium">No tasks to show.</p>
              <p className="text-sm text-gray-400 mt-1">Try adding a task or switching filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}