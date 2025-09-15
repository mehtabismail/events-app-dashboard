import { useState } from "react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}${API_ENDPOINTS.login}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        }
      );
      if (!res.ok) {
        setError("Invalid credentials");
        setLoading(false);
        toast.error("Login failed: Invalid credentials");
        return false;
      }
      setLoading(false);
      toast.success("Login successful!");
      return true;
    } catch {
      setError("Network error");
      setLoading(false);
      toast.error("Login failed: Network error");
      return false;
    }
  }

  return { login, loading, error };
}
