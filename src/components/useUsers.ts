import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

// User type definition
export interface User {
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
}

// Pagination type
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Filters type
export interface Filters {
  role: string;
  search: string | null;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

// API Response type
export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: Pagination;
    filters: Filters;
  };
}

// Query params type
export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: "user" | "event-planner" | "all";
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useUsers(initialParams?: GetUsersParams) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);

  const fetchUsers = useCallback(
    async (params?: GetUsersParams) => {
      setLoading(true);
      setError(null);

      // Build query string
      const queryParams = new URLSearchParams();
      const finalParams = params || initialParams || {};

      if (finalParams.page)
        queryParams.append("page", finalParams.page.toString());
      if (finalParams.limit)
        queryParams.append("limit", finalParams.limit.toString());
      if (finalParams.role) queryParams.append("role", finalParams.role);
      if (finalParams.search) queryParams.append("search", finalParams.search);
      if (finalParams.sortBy) queryParams.append("sortBy", finalParams.sortBy);
      if (finalParams.sortOrder)
        queryParams.append("sortOrder", finalParams.sortOrder);

      const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${
        API_ENDPOINTS.all_users
      }?${queryParams.toString()}`;

      console.log("Fetching users from:", apiUrl);

      try {
        const res = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.message || "Failed to fetch users";
          setError(errorMessage);
          setLoading(false);
          toast.error(errorMessage);
          return false;
        }

        const data: UsersResponse = await res.json();
        console.log("Users data:", data);

        setUsers(data.data.users);
        setPagination(data.data.pagination);
        setFilters(data.data.filters);
        setLoading(false);
        return true;
      } catch (err) {
        console.error("Fetch users error:", err);
        setError("Network error");
        setLoading(false);
        toast.error("Failed to fetch users: Network error");
        return false;
      }
    },
    [initialParams]
  );

  useEffect(() => {
    fetchUsers(initialParams);
  }, []);

  return {
    users,
    loading,
    error,
    pagination,
    filters,
    refetch: fetchUsers,
    setUsers,
  };
}
