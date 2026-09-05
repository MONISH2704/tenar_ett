"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Users,
  KeyRound,
  X,
  UserPlus,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";

type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: "Active" | "Inactive";
  joinedDate: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [newEmployee, setNewEmployee] = useState({
  name: "",
  email: "",
  department: "",
  password: "",
});

  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/users");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load employees."
        );
      }

      setEmployees(data.users ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load employees."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter(
    (employee) => {
      const searchValue = search.toLowerCase();

      return (
        employee.name
          .toLowerCase()
          .includes(searchValue) ||
        employee.email
          .toLowerCase()
          .includes(searchValue) ||
        employee.department
          .toLowerCase()
          .includes(searchValue)
      );
    }
  );

  const handleAddEmployee = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEmployee),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create employee."
        );
      }

      setMessage("Employee created successfully.");

      setNewEmployee({
  name: "",
  email: "",
  department: "",
  password: "",
});

      setShowAddModal(false);

      await loadEmployees();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create employee."
      );
    }
  };

  const openPasswordModal = (
    employee: Employee
  ) => {
    setSelectedEmployee(employee);
    setNewPassword("");
    setMessage("");
    setError("");
    setShowPasswordModal(true);
  };

  const handleChangePassword = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!selectedEmployee) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/users/${selectedEmployee.id}/password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to change employee password."
        );
      }

      setMessage(
        `Password updated for ${selectedEmployee.name}.`
      );

      setNewPassword("");

      setShowPasswordModal(false);
      setSelectedEmployee(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to change employee password."
      );
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm font-medium text-[#0B63F6]">
            Employee Management
          </p>

          <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#102A43]">
                Employees
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage employee accounts and access.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setMessage("");
                setError("");
                setShowAddModal(true);
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#0B63F6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Main Card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="border-b border-slate-200 p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search employees..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>


          <div>
  <label className="mb-1.5 block text-sm font-medium text-slate-700">
    Password
  </label>

  <input
    required
    minLength={8}
    type="password"
    value={newEmployee.password}
    onChange={(event) =>
      setNewEmployee({
        ...newEmployee,
        password: event.target.value,
      })
    }
    placeholder="Enter employee password"
    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
  />

  <p className="mt-1.5 text-xs text-slate-400">
    Minimum 8 characters.
  </p>
</div>




          {/* Employee Count */}
          <div className="flex items-center gap-2 px-4 py-4 sm:px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0B63F6]">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#102A43]">
                {filteredEmployees.length}{" "}
                {filteredEmployees.length === 1
                  ? "Employee"
                  : "Employees"}
              </p>

              <p className="text-xs text-slate-400">
                Active employee accounts
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                Loading employees...
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="mx-auto h-8 w-8 text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  No employees found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try changing your search.
                </p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="border-y border-slate-200 bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Employee
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Department
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Joined
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map(
                    (employee) => (
                      <tr
                        key={employee.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-[#102A43]">
                              {employee.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {employee.email}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {employee.department}
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            {employee.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {employee.joinedDate}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              openPasswordModal(
                                employee
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0B63F6]"
                          >
                            <KeyRound className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              Change Password
                            </span>
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#102A43]">
                  Add Employee
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create a new employee account.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddModal(false)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddEmployee}
              className="space-y-4 p-6"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full Name
                </label>

                <input
                  required
                  type="text"
                  value={newEmployee.name}
                  onChange={(event) =>
                    setNewEmployee({
                      ...newEmployee,
                      name: event.target.value,
                    })
                  }
                  placeholder="Enter employee name"
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Company Email
                </label>

                <input
                  required
                  type="email"
                  value={newEmployee.email}
                  onChange={(event) =>
                    setNewEmployee({
                      ...newEmployee,
                      email: event.target.value,
                    })
                  }
                  placeholder="employee@tenar.com"
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Department
                </label>

                <input
                  required
                  type="text"
                  value={newEmployee.department}
                  onChange={(event) =>
                    setNewEmployee({
                      ...newEmployee,
                      department:
                        event.target.value,
                    })
                  }
                  placeholder="Enter department"
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-[#0B63F6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal &&
        selectedEmployee && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-bold text-[#102A43]">
                    Change Password
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedEmployee.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedEmployee(null);
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleChangePassword}
                className="space-y-4 p-6"
              >
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    New Password
                  </label>

                  <input
                    required
                    minLength={8}
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter new password"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Minimum 8 characters.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setSelectedEmployee(null);
                    }}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-[#0B63F6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <KeyRound className="h-4 w-4" />
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </AppLayout>
  );
}