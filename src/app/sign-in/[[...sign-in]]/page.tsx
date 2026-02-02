"use client";

import { SignIn } from "@clerk/clerk-react";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
            card: "bg-gray-900 border border-gray-800",
          }
        }}
      />
    </div>
  );
}
