"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck2,
  Users2,
  UserCog,
  BarChart2,
} from "lucide-react";

export default function DashboardOverview() {
  const router = useRouter();

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
          <div className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                  Total Events
                </p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white'>
                  0
                </p>
              </div>
              <div className='p-3 bg-blue-100 dark:bg-blue-900 rounded-full'>
                <CalendarCheck2 className='w-6 h-6 text-blue-600 dark:text-blue-400' />
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                  Active Users
                </p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white'>
                  0
                </p>
              </div>
              <div className='p-3 bg-green-100 dark:bg-green-900 rounded-full'>
                <Users2 className='w-6 h-6 text-green-600 dark:text-green-400' />
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                  Event Planners
                </p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white'>
                  0
                </p>
              </div>
              <div className='p-3 bg-purple-100 dark:bg-purple-900 rounded-full'>
                <UserCog className='w-6 h-6 text-purple-600 dark:text-purple-400' />
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                  Reports
                </p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white'>
                  0
                </p>
              </div>
              <div className='p-3 bg-orange-100 dark:bg-orange-900 rounded-full'>
                <BarChart2 className='w-6 h-6 text-orange-600 dark:text-orange-400' />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
            Quick Actions
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <button
              onClick={() => router.push("/dashboard/events")}
              className='p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
            >
              <CalendarCheck2 className='w-8 h-8 text-blue-600 dark:text-blue-400 mb-2' />
              <h3 className='font-medium text-gray-900 dark:text-white'>
                Manage Events
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                View and manage all events
              </p>
            </button>

            <button
              onClick={() => router.push("/dashboard/users")}
              className='p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
            >
              <Users2 className='w-8 h-8 text-green-600 dark:text-green-400 mb-2' />
              <h3 className='font-medium text-gray-900 dark:text-white'>
                Manage Users
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                View and manage users
              </p>
            </button>

            <button
              onClick={() => router.push("/dashboard/event-planners")}
              className='p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
            >
              <UserCog className='w-8 h-8 text-purple-600 dark:text-purple-400 mb-2' />
              <h3 className='font-medium text-gray-900 dark:text-white'>
                Event Planners
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                Manage event planners
              </p>
            </button>

            <button
              onClick={() => router.push("/dashboard/reports")}
              className='p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
            >
              <BarChart2 className='w-8 h-8 text-orange-600 dark:text-orange-400 mb-2' />
              <h3 className='font-medium text-gray-900 dark:text-white'>
                View Reports
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                Access analytics and reports
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
