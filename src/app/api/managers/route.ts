import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/authorization";
import { users } from "@/lib/data/users";

export async function GET() {
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

  if (
    !hasPermission(
      session.role,
      "MANAGE_MANAGERS"
    )
  ) {
    return NextResponse.json(
      {
        error:
          "You do not have permission to manage managers.",
      },
      {
        status: 403,
      }
    );
  }

  const managers = users.filter(
    (user) => user.role === "MANAGER"
  );

  return NextResponse.json({
    users: managers,
  });
}

export async function POST(request: Request) {
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

  if (
    !hasPermission(
      session.role,
      "MANAGE_MANAGERS"
    )
  ) {
    return NextResponse.json(
      {
        error:
          "You do not have permission to create managers.",
      },
      {
        status: 403,
      }
    );
  }

  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const department =
      typeof body.department === "string"
        ? body.department.trim()
        : "";

    if (!name || !email || !department) {
      return NextResponse.json(
        {
          error:
            "Name, email and department are required.",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser = users.find(
      (user) =>
        user.email.toLowerCase() === email
    );

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "A user with this email already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const newManager = {
      id: `manager-${Date.now()}`,
      name,
      email,
      role: "MANAGER" as const,
      department,
      status: "Active" as const,
      joinedDate: new Date().toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),
      password: "Temporary@12345",
    };

    users.push(newManager);

    return NextResponse.json(
      {
        success: true,
        message: "Manager created successfully.",
        user: newManager,
      },
      {
        status: 201,
      }
    );
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