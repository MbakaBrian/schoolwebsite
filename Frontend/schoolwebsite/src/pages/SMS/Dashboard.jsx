import React from "react";
import Sidebar from "../../components/layout/Sidebar";

import HeadTeacherDashboard from "./HeadteacherPages/HeadTeacherDashboard";

export default function DashboardLayout() {
  return (
    <div className="flex">
      <Sidebar role="headteacher" />
      <main className="flex-1 p-6 bg-gray-50">
        <HeadTeacherDashboard />
      </main>
    </div>
  );
}
