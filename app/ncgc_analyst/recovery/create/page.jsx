import { Suspense } from "react";
import CreateRecoveryPage from "./CreateRecoveryPage";

export default function RecoveryCreatePage() {
  return (
    <Suspense fallback={<div>Loading recovery create page...</div>}>
      <CreateRecoveryPage />
    </Suspense>
  );
}
