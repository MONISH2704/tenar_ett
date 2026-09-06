"use client";

import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  CalendarDays,
  Clock3,
  Coffee,
  Search,
  BriefcaseBusiness,
  Timer,
  X,
  Users,
  UserCheck,
} from "lucide-react";

type SessionType = "Work" | "Break";

type TeamStatus =
  | "Working"
  | "Break"
  | "Completed"
  | "Not Started";

type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

interface WorkLog {
  id: string;
  date: string;
  dateValue: string;
  day: string;
  type: SessionType;
  startTime: string;
  endTime: string;
  duration: string;
}

interface TeamWorkLog {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  date: string;
  status: TeamStatus;
  started: string | null;
  totalWorkingSeconds: number;
}

export default function WorkLogsPage() {
  const [userRole, setUserRole] =
    useState<UserRole | null>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to identify current user."
          );
        }

        const data = await response.json();

        setUserRole(
          data.user?.role ?? null
        );
      } catch (error) {
        console.error(
          "Failed to fetch current user:",
          error
        );
      } finally {
        setAuthLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  if (authLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[300px] items-center justify-center">
            <Clock3 className="h-8 w-8 animate-pulse text-slate-300" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (
    userRole === "MANAGER" ||
    userRole === "ADMIN"
  ) {
    return <TeamWorkLogs />;
  }

  return <EmployeeWorkLogs />;
}

/* =========================================================
   EMPLOYEE VIEW
   ========================================================= */

function EmployeeWorkLogs() {
  const [workLogs, setWorkLogs] =
    useState<WorkLog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [sessionFilter, setSessionFilter] =
    useState<"All" | SessionType>("All");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedDate, setSelectedDate] =
    useState("");

  useEffect(() => {
    const fetchWorkLogs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/work-logs",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to fetch work logs."
          );
        }

        setWorkLogs(data.workLogs ?? []);
      } catch (error) {
        console.error(
          "Failed to fetch work logs:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to fetch work logs."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return workLogs.filter((log) => {
      const matchesType =
        sessionFilter === "All" ||
        log.type === sessionFilter;

      const search =
        searchTerm.toLowerCase();

      const matchesSearch =
        log.date
          .toLowerCase()
          .includes(search) ||
        log.day
          .toLowerCase()
          .includes(search) ||
        log.type
          .toLowerCase()
          .includes(search);

      const matchesDate =
        selectedDate === "" ||
        log.dateValue === selectedDate;

      return (
        matchesType &&
        matchesSearch &&
        matchesDate
      );
    });
  }, [
    workLogs,
    sessionFilter,
    searchTerm,
    selectedDate,
  ]);

  const workSessions =
    workLogs.filter(
      (log) => log.type === "Work"
    ).length;

  const breakSessions =
    workLogs.filter(
      (log) => log.type === "Break"
    ).length;

  const todayDate =
    new Date().toLocaleDateString(
      "en-CA",
      {
        timeZone: "Asia/Kolkata",
      }
    );

  const todayWorkingMinutes =
    workLogs
      .filter(
        (log) =>
          log.dateValue === todayDate &&
          log.type === "Work"
      )
      .reduce((total, log) => {
        const match =
          log.duration.match(
            /(\d+)h\s*(\d+)m/
          );

        if (!match) {
          return total;
        }

        const hours = Number(
          match[1]
        );

        const minutes = Number(
          match[2]
        );

        return (
          total +
          hours * 60 +
          minutes
        );
      }, 0);

  const todayWorkingHours =
    Math.floor(
      todayWorkingMinutes / 60
    );

  const todayWorkingRemainingMinutes =
    todayWorkingMinutes % 60;

  const todayWorking =
    todayWorkingMinutes > 0
      ? `${String(
          todayWorkingHours
        ).padStart(
          2,
          "0"
        )}h ${String(
          todayWorkingRemainingMinutes
        ).padStart(
          2,
          "0"
        )}m`
      : "00h 00m";

  const handleDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedDate(
      event.target.value
    );

    setSearchTerm("");
  };

  const clearDateFilter = () => {
    setSelectedDate("");
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-[#0B63F6]">
            Time Management
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#102A43]">
            Work Logs
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View your detailed work sessions
            and break history.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            icon={
              <BriefcaseBusiness className="h-5 w-5" />
            }
            title="Work Sessions"
            value={workSessions.toString()}
            description="Recorded work sessions"
            type="blue"
          />

          <SummaryCard
            icon={
              <Coffee className="h-5 w-5" />
            }
            title="Break Sessions"
            value={breakSessions.toString()}
            description="Recorded breaks"
            type="orange"
          />

          <SummaryCard
            icon={
              <Timer className="h-5 w-5" />
            }
            title="Today's Working"
            value={todayWorking}
            description="Total active work time"
            type="green"
          />
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search work logs..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="date"
                  value={selectedDate}
                  onChange={
                    handleDateChange
                  }
                  className="h-10 rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-600 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  aria-label="Filter work logs by date"
                />
              </div>

              {selectedDate && (
                <button
                  type="button"
                  onClick={
                    clearDateFilter
                  }
                  className="flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-red-600"
                  title="Clear date filter"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>

            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              {(
                [
                  "All",
                  "Work",
                  "Break",
                ] as const
              ).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() =>
                    setSessionFilter(
                      filter
                    )
                  }
                  className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                    sessionFilter ===
                    filter
                      ? "bg-white text-[#0B63F6] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" />

              <span>
                Showing logs for{" "}
                <span className="font-semibold text-slate-700">
                  {new Date(
                    `${selectedDate}T00:00:00`
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-[#102A43]">
                Session History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Detailed record of your work
                and break sessions.
              </p>
            </div>

            <Clock3 className="h-5 w-5 text-slate-400" />
          </div>

          {loading && (
            <LoadingState text="Loading work logs..." />
          )}

          {!loading && error && (
            <ErrorState
              message={error}
            />
          )}

          {!loading &&
            !error &&
            filteredLogs.length > 0 && (
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <TableHeader>
                        Date
                      </TableHeader>

                      <TableHeader>
                        Session
                      </TableHeader>

                      <TableHeader>
                        Start Time
                      </TableHeader>

                      <TableHeader>
                        End Time
                      </TableHeader>

                      <TableHeader>
                        Duration
                      </TableHeader>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredLogs.map(
                      (log) => (
                        <tr
                          key={log.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-800">
                              {log.date}
                            </p>

                            <p className="text-xs text-slate-400">
                              {log.day}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <SessionBadge
                              type={
                                log.type
                              }
                            />
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {
                              log.startTime
                            }
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {
                              log.endTime
                            }
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-slate-700">
                              {
                                log.duration
                              }
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}

          {!loading &&
            !error &&
            filteredLogs.length > 0 && (
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredLogs.map(
                  (log) => (
                    <div
                      key={log.id}
                      className="p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {
                              log.date
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {log.day}
                          </p>
                        </div>

                        <SessionBadge
                          type={
                            log.type
                          }
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <MobileDetail
                          label="Start Time"
                          value={
                            log.startTime
                          }
                        />

                        <MobileDetail
                          label="End Time"
                          value={
                            log.endTime
                          }
                        />

                        <MobileDetail
                          label="Duration"
                          value={
                            log.duration
                          }
                          strong
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

          {!loading &&
            !error &&
            filteredLogs.length === 0 && (
              <EmptyState text="Try changing your search, date or session filter." />
            )}

          {!loading &&
            !error && (
              <div className="border-t border-slate-100 px-6 py-4">
                <p className="text-xs text-slate-400">
                  Showing{" "}
                  {
                    filteredLogs.length
                  }{" "}
                  of{" "}
                  {
                    workLogs.length
                  }{" "}
                  sessions
                </p>
              </div>
            )}
        </div>
      </div>
    </AppLayout>
  );
}

/* =========================================================
   MANAGER / ADMIN TEAM VIEW
   ========================================================= */

function TeamWorkLogs() {
  const [summaries, setSummaries] =
    useState<TeamWorkLog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedDate, setSelectedDate] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"All" | TeamStatus>("All");

  const [serverNow, setServerNow] =
    useState(Date.now());

  const [responseTime, setResponseTime] =
    useState(Date.now());

  const fetchSummary = async (
    showLoading = true
  ) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const url = selectedDate
        ? `/api/work-logs/summary?date=${encodeURIComponent(
            selectedDate
          )}`
        : "/api/work-logs/summary";

      const response = await fetch(url, {
        cache: "no-store",
      });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to fetch team work logs."
        );
      }

      const apiServerNow =
        data.serverNow ??
        Date.now();

      setSummaries(
        data.summaries ?? []
      );

      setServerNow(
        apiServerNow
      );

      setResponseTime(
        apiServerNow
      );
    } catch (error) {
      console.error(
        "Failed to fetch team work logs:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to fetch team work logs."
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchSummary(true);
  }, [selectedDate]);

  useEffect(() => {
    const refreshTimer =
      window.setInterval(() => {
        fetchSummary(false);
      }, 30000);

    return () => {
      window.clearInterval(
        refreshTimer
      );
    };
  }, [selectedDate]);

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        setServerNow(
          Date.now()
        );
      }, 1000);

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, []);

  const filteredSummaries =
    useMemo(() => {
      const search =
        searchTerm.toLowerCase();

      return summaries.filter(
        (summary) => {
          const matchesSearch =
            summary.name
              .toLowerCase()
              .includes(search) ||
            summary.email
              .toLowerCase()
              .includes(search) ||
            summary.role
              .toLowerCase()
              .includes(search) ||
            summary.department
              .toLowerCase()
              .includes(search);

          const matchesStatus =
            statusFilter ===
              "All" ||
            summary.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      summaries,
      searchTerm,
      statusFilter,
    ]);

  const workingCount =
    summaries.filter(
      (summary) =>
        summary.status ===
        "Working"
    ).length;

  const breakCount =
    summaries.filter(
      (summary) =>
        summary.status ===
        "Break"
    ).length;

  const completedCount =
    summaries.filter(
      (summary) =>
        summary.status ===
        "Completed"
    ).length;

  const clearDateFilter =
    () => {
      setSelectedDate("");
    };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-[#0B63F6]">
            Time Management
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#102A43]">
            Work Logs
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor team work status and
            live working time.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={
              <Users className="h-5 w-5" />
            }
            title="Total People"
            value={summaries.length.toString()}
            description="People in your work view"
            type="blue"
          />

          <SummaryCard
            icon={
              <UserCheck className="h-5 w-5" />
            }
            title="Working Now"
            value={workingCount.toString()}
            description="Currently working"
            type="green"
          />

          <SummaryCard
            icon={
              <Coffee className="h-5 w-5" />
            }
            title="On Break"
            value={breakCount.toString()}
            description="Currently on break"
            type="orange"
          />

          <SummaryCard
            icon={
              <Clock3 className="h-5 w-5" />
            }
            title="Completed"
            value={completedCount.toString()}
            description="Completed work today"
            type="blue"
          />
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search employees..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(
                      event.target.value
                    );

                    setSearchTerm("");
                  }}
                  className="h-10 rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-600 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  aria-label="Filter work logs by date"
                />
              </div>

              {selectedDate && (
                <button
                  type="button"
                  onClick={
                    clearDateFilter
                  }
                  className="flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-red-600"
                  title="Clear date filter"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>

            <div className="flex overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-1">
              {(
                [
                  "All",
                  "Working",
                  "Break",
                  "Completed",
                  "Not Started",
                ] as const
              ).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      filter
                    )
                  }
                  className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition ${
                    statusFilter ===
                    filter
                      ? "bg-white text-[#0B63F6] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" />

              <span>
                Showing work logs for{" "}
                <span className="font-semibold text-slate-700">
                  {new Date(
                    `${selectedDate}T00:00:00`
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-[#102A43]">
                Team Work Logs
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Daily work status and live
                working time.
              </p>
            </div>

            <Clock3 className="h-5 w-5 text-slate-400" />
          </div>

          {loading && (
            <LoadingState text="Loading team work logs..." />
          )}

          {!loading && error && (
            <ErrorState
              message={error}
            />
          )}

          {!loading &&
            !error &&
            filteredSummaries.length >
              0 && (
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <TableHeader>
                        Date
                      </TableHeader>

                      <TableHeader>
                        Employee / User
                      </TableHeader>

                      <TableHeader>
                        Role
                      </TableHeader>

                      <TableHeader>
                        Session
                      </TableHeader>

                      <TableHeader>
                        Started
                      </TableHeader>

                      <TableHeader>
                        Total Working
                      </TableHeader>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredSummaries.map(
                      (summary) => (
                        <tr
                          key={
                            summary.userId
                          }
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-800">
                              {formatDate(
                                summary.date
                              )}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-800">
                              {
                                summary.name
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {
                                summary.email
                              }
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <RoleBadge
                              role={
                                summary.role
                              }
                            />
                          </td>

                          <td className="px-6 py-4">
                            <StatusBadge
                              status={
                                summary.status
                              }
                            />
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {summary.started
                              ? formatDateTime(
                                  summary.started
                                )
                              : "—"}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`text-sm font-semibold ${
                                summary.status ===
                                "Working"
                                  ? "text-blue-600"
                                  : "text-slate-700"
                              }`}
                            >
                              {formatWorkingTime(
                                summary,
                                serverNow,
                                responseTime
                              )}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}

          {!loading &&
            !error &&
            filteredSummaries.length >
              0 && (
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredSummaries.map(
                  (summary) => (
                    <div
                      key={
                        summary.userId
                      }
                      className="p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {
                              summary.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {
                              summary.email
                            }
                          </p>
                        </div>

                        <StatusBadge
                          status={
                            summary.status
                          }
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <MobileDetail
                          label="Date"
                          value={formatDate(
                            summary.date
                          )}
                        />

                        <MobileDetail
                          label="Role"
                          value={
                            summary.role
                          }
                        />

                        <MobileDetail
                          label="Started"
                          value={
                            summary.started
                              ? formatDateTime(
                                  summary.started
                                )
                              : "—"
                          }
                        />

                        <MobileDetail
                          label="Total Working"
                          value={formatWorkingTime(
                            summary,
                            serverNow,
                            responseTime
                          )}
                          strong
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

          {!loading &&
            !error &&
            filteredSummaries.length ===
              0 && (
              <EmptyState text="Try changing your search, date or status filter." />
            )}

          {!loading &&
            !error && (
              <div className="border-t border-slate-100 px-6 py-4">
                <p className="text-xs text-slate-400">
                  Showing{" "}
                  {
                    filteredSummaries.length
                  }{" "}
                  of{" "}
                  {
                    summaries.length
                  }{" "}
                  people
                </p>
              </div>
            )}
        </div>
      </div>
    </AppLayout>
  );
}

/* =========================================================
   TEAM TIMER
   ========================================================= */

function formatWorkingTime(
  summary: TeamWorkLog,
  currentTime: number,
  apiTime: number
): string {
  let seconds =
    summary.totalWorkingSeconds;

  if (
    summary.status === "Working"
  ) {
    const additionalSeconds =
      Math.max(
        0,
        Math.floor(
          (currentTime - apiTime) /
            1000
        )
      );

    seconds +=
      additionalSeconds;
  }

  return secondsToHHMM(seconds);
}

function secondsToHHMM(
  seconds: number
): string {
  const safeSeconds = Math.max(
    0,
    Math.floor(seconds)
  );

  const hours = Math.floor(
    safeSeconds / 3600
  );

  const minutes = Math.floor(
    (safeSeconds % 3600) / 60
  );

  return `${String(hours).padStart(
    2,
    "0"
  )}h ${String(minutes).padStart(
    2,
    "0"
  )}m`;
}

/* =========================================================
   FORMATTING
   ========================================================= */

function formatDate(
  date: string
): string {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatDateTime(
  value: string
): string {
  return new Date(
    value
  ).toLocaleString(
    "en-IN",
    {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
}

/* =========================================================
   REUSABLE UI
   ========================================================= */

function SummaryCard({
  icon,
  title,
  value,
  description,
  type,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  type: "blue" | "orange" | "green";
}) {
  const styles = {
    blue:
      "bg-blue-50 text-blue-600",
    orange:
      "bg-orange-50 text-orange-600",
    green:
      "bg-green-50 text-green-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${styles[type]}`}
        >
          {icon}
        </div>

        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>
      </div>

      <p className="mt-4 text-2xl font-bold text-[#102A43]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function MobileDetail({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm ${
          strong
            ? "font-semibold text-slate-700"
            : "font-medium text-slate-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SessionBadge({
  type,
}: {
  type: SessionType;
}) {
  if (type === "Work") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
        <BriefcaseBusiness className="h-3.5 w-3.5" />
        Work
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
      <Coffee className="h-3.5 w-3.5" />
      Break
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: TeamStatus;
}) {
  const config = {
    Working: {
      className:
        "bg-blue-50 text-blue-700",
      icon: (
        <BriefcaseBusiness className="h-3.5 w-3.5" />
      ),
    },

    Break: {
      className:
        "bg-orange-50 text-orange-700",
      icon: (
        <Coffee className="h-3.5 w-3.5" />
      ),
    },

    Completed: {
      className:
        "bg-slate-100 text-slate-700",
      icon: (
        <Clock3 className="h-3.5 w-3.5" />
      ),
    },

    "Not Started": {
      className:
        "bg-slate-50 text-slate-500",
      icon: (
        <Timer className="h-3.5 w-3.5" />
      ),
    },
  };

  const current =
    config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${current.className}`}
    >
      {current.icon}
      {status}
    </span>
  );
}

function RoleBadge({
  role,
}: {
  role: UserRole;
}) {
  const label =
    role === "ADMIN"
      ? "Admin"
      : role === "MANAGER"
      ? "Manager"
      : "Employee";

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {label}
    </span>
  );
}

function LoadingState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <Clock3 className="mx-auto h-8 w-8 animate-pulse text-slate-300" />

      <p className="mt-3 text-sm font-medium text-slate-600">
        {text}
      </p>
    </div>
  );
}

function ErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <Clock3 className="mx-auto h-8 w-8 text-red-300" />

      <p className="mt-3 text-sm font-medium text-red-600">
        Unable to load work logs
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {message}
      </p>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <Clock3 className="mx-auto h-8 w-8 text-slate-300" />

      <p className="mt-3 text-sm font-medium text-slate-600">
        No work logs found
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {text}
      </p>
    </div>
  );
}