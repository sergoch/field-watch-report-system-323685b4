
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex h-screen">
      <div className="hidden md:block w-64 bg-background border-r">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
