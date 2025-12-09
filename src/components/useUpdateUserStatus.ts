import { useState } from "react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { PendingUser } from "./usePendingUsers";

export type UserStatus = "pending" | "active" | "suspended";

export interface UpdateUserStatusParams {
  status: UserStatus;
}

export interface UpdateUserStatusResponse {
  success: boolean;
  message: string;
  data: {
    user: PendingUser;
    statusChange: {
      from: UserStatus;
      to: UserStatus;
    };
  };
}

export function useUpdateUserStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateUserStatus(userId: string, status: UserStatus) {
    setLoading(true);
    setError(null);

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${API_ENDPOINTS.update_user_status}/${userId}/status`;

    console.log("Updating user status from:", apiUrl);
    console.log("New status:", status);

    try {
      const res = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || "Failed to update user status";
        setError(errorMessage);
        setLoading(false);
        toast.error(errorMessage);
        return null;
      }

      const data: UpdateUserStatusResponse = await res.json();
      setLoading(false);
      toast.success(
        `User status changed from '${data.data.statusChange.from}' to '${data.data.statusChange.to}' successfully`
      );
      return data.data.user;
    } catch (err) {
      console.error("Update user status error:", err);
      setError("Network error");
      setLoading(false);
      toast.error("Failed to update user status: Network error");
      return null;
    }
  }

  return { updateUserStatus, loading, error };
}

