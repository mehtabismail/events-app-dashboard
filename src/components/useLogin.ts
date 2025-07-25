import { useState } from "react";
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
        return false;
      }
      setLoading(false);
      return true;
    } catch (err) {
      setError("Network error");
      setLoading(false);
      return false;
    }
  }

  return { login, loading, error };
}
