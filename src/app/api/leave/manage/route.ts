import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getAllLeaveRequests,
  updateLeaveRequestStatus,
} from "@/lib/data/cosmos-leave";
import { getUserById } from "@/lib/data/cosmos-users";

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

    if (
      session.role !== "ADMIN" &&
      session.role !== "MANAGER"
    ) {
      return NextResponse.json(
        { message: "Forbidden." },
        { status: 403 }
      );
    }

    const requests = await getAllLeaveRequests();

    const requestsWithEmployees = await Promise.all(
      requests.map(async (request) => {
        const employee = await getUserById(
          request.userId
        );

        return {
          ...request,
          employee: employee
            ? {
                userId: employee.userId,
                name: employee.name,
                email: employee.email,
                department: employee.department,
              }
            : null,
        };
      })
    );

    return NextResponse.json(requestsWithEmployees);
  } catch (error) {
    console.error(
      "Failed to fetch managed leave requests:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to fetch leave requests.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    if (
      session.role !== "ADMIN" &&
      session.role !== "MANAGER"
    ) {
      return NextResponse.json(
        { message: "Forbidden." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const id = String(body.id ?? "").trim();
    const userId = String(
      body.userId ?? ""
    ).trim();
    const status = String(
      body.status ?? ""
    ).trim();

    if (!id || !userId || !status) {
      return NextResponse.json(
        {
          message:
            "Leave request ID, user ID, and status are required.",
        },
        { status: 400 }
      );
    }

    if (
      status !== "Approved" &&
      status !== "Rejected"
    ) {
      return NextResponse.json(
        {
          message:
            "Status must be Approved or Rejected.",
        },
        { status: 400 }
      );
    }

    const targetUser = await getUserById(userId);

if (!targetUser) {
  return NextResponse.json(
    { message: "Employee not found." },
    { status: 404 }
  );
}

if (targetUser.role !== "EMPLOYEE") {
  return NextResponse.json(
    {
      message:
        "Only employee leave requests can be managed.",
    },
    { status: 400 }
  );
}

    const updatedRequest =
      await updateLeaveRequestStatus(
        id,
        userId,
        status
      );

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error(
      "Failed to update leave request:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to update leave request.",
      },
      { status: 500 }
    );
  }
}