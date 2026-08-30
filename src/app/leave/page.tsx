"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
  Plus,
  X,
} from "lucide-react";

type LeaveStatus = "Pending" | "Approved" | "Rejected";

type LeaveType = "Casual Leave" | "Sick Leave" | "Other Leave";

interface LeaveRequest {
  id: number;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
}

const initialRequests: LeaveRequest[] = [
  {
    id: 1,
    type: "Casual Leave",
    startDate: "02 Sep 2026",
    endDate: "02 Sep 2026",
    days: 1,
    reason: "Personal work",
    status: "Pending",
  },
  {
    id: 2,
    type: "Sick Leave",
    startDate: "18 Aug 2026",
    endDate: "19 Aug 2026",
    days: 2,
    reason: "Not feeling well",
    status: "Approved",
  },
  {
    id: 3,
    type: "Casual Leave",
    startDate: "05 Aug 2026",
    endDate: "05 Aug 2026",
    days: 1,
    reason: "Personal appointment",
    status: "Approved",
  },
  {
    id: 4,
    type: "Other Leave",
    startDate: "28 Jul 2026",
    endDate: "28 Jul 2026",
    days: 1,
    reason: "Family function",
    status: "Rejected",
  },
];

export default function LeavePage() {
  const [requests, setRequests] =
    useState<LeaveRequest[]>(initialRequests);

  const [showModal, setShowModal] = useState(false);

  const [leaveType, setLeaveType] =
    useState<LeaveType>("Casual Leave");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const pendingCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "Approved"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "Rejected"
  ).length;

  const calculateDays = () => {
    if (!startDate || !endDate) {
      return 0;
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    const difference =
      end.getTime() - start.getTime();

    if (difference < 0) {
      return 0;
    }

    return (
      Math.floor(
        difference / (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const days = calculateDays();

    if (!startDate || !endDate || days === 0) {
      return;
    }

    const formatDate = (date: string) => {
      return new Date(
        `${date}T00:00:00`
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const newRequest: LeaveRequest = {
      id: Date.now(),
      type: leaveType,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      days,
      reason:
        reason.trim() || "No reason provided",
      status: "Pending",
    };

    setRequests((previous) => [
      newRequest,
      ...previous,
    ]);

    setStartDate("");
    setEndDate("");
    setReason("");
    setLeaveType("Casual Leave");
    setShowModal(false);
  };

  const handleCancel = (id: number) => {
    setRequests((previous) =>
      previous.filter((request) => request.id !== id)
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <p className="text-sm font-medium text-[#0B63F6]">
              Leave Management
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#102A43]">
              Leave Requests
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Apply for leave and view your request history.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Apply for Leave
          </button>

        </div>

        {/* Leave Balance */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Leave Balance
              </p>

              <p className="mt-1 text-3xl font-bold text-[#102A43]">
                18 days
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Available leave balance for this year
              </p>
            </div>

            <div className="w-full max-w-sm">

              <div className="mb-2 flex justify-between text-xs">
                <span className="font-medium text-slate-500">
                  Used
                </span>

                <span className="font-semibold text-slate-700">
                  6 / 24 days
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-1/4 rounded-full bg-blue-600" />
              </div>

            </div>

          </div>

        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">

          <SummaryCard
            icon={<Clock3 className="h-5 w-5" />}
            title="Pending"
            value={pendingCount.toString()}
            description="Awaiting approval"
            type="orange"
          />

          <SummaryCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Approved"
            value={approvedCount.toString()}
            description="Approved requests"
            type="green"
          />

          <SummaryCard
            icon={<XCircle className="h-5 w-5" />}
            title="Rejected"
            value={rejectedCount.toString()}
            description="Rejected requests"
            type="red"
          />

        </div>

        {/* Request History */}
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-lg font-semibold text-[#102A43]">
              Leave Request History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track your submitted leave requests.
            </p>

          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">

            <table className="w-full">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Leave Type
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Dates
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Days
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Reason
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="transition hover:bg-slate-50"
                  >

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {request.type}
                      </p>
                    </td>

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-2">

                        <CalendarDays className="h-4 w-4 text-slate-400" />

                        <div>
                          <p className="text-sm text-slate-700">
                            {request.startDate}
                          </p>

                          {request.startDate !==
                            request.endDate && (
                            <p className="text-xs text-slate-400">
                              to {request.endDate}
                            </p>
                          )}
                        </div>

                      </div>

                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {request.days}
                    </td>

                    <td className="max-w-xs px-6 py-4 text-sm text-slate-600">
                      {request.reason}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={request.status} />
                    </td>

                    <td className="px-6 py-4 text-right">

                      {request.status === "Pending" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleCancel(request.id)
                          }
                          className="text-xs font-semibold text-red-600 transition hover:text-red-700"
                        >
                          Cancel
                        </button>
                      )}

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {/* Mobile Cards */}
          <div className="divide-y divide-slate-100 md:hidden">

            {requests.map((request) => (
              <div
                key={request.id}
                className="p-5"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {request.type}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-slate-400" />

                      <p className="text-xs text-slate-500">
                        {request.startDate}
                        {request.startDate !==
                          request.endDate &&
                          ` - ${request.endDate}`}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={request.status} />

                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-slate-400">
                      Days
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {request.days}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Reason
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {request.reason}
                    </p>
                  </div>

                </div>

                {request.status === "Pending" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleCancel(request.id)
                    }
                    className="mt-4 text-xs font-semibold text-red-600"
                  >
                    Cancel Request
                  </button>
                )}

              </div>
            ))}

          </div>

          <div className="border-t border-slate-100 px-6 py-4">
            <p className="text-xs text-slate-400">
              Showing {requests.length} leave requests
            </p>
          </div>

        </div>

      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-lg font-semibold text-[#102A43]">
                  Apply for Leave
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Submit a new leave request.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* Leave Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Leave Type
                </label>

                <select
                  value={leaveType}
                  onChange={(event) =>
                    setLeaveType(
                      event.target.value as LeaveType
                    )
                  }
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option>Casual Leave</option>
                  <option>Sick Leave</option>
                  <option>Other Leave</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) =>
                      setStartDate(event.target.value)
                    }
                    required
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    End Date
                  </label>

                  <input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(event) =>
                      setEndDate(event.target.value)
                    }
                    required
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

              </div>

              {/* Days */}
              {startDate && endDate && (
                <div className="rounded-lg bg-blue-50 px-4 py-3">

                  <p className="text-sm text-blue-700">
                    Requested leave:
                    <span className="ml-1 font-semibold">
                      {calculateDays()} day
                      {calculateDays() !== 1
                        ? "s"
                        : ""}
                    </span>
                  </p>

                </div>
              )}

              {/* Reason */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Reason
                </label>

                <textarea
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  rows={4}
                  placeholder="Enter the reason for your leave..."
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Submit Request
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

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
  type: "orange" | "green" | "red";
}) {
  const styles = {
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
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

function StatusBadge({
  status,
}: {
  status: LeaveStatus;
}) {
  const styles = {
    Pending: "bg-orange-50 text-orange-700",
    Approved: "bg-green-50 text-green-700",
    Rejected: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}