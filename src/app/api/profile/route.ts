import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import {
  getUserById,
  updateUser,
} from "@/lib/data/cosmos-users";

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
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

  try {
    const user = await getUserById(session.userId);

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

    const { firstName, lastName } = splitName(user.name);

    return NextResponse.json({
      profile: {
        firstName,
        lastName,
        employeeId: user.userId,
        email: user.email,
        phone: user.phone ?? "",
        department: user.department,
        jobTitle: user.jobTitle ?? "",
        manager: user.manager ?? "",
        joiningDate: user.joinedDate,
        location: user.location ?? "",
      },
    });
  } catch (error) {
    console.error(
      "Failed to load profile from Cosmos DB:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load profile.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request: Request) {
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

  try {
    const body = await request.json();

    const firstName =
      typeof body.firstName === "string"
        ? body.firstName.trim()
        : "";

    const lastName =
      typeof body.lastName === "string"
        ? body.lastName.trim()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const location =
      typeof body.location === "string"
        ? body.location.trim()
        : "";

    if (!firstName) {
      return NextResponse.json(
        {
          error: "First name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const name = [firstName, lastName]
      .filter(Boolean)
      .join(" ");

    const updatedUser = await updateUser(
      session.userId,
      {
        name,
        phone,
        location,
      }
    );

    const { firstName: updatedFirstName, lastName: updatedLastName } =
      splitName(updatedUser.name);

    return NextResponse.json({
      message: "Profile updated successfully.",
      profile: {
        firstName: updatedFirstName,
        lastName: updatedLastName,
        employeeId: updatedUser.userId,
        email: updatedUser.email,
        phone: updatedUser.phone ?? "",
        department: updatedUser.department,
        jobTitle: updatedUser.jobTitle ?? "",
        manager: updatedUser.manager ?? "",
        joiningDate: updatedUser.joinedDate,
        location: updatedUser.location ?? "",
      },
    });
  } catch (error) {
    console.error(
      "Failed to update profile in Cosmos DB:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to update profile.",
      },
      {
        status: 500,
      }
    );
  }
}