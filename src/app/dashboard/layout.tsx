"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import {
  LayoutDashboard,
  CalendarCheck2,
  Users2,
  UserCog,
  BarChart2,
  LogOut,
} from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { logout } from "@/components/useLogout";

const menu = [
  { name: "Overview", key: "overview", icon: LayoutDashboard },
  { name: "Events", key: "events", icon: CalendarCheck2 },
  { name: "Users", key: "users", icon: Users2 },
  { name: "Event Planners", key: "eventPlanners", icon: UserCog },
  { name: "Reports", key: "reports", icon: BarChart2 },
  { name: "Logout", key: "logout", icon: LogOut },
];

export default function DashboardLayout() {
  const [selected, setSelected] = useState("overview");

  function renderContent() {
    switch (selected) {
      case "overview":
        return (
          <div>
            <h1 className='text-3xl font-bold mb-6'>
              Admin Dashboard Overview
            </h1>
            {/* Add dashboard widgets/overview here */}
          </div>
        );
      case "events":
        return (
          <div>
            <h1 className='text-2xl font-bold mb-6'>Events</h1>
            {/* Events management UI here */}
          </div>
        );
      case "users":
        return (
          <div>
            <h1 className='text-2xl font-bold mb-6'>Users</h1>
            {/* Users management UI here */}
          </div>
        );
      case "eventPlanners":
        return (
          <div>
            <h1 className='text-2xl font-bold mb-6'>Event Planners</h1>
            {/* Event planners management UI here */}
          </div>
        );
      case "reports":
        return (
          <div>
            <h1 className='text-2xl font-bold mb-6'>Reports</h1>
            {/* Reports UI here */}
          </div>
        );
      case "logout":
        // Call logout API and redirect to splash
        (async () => {
          await logout();
          window.location.href = "/";
        })();
        return (
          <div>
            <h1 className='text-2xl font-bold mb-6'>Logging out...</h1>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className='flex min-h-screen bg-gray-50 dark:bg-black'>
      <ThemeSwitcher />
      <aside className='w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 p-6 flex flex-col gap-4 shadow-lg'>
        <h2 className='text-xl font-bold mb-6 text-black dark:text-white'>
          Admin Menu
        </h2>
        <nav className='flex flex-col gap-2'>
          {menu.map((item) => {
            const Icon = item.icon;
            const active = selected === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSelected(item.key)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded font-medium transition-colors w-full text-left",
                  "hover:bg-gray-100 dark:hover:bg-zinc-800 text-black dark:text-white",
                  active &&
                    "bg-gray-200 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold"
                )}
              >
                <Icon size={20} className='shrink-0' />
                {item.name}
              </button>
            );
          })}
        </nav>
      </aside>
      <main className='flex-1 p-8'>{renderContent()}</main>
    </div>
  );
}
