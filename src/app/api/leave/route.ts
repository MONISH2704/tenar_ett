import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  createLeaveRequest,
  getLeaveRequestsByUserId,
  getLeaveRequestById,
  deleteLeaveRequest,
} from "@/lib/data/cosmos-leave";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const requests = await getLeaveRequestsByUserId(session.userId);

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Failed to fetch leave requests:", error);

    return NextResponse.json(
      { message: "Unable to fetch leave requests." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const type = String(body.type ?? "").trim();
    const startDate = String(body.startDate ?? "").trim();
    const endDate = String(body.endDate ?? "").trim();
    const reason = String(body.reason ?? "").trim();
    const days = Number(body.days);

    if (!type || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { message: "All leave fields are required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(days) || days <= 0) {
      return NextResponse.json(
        { message: "Invalid number of leave days." },
        { status: 400 }
      );
    }

    if (
      type !== "Casual Leave" &&
      type !== "Sick Leave" &&
      type !== "Other Leave"
    ) {
      return NextResponse.json(
        { message: "Invalid leave type." },
        { status: 400 }
      );
    }

    if (endDate < startDate) {
      return NextResponse.json(
        { message: "End date cannot be before start date." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const leaveRequest = await createLeaveRequest({
      userId: session.userId,
      type,
      startDate,
      endDate,
      startDateValue: startDate,
      endDateValue: endDate,
      days,
      reason,
      status: "Pending",
      createdAt: now,
    });

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error("Failed to create leave request:", error);

    return NextResponse.json(
      { message: "Unable to create leave request." },
      { status: 500 }
    );
  }
}
export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Leave request ID is required." },
        { status: 400 }
      );
    }

    const existingRequest = await getLeaveRequestById(
      id,
      session.userId
    );

    if (!existingRequest) {
      return NextResponse.json(
        { message: "Leave request not found." },
        { status: 404 }
      );
    }

    if (existingRequest.status !== "Pending") {
      return NextResponse.json(
        { message: "Only pending requests can be cancelled." },
        { status: 400 }
      );
    }

    await deleteLeaveRequest(id, session.userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Failed to cancel leave request:", error);

    return NextResponse.json(
      { message: "Unable to cancel leave request." },
      { status: 500 }
    );
  }
}