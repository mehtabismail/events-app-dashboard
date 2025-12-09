# Frontend Implementation Guide - Admin User Management APIs

**For:** Next.js Admin Panel  
**Date:** {{date}}  
**Backend API Base URL:** `https://ext-ent.com/api` (Production) or `http://localhost:PORT/api` (Development)

---

## 📋 Overview

Two admin-only APIs have been created for user management:

1. **GET Users List** - Get all users with filtering and pagination
2. **PATCH Update User** - Update user/event-planner details

**Important:** All requests must include authentication cookie (token).

---

## 🔐 Authentication

All admin APIs require admin authentication via cookies. The token is automatically sent with requests if cookies are enabled.

**Axios Config:**
```javascript
// Set in your API client
axios.defaults.withCredentials = true;
```

**Fetch Config:**
```javascript
fetch(url, {
  credentials: 'include', // Important for cookies
  // ...
});
```

---

## 📡 API 1: Get Users List

### **Endpoint**
```
GET /api/admin/users
```

### **Purpose**
Get list of all users and event-planners (excluding admins) with filtering and pagination.

### **Query Parameters**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 20 | Items per page (max 100) |
| `role` | string | No | "all" | Filter: `"user"`, `"event-planner"`, or `"all"` |
| `search` | string | No | - | Search by email, name, company |
| `sortBy` | string | No | "createdAt" | Sort field: `createdAt`, `email`, `first_name`, `last_name`, `role` |
| `sortOrder` | string | No | "desc" | Sort direction: `"asc"` or `"desc"` |

### **Role Filter Logic**

- `role=user` → Shows only users
- `role=event-planner` → Shows only event planners
- `role=all` or not provided → Shows users + event planners (admins always excluded)

### **Request Example**

```javascript
// Get all users (page 1)
GET /api/admin/users?page=1&limit=20

// Get only users
GET /api/admin/users?role=user&page=1&limit=20

// Get only event planners
GET /api/admin/users?role=event-planner&page=1&limit=20

// Search users
GET /api/admin/users?search=john&page=1&limit=20

// Combined filters
GET /api/admin/users?role=user&search=john&page=1&limit=20&sortBy=email&sortOrder=asc
```

### **Response Structure**

```typescript
{
  success: boolean;
  message: string;
  data: {
    users: Array<{
      _id: string;
      first_name: string;
      last_name: string;
      email: string;
      company_name?: string;
      photo?: string;
      phone?: string;
      address?: string;
      role: "user" | "event-planner";
      fcmTokens?: string[];
      stripeCustomerId?: string;
      createdAt: string;
      updatedAt: string;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters: {
      role: string;
      search: string | null;
      sortBy: string;
      sortOrder: "asc" | "desc";
    };
  };
}
```

### **Success Response Example**

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "company_name": "ABC Corp",
        "photo": "https://cloudinary.com/image.jpg",
        "phone": "+1234567890",
        "address": "123 Main St",
        "role": "user",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-20T14:20:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 95,
      "limit": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "role": "all",
      "search": null,
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  }
}
```

### **Error Responses**

```json
// 401 Unauthorized (not logged in)
{
  "message": "Unauthorized"
}

// 403 Forbidden (not admin)
{
  "message": "Forbidden: Admin access required"
}

// 400 Bad Request (invalid role filter)
{
  "success": false,
  "message": "Invalid role filter. Must be 'user', 'event-planner', or 'all'"
}

// 500 Server Error
{
  "success": false,
  "message": "Error fetching users",
  "error": "Error message"
}
```

---

## 📡 API 2: Update User

### **Endpoint**
```
PATCH /api/admin/users/:id
```

### **Purpose**
Update user or event-planner details (admin can update any user).

### **URL Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User ID to update |

### **Request Body (JSON)**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `first_name` | string | No | First name |
| `last_name` | string | No | Last name |
| `company_name` | string | No | Company name |
| `email` | string | No | Email (must be unique) |
| `phone` | string | No | Phone number |
| `address` | string | No | Address |
| `photo` | string | No | Photo URL (must be valid URL) |

**Note:** All fields are optional - send only fields you want to update.

### **Request Example**

```javascript
// Update user name and email
PATCH /api/admin/users/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com"
}
```

### **Response Structure**

```typescript
{
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      first_name: string;
      last_name: string;
      email: string;
      company_name?: string;
      photo?: string;
      phone?: string;
      address?: string;
      role: "user" | "event-planner";
      createdAt: string;
      updatedAt: string;
    };
  };
}
```

### **Success Response Example**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane@example.com",
      "company_name": "ABC Corp",
      "photo": "https://cloudinary.com/image.jpg",
      "phone": "+1234567890",
      "address": "123 Main St",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-25T16:45:00.000Z"
    }
  }
}
```

### **Error Responses**

```json
// 401 Unauthorized
{
  "message": "Unauthorized"
}

// 403 Forbidden (not admin or trying to update admin)
{
  "success": false,
  "message": "Cannot update admin user profile"
}

// 404 Not Found
{
  "success": false,
  "message": "User not found"
}

// 400 Bad Request (duplicate email)
{
  "success": false,
  "message": "Email already exists",
  "error": "A user with this email already exists"
}

// 400 Bad Request (validation error)
{
  "success": false,
  "message": "Validation error",
  "error": "Invalid email format"
}

// 500 Server Error
{
  "success": false,
  "message": "Error updating user",
  "error": "Error message"
}
```

---

## 💻 Next.js Implementation Examples

### **1. API Service File**

Create `lib/api/adminUsers.ts` (or `.js`):

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:PORT/api';

// Configure axios to send cookies
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name?: string;
  photo?: string;
  phone?: string;
  address?: string;
  role: 'user' | 'event-planner';
  createdAt: string;
  updatedAt: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: 'user' | 'event-planner' | 'all';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetUsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters: {
      role: string;
      search: string | null;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    };
  };
}

export interface UpdateUserParams {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  photo?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

// API Functions
export const adminUsersApi = {
  /**
   * Get all users with filtering and pagination
   */
  async getUsers(params: GetUsersParams = {}): Promise<GetUsersResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.role) queryParams.append('role', params.role);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get<GetUsersResponse>(
      `/admin/users?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Update user details
   */
  async updateUser(
    userId: string,
    updates: UpdateUserParams
  ): Promise<UpdateUserResponse> {
    const response = await apiClient.patch<UpdateUserResponse>(
      `/admin/users/${userId}`,
      updates
    );
    return response.data;
  },
};
```

---

### **2. React Hook Example**

Create `hooks/useAdminUsers.ts`:

```typescript
import { useState, useEffect } from 'react';
import { adminUsersApi, GetUsersParams, User } from '@/lib/api/adminUsers';

interface UseAdminUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  filters: {
    role: string;
    search: string | null;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  } | null;
  fetchUsers: (params?: GetUsersParams) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
}

export function useAdminUsers(initialParams?: GetUsersParams) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseAdminUsersReturn['pagination']>(null);
  const [filters, setFilters] = useState<UseAdminUsersReturn['filters']>(null);

  const fetchUsers = async (params?: GetUsersParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminUsersApi.getUsers(params || initialParams);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
      setFilters(response.data.filters);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminUsersApi.updateUser(userId, updates);
      
      // Update user in local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? response.data.user : user
        )
      );
      
      return response.data.user;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialParams) {
      fetchUsers(initialParams);
    }
  }, []);

  return {
    users,
    loading,
    error,
    pagination,
    filters,
    fetchUsers,
    updateUser,
  };
}
```

---

### **3. Users List Component Example**

Create `components/admin/UsersList.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';

export default function UsersList() {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<'user' | 'event-planner' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { users, loading, error, pagination, fetchUsers } = useAdminUsers({
    page,
    limit: 20,
    role: roleFilter,
    search: searchTerm || undefined,
  });

  const handleSearch = () => {
    setPage(1);
    fetchUsers({
      page: 1,
      limit: 20,
      role: roleFilter,
      search: searchTerm || undefined,
    });
  };

  const handleRoleFilter = (role: 'user' | 'event-planner' | 'all') => {
    setRoleFilter(role);
    setPage(1);
    fetchUsers({
      page: 1,
      limit: 20,
      role,
      search: searchTerm || undefined,
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchUsers({
      page: newPage,
      limit: 20,
      role: roleFilter,
      search: searchTerm || undefined,
    });
  };

  if (loading && !users.length) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="users-list">
      <h1>Users Management</h1>

      {/* Filters */}
      <div className="filters">
        <div className="role-filters">
          <button
            onClick={() => handleRoleFilter('all')}
            className={roleFilter === 'all' ? 'active' : ''}
          >
            All
          </button>
          <button
            onClick={() => handleRoleFilter('user')}
            className={roleFilter === 'user' ? 'active' : ''}
          >
            Users
          </button>
          <button
            onClick={() => handleRoleFilter('event-planner')}
            className={roleFilter === 'event-planner' ? 'active' : ''}
          >
            Event Planners
          </button>
        </div>

        <div className="search">
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>

      {/* Users Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Company</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.first_name} {user.last_name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.company_name || '-'}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleEdit(user._id)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && (
        <div className="pagination">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => handlePageChange(page - 1)}
          >
            Previous
          </button>
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => handlePageChange(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Total Count */}
      {pagination && (
        <div className="total">
          Total Users: {pagination.totalUsers}
        </div>
      )}
    </div>
  );
}
```

---

### **4. Edit User Form Component Example**

Create `components/admin/EditUserForm.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { adminUsersApi, User } from '@/lib/api/adminUsers';

interface EditUserFormProps {
  userId: string;
  onSuccess?: (user: User) => void;
  onCancel?: () => void;
}

export default function EditUserForm({ userId, onSuccess, onCancel }: EditUserFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company_name: '',
    phone: '',
    address: '',
    photo: '',
  });

  useEffect(() => {
    // Fetch user data first (you might want to add a get user by ID API)
    // For now, assuming formData is passed or fetched elsewhere
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Remove empty fields
      const updates = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '')
      );

      const response = await adminUsersApi.updateUser(userId, updates);
      
      if (onSuccess) {
        onSuccess(response.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-user-form">
      <h2>Edit User</h2>

      {error && <div className="error">{error}</div>}

      <div className="form-group">
        <label>First Name</label>
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Last Name</label>
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Company Name</label>
        <input
          type="text"
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Photo URL</label>
        <input
          type="url"
          name="photo"
          value={formData.photo}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update User'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
```

---

### **5. Error Handling Example**

```typescript
import { AxiosError } from 'axios';

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    // Handle specific status codes
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/admin/login';
      return 'Please log in to continue';
    }
    
    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action';
    }
    
    if (error.response?.status === 404) {
      return 'Resource not found';
    }
    
    // Return backend error message
    return error.response?.data?.message || 'An error occurred';
  }
  
  return 'An unexpected error occurred';
}
```

---

## 🧪 Testing Checklist

- [ ] **Authentication**: Verify admin can access APIs
- [ ] **Authorization**: Verify non-admin users get 403
- [ ] **Role Filtering**: Test all three role filters (user, event-planner, all)
- [ ] **Pagination**: Test page navigation
- [ ] **Search**: Test search functionality
- [ ] **Sorting**: Test different sort options
- [ ] **Update User**: Test updating different fields
- [ ] **Error Handling**: Test error scenarios (404, 403, 400, 500)
- [ ] **Empty States**: Test with no users/results
- [ ] **Loading States**: Verify loading indicators work

---

## 📝 Important Notes

1. **Authentication**: All requests must include cookies (token)
2. **Admin Only**: These APIs only work for users with `role: "admin"`
3. **Admin Exclusion**: Admin users are automatically excluded from user lists
4. **Cannot Update Admins**: Admin cannot update another admin's profile
5. **Email Uniqueness**: Email must be unique across all users
6. **Pagination**: Max 100 items per page
7. **Photo URL**: Must be a valid URL if provided

---

## 🚀 Quick Start

1. **Set up API client** with cookie support
2. **Create TypeScript types** for requests/responses
3. **Create React hooks** for data fetching
4. **Build UI components** for list and edit forms
5. **Add error handling** and loading states
6. **Test thoroughly** with different scenarios

---

**Need help? Contact backend team for API support!** 🎉

