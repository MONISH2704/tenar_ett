import { getCosmosContainer } from "@/lib/cosmos";

export type WorkLogType = "Work" | "Break";

export interface CosmosWorkLog {
  id: string;
  userId: string;
  date: string;
  dateValue: string;
  day: string;
  type: WorkLogType;
  startTime: string;
  endTime: string;
  duration: string;
}

const container = () => getCosmosContainer("workLogs");

export async function getWorkLogsByUserId(
  userId: string
): Promise<CosmosWorkLog[]> {
  const query = {
    query:
      "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.dateValue DESC",
    parameters: [
      {
        name: "@userId",
        value: userId,
      },
    ],
  };

  const { resources } = await container()
    .items.query<CosmosWorkLog>(query, {
      partitionKey: userId,
    })
    .fetchAll();

  return resources;
}

export async function createWorkLog(
  workLog: Omit<CosmosWorkLog, "id">
): Promise<CosmosWorkLog> {
  const document: CosmosWorkLog = {
    ...workLog,
    id: `${workLog.userId}-${crypto.randomUUID()}`,
  };

  const { resource } = await container()
    .items.create<CosmosWorkLog>(document);

  if (!resource) {
    throw new Error("Failed to create work log.");
  }

  return resource;
}