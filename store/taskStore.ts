import { create } from 'zustand';

export type Task = {
  id: string;
  title: string;
  description: string;
  completed?: boolean; // added this for toggle support
};

interface TaskStore {
  tasks: Task[];
  addTask: (title: string, description: string) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  clearTasks: () => void;
}

const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  addTask: (title, description) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          id: Date.now().toString(),
          title,
          description,
          completed: false,
        },
      ],
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    })),
  clearTasks: () => set(() => ({ tasks: [] })),
}));

export default useTaskStore;
