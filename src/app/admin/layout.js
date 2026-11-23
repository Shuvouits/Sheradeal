import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sheradeal_token")?.value;

  if (!token) {
    redirect("/auth/login?redirect=/admin/dashboard");
  }

  const apiUrl = process.env.LARAVEL_API_URL || "http://127.0.0.1:8000";

  let user = null;

  try {
    const response = await fetch(`${apiUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const result = await response.json();
      user = result.data;
    }
  } catch {
    redirect("/auth/login?redirect=/admin/dashboard");
  }

  if (!user) {
    redirect("/auth/login?redirect=/admin/dashboard");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  return (
    <AdminShell user={user}>
      {children}
    </AdminShell>
  );
}
