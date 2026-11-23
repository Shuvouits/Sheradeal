
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  UserRound,
  Settings,
  Bell,
  SlidersHorizontal,
  LogOut,
  ChevronUp,
  ChevronDown,
  LoaderCircle,
  X,
} from "lucide-react";

const menuItems = [
  {
    key: "profile",
    label: "Profile",
    icon: UserRound,
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    key: "preferences",
    label: "Preferences",
    icon: SlidersHorizontal,
  },
];

export default function AdminAccountMenu() {
  const router = useRouter();

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState("");

  const [position, setPosition] = useState({
    left: 12,
    bottom: 90,
    width: 240,
  });

  useEffect(() => {
    setMounted(true);

    const controller = new AbortController();

    async function getUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json();

        if (response.ok && result.authenticated) {
          setUser(result.user || null);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Unable to load admin profile:", error);
        }
      }
    }

    getUser();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const button = buttonRef.current;

      if (!button) return;

      const rect = button.getBoundingClientRect();

      setPosition({
        left: Math.max(
          8,
          Math.min(
            rect.left,
            window.innerWidth - 256
          )
        ),
        bottom: Math.max(
          8,
          window.innerHeight - rect.top + 8
        ),
        width: Math.max(220, Math.min(rect.width, 248)),
      });
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        !buttonRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const accountName = user?.name || "SheraDeal Admin";
  const accountEmail = user?.email || "";

  function handleMenuItem(key) {
    setSelected(key);
    setMessage("");
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to sign out."
        );
      }

      setOpen(false);
      setUser(null);

      window.location.replace("/auth/login");
    } catch (error) {
      setMessage(error.message || "Logout failed.");
      setLoggingOut(false);
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          setSelected("");
          setMessage("");
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-[#F2F7F4]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#05714B] text-sm font-bold text-white">
          {accountName.charAt(0).toUpperCase()}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-bold text-gray-900">
            {accountName}
          </span>

          <span className="mt-1 block truncate text-[11px] text-gray-500">
            {accountEmail}
          </span>
        </span>

        {open ? (
          <ChevronUp size={16} className="text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-500" />
        )}
      </button>

      {mounted && open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Admin account menu"
            className="fixed z-[9999] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.16)]"
            style={{
              left: position.left,
              bottom: position.bottom,
              width: position.width,
              maxWidth: "calc(100vw - 16px)",
              maxHeight: "calc(100vh - 24px)",
              overflowY: "auto",
            }}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[11px] text-gray-500">
                  My Account
                </p>

                <p className="mt-1 truncate text-xs font-medium text-gray-800">
                  {accountEmail || accountName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close account menu"
                className="cursor-pointer rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              >
                <X size={15} />
              </button>
            </div>

            <div className="py-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    type="button"
                    role="menuitem"
                    key={item.key}
                    onClick={() => handleMenuItem(item.key)}
                    className={`flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                      selected === item.key
                        ? "bg-[#ECF7F1] text-[#05714B]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {selected && (
              <div className="mx-3 mb-2 rounded-lg bg-[#F4F8F6] px-3 py-2 text-xs leading-5 text-gray-600">
                {selected === "profile" ? (
                  <>
                    <strong className="block text-gray-900">
                      {accountName}
                    </strong>
                    {accountEmail}
                  </>
                ) : (
                  <>
                    {menuItems.find(
                      (item) => item.key === selected
                    )?.label}{" "}
                    page is not configured yet.
                  </>
                )}
              </div>
            )}

            {message && (
              <div
                role="alert"
                className="mx-3 mb-2 rounded-lg bg-red-50 p-2 text-xs text-red-600"
              >
                {message}
              </div>
            )}

            <div className="border-t border-gray-100 p-2">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <LogOut size={17} />
                )}

                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
