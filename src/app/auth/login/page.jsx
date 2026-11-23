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
    <main className="shera-login-page">
      <div className="shera-login-card">
        <div className="shera-login-body">
          <Link href="/" className="shera-login-logo">
            <span className="shera-login-logo-icon">
              S
            </span>

            <span className="shera-login-logo-text">
              <strong>
                Shera<span>Deal</span>
              </strong>
              <small>BANGLADESH</small>
            </span>
          </Link>

          <div className="shera-login-heading">
            <h1>Welcome back</h1>
            <p>Log in to your account to continue shopping</p>
          </div>

          {error && (
            <div className="shera-login-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="shera-login-field">
              <label htmlFor="shera-email">
                Email Address
              </label>

              <div className="shera-login-input">
                <UserRound size={18} />

                <input
                  id="shera-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="shera-login-field">
              <label htmlFor="shera-password">
                Password
              </label>

              <div className="shera-login-input">
                <LockKeyhole size={18} />

                <input
                  id="shera-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="shera-password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="shera-login-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="shera-login-spinner"
                  />
                  Signing in...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <div className="shera-login-links">
            <Link href="/auth/forgot-password">
              Forgot password?
            </Link>

            <Link href="/auth/register">
              Create account
            </Link>
          </div>
        </div>

        <div className="shera-login-footer">
          <span>New to SheraDeal?</span>

          <Link href="/auth/register">
            Join us today
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <style>{`
        .shera-login-page {
          min-height: calc(100vh - 185px);
          width: 100%;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 56px 20px 70px;
          font-family: "Segoe UI", Arial, sans-serif;
          background:
            radial-gradient(
              ellipse at 18% 30%,
              var(--brand-lighter, #f2f8f5),
              transparent 55%
            ),
            radial-gradient(
              ellipse at 83% 85%,
              var(--brand-light, #eaf5ef),
              transparent 60%
            ),
            #ffffff;
        }

        .shera-login-card {
          width: 100%;
          max-width: 435px;
          background: #ffffff;
          border: 1px solid var(--brand-border, #d6e9df);
          border-top: 5px solid var(--brand-primary, #05714b);
          border-radius: 23px;
          overflow: hidden;
          box-shadow: 0 16px 50px rgba(0, 0, 0, 0.08);
        }

        .shera-login-body {
          padding: 43px 38px 40px;
        }

        .shera-login-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: fit-content;
          margin: 0 auto 32px;
          text-decoration: none;
        }

        .shera-login-logo-icon {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--brand-primary, #05714b);
          color: #ffffff;
          border-radius: 11px 3px 11px 3px;
          font-size: 31px;
          font-weight: 800;
          letter-spacing: -2px;
        }

        .shera-login-logo-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .shera-login-logo-text strong {
          font-size: 25px;
          font-weight: 800;
          color: var(--brand-black, #111111);
          line-height: 1;
          letter-spacing: -1px;
        }

        .shera-login-logo-text strong span {
          color: var(--brand-primary, #05714b);
        }

        .shera-login-logo-text small {
          font-size: 9px;
          letter-spacing: 4px;
          color: #333333;
        }

        .shera-login-heading {
          text-align: center;
          margin-bottom: 34px;
        }

        .shera-login-heading h1 {
          margin: 0 0 7px;
          font-size: 25px;
          font-weight: 700;
          line-height: 1.3;
          color: var(--brand-black, #111111);
        }

        .shera-login-heading p {
          margin: 0;
          font-size: 13px;
          color: #667085;
          line-height: 1.6;
        }

        .shera-login-field {
          margin-bottom: 21px;
        }

        .shera-login-field label {
          display: block;
          margin-bottom: 8px;
          color: #344054;
          font-size: 13px;
          font-weight: 500;
        }

        .shera-login-input {
          height: 43px;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 13px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 11px;
          color: #98a2b3;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .shera-login-input:focus-within {
          border-color: var(--brand-primary, #05714b);
          box-shadow: 0 0 0 3px var(--brand-light, #eaf5ef);
        }

        .shera-login-input input {
          flex: 1;
          width: 100%;
          min-width: 0;
          height: 100%;
          outline: none;
          border: none;
          background: transparent;
          color: #171717;
          font-size: 13px;
          font-family: inherit;
        }

        .shera-login-input input::placeholder {
          color: #98a2b3;
        }

        .shera-password-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          background: none;
          border: none;
          color: #98a2b3;
          cursor: pointer;
        }

        .shera-password-toggle:hover {
          color: var(--brand-primary, #05714b);
        }

        .shera-login-submit {
          width: 100%;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: none;
          border-radius: 11px;
          background: linear-gradient(
            110deg,
            var(--brand-primary, #05714b),
            var(--brand-black, #111111)
          );
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 6px 14px var(--brand-shadow, rgba(0,0,0,0.12));
          transition: opacity 0.2s;
        }

        .shera-login-submit:hover:not(:disabled) {
          opacity: 0.9;
        }

        .shera-login-submit:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .shera-login-links {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 22px;
        }

        .shera-login-links a {
          font-size: 13px;
          color: #667085;
          text-decoration: none;
        }

        .shera-login-links a:last-child {
          color: var(--brand-primary, #05714b);
        }

        .shera-login-links a:hover {
          text-decoration: underline;
        }

        .shera-login-footer {
          min-height: 53px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 5px;
          padding: 14px;
          background: var(--brand-lighter, #f2f8f5);
          border-top: 1px solid var(--brand-border, #d6e9df);
          font-size: 13px;
          color: #667085;
        }

        .shera-login-footer a {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--brand-primary, #05714b);
          text-decoration: none;
          font-weight: 600;
        }

        .shera-login-footer a:hover {
          text-decoration: underline;
        }

        .shera-login-error {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 11px 12px;
          margin-bottom: 18px;
          border-radius: 9px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 12px;
          line-height: 1.5;
        }

        .shera-login-error svg {
          flex-shrink: 0;
        }

        .shera-login-spinner {
          animation: shera-spin 0.8s linear infinite;
        }

        @keyframes shera-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .shera-login-page {
            padding: 35px 16px 55px;
          }
        }

        @media (max-width: 480px) {
          .shera-login-page {
            padding: 24px 12px 40px;
          }

          .shera-login-card {
            border-radius: 18px;
          }

          .shera-login-body {
            padding: 35px 24px 32px;
          }

          .shera-login-heading h1 {
            font-size: 23px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .shera-login-spinner {
            animation: none;
          }
        }
      `}</style>
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
