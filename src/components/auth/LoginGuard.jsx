"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { getDashboardByRole } from "@/lib/authRedirect";

export default function LoginGuard({ children }) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function checkLogin() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });

        if (response.ok) {
          const result = await response.json();

          if (result.authenticated && result.user) {
            const destination = getDashboardByRole(result.user);

            if (destination) {
              window.location.replace(destination);
              return;
            }
          }
        }
      } catch (error) {
        if (error.name === "AbortError") return;
      }

      if (!controller.signal.aborted) {
        setChecking(false);
      }
    }

    checkLogin();

    return () => controller.abort();
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <LoaderCircle
          size={28}
          className="animate-spin text-[#05714B]"
        />
      </div>
    );
  }

  return children;
}