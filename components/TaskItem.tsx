import useTaskStore from '../store/taskStore'
import type { Task } from '../store/taskStore'

export default function TaskItem({ task }: { task: Task }) {
  const toggle = useTaskStore(state => state.toggleTask);
  const remove = useTaskStore(state => state.deleteTask);

  return (
    <div className="flex items-center justify-between bg-purple-100 dark:bg-purple-900 p-4 rounded-lg shadow-md border border-purple-300 dark:border-purple-700">
      {/* Task content */}
      <div className="flex-1">
        <p className={`font-semibold mb-1 ${task.completed ? 'line-through text-purple-400' : 'text-purple-900 dark:text-purple-100'}`}>
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
        {/* ✅ Complete/Undo Button */}
        <button
          onClick={() => toggle(task.id)}
          className={`px-3 py-1 text-sm rounded-md transition font-semibold ${
            task.completed
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {task.completed ? 'Undo' : 'Complete'}
        </button>

        {/* ❌ Delete Button */}
        <button
          onClick={() => remove(task.id)}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition font-semibold"
          title="Delete"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
