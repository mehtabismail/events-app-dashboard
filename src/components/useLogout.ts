import { API_ENDPOINTS } from "@/lib/apiEndpoints";

export async function logout() {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${API_ENDPOINTS.logout}`, {
      method: "POST",
      credentials: "include",
    });
    // Optionally clear client-side state here
    return true;
  } catch {
    return false;
  }
}
