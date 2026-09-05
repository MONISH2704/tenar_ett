import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  createTimeTracking,
  getTimeTrackingByUserId,
  updateTimeTracking,
  type CosmosTimeTracking,
} from "@/lib/data/cosmos-time-tracking";

export const runtime = "nodejs";

type Action =
  | "start-work"
  | "start-break"
  | "end-break"
  | "end-work";

function getTodayDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

function getNow(): string {
  return new Date().toISOString();
}

function isActive(
  session: CosmosTimeTracking
): boolean {
  return !session.end;
}

function getActiveSession(
  sessions: CosmosTimeTracking[]
): CosmosTimeTracking | undefined {
  return [...sessions]
    .reverse()
    .find((session) => !session.end);
}

/*
 * GET
 *
 * Returns today's time-tracking sessions
 * for the currently authenticated employee.
 */
export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  try {
    const date = getTodayDate();

    const sessions = await getTimeTrackingByUserId(
      session.userId,
      date
    );

    const activeSession = getActiveSession(sessions);

    return NextResponse.json({
      date,
      sessions,
      activeSession: activeSession ?? null,
    });
  } catch (error) {
    console.error(
      "Failed to fetch time tracking:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to fetch time tracking sessions.",
      },
      { status: 500 }
    );
  }
}

/*
 * POST
 *
 * Actions:
 * - start-work
 * - start-break
 * - end-break
 * - end-work
 */
export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const action = String(body.action ?? "") as Action;

    const validActions: Action[] = [
      "start-work",
      "start-break",
      "end-break",
      "end-work",
    ];

    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: "Invalid time tracking action." },
        { status: 400 }
      );
    }

    const date = getTodayDate();
    const now = getNow();

    const sessions =
      await getTimeTrackingByUserId(
        session.userId,
        date
      );

    const activeSession =
      getActiveSession(sessions);

    /*
     * START WORK
     */
    if (action === "start-work") {
      if (activeSession) {
        return NextResponse.json(
          {
            error:
              "You already have an active session.",
          },
          { status: 400 }
        );
      }

      const newSession =
        await createTimeTracking({
          userId: session.userId,
          date,
          type: "work",
          start: now,
        });

      return NextResponse.json({
        success: true,
        message: "Work session started.",
        session: newSession,
      });
    }

    /*
     * All remaining actions require
     * an active session.
     */
    if (!activeSession) {
      return NextResponse.json(
        {
          error:
            "There is no active time tracking session.",
        },
        { status: 400 }
      );
    }

    /*
     * START BREAK
     *
     * Close the active work session and
     * immediately create a break session.
     */
    if (action === "start-break") {
      if (activeSession.type !== "work") {
        return NextResponse.json(
          {
            error:
              "A break is already in progress.",
          },
          { status: 400 }
        );
      }

      const closedWorkSession =
        await updateTimeTracking({
          ...activeSession,
          end: now,
        });

      const breakSession =
        await createTimeTracking({
          userId: session.userId,
          date,
          type: "break",
          start: now,
        });

      return NextResponse.json({
        success: true,
        message: "Break started.",
        closedSession: closedWorkSession,
        session: breakSession,
      });
    }

    /*
     * END BREAK
     *
     * Close the break and immediately
     * create a new work session.
     */
    if (action === "end-break") {
      if (activeSession.type !== "break") {
        return NextResponse.json(
          {
            error:
              "There is no active break.",
          },
          { status: 400 }
        );
      }

      const closedBreakSession =
        await updateTimeTracking({
          ...activeSession,
          end: now,
        });

      const workSession =
        await createTimeTracking({
          userId: session.userId,
          date,
          type: "work",
          start: now,
        });

      return NextResponse.json({
        success: true,
        message: "Break ended.",
        closedSession: closedBreakSession,
        session: workSession,
      });
    }

    /*
     * END WORK
     */
    if (action === "end-work") {
      if (activeSession.type !== "work") {
        return NextResponse.json(
          {
            error:
              "You are currently on a break. End the break first.",
          },
          { status: 400 }
        );
      }

      const closedSession =
        await updateTimeTracking({
          ...activeSession,
          end: now,
        });

      return NextResponse.json({
        success: true,
        message: "Work session ended.",
        session: closedSession,
      });
    }

    return NextResponse.json(
      { error: "Unsupported action." },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "Time tracking action failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to process time tracking action.",
      },
      { status: 500 }
    );
  }
}