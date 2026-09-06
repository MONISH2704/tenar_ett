import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  canViewTeamWorkLogs,
  isAdmin,
  isManagerOrAdmin,
} from "@/lib/auth/authorization";
import {
  getAllUsers,
  type CosmosUser,
} from "@/lib/data/cosmos-users";
import {
  getTimeTrackingByUserId,
  type CosmosTimeTracking,
} from "@/lib/data/cosmos-time-tracking";

interface WorkLogSummary {
  userId: string;
  name: string;
  email: string;
  role: CosmosUser["role"];
  department: string;
  date: string;
  status: "Working" | "Break" | "Completed" | "Not Started";
  started: string | null;
  totalWorkingSeconds: number;
}

function getTodayIndia(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

function getElapsedSeconds(start: string, end?: string): number {
  const startTime = new Date(start).getTime();

  const endTime = end
    ? new Date(end).getTime()
    : Date.now();

  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
    return 0;
  }

  return Math.max(0, Math.floor((endTime - startTime) / 1000));
}

function buildSummary(
  user: CosmosUser,
  sessions: CosmosTimeTracking[],
  date: string
): WorkLogSummary {
  const workSessions = sessions.filter(
    (session) => session.type === "work"
  );

  const activeSession =
    sessions.length > 0
      ? sessions[sessions.length - 1]
      : undefined;

  let status: WorkLogSummary["status"] = "Not Started";

  if (activeSession && !activeSession.end) {
    if (activeSession.type === "work") {
      status = "Working";
    } else {
      status = "Break";
    }
  } else if (workSessions.length > 0) {
    status = "Completed";
  }

  const started =
    workSessions.length > 0
      ? workSessions[0].start
      : null;

  let totalWorkingSeconds = 0;

  for (const session of workSessions) {
    if (session.end) {
      totalWorkingSeconds += getElapsedSeconds(
        session.start,
        session.end
      );
    } else if (status === "Working") {
      totalWorkingSeconds += getElapsedSeconds(
        session.start
      );
    }
  }

  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    date,
    status,
    started,
    totalWorkingSeconds,
  };
}

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!canViewTeamWorkLogs(session.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const requestedDate =
      searchParams.get("date") || getTodayIndia();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      return NextResponse.json(
        { error: "Invalid date format." },
        { status: 400 }
      );
    }

    const allUsers = await getAllUsers();

    let targetUsers: CosmosUser[];

    if (isAdmin(session.role)) {
      // Admin sees:
      // - Employees
      // - Managers
      // - Own Admin record
      targetUsers = allUsers.filter(
        (user) =>
          user.role === "EMPLOYEE" ||
          user.role === "MANAGER" ||
          user.userId === session.userId
      );
    } else if (isManagerOrAdmin(session.role)) {
      // Manager sees:
      // - Employees
      // - Own Manager record
      targetUsers = allUsers.filter(
        (user) =>
          user.role === "EMPLOYEE" ||
          user.userId === session.userId
      );
    } else {
      targetUsers = [];
    }

    const summaries = await Promise.all(
      targetUsers.map(async (user) => {
        const sessions =
          await getTimeTrackingByUserId(
            user.userId,
            requestedDate
          );

        return buildSummary(
          user,
          sessions,
          requestedDate
        );
      })
    );

    summaries.sort((a, b) => {
      if (a.status === "Working" && b.status !== "Working") {
        return -1;
      }

      if (a.status !== "Working" && b.status === "Working") {
        return 1;
      }

      if (a.status === "Break" && b.status !== "Break") {
        return -1;
      }

      if (a.status !== "Break" && b.status === "Break") {
        return 1;
      }

      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      date: requestedDate,
      serverNow: Date.now(),
      summaries,
    });
  } catch (error) {
    console.error(
      "GET /api/work-logs/summary error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to load work log summary." },
      { status: 500 }
    );
  }
}