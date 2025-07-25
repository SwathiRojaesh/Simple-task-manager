import { getProviders, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import type { ClientSafeProvider } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

interface SignInProps {
  providers: Record<string, ClientSafeProvider> | null;
}

export default function SignIn({ providers }: SignInProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (router.query.error) {
      setError("Sign in failed. Please check your credentials and try again.");
    }
  }, [router.query]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/task",
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else if (result?.ok) {
      router.push("/task");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100 bg-cover bg-center" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/flowers.png')"}}>
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6 border border-purple-200">
        <h2 className="text-3xl font-bold text-center text-purple-800">
          Welcome Back
        </h2>
        
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 font-semibold transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="relative flex items-center">
            <div className="flex-grow border-t border-purple-200"></div>
            <span className="flex-shrink mx-4 text-purple-600 text-sm">OR</span>
            <div className="flex-grow border-t border-purple-200"></div>
        </div>

        <div className="space-y-3">
          {providers &&
            Object.values(providers).map((provider) =>
              provider.id !== "credentials" ? (
                <button
                  key={provider.id}
                  onClick={() => signIn(provider.id, { callbackUrl: "/task" })}
                  className="w-full bg-white border border-purple-300 text-purple-700 p-3 rounded-lg hover:bg-purple-50 transition flex items-center justify-center gap-2"
                >
                  Sign in with {provider.name}
                </button>
              ) : null
            )}
        </div>

        <p className="text-center text-sm text-gray-600 pt-4">
          New here?{" "}
          <Link href="/auth/register" className="font-semibold text-purple-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const providers = await getProviders();
  return { props: { providers } };
};
