import { Loader2 } from "lucide-react";

export default function Loading() {
  // This component will be shown automatically by Next.js
  // while the content of a server-rendered page is loading.
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-indigo-700" />
    </div>
  );
}
