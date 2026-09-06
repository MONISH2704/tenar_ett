import { getCosmosContainer } from "@/lib/cosmos";

export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export type LeaveType =
  | "Casual Leave"
  | "Sick Leave"
  | "Other Leave";

export interface CosmosLeaveRequest {
  id: string;
  userId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  startDateValue: string;
  endDateValue: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}

const container = () =>
  getCosmosContainer("leaveRequests");

export async function getLeaveRequestsByUserId(
  userId: string
): Promise<CosmosLeaveRequest[]> {
  const query = {
    query:
      "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.startDateValue DESC",
    parameters: [
      {
        name: "@userId",
        value: userId,
      },
    ],
  };

  const { resources } = await container()
    .items.query<CosmosLeaveRequest>(query)
    .fetchAll();

  return resources;
}

export async function getAllLeaveRequests(): Promise<
  CosmosLeaveRequest[]
> {
  const query = {
    query:
      "SELECT * FROM c ORDER BY c.startDateValue DESC",
  };

  const { resources } = await container()
    .items.query<CosmosLeaveRequest>(query)
    .fetchAll();

  return resources;
}

export async function createLeaveRequest(
  request: Omit<CosmosLeaveRequest, "id">
): Promise<CosmosLeaveRequest> {
  const document: CosmosLeaveRequest = {
    ...request,
    id: `${request.userId}-${crypto.randomUUID()}`,
  };

  const { resource } = await container()
    .items.create<CosmosLeaveRequest>(document);

  if (!resource) {
    throw new Error("Failed to create leave request.");
  }

  return resource;
}

export async function getLeaveRequestById(
  id: string,
  userId: string
): Promise<CosmosLeaveRequest | null> {
  try {
    const { resource } = await container()
      .item(id, userId)
      .read<CosmosLeaveRequest>();

    return resource ?? null;
  } catch (error: unknown) {
    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error
        ? Number(
            (error as { code?: number }).code
          )
        : undefined;

    if (statusCode === 404) {
      return null;
    }

    throw error;
  }
}

export async function updateLeaveRequestStatus(
  id: string,
  userId: string,
  status: LeaveStatus
): Promise<CosmosLeaveRequest> {
  const existingRequest =
    await getLeaveRequestById(id, userId);

  if (!existingRequest) {
    throw new Error("Leave request not found.");
  }

  const updatedRequest: CosmosLeaveRequest = {
    ...existingRequest,
    status,
  };

  const { resource } = await container()
    .item(id, userId)
    .replace<CosmosLeaveRequest>(updatedRequest);

  if (!resource) {
    throw new Error("Failed to update leave request.");
  }

  return resource;
}

export async function deleteLeaveRequest(
  id: string,
  userId: string
): Promise<void> {
  await container()
    .item(id, userId)
    .delete();
}