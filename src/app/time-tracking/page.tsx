"use client";

import { useCallback, useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Play,
  Square,
  Coffee,
  Clock3,
  CalendarDays,
} from "lucide-react";

type SessionType = "work" | "break";

interface Session {
  id: string;
  userId: string;
  date: string;
  type: SessionType;
  start: string;
  end?: string;
}

interface TimeTrackingResponse {
  date: string;
  sessions: Session[];
  activeSession: Session | null;
}

export default function TimeTrackingPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] =
    useState<Session | null>(null);

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState("");

  /*
   * The current state is derived from the active
   * Cosmos session.
   */
  const isWorking =
    activeSession?.type === "work";

  const isOnBreak =
    activeSession?.type === "break";

  /*
   * Format seconds as HH:MM:SS.
   */
  const formatTime = (seconds: number) => {
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

    const secs = safeSeconds % 60;

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  /*
   * Convert an ISO timestamp to the
   * employee's local display time.
   */
  const formatDisplayTime = (value: string) => {
    return new Date(value).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }
    );
  };

  /*
   * Calculate the duration of a session.
   */
  const getSessionSeconds = (
    session: Session,
    now = Date.now()
  ) => {
    const start = new Date(
      session.start
    ).getTime();

    const end = session.end
      ? new Date(session.end).getTime()
      : now;

    if (
      Number.isNaN(start) ||
      Number.isNaN(end)
    ) {
      return 0;
    }

    return Math.max(
      0,
      Math.floor((end - start) / 1000)
    );
  };

  /*
   * Total WORK time for today.
   *
   * Break sessions are intentionally excluded.
   */
  const getTotalWorkSeconds = (
    records: Session[],
    now = Date.now()
  ) => {
    return records
      .filter(
        (session) =>
          session.type === "work"
      )
      .reduce(
        (total, session) =>
          total +
          getSessionSeconds(session, now),
        0
      );
  };

  /*
   * Total BREAK time for today.
   */
  const getTotalBreakSeconds = (
    records: Session[],
    now = Date.now()
  ) => {
    return records
      .filter(
        (session) =>
          session.type === "break"
      )
      .reduce(
        (total, session) =>
          total +
          getSessionSeconds(session, now),
        0
      );
  };

  /*
   * Format a duration as:
   * 05h 20m
   */
  const formatDuration = (
    seconds: number
  ) => {
    const totalMinutes = Math.floor(
      Math.max(0, seconds) / 60
    );

    const hours = Math.floor(
      totalMinutes / 60
    );

    const minutes = totalMinutes % 60;

    return `${hours
      .toString()
      .padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m`;
  };

  /*
   * Fetch today's sessions from the API.
   */
  const loadSessions = useCallback(
    async () => {
      try {
        setError("");

        const response = await fetch(
          "/api/time-tracking",
          {
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as
            | TimeTrackingResponse
            | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Unable to load time tracking."
          );
        }

        const trackingData =
          data as TimeTrackingResponse;

        setSessions(
          trackingData.sessions ?? []
        );

        setActiveSession(
          trackingData.activeSession ?? null
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load time tracking."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /*
   * Load today's data when the page opens.
   */
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  /*
   * Update the timer every second while
   * an active WORK session exists.
   *
   * The timer represents total working time,
   * excluding breaks.
   */
  useEffect(() => {
    if (!isWorking) {
      setElapsedSeconds(
        getTotalWorkSeconds(sessions)
      );

      return;
    }

    const updateTimer = () => {
      setElapsedSeconds(
        getTotalWorkSeconds(
          sessions,
          Date.now()
        )
      );
    };

    updateTimer();

    const timer = setInterval(
      updateTimer,
      1000
    );

    return () => {
      clearInterval(timer);
    };
  }, [
    sessions,
    activeSession,
    isWorking,
  ]);

  /*
   * Perform a time-tracking action.
   */
  const performAction = async (
    action:
      | "start-work"
      | "start-break"
      | "end-break"
      | "end-work"
  ) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        "/api/time-tracking",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to process time tracking action."
        );
      }

      await loadSessions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process time tracking action."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * Start Work.
   */
  const handleStartWork = () => {
    if (actionLoading) {
      return;
    }

    performAction("start-work");
  };

  /*
   * End Work.
   */
  const handleEndWork = () => {
    if (actionLoading) {
      return;
    }

    performAction("end-work");
  };

  /*
   * Start Break.
   */
  const handleStartBreak = () => {
    if (
      actionLoading ||
      !isWorking
    ) {
      return;
    }

    performAction("start-break");
  };

  /*
   * End Break.
   */
  const handleEndBreak = () => {
    if (
      actionLoading ||
      !isOnBreak
    ) {
      return;
    }

    performAction("end-break");
  };

  /*
   * Summary information.
   */
  const totalWorkSeconds =
    getTotalWorkSeconds(sessions);

  const totalBreakSeconds =
    getTotalBreakSeconds(sessions);

  const firstWorkSession =
    sessions.find(
      (session) =>
        session.type === "work"
    );

  const clockIn = firstWorkSession
    ? formatDisplayTime(
        firstWorkSession.start
      )
    : "--";

  /*
   * Sort sessions chronologically for display.
   */
  const sortedSessions = [
    ...sessions,
  ].sort(
    (a, b) =>
      new Date(a.start).getTime() -
      new Date(b.start).getTime()
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-6">
          <p className="text-sm font-medium text-[#0B63F6]">
            Time Management
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#102A43]">
            Time Tracking
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your working hours, breaks and daily sessions.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Current Session */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="flex flex-col items-center text-center">

            {/* Status */}
            <div className="flex items-center gap-2">

              <span
                className={`h-3 w-3 rounded-full ${
                  isOnBreak
                    ? "bg-orange-500"
                    : isWorking
                      ? "bg-green-500"
                      : "bg-slate-400"
                }`}
              />

              <span
                className={`text-sm font-semibold ${
                  isOnBreak
                    ? "text-orange-600"
                    : isWorking
                      ? "text-green-600"
                      : "text-slate-500"
                }`}
              >
                {isOnBreak
                  ? "On Break"
                  : isWorking
                    ? "Working"
                    : "Not Working"}
              </span>

            </div>

            {/* Timer */}
            <div className="mt-5">

              <p className="font-mono text-5xl font-bold tracking-tight text-[#102A43] sm:text-6xl">
                {loading
                  ? "00:00:00"
                  : formatTime(
                      isWorking
                        ? elapsedSeconds
                        : totalWorkSeconds
                    )}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {isOnBreak
                  ? "Break in progress"
                  : isWorking
                    ? "Current work session"
                    : "No active work session"}
              </p>

            </div>

            {/* Actions */}
            <div className="mt-7 flex flex-wrap justify-center gap-3">

              {/* Start Work */}
              {!isWorking &&
                !isOnBreak && (
                  <button
                    type="button"
                    onClick={
                      handleStartWork
                    }
                    disabled={
                      loading ||
                      actionLoading
                    }
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Play className="h-4 w-4" />

                    {actionLoading
                      ? "Starting..."
                      : "Start Work"}
                  </button>
                )}

              {/* Working State */}
              {isWorking && (
                <>
                  <button
                    type="button"
                    onClick={
                      handleStartBreak
                    }
                    disabled={
                      actionLoading
                    }
                    className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-6 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Coffee className="h-4 w-4" />

                    {actionLoading
                      ? "Please wait..."
                      : "Start Break"}
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleEndWork
                    }
                    disabled={
                      actionLoading
                    }
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Square className="h-4 w-4" />

                    {actionLoading
                      ? "Ending..."
                      : "End Work"}
                  </button>
                </>
              )}

              {/* Break State */}
              {isOnBreak && (
                <button
                  type="button"
                  onClick={
                    handleEndBreak
                  }
                  disabled={
                    actionLoading
                  }
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Play className="h-4 w-4" />

                  {actionLoading
                    ? "Please wait..."
                    : "End Break"}
                </button>
              )}

            </div>

          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <SummaryCard
            icon={
              <Clock3 className="h-5 w-5" />
            }
            title="Clock In"
            value={clockIn}
            description="Today's start time"
          />

          <SummaryCard
            icon={
              <Clock3 className="h-5 w-5" />
            }
            title="Working Time"
            value={formatDuration(
              totalWorkSeconds
            )}
            description="Total active time"
          />

          <SummaryCard
            icon={
              <Coffee className="h-5 w-5" />
            }
            title="Break Time"
            value={formatDuration(
              totalBreakSeconds
            )}
            description="Total break time"
          />

        </div>

        {/* Today's Sessions */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-[#102A43]">
                Today&apos;s Sessions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your work and break activity for today.
              </p>
            </div>

            <CalendarDays className="h-5 w-5 text-slate-400" />

          </div>

          {loading ? (
            <div className="mt-6 py-8 text-center text-sm text-slate-400">
              Loading today's sessions...
            </div>
          ) : sortedSessions.length === 0 ? (
            <div className="mt-6 py-8 text-center">

              <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No sessions today
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Start work to create your first session.
              </p>

            </div>
          ) : (
            <div className="mt-6 divide-y divide-slate-100">

              {sortedSessions.map(
                (session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between py-4"
                  >

                    <div className="flex items-center gap-3">

                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          session.type ===
                          "work"
                            ? "bg-blue-500"
                            : "bg-orange-500"
                        }`}
                      />

                      <div>

                        <p className="text-sm font-semibold text-slate-800">
                          {session.type ===
                          "work"
                            ? "Work Session"
                            : "Break"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {formatDisplayTime(
                            session.start
                          )}

                          {" - "}

                          {session.end
                            ? formatDisplayTime(
                                session.end
                              )
                            : "Active"}
                        </p>

                      </div>
                    </div>

                    <span
                      className={`text-xs font-medium ${
                        session.type ===
                        "work"
                          ? "text-blue-500"
                          : "text-orange-500"
                      }`}
                    >
                      {session.type ===
                      "work"
                        ? "Working"
                        : "Break"}
                    </span>

                  </div>
                )
              )}

            </div>
          )}

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
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
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