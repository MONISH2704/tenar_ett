"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock3,
  CalendarDays,
  ClipboardList,
  Plane,
  UserRound,
  LogOut,
  X,
  Users,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

interface CurrentUser {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Time Tracking",
    href: "/time-tracking",
    icon: Clock3,
  },
  {
    name: "My Attendance",
    href: "/attendance",
    icon: CalendarDays,
  },
  {
    name: "Work Logs",
    href: "/work-logs",
    icon: ClipboardList,
  },
  {
    name: "Leave Requests",
    href: "/leave",
    icon: Plane,
  },
  {
    name: "My Profile",
    href: "/profile",
    icon: UserRound,
  },
];

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to load current user:", error);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      window.location.href = "/login";
    }
  };

  const role = user?.role;

  const roleNavigation = [
    ...navigation,

    ...(role === "MANAGER" || role === "ADMIN"
      ? [
          {
            name: "Employees",
            href: "/employees",
            icon: Users,
          },
        ]
      : []),

    ...(role === "ADMIN"
      ? [
          {
            name: "Managers",
            href: "/managers",
            icon: ShieldCheck,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r border-slate-200 bg-white
          transition-transform duration-200
          lg:static lg:z-auto lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <img
              src="/images/tenar_logo.jpeg"
              alt="TENĀR"
              className="h-11 w-11 rounded-lg object-contain"
            />

            <div>
              <h1 className="text-xl font-bold tracking-wide text-[#102A43]">
                TENĀR
              </h1>

              <p className="text-[10px] font-medium tracking-wide text-slate-500">
                WORK TIME TRACKER
              </p>
            </div>
          </Link>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <div className="space-y-1">
            {roleNavigation.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group flex items-center gap-3 rounded-lg
                    px-3 py-2.5 text-sm font-medium
                    transition-colors
                    ${
                      isActive
                        ? "bg-blue-50 text-[#0B63F6]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#0B63F6]"
                    }
                  `}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-[18px] w-[18px]" />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}