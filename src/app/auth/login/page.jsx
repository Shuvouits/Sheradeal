"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  LoaderCircle,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import LoginGuard from "@/components/auth/LoginGuard";
import { getDashboardByRole } from "@/lib/authRedirect";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          email: email.trim(),
          password,
          remember_me: rememberMe,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        const validationError = result.errors
          ? Object.values(result.errors).flat()[0]
          : null;

        throw new Error(
          validationError ||
          result.message ||
          "Invalid email or password."
        );
      }

      const destination = getDashboardByRole(result.user);

      if (!destination) {
        throw new Error(
          "Login succeeded, but your account role has no assigned dashboard."
        );
      }

      window.location.replace(destination);
    } catch (err) {
      setError(
        err.message ||
        "Unable to connect to the server. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-185px)] w-full items-start justify-center bg-[radial-gradient(ellipse_at_18%_30%,#f2f8f5,transparent_55%),radial-gradient(ellipse_at_83%_85%,#eaf5ef,transparent_60%)] bg-white px-5 pt-14 pb-[70px] font-['Segoe_UI',Arial,sans-serif] max-md:px-4 max-md:pt-[35px] max-md:pb-[55px] max-[480px]:px-3 max-[480px]:pt-6 max-[480px]:pb-10">
      <div className="w-full max-w-[435px] overflow-hidden rounded-[23px] border border-[#d6e9df] border-t-[5px] border-t-[#05714b] bg-white shadow-[0_16px_50px_rgba(0,0,0,0.08)] max-[480px]:rounded-[18px]">
        <div className="px-[38px] pt-[43px] pb-10 max-[480px]:px-6 max-[480px]:pt-[35px] max-[480px]:pb-8">
          <Link
            href="/"
            className="mx-auto mb-8 flex w-fit items-center justify-center gap-2.5 no-underline"
          >
            <span className="flex h-[46px] w-[46px] items-center justify-center rounded-[11px_3px_11px_3px] bg-[#05714b] text-[31px] font-extrabold tracking-[-2px] text-white">
              S
            </span>

            <span className="flex flex-col gap-[3px]">
              <strong className="text-[25px] leading-none font-extrabold tracking-[-1px] text-[#111111]">
                Shera<span className="text-[#05714b]">Deal</span>
              </strong>

              <small className="text-[9px] tracking-[4px] text-[#333333]">
                BANGLADESH
              </small>
            </span>
          </Link>

          <div className="mb-[34px] text-center">
            <h1 className="mb-[7px] text-[25px] leading-[1.3] font-bold text-[#111111] max-[480px]:text-[23px]">
              Welcome back
            </h1>

            <p className="text-[13px] leading-[1.6] text-[#667085]">
              Log in to your account to continue shopping
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-[18px] flex items-start gap-[9px] rounded-[9px] border border-[#fecaca] bg-[#fef2f2] px-3 py-[11px] text-xs leading-[1.5] text-[#b91c1c]"
            >
              <AlertCircle
                size={18}
                className="shrink-0"
              />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-[21px]">
              <label
                htmlFor="shera-email"
                className="mb-2 block text-[13px] font-medium text-[#344054]"
              >
                Email Address
              </label>

              <div className="flex h-[43px] w-full items-center gap-3 rounded-[11px] border border-[#e5e7eb] bg-white px-[13px] text-[#98a2b3] transition-[border-color,box-shadow] duration-200 focus-within:border-[#05714b] focus-within:shadow-[0_0_0_3px_#eaf5ef]">
                <UserRound size={18} className="shrink-0" />

                <input
                  id="shera-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  className="h-full w-full min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[#171717] placeholder:text-[#98a2b3] focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-[21px]">
              <label
                htmlFor="shera-password"
                className="mb-2 block text-[13px] font-medium text-[#344054]"
              >
                Password
              </label>

              <div className="flex h-[43px] w-full items-center gap-3 rounded-[11px] border border-[#e5e7eb] bg-white px-[13px] text-[#98a2b3] transition-[border-color,box-shadow] duration-200 focus-within:border-[#05714b] focus-within:shadow-[0_0_0_3px_#eaf5ef]">
                <LockKeyhole size={18} className="shrink-0" />

                <input
                  id="shera-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  className="h-full w-full min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[#171717] placeholder:text-[#98a2b3] focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[#98a2b3] hover:text-[#05714b]"
                >
                  {showPassword ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>
              </div>
            </div>

            <label
              htmlFor="shera-remember-me"
              className="mb-5 flex w-fit cursor-pointer items-center gap-[9px] text-[13px] font-medium text-[#475467] select-none"
            >
              <input
                id="shera-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                disabled={loading}
                className="h-4 w-4 cursor-pointer accent-[#05714b] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#05714b] disabled:cursor-not-allowed disabled:opacity-60"
              />
              <span>Remember me</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-[9px] rounded-[11px] border-0 bg-[linear-gradient(110deg,#05714b,#111111)] text-sm font-bold text-white shadow-[0_6px_14px_rgba(0,0,0,0.12)] transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin motion-reduce:animate-none"
                  />
                  Signing in...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <div className="mt-[22px] flex items-center justify-between gap-3">
            <Link
              href="/auth/forgot-password"
              className="text-[13px] text-[#667085] no-underline hover:underline"
            >
              Forgot password?
            </Link>

            <Link
              href="/auth/register"
              className="text-[13px] text-[#05714b] no-underline hover:underline"
            >
              Create account
            </Link>
          </div>
        </div>

        <div className="flex min-h-[53px] flex-wrap items-center justify-center gap-[5px] border-t border-[#d6e9df] bg-[#f2f8f5] p-[14px] text-[13px] text-[#667085]">
          <span>New to SheraDeal?</span>

          <Link
            href="/auth/register"
            className="inline-flex items-center gap-1 font-semibold text-[#05714b] no-underline hover:underline"
          >
            Join us today
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <LoginGuard>
      <LoginForm />
    </LoginGuard>
  );
}
