import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/api/register", {
        name,
        email,
        password,
      });

      if (res.status === 200) {
        alert("✅ Registration successful!");
        router.push("/auth/signin");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "❌ Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-md shadow-md space-y-4 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-purple-700">
          Register
        </h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 border border-gray-300 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border border-gray-300 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border border-gray-300 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-purple-600 text-white font-semibold p-2 rounded hover:bg-purple-700"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
