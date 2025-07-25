import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated") {
      router.replace("/task");
    } else {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50">
      <p className="text-purple-700">Loading...</p>
    </div>
  );
}