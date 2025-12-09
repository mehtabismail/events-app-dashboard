import { useState } from "react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { User } from "./useUsers";

// Update user params
export interface UpdateUserParams {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  photo?: string;
}

// Update response type
export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateUser(
    userId: string,
    updates: UpdateUserParams
  ): Promise<User | null> {
    setLoading(true);
    setError(null);

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${API_ENDPOINTS.update_user}/${userId}`;

    console.log("Updating user at:", apiUrl);
    console.log("Updates:", updates);

    try {
      const res = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || "Failed to update user";
        setError(errorMessage);
        setLoading(false);
        toast.error(errorMessage);
        return null;
      }

      const data: UpdateUserResponse = await res.json();
      console.log("Update response:", data);

      setLoading(false);
      toast.success("User updated successfully!");
      return data.data.user;
    } catch (err) {
      console.error("Update user error:", err);
      setError("Network error");
      setLoading(false);
      toast.error("Failed to update user: Network error");
      return null;
    }
  }

  return { updateUser, loading, error };
}
