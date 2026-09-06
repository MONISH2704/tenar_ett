import { getCosmosContainer } from "@/lib/cosmos";
export type UserRole =
  | "ADMIN"
  | "MANAGER"
  | "EMPLOYEE";

export interface CosmosUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: "Active" | "Inactive";
  joinedDate: string;
  passwordHash: string;

  // Optional profile information.
  // Existing Cosmos users can continue working without these fields.
  phone?: string;
  jobTitle?: string;
  manager?: string;
  location?: string;
}

const container = () => getCosmosContainer("users");

export async function getUserByEmail(
  email: string
): Promise<CosmosUser | null> {
  const normalizedEmail = email.trim().toLowerCase();

  const query = {
    query:
      "SELECT * FROM c WHERE LOWER(c.email) = @email",
    parameters: [
      {
        name: "@email",
        value: normalizedEmail,
      },
    ],
  };

  const { resources } = await container()
    .items.query<CosmosUser>(query)
    .fetchAll();

  return resources[0] ?? null;
}

export async function getUserById(
  userId: string
): Promise<CosmosUser | null> {
  try {
    const { resource } = await container()
      .item(userId, userId)
      .read<CosmosUser>();

    return resource ?? null;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 404
    ) {
      return null;
    }

    throw error;
  }
}

export async function createUser(
  user: Omit<CosmosUser, "id">
): Promise<CosmosUser> {
  const document: CosmosUser = {
    ...user,
    id: user.userId,
  };

  const { resource } = await container()
    .items.create<CosmosUser>(document);

  if (!resource) {
    throw new Error("Failed to create user.");
  }

  return resource;
}

export async function updateUser(
  userId: string,
  updates: Partial<Omit<CosmosUser, "id" | "userId">>
): Promise<CosmosUser> {
  const existing = await getUserById(userId);

  if (!existing) {
    throw new Error("User not found.");
  }

  const updated: CosmosUser = {
    ...existing,
    ...updates,
    id: existing.userId,
    userId: existing.userId,
  };

  const { resource } = await container()
    .item(userId, userId)
    .replace<CosmosUser>(updated);

  if (!resource) {
    throw new Error("Failed to update user.");
  }

  return resource;
}

export async function getAllUsers(): Promise<CosmosUser[]> {
  const query = {
    query: "SELECT * FROM c",
  };

  const { resources } = await container()
    .items.query<CosmosUser>(query)
    .fetchAll();

  return resources;
}
