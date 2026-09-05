import { getCosmosContainer } from "@/lib/cosmos";

export type TimeTrackingSessionType = "work" | "break";

export interface CosmosTimeTracking {
  id: string;
  userId: string;
  date: string;
  type: TimeTrackingSessionType;
  start: string;
  end?: string;
}

const container = () =>
  getCosmosContainer("timeTracking");

export async function getTimeTrackingByUserId(
  userId: string,
  date: string
): Promise<CosmosTimeTracking[]> {
  const query = {
    query:
      "SELECT * FROM c WHERE c.userId = @userId AND c.date = @date ORDER BY c.start ASC",
    parameters: [
      {
        name: "@userId",
        value: userId,
      },
      {
        name: "@date",
        value: date,
      },
    ],
  };

  const { resources } = await container()
    .items
    .query<CosmosTimeTracking>(query)
    .fetchAll();

  return resources;
}

export async function createTimeTracking(
  session: Omit<CosmosTimeTracking, "id">
): Promise<CosmosTimeTracking> {
  const document: CosmosTimeTracking = {
    ...session,
    id: `${session.userId}-${crypto.randomUUID()}`,
  };

  const { resource } = await container()
    .items
    .create<CosmosTimeTracking>(document);

  if (!resource) {
    throw new Error("Failed to create time tracking session.");
  }

  return resource;
}

export async function updateTimeTracking(
  session: CosmosTimeTracking
): Promise<CosmosTimeTracking> {
  const { resource } = await container()
    .item(session.id, session.userId)
    .replace<CosmosTimeTracking>(session);

  if (!resource) {
    throw new Error("Failed to update time tracking session.");
  }

  return resource;
}