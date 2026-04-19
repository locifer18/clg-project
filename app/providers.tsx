"use client";

import QueryProvider from "@/components/(common)/QueryProvider";
import { Toaster } from "sonner";

export default function Providers({ children }: any) {
  return (
    <QueryProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryProvider>
  );
}