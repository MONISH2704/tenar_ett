import "dotenv/config";
import bcrypt from "bcryptjs";
import { createUser } from "../src/lib/data/cosmos-users";

const users = [
  {
    userId: "admin-001",
    name: "Admin User",
    email: "admin@tenar.com",
    role: "ADMIN" as const,
    department: "Administration",
    status: "Active" as const,
    joinedDate: "01 Jan 2026",
    password: "Admin@12345",
  },
  {
    userId: "manager-001",
    name: "Manager User",
    email: "manager@tenar.com",
    role: "MANAGER" as const,
    department: "Engineering",
    status: "Active" as const,
    joinedDate: "05 Jan 2026",
    password: "Manager@12345",
  },
  {
    userId: "employee-001",
    name: "John Doe",
    email: "employee@tenar.com",
    role: "EMPLOYEE" as const,
    department: "Engineering",
    status: "Active" as const,
    joinedDate: "15 Jan 2026",
    password: "Employee@12345",
  },
  {
    userId: "employee-002",
    name: "Jane Smith",
    email: "jane@tenar.com",
    role: "EMPLOYEE" as const,
    department: "Human Resources",
    status: "Active" as const,
    joinedDate: "02 Feb 2026",
    password: "Employee@12345",
  },
  {
    userId: "employee-003",
    name: "Robert Kumar",
    email: "robert@tenar.com",
    role: "EMPLOYEE" as const,
    department: "Finance",
    status: "Active" as const,
    joinedDate: "18 Mar 2026",
    password: "Employee@12345",
  },
];

async function seed() {
  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    await createUser({
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
      joinedDate: user.joinedDate,
      passwordHash,
    });

    console.log(`Created: ${user.email}`);
  }

  console.log("All users seeded successfully.");
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});