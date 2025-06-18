"use client";

import AppLayout from "@/app/components/AppLayout";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [username, setUsername] = useState("user");

  useEffect(() => {
    async function fetchUsername() {
      try {
        const email = session?.user?.email;
        if (!email) return;

        const res = await fetch(`/api/getUsername?email=${encodeURIComponent(email)}`);
        const json = await res.json();
        setUsername(json.username || "user");
      } catch {
        setUsername("user");
      }
    }

    fetchUsername();
  }, [session]);

  const handleGoHome = () => {
    router.push(`/homepage/${username}`);
  };

  return (
    <AppLayout>
      <main className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShieldAlert className="w-16 h-16 text-[#0078C3] mb-4" />
        <h1 className="text-3xl font-bold text-[#0078C3] mb-2">Access Denied</h1>
        <p className="text-gray-600 text-md mb-6">
          You do not have permission to view this page.
        </p>
        <button
          onClick={handleGoHome}
          className="px-5 py-2 rounded-md text-white font-medium shadow hover:bg-[#006bb0] transition bg-[#0078C3]"
        >
          Go to Homepage
        </button>
      </main>
    </AppLayout>
  );
}
