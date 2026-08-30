import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/authorization";
import { users } from "@/lib/data/users";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        error: "Authentication required.",
      },
      {
        status: 401,
      }
    );
  }

  const { id } = await context.params;

  const user = users.find(
    (currentUser) => currentUser.id === id
  );

  if (!user) {
    return NextResponse.json(
      {
        error: "User not found.",
      },
      {
        status: 404,
      }
    );
  }

  /*
   * ADMIN:
   * Can change employee and manager passwords.
   *
   * MANAGER:
   * Can change employee passwords only.
   *
   * EMPLOYEE:
   * Cannot change other users' passwords.
   */

  if (user.role === "EMPLOYEE") {
    if (
      !hasPermission(
        session.role,
        "CHANGE_EMPLOYEE_PASSWORD"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to change employee passwords.",
        },
        {
          status: 403,
        }
      );
    }
  }

  if (user.role === "MANAGER") {
    if (
      !hasPermission(
        session.role,
        "CHANGE_MANAGER_PASSWORD"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to change manager passwords.",
        },
        {
          status: 403,
        }
      );
    }
  }

  if (user.role === "ADMIN") {
    return NextResponse.json(
      {
        error:
          "Administrator passwords cannot be changed through this endpoint.",
      },
      {
        status: 403,
      }
    );
  }

  try {
    const body = await request.json();

    const newPassword =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!newPassword) {
      return NextResponse.json(
        {
          error: "New password is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          error:
            "Password must contain at least 8 characters.",
        },
        {
          status: 400,
        }
      );
    }

    user.password = newPassword;

    return NextResponse.json({
      success: true,
      message:
        `${user.role === "MANAGER" ? "Manager" : "Employee"} password updated successfully.`,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request.",
      },
      {
        status: 400,
      }
    );
  }
}