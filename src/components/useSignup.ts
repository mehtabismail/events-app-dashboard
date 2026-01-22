import { useState } from "react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { User } from "./useUsers";

// Signup params
export interface SignupParams {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: "user" | "event-planner";
  photo?: File;
  company_name?: string;
  phone?: string;
  address?: string;
}

// Signup response type
export interface SignupResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signup(params: SignupParams): Promise<User | null> {
    setLoading(true);
    setError(null);

    // Use Next.js API route proxy to preserve admin session
    // The proxy will forward admin's cookie but NOT forward the Set-Cookie header back
    const apiUrl = `/api${API_ENDPOINTS.signup}`;

    console.log("Signing up user at:", apiUrl);
    console.log("Signup params:", { ...params, photo: params.photo?.name });

    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append("first_name", params.first_name);
      formData.append("last_name", params.last_name);
      formData.append("email", params.email);
      formData.append("password", params.password);
      formData.append("role", params.role);
      
      // Add optional fields if provided
      if (params.company_name) {
        formData.append("company_name", params.company_name);
      }
      if (params.phone) {
        formData.append("phone", params.phone);
      }
      if (params.address) {
        formData.append("address", params.address);
      }
      if (params.photo) {
        formData.append("photo", params.photo);
      }

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          // Don't set Content-Type header - browser will set it with boundary for FormData
        },
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || "Failed to create user";
        setError(errorMessage);
        setLoading(false);
        toast.error(errorMessage);
        return null;
      }

      const responseData = await res.json();
      console.log("Signup response:", responseData);
      console.log("Full response structure:", JSON.stringify(responseData, null, 2));

      // Handle different possible response structures
      let user: User | null = null;
      
      if (responseData.data?.user) {
        // Structure: { success: true, data: { user: {...} } }
        user = responseData.data.user;
      } else if (responseData.user) {
        // Structure: { success: true, user: {...} }
        user = responseData.user;
      } else if (responseData.data) {
        // Structure: { success: true, data: {...} } (user data directly in data)
        user = responseData.data as User;
      } else {
        // Structure: response is the user directly
        user = responseData as User;
      }

      if (!user || !user._id) {
        console.error("Invalid response structure:", responseData);
        setError("Invalid response from server");
        setLoading(false);
        toast.error("Failed to create event planner: Invalid response format");
        return null;
      }

      setLoading(false);
      toast.success("Event planner created successfully!");
      return user;
    } catch (err) {
      console.error("Signup error:", err);
      setError("Network error");
      setLoading(false);
      toast.error("Failed to create event planner: Network error");
      return null;
    }
  }

  return { signup, loading, error };
}
