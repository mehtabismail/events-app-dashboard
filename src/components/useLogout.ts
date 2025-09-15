import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toast } from "sonner";

export async function logout() {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${API_ENDPOINTS.logout}`, {
      method: "POST",
      // credentials: "include",
    });
    toast.success("Logout successful!");
    // Optionally clear client-side state here
    return true;
  } catch {
    toast.error("Logout failed: Network error");
    return false;
  }
}
