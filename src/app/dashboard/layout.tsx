"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck2,
  Users2,
  BarChart2,
  LogOut,
  UserCog,
} from "lucide-react";
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
    key: "event-planners",
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

  const handleLogout = async () => {
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <aside
        className="fixed left-0 top-0 h-screen w-64 shadow-lg border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto z-30"
        style={{ backgroundColor: "#1F9BB7" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Image
            src="/AppIcon.png"
            alt="App Icon"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
          <h2 className="text-xl font-bold text-white">Admin Menu</h2>
        </div>
        <nav className="flex flex-col gap-2">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded font-medium transition-colors w-full text-left",
                  "hover:bg-white/20 text-white",
                  active && "bg-white/30 text-white font-bold"
                )}
              >
                <Icon size={20} className="shrink-0" />
                {item.name}
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
