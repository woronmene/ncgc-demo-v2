"use client";
import { Suspense } from "react";
import CreateRecoveryPage from "./CreateRecoveryPage";

export default function RecoveryCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 flex justify-center">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      }
    >
      <CreateRecoveryPage />
    </Suspense>
  );
}
