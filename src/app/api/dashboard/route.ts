import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/data/cosmos-users";
import { getTimeTrackingByUserId } from "@/lib/data/cosmos-time-tracking";

type DashboardStatus = "Working" | "On Break" | "Completed" | "Not Started";

type TimelineItem = {
  time: string;
  title: string;
  description: string;
  color: string;
};

const TIME_ZONE = "Asia/Kolkata";
const DAILY_WORK_TARGET_SECONDS = 8 * 60 * 60;

function getIndiaDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getDateDaysAgo(daysAgo: number) {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - daysAgo);

  return date.toISOString().slice(0, 10);
}

function getDurationSeconds(
  start: string,
  end?: string,
  currentTime = Date.now(),
) {
  const startTime = new Date(start).getTime();

  if (Number.isNaN(startTime)) {
    return 0;
  }

  const endTime = end ? new Date(end).getTime() : currentTime;

  if (Number.isNaN(endTime) || endTime <= startTime) {
    return 0;
  }

  return Math.floor((endTime - startTime) / 1000);
}

function formatTime(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateString));
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00+05:30`));
}

function getMinutesFromTime(dateString: string) {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(dateString));

  const hour = Number(
    parts.find((part) => part.type === "hour")?.value ?? 0,
  );

  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0,
  );

  return hour * 60 + minute;
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(
    2,
    "0",
  )}m`;
}

function getStatus(
  sessions: Awaited<ReturnType<typeof getTimeTrackingByUserId>>,
): DashboardStatus {
  const activeSession = [...sessions]
    .reverse()
    .find((session) => !session.end);

  if (activeSession?.type === "work") {
    return "Working";
  }

  if (activeSession?.type === "break") {
    return "On Break";
  }

  if (sessions.length > 0) {
    return "Completed";
  }

  return "Not Started";
}

function buildTimeline(
  sessions: Awaited<ReturnType<typeof getTimeTrackingByUserId>>,
): TimelineItem[] {
  if (sessions.length === 0) {
    return [];
  }

  return sessions.map((session) => {
    if (session.type === "work") {
      const time = session.end
        ? `${formatTime(session.start)} - ${formatTime(session.end)}`
        : `${formatTime(session.start)} - Now`;

      return {
        time,
        title: session.end ? "Work Session" : "Working",
        description: session.end
          ? "Completed work session"
          : "Current work session",
        color: "bg-green-500",
      };
    }

    const time = session.end
      ? `${formatTime(session.start)} - ${formatTime(session.end)}`
      : `${formatTime(session.start)} - Now`;

    return {
      time,
      title: session.end ? "Break" : "Break",
      description: session.end ? "Break completed" : "Currently on break",
      color: "bg-orange-500",
    };
  });
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = await getUserById(session.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const today = getIndiaDate();
    const currentTime = Date.now();

    const todaySessions = await getTimeTrackingByUserId(
      session.userId,
      today,
    );

    let workingSeconds = 0;
    let breakSeconds = 0;

    for (const item of todaySessions) {
      const duration = getDurationSeconds(
        item.start,
        item.end,
        currentTime,
      );

      if (item.type === "work") {
        workingSeconds += duration;
      } else {
        breakSeconds += duration;
      }
    }

    const status = getStatus(todaySessions);

    const firstWorkSession = todaySessions.find(
      (item) => item.type === "work",
    );

    const weekSessions: Awaited<
      ReturnType<typeof getTimeTrackingByUserId>
    >[] = [];

    for (let daysAgo = 0; daysAgo < 7; daysAgo++) {
      const date = getDateDaysAgo(daysAgo);

      const sessions = await getTimeTrackingByUserId(
        session.userId,
        date,
      );

      weekSessions.push(sessions);
    }

    let weeklyWorkingSeconds = 0;
    let weeklyBreakSeconds = 0;
    let lateArrivals = 0;

    for (const daySessions of weekSessions) {
      for (const item of daySessions) {
        const duration = getDurationSeconds(
          item.start,
          item.end,
          currentTime,
        );

        if (item.type === "work") {
          weeklyWorkingSeconds += duration;
        } else {
          weeklyBreakSeconds += duration;
        }
      }

      const firstWork = daySessions.find(
        (item) => item.type === "work",
      );

      if (firstWork) {
        const clockInMinutes = getMinutesFromTime(firstWork.start);

        // 09:10 AM is considered the late-arrival threshold.
        if (clockInMinutes > 9 * 60 + 10) {
          lateArrivals += 1;
        }
      }
    }

    const expectedWeeklySeconds = DAILY_WORK_TARGET_SECONDS * 5;
    const overtimeSeconds = Math.max(
      0,
      weeklyWorkingSeconds - expectedWeeklySeconds,
    );

    return NextResponse.json({
      date: today,
      formattedDate: formatDate(today),

      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },

      today: {
        clockIn: firstWorkSession
          ? formatTime(firstWorkSession.start)
          : null,

        workingSeconds,
        breakSeconds,
        workingTime: formatDuration(workingSeconds),
        breakTime: formatDuration(breakSeconds),

        status,

        timeline: buildTimeline(todaySessions),
      },

      week: {
        workingSeconds: weeklyWorkingSeconds,
        breakSeconds: weeklyBreakSeconds,
        overtimeSeconds,

        workingTime: formatDuration(weeklyWorkingSeconds),
        breakTime: formatDuration(weeklyBreakSeconds),
        overtime: formatDuration(overtimeSeconds),

        lateArrivals,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 },
    );
  }
}