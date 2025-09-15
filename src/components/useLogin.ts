import { useState } from "react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);

    console.log(process.env.NEXT_PUBLIC_BASE_URL);
    console.log(API_ENDPOINTS.login);
    console.log(`${process.env.NEXT_PUBLIC_BASE_URL}${API_ENDPOINTS.login}`);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}${API_ENDPOINTS.login}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          // credentials: "include",
        }
      );

      if (!res.ok) {
        setError("Invalid credentials");
        setLoading(false);
        toast.error("Login failed: Invalid credentials");
        return false;
      }
      const data = await res.json();
      if (res?.ok && data?.user?.token) {
        // console.log("storing token ", data.user?.token);
        // toast.success("token saved");
        // localStorage.setItem("token", data?.user?.token); // store token
        document.cookie = `token=${data?.user?.token}; path=/; max-age=3600`;
      } else {
        toast.success("token not saved");
      }
      console.log(res, "after login");
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
