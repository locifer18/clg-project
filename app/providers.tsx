"use client";

import QueryProvider from "@/components/(common)/QueryProvider";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: any) {
  return (
    <SessionProvider>
      <QueryProvider>{children}</QueryProvider>
    </SessionProvider>
  );
}