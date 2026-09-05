import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CosmosClient } from "@azure/cosmos";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const envPath = path.join(projectRoot, ".env.local");

if (!fs.existsSync(envPath)) {
  throw new Error(".env.local was not found.");
}

const envText = fs.readFileSync(envPath, "utf8");

function getEnv(name) {
  const line = envText
    .split(/\r?\n/)
    .find((line) => line.startsWith(`${name}=`));

  return line
    ? line.substring(name.length + 1).trim()
    : undefined;
}

const endpoint = getEnv("COSMOS_ENDPOINT");
const key = getEnv("COSMOS_KEY");
const databaseId = getEnv("COSMOS_DATABASE");

if (!endpoint || !key || !databaseId) {
  throw new Error(
    "COSMOS_ENDPOINT, COSMOS_KEY and COSMOS_DATABASE are required."
  );
}

const client = new CosmosClient({
  endpoint,
  key,
});

const container = client
  .database(databaseId)
  .container("attendance");

const userId = "employee-001";

const attendanceData = [
  {
    date: "30 Aug 2026",
    day: "Sunday",
    clockIn: "09:05 AM",
    clockOut: "06:10 PM",
    workingHours: "08h 20m",
    breakHours: "00h 45m",
    status: "Present",
  },
  {
    date: "29 Aug 2026",
    day: "Saturday",
    clockIn: "09:02 AM",
    clockOut: "06:05 PM",
    workingHours: "08h 18m",
    breakHours: "00h 45m",
    status: "Present",
  },
  {
    date: "28 Aug 2026",
    day: "Friday",
    clockIn: "09:15 AM",
    clockOut: "06:00 PM",
    workingHours: "07h 55m",
    breakHours: "00h 50m",
    status: "Late",
  },
  {
    date: "27 Aug 2026",
    day: "Thursday",
    clockIn: "09:00 AM",
    clockOut: "06:02 PM",
    workingHours: "08h 32m",
    breakHours: "00h 30m",
    status: "Present",
  },
  {
    date: "26 Aug 2026",
    day: "Wednesday",
    clockIn: "09:08 AM",
    clockOut: "06:12 PM",
    workingHours: "08h 24m",
    breakHours: "00h 40m",
    status: "Present",
  },
  {
    date: "25 Aug 2026",
    day: "Tuesday",
    clockIn: "09:00 AM",
    clockOut: "06:00 PM",
    workingHours: "08h 30m",
    breakHours: "00h 30m",
    status: "Present",
  },
  {
    date: "24 Aug 2026",
    day: "Monday",
    clockIn: "09:25 AM",
    clockOut: "06:15 PM",
    workingHours: "07h 50m",
    breakHours: "01h 00m",
    status: "Late",
  },
  {
    date: "23 Aug 2026",
    day: "Sunday",
    clockIn: "--",
    clockOut: "--",
    workingHours: "--",
    breakHours: "--",
    status: "Leave",
  },
];

for (const record of attendanceData) {
  const id = `${userId}-${record.date
    .replace(/\s+/g, "-")
    .toLowerCase()}`;

  try {
    const { resource: existing } = await container
      .item(id, userId)
      .read();

    if (existing) {
      console.log(
        `SKIPPED: ${record.date} already exists.`
      );
      continue;
    }
  } catch (error) {
    if (error.code !== 404) {
      throw error;
    }
  }

  await container.items.create({
    id,
    userId,
    ...record,
  });

  console.log(`CREATED: ${record.date}`);
}

console.log("\nAttendance seed completed.");