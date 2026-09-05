import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAttendanceByUserId } from "@/lib/data/cosmos-attendance";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const attendance = await getAttendanceByUserId(
      session.userId
    );

    const filteredAttendance =
      month && year
        ? attendance.filter((record) => {
            const date = new Date(record.date);

            return (
              date.getMonth() + 1 === Number(month) &&
              date.getFullYear() === Number(year)
            );
          })
        : attendance;

    return NextResponse.json({
      attendance: filteredAttendance,
    });
  } catch (error) {
    console.error("Failed to fetch attendance:", error);

    return NextResponse.json(
      { error: "Unable to fetch attendance." },
      { status: 500 }
    );
  }
}