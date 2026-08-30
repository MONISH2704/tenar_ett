export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: "Active" | "Inactive";
  joinedDate: string;
  password: string;
}

export const users: User[] = [
  {
    id: "admin-001",
    name: "Admin User",
    email: "admin@tenar.com",
    role: "ADMIN",
    department: "Administration",
    status: "Active",
    joinedDate: "01 Jan 2026",
    password: "Admin@12345",
  },

  {
    id: "manager-001",
    name: "Manager User",
    email: "manager@tenar.com",
    role: "MANAGER",
    department: "Engineering",
    status: "Active",
    joinedDate: "05 Jan 2026",
    password: "Manager@12345",
  },

  {
    id: "employee-001",
    name: "John Doe",
    email: "employee@tenar.com",
    role: "EMPLOYEE",
    department: "Engineering",
    status: "Active",
    joinedDate: "15 Jan 2026",
    password: "Employee@12345",
  },

  {
    id: "employee-002",
    name: "Jane Smith",
    email: "jane@tenar.com",
    role: "EMPLOYEE",
    department: "Human Resources",
    status: "Active",
    joinedDate: "02 Feb 2026",
    password: "Employee@12345",
  },

  {
    id: "employee-003",
    name: "Robert Kumar",
    email: "robert@tenar.com",
    role: "EMPLOYEE",
    department: "Finance",
    status: "Active",
    joinedDate: "18 Mar 2026",
    password: "Employee@12345",
  },
];