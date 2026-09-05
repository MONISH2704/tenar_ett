import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/authorization";

import {
  getAllUsers,
  getUserByEmail,
  createUser,
} from "@/lib/data/cosmos-users";

type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: "Active" | "Inactive";
  joinedDate: string;
}

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

  const allowed = hasPermission(
    session.role,
    "MANAGE_EMPLOYEES"
  );

  if (!allowed) {
    return NextResponse.json(
      {
        error:
          "You do not have permission to manage employees.",
      },
      {
        status: 403,
      }
    );
  }

  try {
    const allUsers = await getAllUsers();

    const employees: User[] = allUsers
      .filter((user) => user.role === "EMPLOYEE")
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
      users: employees,
    });
  } catch (error) {
    console.error(
      "Failed to load employees from Cosmos DB:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load employees.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
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

  const allowed = hasPermission(
    session.role,
    "MANAGE_EMPLOYEES"
  );

  if (!allowed) {
    return NextResponse.json(
      {
        error:
          "You do not have permission to manage employees.",
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
            "Password must be at least 8 characters.",
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

    const userId = `employee-${crypto.randomUUID()}`;

    const passwordHash = await bcrypt.hash(
      password,
      10
    );

    const joinedDate = new Date().toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

    const createdUser = await createUser({
  userId,
  name,
  email,
  role: "EMPLOYEE",
  department,
  status: "Active",
  joinedDate,
  passwordHash,
});

    return NextResponse.json(
      {
        message: "Employee created successfully.",
        user: {
          id: createdUser.userId,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          department: createdUser.department,
          status: createdUser.status,
          joinedDate: createdUser.joinedDate,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Failed to create employee in Cosmos DB:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to create employee.",
      },
      {
        status: 500,
      }
    );
  }
}