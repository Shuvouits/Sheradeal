"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Bell,
  MessageSquare,
  FileText,
  Heart,
  Wallet,
  Coins,
  Gift,
  Handshake,
  UserRound,
  SlidersHorizontal,
  MapPin,
  ShieldCheck,
  LogOut,
  LoaderCircle,
  Menu,
  X,
} from "lucide-react";

export const ACCOUNT_MENU = [
  { label: "Overview", slug: "", icon: LayoutDashboard },
  { label: "My Orders", slug: "orders", icon: Package },
  { label: "Notifications", slug: "notifications", icon: Bell },
  { label: "Inbox", slug: "inbox", icon: MessageSquare },
  { label: "Quotes", slug: "quotes", icon: FileText },
  { label: "Wishlist", slug: "wishlist", icon: Heart },
  { label: "Store Credit", slug: "store-credit", icon: Wallet },
  { label: "Points", slug: "points", icon: Coins },
  { label: "Refer a Friend", slug: "referrals", icon: Gift },
  { label: "Affiliate", slug: "affiliate", icon: Handshake },
];

export const SETTINGS_MENU = [
  { label: "Profile", slug: "profile", icon: UserRound },
  { label: "Preferences", slug: "preferences", icon: SlidersHorizontal },
  { label: "Addresses", slug: "addresses", icon: MapPin },
  { label: "Security", slug: "security", icon: ShieldCheck },
];

function isAdministrator(user) {
  const role = user?.role;
  const values = Array.isArray(user?.roles)
    ? user.roles.map((item) =>
        typeof item === "string" ? item : item?.name
      )
    : [];

  values.push(typeof role === "string" ? role : role?.name);

  return (
    user?.is_admin === true ||
    user?.is_super_admin === true ||
    values.some((value) =>
      ["admin", "super_admin", "super-admin"].includes(
        String(value || "").toLowerCase()
      )
    )
  );
}

function SidebarGroup({ items, pathname, onNavigate }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {items.map((item) => {
        const Icon = item.icon;

        const href = item.slug
          ? `/user/dashboard/${item.slug}`
          : "/user/dashboard";

        const active = pathname === href;

        return (
          <Link
            key={item.slug}
            href={href}
            onClick={onNavigate}
            className={`flex min-h-12 items-center gap-3 border-b border-gray-100 px-3 py-2.5 text-[13px] font-medium transition last:border-b-0 ${
              active
                ? "bg-[#EAF7F0] text-[#05714B]"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                active
                  ? "bg-[#D5F1E1] text-[#05714B]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <Icon size={17} />
            </span>

            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function UserDashboardShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function checkAccount() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });

        const result = await response.json().catch(() => ({}));

        const account =
          result.user ||
          result.data?.user ||
          result.data;

        if (!response.ok || result.success !== true || !account?.id) {
          router.replace("/auth/login");
          return;
        }

        if (isAdministrator(account)) {
          router.replace("/admin/dashboard");
          return;
        }

        if (!controller.signal.aborted) {
          setUser(account);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError("Account information load করা যাচ্ছে না।");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    checkAccount();

    return () => controller.abort();
  }, [router]);

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);
    setError("");

    try {
      const response = await fetch("/api/user/signout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Sign out করা যাচ্ছে না।");
      }

      router.replace("/auth/login");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSigningOut(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-[#F8FAF9]">
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : (
          <LoaderCircle
            size={30}
            className="animate-spin text-[#05714B]"
          />
        )}
      </div>
    );
  }

  return (
    <main className="min-h-[75vh] bg-[#FAFBFA] py-8 sm:py-10">
      <div className="mx-auto w-[calc(100%-28px)] max-w-[1440px] sm:w-[calc(100%-40px)]">
        <div className="mb-5 flex items-center justify-between lg:hidden">
          <h1 className="text-xl font-bold text-gray-900">
            My Account
          </h1>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Toggle account menu"
            className="rounded-lg border border-gray-200 bg-white p-2.5 text-[#05714B]"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside
            className={`space-y-5 ${
              mobileOpen ? "block" : "hidden lg:block"
            }`}
          >
            <SidebarGroup
              items={ACCOUNT_MENU}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />

            <div>
              <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                Settings
              </h2>

              <SidebarGroup
                items={SETTINGS_MENU}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                {signingOut ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <LogOut size={17} />
                )}
              </span>

              {signingOut ? "Signing out..." : "Sign Out"}
            </button>
          </aside>

          <div className="min-w-0">
            {error && (
              <p
                role="alert"
                className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {children &&
              (pathname === "/user/dashboard" ? (
                <div>
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-950">
                      Welcome back, {user.name?.split(" ")[0] || "Customer"}!
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                      Your account at a glance
                    </p>
                  </div>

                  {children}
                </div>
              ) : (
                children
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}