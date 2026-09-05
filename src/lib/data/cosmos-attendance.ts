import { getCosmosContainer } from "@/lib/cosmos";

export type AttendanceStatus =
  | "Present"
  | "Late"
  | "Absent"
  | "Leave";

export interface CosmosAttendance {
  id: string;
  userId: string;
  date: string;
  day: string;
  clockIn: string;
  clockOut: string;
  workingHours: string;
  breakHours: string;
  status: AttendanceStatus;
}

const container = () =>
  getCosmosContainer("attendance");

export async function getAttendanceByUserId(
  userId: string
): Promise<CosmosAttendance[]> {
  const query = {
    query:
      "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.date DESC",
    parameters: [
      {
        name: "@userId",
        value: userId,
      },
    ],
  };

  const { resources } = await container()
    .items.query<CosmosAttendance>(query)
    .fetchAll();

  return resources;
}

export async function createAttendance(
  attendance: Omit<CosmosAttendance, "id">
): Promise<CosmosAttendance> {
  const document: CosmosAttendance = {
    ...attendance,
    id: `${attendance.userId}-${crypto.randomUUID()}`,
  };

  const { resource } = await container()
    .items.create<CosmosAttendance>(document);

  if (!resource) {
    throw new Error(
      "Failed to create attendance record."
    );
  }

  return resource;
}