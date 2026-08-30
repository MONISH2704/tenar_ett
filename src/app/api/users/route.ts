import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/authorization";

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

/*
 * Temporary user store.
 *
 * Cosmos DB will replace this later.
 */
const users: User[] = [
  {
    id: "employee-001",
    name: "John Doe",
    email: "employee@tenar.com",
    role: "EMPLOYEE",
    department: "Engineering",
    status: "Active",
    joinedDate: "15 Jan 2026",
  },
  {
    id: "employee-002",
    name: "Jane Smith",
    email: "jane@tenar.com",
    role: "EMPLOYEE",
    department: "Human Resources",
    status: "Active",
    joinedDate: "02 Feb 2026",
  },
  {
    id: "employee-003",
    name: "Robert Kumar",
    email: "robert@tenar.com",
    role: "EMPLOYEE",
    department: "Finance",
    status: "Active",
    joinedDate: "18 Mar 2026",
  },
];

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
        error: "You do not have permission to manage employees.",
      },
      {
        status: 403,
      }
    );
  }

  const employees = users.filter(
    (user) => user.role === "EMPLOYEE"
  );

  return NextResponse.json({
    users: employees,
  });
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
        error: "You do not have permission to manage employees.",
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
          error: "A user with this email already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const newUser: User = {
      id: `employee-${Date.now()}`,
      name,
      email,
      role: "EMPLOYEE",
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
    };

    users.push(newUser);

    return NextResponse.json(
      {
        message: "Employee created successfully.",
        user: newUser,
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