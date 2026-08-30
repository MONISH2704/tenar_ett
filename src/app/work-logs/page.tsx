"use client";

import { useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  CalendarDays,
  Clock3,
  Coffee,
  Search,
  BriefcaseBusiness,
  Timer,
  X,
} from "lucide-react";

type SessionType = "Work" | "Break";

interface WorkLog {
  id: number;
  date: string;
  dateValue: string;
  day: string;
  type: SessionType;
  startTime: string;
  endTime: string;
  duration: string;
}

const workLogs: WorkLog[] = [
  {
    id: 1,
    date: "30 Aug 2026",
    dateValue: "2026-08-30",
    day: "Sunday",
    type: "Work",
    startTime: "09:05 AM",
    endTime: "12:30 PM",
    duration: "03h 25m",
  },
  {
    id: 2,
    date: "30 Aug 2026",
    dateValue: "2026-08-30",
    day: "Sunday",
    type: "Break",
    startTime: "12:30 PM",
    endTime: "01:15 PM",
    duration: "00h 45m",
  },
  {
    id: 3,
    date: "30 Aug 2026",
    dateValue: "2026-08-30",
    day: "Sunday",
    type: "Work",
    startTime: "01:15 PM",
    endTime: "06:10 PM",
    duration: "04h 55m",
  },
  {
    id: 4,
    date: "29 Aug 2026",
    dateValue: "2026-08-29",
    day: "Saturday",
    type: "Work",
    startTime: "09:02 AM",
    endTime: "12:45 PM",
    duration: "03h 43m",
  },
  {
    id: 5,
    date: "29 Aug 2026",
    dateValue: "2026-08-29",
    day: "Saturday",
    type: "Break",
    startTime: "12:45 PM",
    endTime: "01:30 PM",
    duration: "00h 45m",
  },
  {
    id: 6,
    date: "29 Aug 2026",
    dateValue: "2026-08-29",
    day: "Saturday",
    type: "Work",
    startTime: "01:30 PM",
    endTime: "06:05 PM",
    duration: "04h 35m",
  },
  {
    id: 7,
    date: "28 Aug 2026",
    dateValue: "2026-08-28",
    day: "Friday",
    type: "Work",
    startTime: "09:15 AM",
    endTime: "12:30 PM",
    duration: "03h 15m",
  },
  {
    id: 8,
    date: "28 Aug 2026",
    dateValue: "2026-08-28",
    day: "Friday",
    type: "Break",
    startTime: "12:30 PM",
    endTime: "01:20 PM",
    duration: "00h 50m",
  },
  {
    id: 9,
    date: "28 Aug 2026",
    dateValue: "2026-08-28",
    day: "Friday",
    type: "Work",
    startTime: "01:20 PM",
    endTime: "06:00 PM",
    duration: "04h 40m",
  },
  {
    id: 10,
    date: "27 Aug 2026",
    dateValue: "2026-08-27",
    day: "Thursday",
    type: "Work",
    startTime: "09:00 AM",
    endTime: "01:00 PM",
    duration: "04h 00m",
  },
  {
    id: 11,
    date: "27 Aug 2026",
    dateValue: "2026-08-27",
    day: "Thursday",
    type: "Break",
    startTime: "01:00 PM",
    endTime: "01:30 PM",
    duration: "00h 30m",
  },
  {
    id: 12,
    date: "27 Aug 2026",
    dateValue: "2026-08-27",
    day: "Thursday",
    type: "Work",
    startTime: "01:30 PM",
    endTime: "06:02 PM",
    duration: "04h 32m",
  },
];

export default function WorkLogsPage() {
  const [sessionFilter, setSessionFilter] =
    useState<"All" | SessionType>("All");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedDate, setSelectedDate] = useState("");

  const filteredLogs = useMemo(() => {
    return workLogs.filter((log) => {
      const matchesType =
        sessionFilter === "All" ||
        log.type === sessionFilter;

      const search = searchTerm.toLowerCase();

      const matchesSearch =
        log.date.toLowerCase().includes(search) ||
        log.day.toLowerCase().includes(search) ||
        log.type.toLowerCase().includes(search);

      const matchesDate =
        selectedDate === "" ||
        log.dateValue === selectedDate;

      return (
        matchesType &&
        matchesSearch &&
        matchesDate
      );
    });
  }, [sessionFilter, searchTerm, selectedDate]);

  const workSessions = workLogs.filter(
    (log) => log.type === "Work"
  ).length;

  const breakSessions = workLogs.filter(
    (log) => log.type === "Break"
  ).length;

  const handleDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedDate(event.target.value);
    setSearchTerm("");
  };

  const clearDateFilter = () => {
    setSelectedDate("");
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-6">
          <p className="text-sm font-medium text-[#0B63F6]">
            Time Management
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#102A43]">
            Work Logs
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View your detailed work sessions and break history.
          </p>
        </div>

        {/* Summary Cards */}
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
            icon={<Coffee className="h-5 w-5" />}
            title="Break Sessions"
            value={breakSessions.toString()}
            description="Recorded breaks"
            type="orange"
          />

          <SummaryCard
            icon={<Timer className="h-5 w-5" />}
            title="Today's Working"
            value="08h 20m"
            description="Total active work time"
            type="green"
          />

        </div>

        {/* Filters */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search work logs..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2">

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="h-10 rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-600 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  aria-label="Filter work logs by date"
                />
              </div>

              {selectedDate && (
                <button
                  type="button"
                  onClick={clearDateFilter}
                  className="flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-red-600"
                  title="Clear date filter"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}

            </div>

            {/* Session Filter */}
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">

              {(["All", "Work", "Break"] as const).map(
                (filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() =>
                      setSessionFilter(filter)
                    }
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                      sessionFilter === filter
                        ? "bg-white text-[#0B63F6] shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {filter}
                  </button>
                )
              )}

            </div>

          </div>

          {/* Active Date Filter */}
          {selectedDate && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" />

              <span>
                Showing logs for{" "}
                <span className="font-semibold text-slate-700">
                  {new Date(
                    `${selectedDate}T00:00:00`
                  ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </span>
            </div>
          )}

        </div>

        {/* Session History */}
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

            <div>
              <h2 className="text-lg font-semibold text-[#102A43]">
                Session History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Detailed record of your work and break sessions.
              </p>
            </div>

            <Clock3 className="h-5 w-5 text-slate-400" />

          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">

            <table className="w-full">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Session
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Start Time
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    End Time
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Duration
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredLogs.map((log) => (
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
                      <SessionBadge type={log.type} />
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {log.startTime}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {log.endTime}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {log.duration}
                      </span>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {/* Mobile Cards */}
          <div className="divide-y divide-slate-100 md:hidden">

            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-5"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {log.date}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {log.day}
                    </p>
                  </div>

                  <SessionBadge type={log.type} />

                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-slate-400">
                      Start Time
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {log.startTime}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      End Time
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {log.endTime}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Duration
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {log.duration}
                    </p>
                  </div>

                </div>

              </div>
            ))}

          </div>

          {/* Empty State */}
          {filteredLogs.length === 0 && (
            <div className="px-6 py-12 text-center">

              <Clock3 className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No work logs found
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your search, date or session filter.
              </p>

            </div>
          )}

          {/* Footer */}
          <div className="border-t border-slate-100 px-6 py-4">

            <p className="text-xs text-slate-400">
              Showing {filteredLogs.length} of{" "}
              {workLogs.length} sessions
            </p>

          </div>

        </div>

      </div>
    </AppLayout>
  );
}

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
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
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