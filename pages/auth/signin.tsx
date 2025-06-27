import { getProviders, signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import type { GetServerSideProps } from "next";
import type { ClientSafeProvider } from "next-auth/react";

interface SignInProps {
  providers: Record<string, ClientSafeProvider>;
}

export default function SignIn({ providers }: SignInProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-purple-700">
          Welcome Back
        </h2>

        {/* Email/Password Login */}
        <form onSubmit={handleSubmit} className="space-y-3">
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
            className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 font-semibold"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Google Login */}
        {providers?.google && (
          <>
            <hr className="my-4" />
            <div className="text-center">
              <button
                onClick={() => signIn("google")}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Sign in with Google
              </button>
            </div>
          </>
        )}

        {/* Link to Register */}
        <p className="text-center text-sm text-gray-600 pt-4">
          New user?{" "}
          <Link href="/auth/register" className="text-purple-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const providers = await getProviders();
  return {
    props: { providers },
  };
};
