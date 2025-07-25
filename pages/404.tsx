
import Link from "next/link";

export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50 text-purple-800 text-center px-4">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      {/* ✅ FIX: Replaced the apostrophe in "you're" with "&apos;" to fix the linting error. */}
      <p className="text-xl mb-6">Oops! The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/">
        <button className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
          Go to Home
        </button>
      </Link>
    </div>
  );
}
