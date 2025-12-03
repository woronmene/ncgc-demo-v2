"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 300); // slight delay for smoother UX

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      {/* Spinner */}
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-emerald-600"></div>
    </div>
  );
}
