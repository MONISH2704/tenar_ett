"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Search,
  HelpCircle,
  ChevronDown,
  Menu,
} from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
}

interface CurrentUser {
  userId: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const [authResponse, profileResponse] =
          await Promise.all([
            fetch("/api/auth/me", {
              cache: "no-store",
            }),
            fetch("/api/profile", {
              cache: "no-store",
            }),
          ]);

        let currentUser: CurrentUser | null = null;

        if (authResponse.ok) {
          const authData = await authResponse.json();

          if (
            authData.authenticated &&
            authData.user
          ) {
            currentUser = authData.user;
          }
        }

        if (profileResponse.ok) {
          const profileData =
            await profileResponse.json();

          if (
            profileData.profile &&
            currentUser
          ) {
            const profile = profileData.profile;

            currentUser = {
              ...currentUser,
              name: `${profile.firstName} ${profile.lastName}`.trim(),
            };
          }
        }

        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error(
          "Failed to load current user:",
          error
        );
      }
    };

    loadCurrentUser();

    const handleProfileUpdated = (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent<{
          firstName: string;
          lastName: string;
        }>;

      const firstName =
        customEvent.detail?.firstName ?? "";

      const lastName =
        customEvent.detail?.lastName ?? "";

      const updatedName =
        `${firstName} ${lastName}`.trim();

      if (!updatedName) {
        return;
      }

      setUser((previous) =>
        previous
          ? {
              ...previous,
              name: updatedName,
            }
          : previous
      );
    };

    window.addEventListener(
      "profile-updated",
      handleProfileUpdated
    );

    return () => {
      window.removeEventListener(
        "profile-updated",
        handleProfileUpdated
      );
    };
  }, []);

  const displayName =
    user?.name ?? "Loading...";

  const displayRole =
    user?.role === "ADMIN"
      ? "Admin"
      : user?.role === "MANAGER"
        ? "Manager"
        : "Employee";

  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Left Section */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Mobile Menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search anything..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="ml-3 flex items-center gap-2 sm:gap-4">
        {/* Help */}
        <button
          type="button"
          className="hidden rounded-lg p-2 text-slate-500 transition hover:bg-slate-50 hover:text-[#0B63F6] sm:block"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-50 hover:text-[#0B63F6]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />

          <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            3
          </span>
        </button>

        {/* Divider */}
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        {/* User */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-slate-50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-[#0B63F6]">
            {initials}
          </div>

          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-slate-800">
              {displayName}
            </p>

            <p className="text-xs text-slate-500">
              {displayRole}
            </p>
          </div>

          <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
        </button>
      </div>
    </header>
  );
}