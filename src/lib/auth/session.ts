import {
  SignJWT,
  jwtVerify,
  type JWTPayload,
} from "jose";
import { cookies } from "next/headers";

export type UserRole =
  | "ADMIN"
  | "MANAGER"
  | "EMPLOYEE";

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is not configured.");
}

const secretKey = new TextEncoder().encode(secret);

const COOKIE_NAME = "tenar_session";

export async function createSession(
  payload: SessionPayload
) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey);

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function getSession(): Promise<
  SessionPayload | null
> {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(
      token,
      secretKey
    );

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }

    if (
      payload.role !== "ADMIN" &&
      payload.role !== "MANAGER" &&
      payload.role !== "EMPLOYEE"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}