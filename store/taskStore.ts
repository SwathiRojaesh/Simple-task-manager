import { create } from 'zustand'

export type Task = {
  id: number
  title: string
  description?: string
  completed: boolean
}

type TaskStore = {
  tasks: Task[]
  addTask: (title: string, description?: string) => void
  toggleTask: (id: number) => void
  deleteTask: (id: number) => void
}

const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  addTask: (title, description = '') =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          id: Date.now(),
          title,
          description,
          completed: false,
        },
      ],
    })),
  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
}))

export default useTaskStore
