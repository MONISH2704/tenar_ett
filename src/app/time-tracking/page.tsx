"use client";

import { useEffect, useState } from "react";
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
  type: SessionType;
  start: string;
  end?: string;
}

export default function TimeTrackingPage() {
  const [isWorking, setIsWorking] = useState(true);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(9342);

  const [sessions, setSessions] = useState<Session[]>([
    {
      type: "work",
      start: "09:05 AM",
    },
    {
      type: "break",
      start: "12:30 PM",
      end: "01:15 PM",
    },
  ]);

  useEffect(() => {
    if (!isWorking || isOnBreak) {
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isWorking, isOnBreak]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  const handleStartWork = () => {
    setIsWorking(true);
    setIsOnBreak(false);
    setElapsedSeconds(0);

    setSessions((previous) => [
      ...previous,
      {
        type: "work",
        start: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const handleEndWork = () => {
    setIsWorking(false);
    setIsOnBreak(false);
  };

  const handleStartBreak = () => {
    if (!isWorking) {
      return;
    }

    setIsOnBreak(true);
  };

  const handleEndBreak = () => {
    setIsOnBreak(false);
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
            Time Tracking
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your working hours, breaks and daily sessions.
          </p>
        </div>

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
                {formatTime(elapsedSeconds)}
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
              {!isWorking && (
                <button
                  type="button"
                  onClick={handleStartWork}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Play className="h-4 w-4" />
                  Start Work
                </button>
              )}

              {/* Working State */}
              {isWorking && !isOnBreak && (
                <>
                  <button
                    type="button"
                    onClick={handleStartBreak}
                    className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-6 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-100"
                  >
                    <Coffee className="h-4 w-4" />
                    Start Break
                  </button>

                  <button
                    type="button"
                    onClick={handleEndWork}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    <Square className="h-4 w-4" />
                    End Work
                  </button>
                </>
              )}

              {/* Break State */}
              {isWorking && isOnBreak && (
                <button
                  type="button"
                  onClick={handleEndBreak}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Play className="h-4 w-4" />
                  End Break
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <SummaryCard
            icon={<Clock3 className="h-5 w-5" />}
            title="Clock In"
            value="09:05 AM"
            description="Today's start time"
          />

          <SummaryCard
            icon={<Clock3 className="h-5 w-5" />}
            title="Working Time"
            value="05h 20m"
            description="Total active time"
          />

          <SummaryCard
            icon={<Coffee className="h-5 w-5" />}
            title="Break Time"
            value="00h 45m"
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

          <div className="mt-6 divide-y divide-slate-100">

            {sessions.map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-4"
              >

                <div className="flex items-center gap-3">

                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      session.type === "work"
                        ? "bg-blue-500"
                        : "bg-orange-500"
                    }`}
                  />

                  <div>

                    <p className="text-sm font-semibold text-slate-800">
                      {session.type === "work"
                        ? "Work Session"
                        : "Break"}
                    </p>

                    <p className="text-xs text-slate-500">
                      {session.start}
                      {session.end
                        ? ` - ${session.end}`
                        : " - Active"}
                    </p>

                  </div>

                </div>

                <span className="text-xs font-medium text-slate-400">
                  {session.type === "work"
                    ? "Working"
                    : "Break"}
                </span>

              </div>
            ))}

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