"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type AttendanceStatus =
  | "Present"
  | "Late"
  | "Absent"
  | "Leave";

interface AttendanceRecord {
  date: string;
  day: string;
  clockIn: string;
  clockOut: string;
  workingHours: string;
  breakHours: string;
  status: AttendanceStatus;
}

const attendanceData: AttendanceRecord[] = [
  {
    date: "30 Aug 2026",
    day: "Sunday",
    clockIn: "09:05 AM",
    clockOut: "06:10 PM",
    workingHours: "08h 20m",
    breakHours: "00h 45m",
    status: "Present",
  },
  {
    date: "29 Aug 2026",
    day: "Saturday",
    clockIn: "09:02 AM",
    clockOut: "06:05 PM",
    workingHours: "08h 18m",
    breakHours: "00h 45m",
    status: "Present",
  },
  {
    date: "28 Aug 2026",
    day: "Friday",
    clockIn: "09:15 AM",
    clockOut: "06:00 PM",
    workingHours: "07h 55m",
    breakHours: "00h 50m",
    status: "Late",
  },
  {
    date: "27 Aug 2026",
    day: "Thursday",
    clockIn: "09:00 AM",
    clockOut: "06:02 PM",
    workingHours: "08h 32m",
    breakHours: "00h 30m",
    status: "Present",
  },
  {
    date: "26 Aug 2026",
    day: "Wednesday",
    clockIn: "09:08 AM",
    clockOut: "06:12 PM",
    workingHours: "08h 24m",
    breakHours: "00h 40m",
    status: "Present",
  },
  {
    date: "25 Aug 2026",
    day: "Tuesday",
    clockIn: "09:00 AM",
    clockOut: "06:00 PM",
    workingHours: "08h 30m",
    breakHours: "00h 30m",
    status: "Present",
  },
  {
    date: "24 Aug 2026",
    day: "Monday",
    clockIn: "09:25 AM",
    clockOut: "06:15 PM",
    workingHours: "07h 50m",
    breakHours: "01h 00m",
    status: "Late",
  },
  {
    date: "23 Aug 2026",
    day: "Sunday",
    clockIn: "--",
    clockOut: "--",
    workingHours: "--",
    breakHours: "--",
    status: "Leave",
  },
];

export default function AttendancePage() {
  const [currentMonth, setCurrentMonth] = useState(
    "August 2026"
  );

  const presentDays = attendanceData.filter(
    (record) => record.status === "Present"
  ).length;

  const lateDays = attendanceData.filter(
    (record) => record.status === "Late"
  ).length;

  const leaveDays = attendanceData.filter(
    (record) => record.status === "Leave"
  ).length;

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-6">
          <p className="text-sm font-medium text-[#0B63F6]">
            Attendance
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#102A43]">
            My Attendance
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View your attendance history and working hours.
          </p>
        </div>

        {/* Month Selector */}
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-400">
                Viewing
              </p>

              <p className="text-sm font-semibold text-[#102A43]">
                {currentMonth}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentMonth("July 2026")}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-[#0B63F6]"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentMonth("August 2026")}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Current Month
            </button>

            <button
              type="button"
              onClick={() => setCurrentMonth("September 2026")}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-[#0B63F6]"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <AttendanceSummaryCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Present Days"
            value={presentDays.toString()}
            description="Days attended"
            iconStyle="green"
          />

          <AttendanceSummaryCard
            icon={<AlertCircle className="h-5 w-5" />}
            title="Late Arrivals"
            value={lateDays.toString()}
            description="Late check-ins"
            iconStyle="orange"
          />

          <AttendanceSummaryCard
            icon={<XCircle className="h-5 w-5" />}
            title="Leave Days"
            value={leaveDays.toString()}
            description="Approved leave"
            iconStyle="blue"
          />

          <AttendanceSummaryCard
            icon={<Clock3 className="h-5 w-5" />}
            title="Avg. Hours"
            value="08h 15m"
            description="Average per day"
            iconStyle="blue"
          />

        </div>

        {/* Attendance Table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Table Header */}
          <div className="border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-[#102A43]">
                Attendance History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your daily attendance records.
              </p>
            </div>
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
                    Clock In
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Clock Out
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Working
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Break
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {attendanceData.map((record) => (
                  <tr
                    key={record.date}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {record.date}
                        </p>

                        <p className="text-xs text-slate-400">
                          {record.day}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {record.clockIn}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {record.clockOut}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {record.workingHours}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {record.breakHours}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="divide-y divide-slate-100 md:hidden">
            {attendanceData.map((record) => (
              <div
                key={record.date}
                className="p-5"
              >
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {record.date}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {record.day}
                    </p>
                  </div>

                  <StatusBadge status={record.status} />

                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-slate-400">
                      Clock In
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {record.clockIn}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Clock Out
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {record.clockOut}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Working Hours
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {record.workingHours}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Break Hours
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {record.breakHours}
                    </p>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-6 py-4">
            <p className="text-xs text-slate-400">
              Showing {attendanceData.length} attendance records
            </p>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}

function AttendanceSummaryCard({
  icon,
  title,
  value,
  description,
  iconStyle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  iconStyle: "green" | "orange" | "blue";
}) {
  const styles = {
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${styles[iconStyle]}`}
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

function StatusBadge({
  status,
}: {
  status: AttendanceStatus;
}) {
  const styles = {
    Present: "bg-green-50 text-green-700",
    Late: "bg-orange-50 text-orange-700",
    Absent: "bg-red-50 text-red-700",
    Leave: "bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}