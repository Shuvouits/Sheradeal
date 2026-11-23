"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserRound,
  Phone,
  Mail,
  MapPin,
  AtSign,
  LockKeyhole,
  Eye,
  EyeOff,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  delivery_address: "",
  username: "",
  password: "",
  password_confirmation: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-xl border border-gray-200 bg-gray-50/70 pl-11 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#05714B] focus:bg-white focus:ring-2 focus:ring-emerald-100";

function FormField({ label, icon: Icon, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={18}
          strokeWidth={1.7}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />

        {children}
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default function RegistrationForm() {
  const router = useRouter();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  function update(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
      ...(field === "password"
        ? { password_confirmation: undefined }
        : {}),
    }));

    setGeneralError("");
  }

  function validate() {
    const nextErrors = {};

    if (form.name.trim().length < 2) {
      nextErrors.name = "কমপক্ষে ২ অক্ষরের নাম লিখুন।";
    }

    if (!/^01[3-9]\d{8}$/.test(form.phone.trim())) {
      nextErrors.phone = "সঠিক ১১ সংখ্যার মোবাইল নম্বর লিখুন।";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "সঠিক Email Address লিখুন।";
    }

    if (form.delivery_address.trim().length < 5) {
      nextErrors.delivery_address =
        "সম্পূর্ণ Delivery Address লিখুন।";
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(form.username.trim())) {
      nextErrors.username =
        "Username ৩-৩০ অক্ষরের হতে হবে। English Letter, Number ও _ ব্যবহার করুন।";
    }

    if (form.password.length < 8) {
      nextErrors.password =
        "Password কমপক্ষে ৮ অক্ষরের হতে হবে।";
    }

    if (!form.password_confirmation) {
      nextErrors.password_confirmation =
        "Confirm Password লিখুন।";
    } else if (form.password !== form.password_confirmation) {
      nextErrors.password_confirmation =
        "Password এবং Confirm Password একই হতে হবে।";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting || registered || !validate()) {
      return;
    }

    setSubmitting(true);
    setGeneralError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim().toLowerCase(),
          delivery_address: form.delivery_address.trim(),
          username: form.username.trim().toLowerCase(),
          password: form.password,
          password_confirmation: form.password_confirmation,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        if (result.errors) {
          const fieldErrors = {};

          Object.entries(result.errors).forEach(([field, messages]) => {
            fieldErrors[field] = Array.isArray(messages)
              ? messages[0]
              : String(messages);
          });

          setErrors(fieldErrors);
        }

        throw new Error(
          result.message || "Account তৈরি করা যায়নি।"
        );
      }

      setRegistered(true);
      setForm(EMPTY_FORM);

      router.replace("/auth/login?registered=1");
      router.refresh();
    } catch (error) {
      setGeneralError(
        error.message || "Registration সম্পন্ন করা যায়নি।"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-180px)] bg-gradient-to-br from-white via-[#FAFCFB] to-[#EAF7F0] px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[440px] overflow-hidden rounded-[24px] border border-emerald-100 border-t-[5px] border-t-[#05714B] bg-white shadow-[0_20px_55px_rgba(0,0,0,0.09)]">
        <div className="px-7 pb-8 pt-9 sm:px-10">
          <Link
            href="/"
            className="mb-9 flex items-center justify-center gap-3"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#05714B] text-[33px] font-extrabold text-white">
              S
            </span>

            <span className="text-left">
              <strong className="block text-[26px] font-extrabold leading-7 tracking-[-1.5px] text-black">
                Shera
                <span className="text-[#05714B]">Deal</span>
              </strong>

              <small className="mt-1 block text-[9px] font-semibold tracking-[0.36em] text-gray-600">
                BANGLADESH
              </small>
            </span>
          </Link>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[#075D40]">
              Create your account
            </h1>

            <p className="mt-2 text-[13px] text-gray-500">
              Join SheraDeal and start shopping your favorites
            </p>
          </div>

          {generalError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700"
            >
              <AlertCircle
                size={17}
                className="shrink-0"
              />

              <span>{generalError}</span>
            </div>
          )}

          {registered && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-[#05714B]">
              <CheckCircle2 size={18} />

              Account তৈরি হয়েছে। Login Page-এ যাচ্ছি।
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <FormField
              label="Full Name"
              icon={UserRound}
              error={errors.name}
            >
              <input
                type="text"
                name="name"
                autoComplete="name"
                required
                maxLength={120}
                value={form.name}
                onChange={(event) =>
                  update("name", event.target.value)
                }
                placeholder="Enter your full name"
                className={INPUT_CLASS}
              />
            </FormField>

            <FormField
              label="Mobile Number"
              icon={Phone}
              error={errors.phone}
            >
              <input
                type="tel"
                name="phone"
                autoComplete="tel-national"
                inputMode="numeric"
                required
                maxLength={11}
                value={form.phone}
                onChange={(event) =>
                  update(
                    "phone",
                    event.target.value.replace(/\D/g, "").slice(0, 11)
                  )
                }
                placeholder="01XXXXXXXXX"
                className={INPUT_CLASS}
              />
            </FormField>

            <FormField
              label="Email"
              icon={Mail}
              error={errors.email}
            >
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                maxLength={180}
                value={form.email}
                onChange={(event) =>
                  update("email", event.target.value)
                }
                placeholder="you@example.com"
                className={INPUT_CLASS}
              />
            </FormField>

            <FormField
              label="Delivery Address"
              icon={MapPin}
              error={errors.delivery_address}
            >
              <input
                type="text"
                name="delivery_address"
                autoComplete="street-address"
                required
                maxLength={500}
                value={form.delivery_address}
                onChange={(event) =>
                  update("delivery_address", event.target.value)
                }
                placeholder="House, road, area, city"
                className={INPUT_CLASS}
              />
            </FormField>

            <FormField
              label="Username"
              icon={AtSign}
              error={errors.username}
            >
              <input
                type="text"
                name="username"
                autoComplete="username"
                required
                maxLength={30}
                value={form.username}
                onChange={(event) =>
                  update("username", event.target.value)
                }
                placeholder="Choose a username"
                className={INPUT_CLASS}
              />
            </FormField>

            <FormField
              label="Password"
              icon={LockKeyhole}
              error={errors.password}
            >
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={form.password}
                onChange={(event) =>
                  update("password", event.target.value)
                }
                placeholder="At least 8 characters"
                className={INPUT_CLASS}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((value) => !value)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-gray-400 hover:text-[#05714B]"
              >
                {showPassword ? (
                  <Eye size={18} />
                ) : (
                  <EyeOff size={18} />
                )}
              </button>
            </FormField>

            <FormField
              label="Confirm Password"
              icon={LockKeyhole}
              error={errors.password_confirmation}
            >
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="password_confirmation"
                autoComplete="new-password"
                required
                minLength={8}
                value={form.password_confirmation}
                onChange={(event) =>
                  update(
                    "password_confirmation",
                    event.target.value
                  )
                }
                placeholder="Re-enter your password"
                className={INPUT_CLASS}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((value) => !value)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-gray-400 hover:text-[#05714B]"
              >
                {showConfirmPassword ? (
                  <Eye size={18} />
                ) : (
                  <EyeOff size={18} />
                )}
              </button>
            </FormField>

            <button
              type="submit"
              disabled={submitting || registered}
              className="mt-2 flex h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#05714B] to-[#063C2B] text-sm font-bold text-white shadow-lg shadow-emerald-950/10 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />

                  Creating Account...
                </>
              ) : registered ? (
                <>
                  <CheckCircle2 size={18} />
                  Account Created
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        <div className="border-t border-gray-100 bg-[#F5FAF7] px-5 py-5 text-center">
          <p className="text-[13px] text-gray-500">
            Already have an account?{" "}

            <Link
              href="/auth/login"
              className="font-semibold text-[#05714B] hover:underline"
            >
              Log In{" "}
              <ArrowRight
                size={14}
                className="inline"
              />
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}