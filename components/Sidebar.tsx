// components/Sidebar.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Project {
  id: string;
  name: string;
}

export default function Sidebar() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });

    if (res.ok) {
      setNewName("");
      fetchProjects();
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <aside className="w-full sm:w-64 bg-white dark:bg-zinc-900 p-4 border-r border-gray-300 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-purple-700 dark:text-purple-300">Projects</h2>

      <form onSubmit={handleCreateProject} className="mb-6">
        <input
          type="text"
          placeholder="New project name"
          className="w-full p-2 mb-2 border rounded text-black"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </form>

      <ul className="space-y-2">
        {projects.map((project) => (
          <li key={project.id}>
            <button
              onClick={() => router.push(`/?projectId=${project.id}`)}
              className={`w-full text-left px-3 py-2 rounded ${
                router.query.projectId === project.id
                  ? "bg-purple-200 dark:bg-purple-600 text-black dark:text-white"
                  : "hover:bg-purple-100 dark:hover:bg-purple-700"
              }`}
            >
              {project.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
