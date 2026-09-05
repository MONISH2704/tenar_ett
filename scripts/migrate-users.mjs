import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CosmosClient } from "@azure/cosmos";
import bcrypt from "bcryptjs";

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

  if (!line) {
    return undefined;
  }

  return line.substring(name.length + 1).trim();
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

const database = client.database(databaseId);
const container = database.container("users");

const users = [
  {
    userId: "admin-001",
    name: "Admin User",
    email: "admin@tenar.com",
    role: "ADMIN",
    department: "Administration",
    status: "Active",
    joinedDate: "01 Jan 2026",
    password: "Admin@12345",
  },
  {
    userId: "manager-001",
    name: "Manager User",
    email: "manager@tenar.com",
    role: "MANAGER",
    department: "Engineering",
    status: "Active",
    joinedDate: "05 Jan 2026",
    password: "Manager@12345",
  },
  {
    userId: "employee-001",
    name: "John Doe",
    email: "employee@tenar.com",
    role: "EMPLOYEE",
    department: "Engineering",
    status: "Active",
    joinedDate: "15 Jan 2026",
    password: "Employee@12345",
  },
  {
    userId: "employee-002",
    name: "Jane Smith",
    email: "jane@tenar.com",
    role: "EMPLOYEE",
    department: "Human Resources",
    status: "Active",
    joinedDate: "02 Feb 2026",
    password: "Employee@12345",
  },
  {
    userId: "employee-003",
    name: "Robert Kumar",
    email: "robert@tenar.com",
    role: "EMPLOYEE",
    department: "Finance",
    status: "Active",
    joinedDate: "18 Mar 2026",
    password: "Employee@12345",
  },
];

for (const user of users) {
  try {
    const { resource: existing } = await container
      .item(user.userId, user.userId)
      .read();

    if (existing) {
      console.log(
        `SKIPPED: ${user.email} already exists in Cosmos DB.`
      );
      continue;
    }
  } catch (error) {
    if (error.code !== 404) {
      throw error;
    }
  }

  const passwordHash = await bcrypt.hash(
    user.password,
    10
  );

  const document = {
    id: user.userId,
    userId: user.userId,
    name: user.name,
    email: user.email.toLowerCase(),
    role: user.role,
    department: user.department,
    status: user.status,
    joinedDate: user.joinedDate,
    passwordHash,
  };

  await container.items.create(document);

  console.log(
    `CREATED: ${user.email} (${user.role})`
  );
}

console.log("\nMigration completed.");