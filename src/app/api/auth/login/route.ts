import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth/session";
import { users } from "@/lib/data/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    const user = users.find(
      (currentUser) =>
        currentUser.email.toLowerCase() === email &&
        currentUser.status === "Active"
    );

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid company email or password.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Temporary development authentication.
     *
     * The current users.ts contains plaintext development
     * passwords. We hash the stored password before comparing
     * so the login flow continues to use bcrypt.
     *
     * When Cosmos DB is added, users will contain password
     * hashes directly and this section will be changed to:
     *
     * bcrypt.compare(password, user.passwordHash)
     */
    const passwordHash = await bcrypt.hash(
      user.password,
      10
    );

    const passwordMatches = await bcrypt.compare(
      password,
      passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          message: "Invalid company email or password.",
        },
        {
          status: 401,
        }
      );
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      user: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json(
      {
        message: "Unable to process login.",
      },
      {
        status: 500,
      }
    );
  }
}