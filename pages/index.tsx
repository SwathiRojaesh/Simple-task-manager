import TaskInput from '../components/TaskInput'
import TaskItem from '../components/TaskItem'
import useTaskStore from '../store/taskStore'
import type { Task } from '../store/taskStore'

export default function Home() {
  const tasks = useTaskStore(state => state.tasks);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">📝 Task Manager</h1>

        <TaskInput />

        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-sm text-center text-gray-500">No tasks yet. Add one!</p>
          ) : (
            tasks.map((task: Task) => (
              <TaskItem key={task.id} task={task} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
