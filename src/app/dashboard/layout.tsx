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
import DashboardEvents from "./events/page";

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
  const [loggingOut, setLoggingOut] = useState(false);

  React.useEffect(() => {
    if (selected === "logout" && !loggingOut) {
      setLoggingOut(true);
      (async () => {
        await logout();
        window.location.href = "/";
      })();
    } else if (selected !== "logout" && loggingOut) {
      setLoggingOut(false);
    }
  }, [selected, loggingOut]);

  function renderContent() {
    switch (selected) {
      case "overview":
        return (
          <div className='w-full'>
            <div className='max-w-7xl mx-auto'>
              <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-2'>
                Dashboard Overview
              </h1>
              <p className='text-gray-500 dark:text-gray-300 mb-8'>
                Welcome to your events management dashboard
              </p>

              {/* Quick Stats Cards */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-200'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-600'>
                        Total Events
                      </p>
                      <p className='text-3xl font-bold text-gray-900'>0</p>
                    </div>
                    <div className='p-3 bg-blue-100 rounded-full'>
                      <CalendarCheck2 className='w-6 h-6 text-blue-600' />
                    </div>
                  </div>
                </div>

                <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-200'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-600'>
                        Active Users
                      </p>
                      <p className='text-3xl font-bold text-gray-900'>0</p>
                    </div>
                    <div className='p-3 bg-green-100 rounded-full'>
                      <Users2 className='w-6 h-6 text-green-600' />
                    </div>
                  </div>
                </div>

                <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-200'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-600'>
                        Event Planners
                      </p>
                      <p className='text-3xl font-bold text-gray-900'>0</p>
                    </div>
                    <div className='p-3 bg-purple-100 rounded-full'>
                      <UserCog className='w-6 h-6 text-purple-600' />
                    </div>
                  </div>
                </div>

                <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-200'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-600'>
                        Reports
                      </p>
                      <p className='text-3xl font-bold text-gray-900'>0</p>
                    </div>
                    <div className='p-3 bg-orange-100 rounded-full'>
                      <BarChart2 className='w-6 h-6 text-orange-600' />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-200'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Quick Actions
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  <button
                    onClick={() => setSelected("events")}
                    className='p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    <CalendarCheck2 className='w-8 h-8 text-blue-600 mb-2' />
                    <h3 className='font-medium text-gray-900'>Manage Events</h3>
                    <p className='text-sm text-gray-600'>
                      View and manage all events
                    </p>
                  </button>

                  <button
                    onClick={() => setSelected("users")}
                    className='p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    <Users2 className='w-8 h-8 text-green-600 mb-2' />
                    <h3 className='font-medium text-gray-900'>Manage Users</h3>
                    <p className='text-sm text-gray-600'>
                      View and manage users
                    </p>
                  </button>

                  <button
                    onClick={() => setSelected("eventPlanners")}
                    className='p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    <UserCog className='w-8 h-8 text-purple-600 mb-2' />
                    <h3 className='font-medium text-gray-900'>
                      Event Planners
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Manage event planners
                    </p>
                  </button>

                  <button
                    onClick={() => setSelected("reports")}
                    className='p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    <BarChart2 className='w-8 h-8 text-orange-600 mb-2' />
                    <h3 className='font-medium text-gray-900'>View Reports</h3>
                    <p className='text-sm text-gray-600'>
                      Access analytics and reports
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case "events":
        return <DashboardEvents />;
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
