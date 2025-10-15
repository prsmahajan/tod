// app/layout.tsx
import "./globals.css";
import { Suspense } from "react";

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function RootLayout({ children }: { children: React.ReactNode }) {
  await delay(2000); // Artificial 2 sec delay
  return (
    <main lang="en">
      <div>
        <Suspense fallback={<GlobalSkeleton />}>{children}</Suspense>
      </div>
    </main>
  );
}

function GlobalSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Preparing your experience...</p>
    </div>
  );
}

export default RootLayout;
