import fs from "fs";
import path from "path";
import { CosmosClient } from "@azure/cosmos";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  const content = fs.readFileSync(envPath, "utf8");

  const env = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const index = trimmed.indexOf("=");

    if (index === -1) {
      continue;
    }

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();

    env[key] = value;
  }

  return env;
}

const env = loadEnv();

const client = new CosmosClient({
  endpoint: env.COSMOS_ENDPOINT,
  key: env.COSMOS_KEY,
});

const database = client.database(env.COSMOS_DATABASE);
const container = database.container("workLogs");

const userId = "employee-001";

const workLogs = [
  {
    date: "30 Aug 2026",
    dateValue: "2026-08-30",
    day: "Sunday",
    type: "Work",
    startTime: "09:05 AM",
    endTime: "12:30 PM",
    duration: "03h 25m",
  },
  {
    date: "30 Aug 2026",
    dateValue: "2026-08-30",
    day: "Sunday",
    type: "Break",
    startTime: "12:30 PM",
    endTime: "01:15 PM",
    duration: "00h 45m",
  },
  {
    date: "30 Aug 2026",
    dateValue: "2026-08-30",
    day: "Sunday",
    type: "Work",
    startTime: "01:15 PM",
    endTime: "06:10 PM",
    duration: "04h 55m",
  },
  {
    date: "29 Aug 2026",
    dateValue: "2026-08-29",
    day: "Saturday",
    type: "Work",
    startTime: "09:02 AM",
    endTime: "12:45 PM",
    duration: "03h 43m",
  },
  {
    date: "29 Aug 2026",
    dateValue: "2026-08-29",
    day: "Saturday",
    type: "Break",
    startTime: "12:45 PM",
    endTime: "01:30 PM",
    duration: "00h 45m",
  },
  {
    date: "29 Aug 2026",
    dateValue: "2026-08-29",
    day: "Saturday",
    type: "Work",
    startTime: "01:30 PM",
    endTime: "06:05 PM",
    duration: "04h 35m",
  },
  {
    date: "28 Aug 2026",
    dateValue: "2026-08-28",
    day: "Friday",
    type: "Work",
    startTime: "09:15 AM",
    endTime: "12:30 PM",
    duration: "03h 15m",
  },
  {
    date: "28 Aug 2026",
    dateValue: "2026-08-28",
    day: "Friday",
    type: "Break",
    startTime: "12:30 PM",
    endTime: "01:20 PM",
    duration: "00h 50m",
  },
  {
    date: "28 Aug 2026",
    dateValue: "2026-08-28",
    day: "Friday",
    type: "Work",
    startTime: "01:20 PM",
    endTime: "06:00 PM",
    duration: "04h 40m",
  },
  {
    date: "27 Aug 2026",
    dateValue: "2026-08-27",
    day: "Thursday",
    type: "Work",
    startTime: "09:00 AM",
    endTime: "01:00 PM",
    duration: "04h 00m",
  },
  {
    date: "27 Aug 2026",
    dateValue: "2026-08-27",
    day: "Thursday",
    type: "Break",
    startTime: "01:00 PM",
    endTime: "01:30 PM",
    duration: "00h 30m",
  },
  {
    date: "27 Aug 2026",
    dateValue: "2026-08-27",
    day: "Thursday",
    type: "Work",
    startTime: "01:30 PM",
    endTime: "06:02 PM",
    duration: "04h 32m",
  },
];

async function main() {
  console.log("Seeding Work Logs...");
  console.log("");

  for (const log of workLogs) {
    const cleanTime = log.startTime
      .replace(/:/g, "")
      .replace(/\s/g, "");

    const id = `${userId}-${log.dateValue}-${log.type}-${cleanTime}`;

    const document = {
      id,
      userId,
      ...log,
    };

    await container.items.upsert(document);

    console.log(
      `UPSERTED: ${log.date} ${log.type} ${log.startTime}`
    );
  }

  console.log("");
  console.log("Work Logs seed completed.");
}

main().catch((error) => {
  console.error("");
  console.error("Work Logs seed failed:");
  console.error(error);
  process.exit(1);
});