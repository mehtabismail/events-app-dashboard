# Project Analysis: Events App Dashboard

## 📋 Overview

This is a **Next.js 15.4.4** admin dashboard application built with:
- **React 19.1.0** with TypeScript
- **Next.js App Router** (file-based routing)
- **Tailwind CSS** for styling
- **shadcn/ui** components (Radix UI based)
- Cookie-based authentication
- API proxy pattern to backend (Railway.app hosted)

## 🏗️ Architecture

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Backend**: External API at `https://events-app-backend-stage.up.railway.app`

### Project Structure

```
src/app/
├── layout.tsx              # Root layout (all pages)
├── page.tsx                # Root page (redirects to /login)
├── login/
│   └── page.tsx            # Login page
├── providers.tsx           # React providers (Toaster)
├── dashboard/              # Protected dashboard area
│   ├── layout.tsx          # Dashboard layout (sidebar navigation)
│   ├── page.tsx            # Dashboard overview/home
│   ├── events/
│   │   ├── page.tsx        # Events list page
│   │   └── [id]/
│   │       └── page.tsx    # Event detail page (dynamic route)
│   ├── users/
│   │   └── page.tsx        # Users management page
│   ├── pending-approvals/
│   │   └── page.tsx        # Pending approvals page
│   ├── reports/
│   │   └── page.tsx        # Reports page
│   └── event-planners/
│       └── page.tsx        # Event planners page
└── api/
    └── login/
        └── route.ts        # API route (proxy to backend)
```

## 🔐 Authentication Flow

### 1. Entry Point (`/`)
- **File**: `src/app/page.tsx`
- **Behavior**: Automatically redirects to `/login`
- **No authentication check** at this level

### 2. Middleware Protection (`middleware.ts`)
- **Location**: Root `middleware.ts`
- **Protection Logic**:
  ```typescript
  - Checks for "token" cookie
  - If authenticated AND on "/" → redirect to "/dashboard"
  - If NOT authenticated AND accessing protected routes → redirect to "/"
  ```

### 3. Protected Routes
Protected routes (require authentication):
- `/dashboard/*` (all dashboard pages)
- `/events/*`
- `/users/*`
- `/event-planners/*`
- `/reports/*`

### 4. Login Process
1. User enters email/password on `/login`
2. Form submits to `/api/login` (Next.js API route)
3. API route proxies request to backend: `https://events-app-backend-stage.up.railway.app/login`
4. Backend returns authentication cookie (`token`)
5. Cookie is forwarded to client
6. Client redirects to `/dashboard`
7. Middleware now allows access (cookie present)

### 5. Logout Process
1. User clicks logout in sidebar
2. `useLogout` hook clears cookie
3. Redirects to `/` (which redirects to `/login`)

## 🧭 Navigation & Screen Flow

### Screen Hierarchy

```
/ (root)
└── Auto-redirect to /login
    │
    ├── /login (unprotected)
    │   └── On success → /dashboard
    │
    └── /dashboard (protected - requires auth cookie)
        ├── Layout: DashboardLayout (sidebar + main content)
        │
        ├── /dashboard (Overview/Home)
        │   └── Dashboard stats, analytics, charts
        │
        ├── /dashboard/events
        │   ├── List view of all events
        │   └── Click event → /dashboard/events/[id]
        │
        ├── /dashboard/events/[id]
        │   └── Event detail page (dynamic route)
        │
        ├── /dashboard/users
        │   └── Users management (filter by role)
        │
        ├── /dashboard/pending-approvals
        │   └── Pending event planner approvals
        │
        ├── /dashboard/reports
        │   └── Analytics and reports
        │
        └── /dashboard/event-planners
            └── Event planners management
```

### Navigation Mechanism

#### 1. Sidebar Navigation (Dashboard Layout)
- **File**: `src/app/dashboard/layout.tsx`
- **Component**: `DashboardLayout`
- **Features**:
  - Fixed sidebar (left side, 256px width)
  - Navigation menu with icons
  - Active route highlighting
  - Uses `usePathname()` to detect current route
  - Uses `useRouter().push()` for navigation

**Menu Items**:
```typescript
- Overview → /dashboard
- Events → /dashboard/events
- Users → /dashboard/users
- Pending Approvals → /dashboard/pending-approvals
- Reports → /dashboard/reports
- Logout → clears cookie, redirects to /
```

#### 2. Programmatic Navigation
- Uses Next.js `useRouter()` hook from `next/navigation`
- Example: `router.push("/dashboard/events")`
- Can navigate with query params: `router.push("/dashboard/users?role=event-planner")`

#### 3. Dynamic Routes
- **Pattern**: `[id]` folder in route structure
- **Example**: `/dashboard/events/[id]/page.tsx`
- Access params: `params.id` in page component
- Example URL: `/dashboard/events/123` → `params.id = "123"`

## 📄 Layout System

### 1. Root Layout (`src/app/layout.tsx`)
- **Wraps ALL pages** in the application
- Features:
  - Font configuration (Geist Sans, Geist Mono)
  - Dark mode script (runs before React hydration)
  - Providers wrapper (Toaster, etc.)
  - Analytics component
  - Global CSS imports

### 2. Dashboard Layout (`src/app/dashboard/layout.tsx`)
- **Wraps ALL dashboard pages** (`/dashboard/*`)
- Features:
  - Fixed sidebar navigation
  - Main content area (margin-left: 256px)
  - Active route detection
  - Logout functionality
  - **Does NOT wrap login page** (login is outside `/dashboard`)

### Layout Nesting
```
RootLayout (app/layout.tsx)
└── All pages
    ├── Login page (no dashboard layout)
    └── Dashboard pages
        └── DashboardLayout (app/dashboard/layout.tsx)
            └── Dashboard children pages
```

## 🔌 API Integration

### API Proxy Pattern
- **Next.js API Routes** act as proxies to backend
- **Backend URL**: `https://events-app-backend-stage.up.railway.app`
- **Example**: `src/app/api/login/route.ts`
  - Receives request from frontend
  - Forwards to backend
  - Returns response + cookies to frontend

### API Endpoints Configuration
- **File**: `src/lib/apiEndpoints.ts`
- Centralized endpoint definitions
- Used by custom hooks (useEvents, useUsers, etc.)

### Data Fetching Hooks
Custom hooks in `src/components/`:
- `useEvents` - Fetch events list
- `useSingleEvent` - Fetch single event
- `useUsers` - Fetch users list
- `useLogin` - Handle login
- `useLogout` - Handle logout
- `usePendingUsers` - Fetch pending approvals
- `useReportsDashboard` - Fetch dashboard reports
- etc.

## 🎨 UI Components

### Component Structure
- **shadcn/ui components**: `src/components/ui/`
  - Button, Input, Label, etc.
- **Custom components**: `src/components/`
  - GoogleMap, ThemeSwitcher, etc.
- **Custom hooks**: `src/components/` (naming: `use*.ts`)
  - Data fetching and state management

### Styling
- **Tailwind CSS** with custom colors
- **Primary color**: `#1F9BB7` (cyan/teal)
- **Dark mode** support (system preference + manual toggle)
- **Responsive design** (mobile, tablet, desktop)

## 🔄 Data Flow

### Typical Page Flow

1. **User navigates to page** (e.g., `/dashboard/events`)
2. **Middleware checks authentication** (cookie present?)
3. **Page component renders** (client component)
4. **Custom hook fetches data** (e.g., `useEvents()`)
5. **Hook makes API call** to backend (via Next.js API or directly)
6. **Data updates state** in component
7. **UI re-renders** with new data
8. **User interacts** (click, filter, etc.)
9. **State updates** → re-render

### Example: Events Page
```
/dashboard/events/page.tsx
└── Uses useEvents() hook
    └── Fetches from backend API
        └── Updates component state
            └── Renders event list
```

## 🔑 Key Concepts

### 1. File-Based Routing (Next.js App Router)
- Folders = Routes
- `page.tsx` = Route component
- `layout.tsx` = Layout wrapper
- `[id]` = Dynamic route parameter

### 2. Server vs Client Components
- **Server Components** (default): Render on server
- **Client Components** (`"use client"`): Render on client, can use hooks

### 3. Protected Routes
- Middleware checks authentication
- Redirects if not authenticated
- Dashboard layout only wraps authenticated pages

### 4. Navigation Patterns
- **Sidebar navigation**: `router.push()` from sidebar
- **Link navigation**: Can use Next.js `<Link>` component
- **Programmatic**: `router.push()` in event handlers

## 📊 Summary

### How Screens Are Attached:

1. **Route Definition**: Each folder in `app/` directory = a route
2. **Page Component**: `page.tsx` file = the screen content
3. **Layout Wrapping**: Parent `layout.tsx` wraps child pages
4. **Navigation**: 
   - Sidebar menu (`dashboard/layout.tsx`) uses `router.push()`
   - Programmatic navigation via `useRouter()` hook
   - Dynamic routes use `[param]` folders

### How It Works:

1. **Entry**: User visits `/` → redirected to `/login`
2. **Auth**: Login sets cookie → middleware allows dashboard access
3. **Protected Area**: All `/dashboard/*` routes require auth
4. **Navigation**: Sidebar provides navigation menu
5. **Data**: Custom hooks fetch from backend API
6. **Layout**: Dashboard layout wraps all dashboard pages with sidebar
7. **Routing**: Next.js App Router handles file-based routing automatically

This architecture provides a clean separation between:
- **Authentication** (middleware)
- **Navigation** (layout with sidebar)
- **Content** (individual page components)
- **Data** (custom hooks)

