"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";

type DashboardStatus =
  | "Working"
  | "On Break"
  | "Completed"
  | "Not Started";

type TimelineItem = {
  time: string;
  title: string;
  description: string;
  color: string;
};

type DashboardData = {
  date: string;
  formattedDate: string;
  user: {
    userId: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  };
  today: {
    clockIn: string | null;
    workingSeconds: number;
    breakSeconds: number;
    workingTime: string;
    breakTime: string;
    status: DashboardStatus;
    timeline: TimelineItem[];
  };
  week: {
    workingSeconds: number;
    breakSeconds: number;
    overtimeSeconds: number;
    workingTime: string;
    breakTime: string;
    overtime: string;
    lateArrivals: number;
  };
};

function formatLiveDuration(seconds: number) {
  const safeSeconds = Math.max(0, seconds);

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(
    2,
    "0",
  )}m`;
}

function getStatusColor(status: DashboardStatus) {
  switch (status) {
    case "Working":
      return "bg-green-500";

    case "On Break":
      return "bg-orange-500";

    case "Completed":
      return "bg-slate-400";

    default:
      return "bg-slate-300";
  }
}

function getStatusTextColor(status: DashboardStatus) {
  switch (status) {
    case "Working":
      return "text-green-600";

    case "On Break":
      return "text-orange-600";

    case "Completed":
      return "text-slate-600";

    default:
      return "text-slate-500";
  }
}

export default function Home() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [liveWorkingSeconds, setLiveWorkingSeconds] =
    useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load dashboard");
      }

      const data: DashboardData = await response.json();

      setDashboard(data);
      setLiveWorkingSeconds(data.today.workingSeconds);
      setError("");
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    const refreshInterval = setInterval(() => {
      loadDashboard();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    if (!dashboard || dashboard.today.status !== "Working") {
      return;
    }

    const timer = setInterval(() => {
      setLiveWorkingSeconds((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [dashboard]);

  if (loading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-sm text-slate-500">
              Loading dashboard...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !dashboard) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-600">
              {error || "Unable to load dashboard."}
            </p>

            <button
              type="button"
              onClick={loadDashboard}
              className="mt-4 rounded-lg bg-[#0B63F6] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const statusColor = getStatusColor(dashboard.today.status);
  const statusTextColor = getStatusTextColor(
    dashboard.today.status,
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <p className="text-sm font-medium text-[#0B63F6]">
            {dashboard.formattedDate}
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#102A43]">
            Welcome back, {dashboard.user.name}! 👋
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your work today.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Clock In"
            value={dashboard.today.clockIn ?? "--"}
            description="Today"
          />

          <StatCard
            title="Total Working"
            value={formatLiveDuration(liveWorkingSeconds)}
            description="Today"
          />

          <StatCard
            title="Break Time"
            value={dashboard.today.breakTime}
            description="Today"
          />

          {/* Current Status */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Current Status
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${statusColor}`}
              />

              <span
                className={`text-lg font-semibold ${statusTextColor}`}
              >
                {dashboard.today.status}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              {dashboard.today.status === "Working"
                ? "Active session"
                : dashboard.today.status === "On Break"
                  ? "Currently on break"
                  : dashboard.today.status === "Completed"
                    ? "Today's work completed"
                    : "No active session"}
            </p>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Today's Timeline */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#102A43]">
              Today&apos;s Timeline
            </h2>

            {dashboard.today.timeline.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-slate-200 p-6 text-center">
                <p className="text-sm text-slate-500">
                  No work activity recorded today.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {dashboard.today.timeline.map((item, index) => (
                  <TimelineItem
                    key={`${item.time}-${item.title}-${index}`}
                    time={item.time}
                    title={item.title}
                    description={item.description}
                    color={item.color}
                    isLast={
                      index ===
                      dashboard.today.timeline.length - 1
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Weekly Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#102A43]">
              This Week
            </h2>

            <div className="mt-6 space-y-5">
              <SummaryItem
                label="Total Working Hours"
                value={dashboard.week.workingTime}
              />

              <SummaryItem
                label="Total Break Hours"
                value={dashboard.week.breakTime}
              />

              <SummaryItem
                label="Overtime"
                value={dashboard.week.overtime}
              />

              <SummaryItem
                label="Late Arrivals"
                value={String(dashboard.week.lateArrivals)}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/* Statistics Card */
function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* Timeline Item */
function TimelineItem({
  time,
  title,
  description,
  color,
  isLast,
}: {
  time: string;
  title: string;
  description: string;
  color: string;
  isLast: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <span
          className={`mt-1 h-3 w-3 rounded-full ${color}`}
        />

        {!isLast && (
          <span className="mt-1 h-10 w-px bg-slate-200" />
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-400">
          {time}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* Weekly Summary Item */
function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}