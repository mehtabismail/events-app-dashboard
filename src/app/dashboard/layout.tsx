"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  {
    name: "Overview",
    key: "overview",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    name: "Events",
    key: "events",
    icon: CalendarCheck2,
    href: "/dashboard/events",
  },
  { name: "Users", key: "users", icon: Users2, href: "/dashboard/users" },
  {
    name: "Event Planners",
    key: "eventPlanners",
    icon: UserCog,
    href: "/dashboard/event-planners",
  },
  {
    name: "Reports",
    key: "reports",
    icon: BarChart2,
    href: "/dashboard/reports",
  },
  { name: "Logout", key: "logout", icon: LogOut, href: null },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    window.location.href = "/";
  };

  const handleNavigation = (href: string | null) => {
    if (href === null) {
      handleLogout();
    } else {
      router.push(href);
    }
  };

  return (
    <div className='flex h-screen bg-gray-50 dark:bg-gray-900'>
      <aside className='w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 p-6'>
        <h2 className='text-xl font-bold mb-6 text-black dark:text-white'>
          Admin Menu
        </h2>
        <nav className='flex flex-col gap-2'>
          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.href)}
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
      <main className='flex-1 p-8'>{children}</main>
    </div>
  );
}
