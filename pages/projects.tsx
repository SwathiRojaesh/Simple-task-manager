// pages/projects.tsx
import Head from "next/head";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
}

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/auth/signin");
    else fetchProjects();
  }, [session, status]);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      setName("");
      setDescription("");
      fetchProjects();
    }
  };

  const deleteProject = async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchProjects();
  };

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
    setEditDesc(project.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDesc("");
  };

  const submitEdit = async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc }),
    });
    if (res.ok) {
      cancelEdit();
      fetchProjects();
    }
  };

  if (status === "loading") {
    return <p className="text-center mt-8">Loading...</p>;
  }

  return (
    <>
      <Head>
        <title>Projects</title>
      </Head>

      <main className="min-h-screen px-4 py-8 bg-gray-100 text-gray-900">
        <div className="max-w-xl mx-auto bg-white p-6 rounded shadow space-y-6">
          <h1 className="text-3xl font-bold text-center text-blue-700">Projects</h1>

          <div className="text-right">
            <p className="text-sm mb-1">Signed in as: {session?.user?.name}</p>
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Sign out
            </button>
          </div>

          {/* Add Project Form */}
          <form onSubmit={createProject} className="space-y-2">
            <input
              type="text"
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded text-black"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded text-black"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Create Project
            </button>
          </form>

          {/* Projects List */}
          <div className="space-y-2">
            {projects.length === 0 ? (
              <p className="text-center text-gray-500">No projects yet.</p>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="p-3 border rounded bg-blue-50 relative">
                  {editingId === project.id ? (
                    <>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full mb-2 p-2 border rounded text-black"
                      />
                      <input
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full mb-2 p-2 border rounded text-black"
                      />
                      <button
                        onClick={() => submitEdit(project.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-500 text-white px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-sm text-gray-700">{project.description}</p>
                      <div className="absolute top-2 right-2 space-x-2">
                        <button
                          onClick={() => startEdit(project)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
