import { CosmosClient } from "@azure/cosmos";

try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local may already be loaded in the environment.
}

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseName = process.env.COSMOS_DATABASE;

if (!endpoint || !key || !databaseName) {
  throw new Error(
    "Missing COSMOS_ENDPOINT, COSMOS_KEY, or COSMOS_DATABASE."
  );
}

const client = new CosmosClient({
  endpoint,
  key,
});

const database = client.database(databaseName);
const container = database.container("leaveRequests");

const userId = "employee-001";

const leaveRequests = [
  {
    id: `${userId}-leave-001`,
    userId,
    type: "Casual Leave",
    startDate: "2026-09-02",
    endDate: "2026-09-02",
    startDateValue: "2026-09-02",
    endDateValue: "2026-09-02",
    days: 1,
    reason: "Personal work",
    status: "Pending",
    createdAt: "2026-09-01T09:00:00.000Z",
  },
  {
    id: `${userId}-leave-002`,
    userId,
    type: "Sick Leave",
    startDate: "2026-08-18",
    endDate: "2026-08-19",
    startDateValue: "2026-08-18",
    endDateValue: "2026-08-19",
    days: 2,
    reason: "Not feeling well",
    status: "Approved",
    createdAt: "2026-08-17T09:00:00.000Z",
  },
  {
    id: `${userId}-leave-003`,
    userId,
    type: "Casual Leave",
    startDate: "2026-08-05",
    endDate: "2026-08-05",
    startDateValue: "2026-08-05",
    endDateValue: "2026-08-05",
    days: 1,
    reason: "Personal appointment",
    status: "Approved",
    createdAt: "2026-08-04T09:00:00.000Z",
  },
  {
    id: `${userId}-leave-004`,
    userId,
    type: "Other Leave",
    startDate: "2026-07-28",
    endDate: "2026-07-28",
    startDateValue: "2026-07-28",
    endDateValue: "2026-07-28",
    days: 1,
    reason: "Family function",
    status: "Rejected",
    createdAt: "2026-07-27T09:00:00.000Z",
  },
];

for (const leaveRequest of leaveRequests) {
  await container.items.upsert(leaveRequest);

  console.log(
    `SEEDED: ${leaveRequest.type} | ${leaveRequest.startDate} | ${leaveRequest.status}`
  );
}

console.log("\nLeave request seeding completed.");