"use client";

import DashboardPage from "./DashboardPage";
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <div className="">
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardPage />
      </Suspense>
    </div>
  );
}
