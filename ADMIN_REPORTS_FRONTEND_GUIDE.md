# 📊 Admin Reports API - Frontend Implementation Guide

## 🎯 Executive Summary

This document provides a comprehensive guide for implementing the **Admin Reports Dashboard** in the Next.js admin panel. The backend has implemented 8 new API endpoints for admin-only reports covering:

- **Dashboard Overview** - Summary statistics for all modules
- **Payments Report** - Complete transaction history with filters
- **Events Report** - Events with metrics (views, likes, RSVPs)
- **Users Report** - User statistics and registration trends
- **Event Planners Report** - Event planner performance metrics
- **Chart APIs** - Pre-formatted data for charts (Revenue, Registrations, Events)

**All APIs require admin authentication** (admin role cookie).

---

## 📋 Table of Contents

1. [API Endpoints Overview](#1-api-endpoints-overview)
2. [Authentication](#2-authentication)
3. [Dashboard Overview API](#3-dashboard-overview-api)
4. [Payments Report API](#4-payments-report-api)
5. [Events Report API](#5-events-report-api)
6. [Users Report API](#6-users-report-api)
7. [Event Planners Report API](#7-event-planners-report-api)
8. [Chart APIs](#8-chart-apis)
9. [TypeScript Types](#9-typescript-types)
10. [React Implementation Examples](#10-react-implementation-examples)
11. [UI Component Suggestions](#11-ui-component-suggestions)

---

## 1. API Endpoints Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/reports/dashboard` | GET | Dashboard overview with all statistics |
| `/api/admin/reports/payments` | GET | Payment/transaction report with pagination |
| `/api/admin/reports/events` | GET | Events report with metrics |
| `/api/admin/reports/users` | GET | Users report with registration trends |
| `/api/admin/reports/event-planners` | GET | Event planners with performance stats |
| `/api/admin/reports/charts/revenue` | GET | Revenue chart data |
| `/api/admin/reports/charts/registrations` | GET | Registration trends chart data |
| `/api/admin/reports/charts/events` | GET | Events creation chart data |

---

## 2. Authentication

All endpoints require:
- Valid JWT token in cookies (`token`)
- User must have `role: "admin"`

```typescript
// Next.js fetch example with credentials
const response = await fetch(`${API_BASE_URL}/api/admin/reports/dashboard`, {
  method: 'GET',
  credentials: 'include', // Required for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## 3. Dashboard Overview API

### Endpoint
```
GET /api/admin/reports/dashboard?period=month
```

### Query Parameters
| Parameter | Type | Default | Options | Description |
|-----------|------|---------|---------|-------------|
| `period` | string | `month` | `week`, `month`, `year`, `all` | Time period for statistics |

### Response Structure
```json
{
  "success": true,
  "message": "Dashboard overview retrieved successfully",
  "data": {
    "period": "month",
    "dateRange": {
      "start": "2024-11-07T00:00:00.000Z",
      "end": "2024-12-07T23:59:59.999Z"
    },
    "users": {
      "total": 150,           // All-time total users
      "inPeriod": 25,         // New users in selected period
      "growth": 15.5          // % growth vs previous period
    },
    "eventPlanners": {
      "total": 45,
      "inPeriod": 8,
      "growth": 10.2
    },
    "events": {
      "total": 200,
      "inPeriod": 35,
      "growth": 20.0,
      "byStatus": {
        "draft": 5,
        "pending": 12,
        "approved": 150,
        "suspended": 3,
        "rejected": 10
      }
    },
    "revenue": {
      "totalCents": 250000,
      "totalFormatted": "$2500.00",
      "growth": 25.5,
      "activeSubscriptions": 30,
      "totalSubscriptions": 45,
      "byPlan": [
        {
          "plan": "weekly",
          "revenueCents": 100000,
          "revenueFormatted": "$1000.00",
          "count": 20
        },
        {
          "plan": "monthly",
          "revenueCents": 150000,
          "revenueFormatted": "$1500.00",
          "count": 25
        }
      ]
    },
    "engagement": {
      "totalViews": 50000,
      "totalUniqueViews": 15000,
      "totalLikes": 3500,
      "totalShares": 1200,
      "totalComments": 800,
      "totalRsvps": 2500,
      "totalTicketRedirects": 600
    }
  }
}
```

### Usage Example
```typescript
// Dashboard.tsx
const { data } = await fetchDashboard('month');

// Display cards
<StatCard title="Total Users" value={data.users.total} growth={data.users.growth} />
<StatCard title="Revenue" value={data.revenue.totalFormatted} growth={data.revenue.growth} />
<StatCard title="Events" value={data.events.total} growth={data.events.growth} />
```

---

## 4. Payments Report API

### Endpoint
```
GET /api/admin/reports/payments
```

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max: 100) |
| `startDate` | string | - | Filter start date (ISO format) |
| `endDate` | string | - | Filter end date (ISO format) |
| `status` | string | - | `active`, `canceled`, `past_due`, `unpaid` |
| `plan` | string | - | `weekly`, `monthly` |
| `eventPlannerId` | string | - | Filter by specific event planner |
| `search` | string | - | Search by name, email, company, event name |
| `sortBy` | string | `createdAt` | Sort field |
| `sortOrder` | string | `desc` | `asc` or `desc` |

### Response Structure
```json
{
  "success": true,
  "message": "Payments report retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": "65abc123...",
        "stripeSubscriptionId": "sub_xxx",
        "eventPlanner": {
          "id": "65user123...",
          "name": "John Doe",
          "email": "john@example.com",
          "company": "Acme Events",
          "photo": "https://..."
        },
        "event": {
          "id": "65event123...",
          "name": "Music Festival 2024",
          "dateTime": "2024-12-25T18:00:00.000Z",
          "status": "approved",
          "category": "concert"
        },
        "plan": "monthly",
        "amount": 2000,
        "amountFormatted": "$20.00",
        "status": "active",
        "currentPeriodStart": "2024-12-01T00:00:00.000Z",
        "currentPeriodEnd": "2025-01-01T00:00:00.000Z",
        "cancelAtPeriodEnd": false,
        "canceledAt": null,
        "createdAt": "2024-11-01T10:00:00.000Z",
        "updatedAt": "2024-12-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalTransactions": 100,
      "limit": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "summary": {
      "totalRevenue": 250000,
      "totalRevenueFormatted": "$2500.00",
      "totalTransactions": 100,
      "byStatus": [
        { "status": "active", "count": 60, "revenue": 180000, "revenueFormatted": "$1800.00" },
        { "status": "canceled", "count": 40, "revenue": 70000, "revenueFormatted": "$700.00" }
      ],
      "byPlan": [
        { "plan": "weekly", "count": 40, "revenue": 80000, "revenueFormatted": "$800.00" },
        { "plan": "monthly", "count": 60, "revenue": 170000, "revenueFormatted": "$1700.00" }
      ]
    },
    "filters": {
      "startDate": "2024-11-01",
      "endDate": "2024-12-07",
      "status": null,
      "plan": null,
      "eventPlannerId": null,
      "search": null,
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  }
}
```

### Features for UI
1. **Date Range Picker** - Filter by startDate/endDate
2. **Status Filter** - Dropdown: active, canceled, past_due, unpaid
3. **Plan Filter** - Dropdown: weekly, monthly
4. **Search Box** - Search across names, emails, event names
5. **Table with Pagination**
6. **Summary Cards** - Total revenue, breakdown by status/plan
7. **Export to CSV** (client-side implementation)

---

## 5. Events Report API

### Endpoint
```
GET /api/admin/reports/events
```

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `startDate` | string | - | Filter start date |
| `endDate` | string | - | Filter end date |
| `status` | string | - | `draft`, `pending`, `approved`, `suspended`, `rejected` |
| `category` | string | - | `concert`, `workshop`, `conference`, `other` |
| `paymentStatus` | string | - | `active`, `trial_expired`, `payment_failed`, `payment_required` |
| `search` | string | - | Search by event name, description, location |
| `includeMetrics` | string | `true` | Include engagement metrics |
| `sortBy` | string | `createdAt` | Sort field |
| `sortOrder` | string | `desc` | Sort direction |

### Response Structure
```json
{
  "success": true,
  "message": "Events report retrieved successfully",
  "data": {
    "events": [
      {
        "id": "65event123...",
        "name": "Tech Conference 2024",
        "description": "Annual tech conference...",
        "dateTime": "2024-12-20T09:00:00.000Z",
        "category": "conference",
        "status": "approved",
        "paymentStatus": "active",
        "ticketPrice": 50,
        "ticketLink": "https://...",
        "location": {
          "type": "Point",
          "coordinates": [-73.9857, 40.7484],
          "address": "New York, NY"
        },
        "images": 3,
        "videos": 1,
        "isTrialActive": false,
        "trialEndsAt": null,
        "subscriptionPlan": "monthly",
        "creator": {
          "id": "65user123...",
          "name": "Jane Smith",
          "email": "jane@company.com",
          "company": "Tech Corp",
          "role": "event-planner",
          "photo": "https://..."
        },
        "metrics": {
          "views": 1500,
          "uniqueViews": 800,
          "likes": 120,
          "shares": 45,
          "comments": 30,
          "rsvps": {
            "total": 200,
            "confirmed": 150,
            "maybe": 40,
            "declined": 10
          },
          "ticketRedirects": 80,
          "engagementRate": 15.5
        },
        "createdAt": "2024-10-15T10:00:00.000Z",
        "updatedAt": "2024-12-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalEvents": 200,
      "limit": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "summary": {
      "totalEvents": 200,
      "byStatus": {
        "draft": 10,
        "pending": 25,
        "approved": 140,
        "suspended": 5,
        "rejected": 20
      },
      "byCategory": {
        "concert": 60,
        "workshop": 50,
        "conference": 70,
        "other": 20
      },
      "byPaymentStatus": {
        "active": 80,
        "trial_expired": 20,
        "payment_failed": 5,
        "payment_required": 15,
        "null": 80
      }
    },
    "filters": { ... }
  }
}
```

### UI Features
1. **Status Pills/Badges** - Color-coded event status
2. **Metrics Display** - Views, likes, RSVPs inline
3. **Category Icons** - Different icons per category
4. **Quick Actions** - View details, approve/reject
5. **Expandable Rows** - Show full metrics on expand

---

## 6. Users Report API

### Endpoint
```
GET /api/admin/reports/users
```

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `startDate` | string | - | Filter by registration date |
| `endDate` | string | - | Filter by registration date |
| `search` | string | - | Search by name, email |
| `sortBy` | string | `createdAt` | Sort field |
| `sortOrder` | string | `desc` | Sort direction |

### Response Structure
```json
{
  "success": true,
  "message": "Users report retrieved successfully",
  "data": {
    "users": [
      {
        "id": "65user123...",
        "firstName": "Alice",
        "lastName": "Johnson",
        "email": "alice@example.com",
        "phone": "+1234567890",
        "photo": "https://...",
        "address": "123 Main St, City",
        "createdAt": "2024-11-01T10:00:00.000Z",
        "updatedAt": "2024-12-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalUsers": 150,
      "limit": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "summary": {
      "totalUsers": 150,
      "registrationTrend": [
        { "date": "2024-11-07", "count": 5 },
        { "date": "2024-11-08", "count": 3 },
        { "date": "2024-11-09", "count": 8 }
      ],
      "activityBreakdown": {
        "created_event": 0,
        "commented_event": 45,
        "liked_event": 120,
        "rsvp_event": 80,
        "became_friends": 200
      }
    },
    "filters": { ... }
  }
}
```

### UI Features
1. **Registration Trend Chart** - Line chart from `registrationTrend`
2. **Activity Breakdown** - Pie chart from `activityBreakdown`
3. **User Cards/Table** - Display user list
4. **Quick Actions** - View profile, edit user

---

## 7. Event Planners Report API

### Endpoint
```
GET /api/admin/reports/event-planners
```

### Query Parameters
Same as Users Report API

### Response Structure
```json
{
  "success": true,
  "message": "Event planners report retrieved successfully",
  "data": {
    "eventPlanners": [
      {
        "id": "65planner123...",
        "firstName": "Bob",
        "lastName": "Williams",
        "email": "bob@company.com",
        "phone": "+1234567890",
        "photo": "https://...",
        "companyName": "Event Masters",
        "address": "456 Business Ave",
        "stripeCustomerId": "cus_xxx",
        "events": {
          "total": 15,
          "approved": 10,
          "pending": 3,
          "rejected": 1,
          "suspended": 1
        },
        "revenue": {
          "totalCents": 50000,
          "totalFormatted": "$500.00",
          "activeSubscriptions": 5,
          "totalSubscriptions": 8
        },
        "createdAt": "2024-08-01T10:00:00.000Z",
        "updatedAt": "2024-12-01T10:00:00.000Z"
      }
    ],
    "pagination": { ... },
    "summary": {
      "totalEventPlanners": 45,
      "totalEvents": 200,
      "approvedEvents": 140,
      "totalRevenue": 250000,
      "totalRevenueFormatted": "$2500.00",
      "activeSubscriptions": 30,
      "registrationTrend": [ ... ]
    },
    "filters": { ... }
  }
}
```

### UI Features
1. **Performance Cards** - Events count, revenue per planner
2. **Top Performers Table** - Sort by revenue/events
3. **Registration Trend** - Line chart
4. **Revenue Distribution** - Pie chart by planner

---

## 8. Chart APIs

### Revenue Chart
```
GET /api/admin/reports/charts/revenue?period=month
```

**Parameters:** `period` = `week` | `month` | `year`

**Response:**
```json
{
  "success": true,
  "data": {
    "chartData": {
      "labels": ["1", "2", "3", ..., "30"],
      "datasets": [
        {
          "label": "Revenue ($)",
          "data": [50, 75, 100, 45, ...]
        }
      ]
    },
    "period": "month",
    "timeRange": "Last 30 Days"
  }
}
```

### Registrations Chart
```
GET /api/admin/reports/charts/registrations?period=month&type=all
```

**Parameters:**
- `period` = `week` | `month` | `year`
- `type` = `users` | `event-planners` | `all`

### Events Chart
```
GET /api/admin/reports/charts/events?period=month
```

---

## 9. TypeScript Types

```typescript
// types/reports.ts

export interface DashboardOverview {
  period: 'week' | 'month' | 'year' | 'all';
  dateRange: {
    start: string;
    end: string;
  };
  users: StatWithGrowth;
  eventPlanners: StatWithGrowth;
  events: EventsStats;
  revenue: RevenueStats;
  engagement: EngagementStats;
}

export interface StatWithGrowth {
  total: number;
  inPeriod: number;
  growth: number;
}

export interface EventsStats extends StatWithGrowth {
  byStatus: Record<string, number>;
}

export interface RevenueStats {
  totalCents: number;
  totalFormatted: string;
  growth: number;
  activeSubscriptions: number;
  totalSubscriptions: number;
  byPlan: PlanBreakdown[];
}

export interface PlanBreakdown {
  plan: 'weekly' | 'monthly';
  revenueCents: number;
  revenueFormatted: string;
  count: number;
}

export interface EngagementStats {
  totalViews: number;
  totalUniqueViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  totalRsvps: number;
  totalTicketRedirects: number;
}

// Transaction
export interface Transaction {
  id: string;
  stripeSubscriptionId: string;
  eventPlanner: EventPlannerInfo | null;
  event: EventInfo | null;
  plan: 'weekly' | 'monthly';
  amount: number;
  amountFormatted: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventPlannerInfo {
  id: string;
  name: string;
  email: string;
  company: string | null;
  photo: string | null;
}

export interface EventInfo {
  id: string;
  name: string;
  dateTime: string;
  status: string;
  category: string;
}

// Pagination
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Chart Data
export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[];
}

// Event Report
export interface EventReportItem {
  id: string;
  name: string;
  description: string;
  dateTime: string;
  category: string;
  status: string;
  paymentStatus: string | null;
  ticketPrice: number;
  ticketLink: string | null;
  location: Location;
  images: number;
  videos: number;
  isTrialActive: boolean;
  trialEndsAt: string | null;
  subscriptionPlan: string | null;
  creator: EventPlannerInfo | null;
  metrics: EventMetrics | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventMetrics {
  views: number;
  uniqueViews: number;
  likes: number;
  shares: number;
  comments: number;
  rsvps: RsvpBreakdown;
  ticketRedirects: number;
  engagementRate: number;
}

export interface RsvpBreakdown {
  total: number;
  confirmed: number;
  maybe: number;
  declined: number;
}

// User Report
export interface UserReportItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  photo: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

// Event Planner Report
export interface EventPlannerReportItem extends UserReportItem {
  companyName: string | null;
  stripeCustomerId: string | null;
  events: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    suspended: number;
  };
  revenue: {
    totalCents: number;
    totalFormatted: string;
    activeSubscriptions: number;
    totalSubscriptions: number;
  };
}
```

---

## 10. React Implementation Examples

### Dashboard Page
```tsx
// pages/admin/dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function AdminDashboard() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [revenueChart, setRevenueChart] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      // Fetch dashboard overview
      const dashRes = await fetch(`/api/admin/reports/dashboard?period=${period}`, {
        credentials: 'include',
      });
      const dashData = await dashRes.json();
      
      // Fetch revenue chart
      const chartRes = await fetch(`/api/admin/reports/charts/revenue?period=${period}`, {
        credentials: 'include',
      });
      const chartData = await chartRes.json();
      
      if (dashData.success) setDashboardData(dashData.data);
      if (chartData.success) setRevenueChart(chartData.data.chartData);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {['week', 'month', 'year'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p as any)}
            className={`px-4 py-2 rounded ${period === p ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {p === 'week' ? '7 Days' : p === 'month' ? '30 Days' : '12 Months'}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={dashboardData?.users.total}
          growth={dashboardData?.users.growth}
        />
        <StatCard
          title="Event Planners"
          value={dashboardData?.eventPlanners.total}
          growth={dashboardData?.eventPlanners.growth}
        />
        <StatCard
          title="Total Events"
          value={dashboardData?.events.total}
          growth={dashboardData?.events.growth}
        />
        <StatCard
          title="Revenue"
          value={dashboardData?.revenue.totalFormatted}
          growth={dashboardData?.revenue.growth}
        />
      </div>

      {/* Revenue Chart */}
      {revenueChart && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={800} height={300} data={formatChartData(revenueChart)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </CardContent>
        </Card>
      )}

      {/* Engagement Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 md:grid-cols-7 gap-4">
          <MiniStat label="Views" value={dashboardData?.engagement.totalViews} />
          <MiniStat label="Unique Views" value={dashboardData?.engagement.totalUniqueViews} />
          <MiniStat label="Likes" value={dashboardData?.engagement.totalLikes} />
          <MiniStat label="Shares" value={dashboardData?.engagement.totalShares} />
          <MiniStat label="Comments" value={dashboardData?.engagement.totalComments} />
          <MiniStat label="RSVPs" value={dashboardData?.engagement.totalRsvps} />
          <MiniStat label="Ticket Clicks" value={dashboardData?.engagement.totalTicketRedirects} />
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, growth }: { title: string; value: any; growth?: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {growth !== undefined && (
          <div className={`text-sm ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: any }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold">{value?.toLocaleString()}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function formatChartData(chartData: ChartData) {
  return chartData.labels.map((label, index) => ({
    name: label,
    value: chartData.datasets[0].data[index],
  }));
}
```

### Payments Report Page
```tsx
// pages/admin/reports/payments.tsx
'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select } from '@/components/ui/select';

export default function PaymentsReport() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    startDate: '',
    endDate: '',
    status: '',
    plan: '',
    search: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });

    try {
      const res = await fetch(`/api/admin/reports/payments?${params}`, {
        credentials: 'include',
      });
      const data = await res.json();
      
      if (data.success) {
        setTransactions(data.data.transactions);
        setPagination(data.data.pagination);
        setSummary(data.data.summary);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Event Planner', accessor: (row: Transaction) => row.eventPlanner?.name },
    { header: 'Event', accessor: (row: Transaction) => row.event?.name },
    { header: 'Plan', accessor: 'plan' },
    { header: 'Amount', accessor: 'amountFormatted' },
    { header: 'Status', accessor: 'status', cell: (value: string) => <StatusBadge status={value} /> },
    { header: 'Date', accessor: (row: Transaction) => new Date(row.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Payments Report</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Total Revenue" value={summary?.totalRevenueFormatted} />
        <Card title="Transactions" value={summary?.totalTransactions} />
        <Card title="Active" value={summary?.byStatus?.find((s: any) => s.status === 'active')?.count || 0} />
        <Card title="Canceled" value={summary?.byStatus?.find((s: any) => s.status === 'canceled')?.count || 0} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <DateRangePicker
          onChange={(range) => setFilters({ ...filters, startDate: range.start, endDate: range.end })}
        />
        <Select
          placeholder="Status"
          options={[
            { value: '', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'canceled', label: 'Canceled' },
            { value: 'past_due', label: 'Past Due' },
            { value: 'unpaid', label: 'Unpaid' },
          ]}
          onChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
        />
        <Select
          placeholder="Plan"
          options={[
            { value: '', label: 'All Plans' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ]}
          onChange={(value) => setFilters({ ...filters, plan: value, page: 1 })}
        />
        <input
          type="text"
          placeholder="Search..."
          className="border rounded px-3 py-2"
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={transactions}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />
    </div>
  );
}
```

---

## 11. UI Component Suggestions

### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Admin Dashboard                        [7 Days ▼]           │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │  Users   │ │  Event   │ │  Events  │ │ Revenue  │        │
│ │   150    │ │ Planners │ │   200    │ │ $2,500   │        │
│ │  ↑15%    │ │    45    │ │  ↑20%    │ │  ↑25%    │        │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
├─────────────────────────────────────────────────────────────┤
│ Revenue Trend                                               │
│ ┌─────────────────────────────────────────────────────────┐│
│ │     ╭───╮                                               ││
│ │    ╭╯   ╰╮    ╭──╮                         ╭───╮       ││
│ │   ╭╯     ╰────╯  ╰────────────────────────╯   ╰────   ││
│ │   ╯                                                     ││
│ └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ Engagement Overview                                         │
│ ┌────────┬────────┬────────┬────────┬────────┬────────┬───┐│
│ │ Views  │Unique  │ Likes  │ Shares │Comments│ RSVPs  │Tkt││
│ │ 50,000 │15,000  │ 3,500  │ 1,200  │  800   │ 2,500  │600││
│ └────────┴────────┴────────┴────────┴────────┴────────┴───┘│
├─────────────────────────────────────────────────────────────┤
│ Events by Status           │ Revenue by Plan               │
│ ┌─────────────────────────┐│ ┌─────────────────────────┐   │
│ │     ╭─────╮             ││ │       Weekly            │   │
│ │   ╱       ╲  Approved   ││ │       40%  ────         │   │
│ │  │         │  70%       ││ │                         │   │
│ │   ╲       ╱  Pending    ││ │       Monthly           │   │
│ │     ╰─────╯   12%       ││ │       60%  ────────     │   │
│ └─────────────────────────┘│ └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Recommended Libraries
- **Charts:** Recharts, Chart.js, or Nivo
- **Tables:** TanStack Table (React Table)
- **Date Picker:** react-datepicker or @shadcn/ui DatePicker
- **UI Components:** shadcn/ui, Radix UI, or Material UI

### Color Scheme for Status Badges
```css
/* Status Badge Colors */
.status-active { background: #10B981; } /* Green */
.status-pending { background: #F59E0B; } /* Yellow */
.status-canceled { background: #6B7280; } /* Gray */
.status-rejected { background: #EF4444; } /* Red */
.status-suspended { background: #F97316; } /* Orange */
.status-past_due { background: #EF4444; } /* Red */
.status-unpaid { background: #DC2626; } /* Dark Red */
```

---

## Quick Start Checklist

- [ ] Set up API service with credentials
- [ ] Create TypeScript types from Section 9
- [ ] Implement Dashboard page with stat cards
- [ ] Add revenue chart using chart library
- [ ] Create Payments report with table and filters
- [ ] Create Events report with metrics display
- [ ] Create Users report with registration trends
- [ ] Create Event Planners report with performance stats
- [ ] Add date range picker component
- [ ] Add export to CSV functionality
- [ ] Implement responsive design for mobile

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**For:** Frontend Team (Next.js Admin Panel)


