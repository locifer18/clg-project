"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: any) {
  const { data, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !data?.success) {
      router.push("/login");
    }
  }, [isLoading, data]);

  if (isLoading) return <div>Loading...</div>;

  return children;
}