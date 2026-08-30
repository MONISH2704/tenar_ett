"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError(
        "Please enter your company email and password."
      );
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Invalid company email or password."
        );
        return;
      }

      window.location.href = "/";
    } catch {
      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen flex-col lg:flex-row">

        {/* Desktop Branding */}
        <section className="hidden bg-[#102A43] px-10 py-10 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between xl:px-16">

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
              <Image
                src="/images/tenar_logo.jpeg"
                alt="TENĀR logo"
                width={56}
                height={56}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            <div>
              <p className="text-xl font-bold tracking-wide">
                TENĀR
              </p>

              <p className="mt-0.5 text-xs text-slate-300">
                Work Time Tracker
              </p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="mb-4 text-sm font-semibold tracking-wide text-blue-400">
              EMPLOYEE WORK MANAGEMENT
            </p>

            <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
              Manage your work time with confidence.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              Track working hours, attendance, work sessions
              and leave requests from one secure company
              platform.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Company Employee Portal
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Authorized employees only
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            © 2026 TENĀR. All rights reserved.
          </p>
        </section>

        {/* Login Section */}
        <section className="flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6 lg:w-1/2 lg:px-10">

          <div className="w-full max-w-md">

            {/* Mobile Branding */}
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">

              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <Image
                  src="/images/tenar_logo.jpeg"
                  alt="TENĀR logo"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-wide text-[#102A43]">
                TENĀR
              </h1>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Work Time Tracker
              </p>
            </div>

            {/* Header */}
            <div className="text-center lg:text-left">

              <p className="text-sm font-semibold text-[#0B63F6]">
                Employee Portal
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#102A43] sm:text-4xl">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in with your company account to continue.
              </p>

            </div>

            {/* Login Card */}
            <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mt-8 sm:p-7">

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Company Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[#102A43]"
                  >
                    Company Email
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="employee@company.com"
                      autoComplete="email"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0B63F6] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-[#102A43]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0B63F6] focus:ring-2 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous
                        )
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#0B63F6]"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div>
                  <label className="flex cursor-pointer items-center gap-2">

                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) =>
                        setRememberMe(
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#0B63F6] focus:ring-[#0B63F6]"
                    />

                    <span className="text-xs text-slate-500">
                      Remember me
                    </span>

                  </label>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                    <p className="text-sm text-red-600">
                      {error}
                    </p>
                  </div>
                )}

                {/* Sign In */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 w-full rounded-lg bg-[#0B63F6] text-sm font-semibold text-white transition hover:bg-[#0956D6] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>

              </form>
            </div>

            {/* Security Notice */}
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">

              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

              <div>
                <p className="text-xs font-semibold text-[#102A43]">
                  Secure employee access
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  This portal is intended for authorized
                  company employees only.
                </p>
              </div>

            </div>

            {/* Mobile Footer */}
            <p className="mt-6 text-center text-[11px] text-slate-400 lg:hidden">
              © 2026 TENĀR. All rights reserved.
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}