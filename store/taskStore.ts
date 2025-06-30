import { create } from 'zustand';

interface Task {
  id: string;
  title: string;
  description: string;
}

interface TaskStore {
  tasks: Task[];
  addTask: (title: string, description: string) => void;
  removeTask: (id: string) => void;
  clearTasks: () => void; // ✅ add this
}

const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  addTask: (title, description) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          id: Date.now().toString(), // or use uuid
          title,
          description,
        },
      ],
    })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  clearTasks: () =>
    set(() => ({
      tasks: [],
    })),
}));

export default useTaskStore;
