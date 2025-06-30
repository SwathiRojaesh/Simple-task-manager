import Head from "next/head";
import { useSession, signOut } from "next-auth/react";
import TaskInput from "@/components/TaskInput";
import TaskItem from "@/components/TaskItem";
import useTaskStore from "@/store/taskStore";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const tasks = useTaskStore(state => state.tasks);
  const clearTasks = useTaskStore(state => state.clearTasks); // ✅ GET clearTasks

  // ✅ Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // ✅ Handle Zustand + NextAuth logout
  const handleSignOut = () => {
    clearTasks();         // ✅ CLEAR Zustand state
    signOut();            // ✅ SIGN OUT of NextAuth (redirects by default)
  };

  // Optional: show a loading state
  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-700">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Task Manager</title>
      </Head>

      <main className="min-h-screen px-4 py-8 bg-purple-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="max-w-xl mx-auto space-y-6 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center text-purple-700 dark:text-purple-300">
            Task Manager
          </h1>

          {session && (
            <>
              <div className="text-right">
                <p className="text-sm mb-1">
                  Signed in as: <strong>{session.user?.name}</strong>
                </p>
                <button
                  onClick={handleSignOut} // ✅ USE the custom handler
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  Sign out
                </button>
              </div>

              <TaskInput />
              <div className="space-y-2">
                {tasks.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-300">
                    No tasks yet. Add one!
                  </p>
                ) : (
                  tasks.map(task => <TaskItem key={task.id} task={task} />)
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
