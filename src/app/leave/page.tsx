"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
  Plus,
  X,
} from "lucide-react";

type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";
type LeaveStatus = "Pending" | "Approved" | "Rejected";
type LeaveType = "Casual Leave" | "Sick Leave" | "Other Leave";

interface CurrentUser {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}

interface LeaveRequest {
  id: string;
  userId?: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  employee?: {
    userId: string;
    name: string;
    email: string;
    department: string;
  };
}

const TOTAL_LEAVE_DAYS = 24;

export default function LeavePage() {
  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] =
    useState<string | null>(null);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);

  const [leaveType, setLeaveType] =
    useState<LeaveType>("Casual Leave");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const isManager =
    currentUser?.role === "MANAGER" ||
    currentUser?.role === "ADMIN";

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        setError("");

        const meResponse = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!meResponse.ok) {
          throw new Error("Unable to determine current user.");
        }

        const meData = await meResponse.json();

        if (!meData.authenticated || !meData.user) {
          throw new Error("Authentication required.");
        }

        const user: CurrentUser = meData.user;
        setCurrentUser(user);

        const endpoint =
          user.role === "ADMIN" ||
          user.role === "MANAGER"
            ? "/api/leave/manage"
            : "/api/leave";

        const response = await fetch(endpoint, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "Failed to load leave requests."
          );
        }

        setRequests(data);
      } catch (err) {
        console.error("Failed to load leave page:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load leave requests."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, []);

  const pendingCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "Approved"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "Rejected"
  ).length;

  const usedLeaveDays = requests
    .filter((request) => request.status === "Approved")
    .reduce(
      (total, request) => total + request.days,
      0
    );

  const remainingLeaveDays = Math.max(
    TOTAL_LEAVE_DAYS - usedLeaveDays,
    0
  );

  const leaveUsagePercentage = Math.min(
    (usedLeaveDays / TOTAL_LEAVE_DAYS) * 100,
    100
  );

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

  const formatDisplayDate = (date: string) => {
    if (!date) {
      return "";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const days = calculateDays();

    if (!startDate || !endDate || days === 0) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch("/api/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: leaveType,
          startDate,
          endDate,
          days,
          reason: reason.trim() || "No reason provided",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit leave request."
        );
      }

      setRequests((previous) => [
        data,
        ...previous,
      ]);

      setStartDate("");
      setEndDate("");
      setReason("");
      setLeaveType("Casual Leave");
      setShowModal(false);
    } catch (err) {
      console.error(
        "Failed to submit leave request:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit leave request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      setCancellingId(id);
      setError("");

      const response = await fetch(
        `/api/leave?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to cancel leave request."
        );
      }

      setRequests((previous) =>
        previous.filter(
          (request) => request.id !== id
        )
      );
    } catch (err) {
      console.error(
        "Failed to cancel leave request:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel leave request."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const handleUpdateStatus = async (
    request: LeaveRequest,
    status: "Approved" | "Rejected"
  ) => {
    if (!request.userId) {
      setError(
        "Unable to determine the employee for this request."
      );
      return;
    }

    try {
      setUpdatingId(request.id);
      setError("");

      const response = await fetch("/api/leave/manage", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: request.id,
          userId: request.userId,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Unable to ${status.toLowerCase()} leave request.`
        );
      }

      setRequests((previous) =>
        previous.map((item) =>
          item.id === request.id
            ? {
                ...item,
                status,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Failed to update leave request:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update leave request."
      );
    } finally {
      setUpdatingId(null);
    }
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
              {isManager
                ? "Review and manage employee leave requests."
                : "Apply for leave and view your request history."}
            </p>
          </div>

          {!isManager && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Apply for Leave
            </button>
          )}
        </div>

        {/* Leave Balance / Team Overview */}
        {!isManager ? (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Leave Balance
                </p>

                <p className="mt-1 text-3xl font-bold text-[#102A43]">
                  {remainingLeaveDays} days
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
                    {usedLeaveDays} / {TOTAL_LEAVE_DAYS} days
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${leaveUsagePercentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Team Leave Overview
              </p>

              <p className="mt-1 text-3xl font-bold text-[#102A43]">
                {pendingCount} pending
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Employee requests awaiting your review
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={<Clock3 className="h-5 w-5" />}
            title="Pending"
            value={pendingCount.toString()}
            description={
              isManager
                ? "Awaiting your approval"
                : "Awaiting approval"
            }
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
              {isManager
                ? "Employee Leave Requests"
                : "Leave Request History"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isManager
                ? "Review employee leave requests and update their status."
                : "Track your submitted leave requests."}
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Loading leave requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              No leave requests found.
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {isManager && (
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Employee
                        </th>
                      )}

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
                        {isManager && (
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-[#102A43]">
                              {request.employee?.name ??
                                "Unknown Employee"}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {request.employee?.department ??
                                "—"}
                            </p>
                          </td>
                        )}

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
                                {formatDisplayDate(
                                  request.startDate
                                )}
                              </p>

                              {request.startDate !==
                                request.endDate && (
                                <p className="text-xs text-slate-400">
                                  to{" "}
                                  {formatDisplayDate(
                                    request.endDate
                                  )}
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
                          <StatusBadge
                            status={request.status}
                          />
                        </td>

                        <td className="px-6 py-4 text-right">
                          {isManager ? (
                            request.status === "Pending" ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  disabled={
                                    updatingId ===
                                    request.id
                                  }
                                  onClick={() =>
                                    handleUpdateStatus(
                                      request,
                                      "Approved"
                                    )
                                  }
                                  className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {updatingId ===
                                  request.id
                                    ? "Updating..."
                                    : "Approve"}
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    updatingId ===
                                    request.id
                                  }
                                  onClick={() =>
                                    handleUpdateStatus(
                                      request,
                                      "Rejected"
                                    )
                                  }
                                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">
                                No action
                              </span>
                            )
                          ) : request.status ===
                            "Pending" ? (
                            <button
                              type="button"
                              disabled={
                                cancellingId ===
                                request.id
                              }
                              onClick={() =>
                                handleCancel(
                                  request.id
                                )
                              }
                              className="text-xs font-semibold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {cancellingId ===
                              request.id
                                ? "Cancelling..."
                                : "Cancel"}
                            </button>
                          ) : null}
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
                        {isManager && (
                          <>
                            <p className="text-sm font-semibold text-[#102A43]">
                              {request.employee?.name ??
                                "Unknown Employee"}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {request.employee?.department ??
                                "—"}
                            </p>
                          </>
                        )}

                        <p
                          className={`text-sm font-semibold text-slate-800 ${
                            isManager ? "mt-2" : ""
                          }`}
                        >
                          {request.type}
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-slate-400" />

                          <p className="text-xs text-slate-500">
                            {formatDisplayDate(
                              request.startDate
                            )}

                            {request.startDate !==
                              request.endDate &&
                              ` - ${formatDisplayDate(
                                request.endDate
                              )}`}
                          </p>
                        </div>
                      </div>

                      <StatusBadge
                        status={request.status}
                      />
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

                    {isManager ? (
                      request.status === "Pending" && (
                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            disabled={
                              updatingId ===
                              request.id
                            }
                            onClick={() =>
                              handleUpdateStatus(
                                request,
                                "Approved"
                              )
                            }
                            className="flex-1 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingId === request.id
                              ? "Updating..."
                              : "Approve"}
                          </button>

                          <button
                            type="button"
                            disabled={
                              updatingId ===
                              request.id
                            }
                            onClick={() =>
                              handleUpdateStatus(
                                request,
                                "Rejected"
                              )
                            }
                            className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )
                    ) : (
                      request.status === "Pending" && (
                        <button
                          type="button"
                          disabled={
                            cancellingId ===
                            request.id
                          }
                          onClick={() =>
                            handleCancel(request.id)
                          }
                          className="mt-4 text-xs font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {cancellingId === request.id
                            ? "Cancelling..."
                            : "Cancel Request"}
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="border-t border-slate-100 px-6 py-4">
            <p className="text-xs text-slate-400">
              Showing {requests.length} leave requests
            </p>
          </div>
        </div>
      </div>

      {/* Apply Leave Modal - Employee Only */}
      {!isManager &&
        showModal && (
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
                  onClick={() =>
                    setShowModal(false)
                  }
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
                        setStartDate(
                          event.target.value
                        )
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
                        setEndDate(
                          event.target.value
                        )
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
                    onClick={() =>
                      setShowModal(false)
                    }
                    className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Request"}
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