import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/authorization";
import {
  getAllUsers,
  getUserByEmail,
  createUser,
} from "@/lib/data/cosmos-users";

export const runtime = "nodejs";

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

  if (!hasPermission(session.role, "MANAGE_MANAGERS")) {
    return NextResponse.json(
      {
        error: "You do not have permission to manage managers.",
      },
      {
        status: 403,
      }
    );
  }

  try {
    const allUsers = await getAllUsers();

    const managers = allUsers
      .filter((user) => user.role === "MANAGER")
      .map((user) => ({
        id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        joinedDate: user.joinedDate,
      }));

    return NextResponse.json({
      users: managers,
    });
  } catch (error) {
    console.error("Failed to fetch managers:", error);

    return NextResponse.json(
      {
        error: "Unable to fetch managers.",
      },
      {
        status: 500,
      }
    );
  }
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

  if (!hasPermission(session.role, "MANAGE_MANAGERS")) {
    return NextResponse.json(
      {
        error: "You do not have permission to create managers.",
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

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!name || !email || !department || !password) {
      return NextResponse.json(
        {
          error:
            "Name, email, department and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters long.",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser = await getUserByEmail(email);

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

    const passwordHash = await bcrypt.hash(password, 10);

    const userId = `manager-${crypto.randomUUID()}`;

    const newManager = await createUser({
      userId,
      name,
      email,
      role: "MANAGER",
      department,
      status: "Active",
      joinedDate: new Date().toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),
      passwordHash,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Manager created successfully.",
        user: {
          id: newManager.userId,
          name: newManager.name,
          email: newManager.email,
          role: newManager.role,
          department: newManager.department,
          status: newManager.status,
          joinedDate: newManager.joinedDate,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Failed to create manager:", error);

    return NextResponse.json(
      {
        error: "Unable to create manager.",
      },
      {
        status: 500,
      }
    );
  }
}