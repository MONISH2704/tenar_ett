import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  createWorkLog,
  getWorkLogsByUserId,
} from "@/lib/data/cosmos-work-logs";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  try {
    const workLogs = await getWorkLogsByUserId(
      session.userId
    );

    return NextResponse.json({
      workLogs,
    });
  } catch (error) {
    console.error(
      "Failed to fetch work logs:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to fetch work logs.",
      },
      { status: 500 }
    );
  }
}

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

    const dateValue = String(
      body.dateValue ?? ""
    ).trim();

    const type = String(
      body.type ?? ""
    ).trim();

    const startTime = String(
      body.startTime ?? ""
    ).trim();

    const endTime = String(
      body.endTime ?? ""
    ).trim();

    const duration = String(
      body.duration ?? ""
    ).trim();

    if (
      !dateValue ||
      !startTime ||
      !endTime ||
      !duration
    ) {
      return NextResponse.json(
        {
          error:
            "Date, start time, end time and duration are required.",
        },
        { status: 400 }
      );
    }

    if (
      type !== "Work" &&
      type !== "Break"
    ) {
      return NextResponse.json(
        {
          error:
            "Session type must be Work or Break.",
        },
        { status: 400 }
      );
    }

    const date = new Date(
      `${dateValue}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return NextResponse.json(
        {
          error: "Invalid date.",
        },
        { status: 400 }
      );
    }

    const day = date.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        timeZone: "Asia/Kolkata",
      }
    );

    const displayDate = date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }
    );

    const workLog = await createWorkLog({
      userId: session.userId,
      date: displayDate,
      dateValue,
      day,
      type,
      startTime,
      endTime,
      duration,
    });

    return NextResponse.json(
      {
        success: true,
        workLog,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Failed to create work log:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to create work log.",
      },
      { status: 500 }
    );
  }
}