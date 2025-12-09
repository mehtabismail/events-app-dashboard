import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

// Extended User type with status
export interface PendingUser {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name?: string;
  photo?: string;
  phone?: string;
  address?: string;
  role: "user" | "event-planner";
  status: "pending" | "active" | "suspended";
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

// API Response type
export interface PendingUsersResponse {
  success: boolean;
  message: string;
  data: {
    users: PendingUser[];
    pagination: Pagination;
  };
}

// Query params type
export interface GetPendingUsersParams {
  page?: number;
  limit?: number;
}

export function usePendingUsers(initialParams?: GetPendingUsersParams) {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  // Store initialParams in a ref so we can use it without it being a dependency
  const initialParamsRef = useRef(initialParams);
  useEffect(() => {
    initialParamsRef.current = initialParams;
  }, [initialParams]);

  const fetchPendingUsers = useCallback(
    async (params?: GetPendingUsersParams) => {
      setLoading(true);
      setError(null);

      // Build query string
      const queryParams = new URLSearchParams();
      const finalParams = params || initialParamsRef.current || {};

      if (finalParams.page)
        queryParams.append("page", finalParams.page.toString());
      if (finalParams.limit)
        queryParams.append("limit", finalParams.limit.toString());

      const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${
        API_ENDPOINTS.pending_users
      }?${queryParams.toString()}`;

      console.log("Fetching pending users from:", apiUrl);

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
          const errorMessage =
            errorData.message || "Failed to fetch pending users";
          setError(errorMessage);
          setLoading(false);
          toast.error(errorMessage);
          return false;
        }

        const data: PendingUsersResponse = await res.json();
        console.log("Pending users data:", data);

        setUsers(data.data.users);
        setPagination(data.data.pagination);
        setLoading(false);
        return true;
      } catch (err) {
        console.error("Fetch pending users error:", err);
        setError("Network error");
        setLoading(false);
        toast.error("Failed to fetch pending users: Network error");
        return false;
      }
    },
    [] // Empty dependencies - function is stable
  );

  // Don't auto-fetch on mount - let component control when to fetch
  // This prevents double fetching and infinite loops

  return {
    users,
    loading,
    error,
    pagination,
    refetch: fetchPendingUsers,
    setUsers,
  };
}
