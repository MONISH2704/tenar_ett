"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  User,
  Mail,
  Phone,
  Building2,
  BriefcaseBusiness,
  UserRound,
  CalendarDays,
  MapPin,
  Pencil,
  X,
  Save,
  ShieldCheck,
} from "lucide-react";

interface ProfileData {
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  phone: string;
  department: string;
  jobTitle: string;
  manager: string;
  joiningDate: string;
  location: string;
}

const emptyProfile: ProfileData = {
  firstName: "",
  lastName: "",
  employeeId: "",
  email: "",
  phone: "",
  department: "",
  jobTitle: "",
  manager: "",
  joiningDate: "",
  location: "",
};

export default function ProfilePage() {
  const [profile, setProfile] =
    useState<ProfileData>(emptyProfile);

  const [editProfile, setEditProfile] =
    useState<ProfileData>(emptyProfile);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/profile", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load profile."
        );
      }

      setProfile(data.profile);
    } catch (error) {
      console.error("Failed to load profile:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    setEditProfile(profile);
    setError("");
    setSuccess("");
    setShowEditModal(true);
  };

  const handleSave = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: editProfile.firstName,
          lastName: editProfile.lastName,
          phone: editProfile.phone,
          location: editProfile.location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update profile."
        );
      }

      setProfile(data.profile);
setEditProfile(data.profile);
setShowEditModal(false);

window.dispatchEvent(
  new CustomEvent("profile-updated", {
    detail: {
      firstName: data.profile.firstName,
      lastName: data.profile.lastName,
    },
  })
);

setSuccess("Profile updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    field: keyof ProfileData,
    value: string
  ) => {
    setEditProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  const initials =
    `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`
      .toUpperCase();

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-[#0B63F6]">
              Account
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#102A43]">
              My Profile
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage your employee profile.
            </p>
          </div>

          <button
            type="button"
            onClick={openEditModal}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && !showEditModal && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : (
          <>
            {/* Profile Header Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                {/* Avatar */}
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                  {initials || "U"}
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-[#102A43]">
                      {fullName || "User"}
                    </h2>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Active
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {profile.jobTitle || "Employee"}
                  </p>

                  <p className="mt-2 text-xs font-medium text-slate-400">
                    Employee ID: {profile.employeeId}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <User className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-[#102A43]">
                      Personal Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Your basic employee information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-x-8 gap-y-6 p-6 sm:grid-cols-2">
                <ProfileField
                  icon={<User className="h-4 w-4" />}
                  label="Full Name"
                  value={fullName}
                />

                <ProfileField
                  icon={<Mail className="h-4 w-4" />}
                  label="Email Address"
                  value={profile.email}
                />

                <ProfileField
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone Number"
                  value={profile.phone}
                />

                <ProfileField
                  icon={<MapPin className="h-4 w-4" />}
                  label="Work Location"
                  value={profile.location}
                />
              </div>
            </div>

            {/* Employment Information */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-[#102A43]">
                      Employment Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Your company and employment details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-x-8 gap-y-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <ProfileField
                  icon={<Building2 className="h-4 w-4" />}
                  label="Department"
                  value={profile.department}
                />

                <ProfileField
                  icon={
                    <BriefcaseBusiness className="h-4 w-4" />
                  }
                  label="Job Title"
                  value={profile.jobTitle}
                />

                <ProfileField
                  icon={<UserRound className="h-4 w-4" />}
                  label="Manager"
                  value={profile.manager}
                />

                <ProfileField
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Joining Date"
                  value={profile.joiningDate}
                />

                <ProfileField
                  icon={<MapPin className="h-4 w-4" />}
                  label="Work Location"
                  value={profile.location}
                />

                <ProfileField
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Account Status"
                  value="Active"
                />
              </div>
            </div>

            {/* Account Information */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[#102A43]">
                    Employee Account
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Your account is managed by your organization.
                    Some employment information may only be
                    changed by an authorized administrator.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-[#102A43]">
                  Edit Profile
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update your personal profile information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setError("");
                }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSave}
              className="p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">

                {/* First Name */}
                <FormField
                  label="First Name"
                  value={editProfile.firstName}
                  onChange={(value) =>
                    handleChange("firstName", value)
                  }
                />

                {/* Last Name */}
                <FormField
                  label="Last Name"
                  value={editProfile.lastName}
                  onChange={(value) =>
                    handleChange("lastName", value)
                  }
                />

                {/* Email */}
                <FormField
                  label="Email Address"
                  value={editProfile.email}
                  onChange={() => {}}
                  type="email"
                  disabled
                />

                {/* Phone */}
                <FormField
                  label="Phone Number"
                  value={editProfile.phone}
                  onChange={(value) =>
                    handleChange("phone", value)
                  }
                />

                {/* Department */}
                <FormField
                  label="Department"
                  value={editProfile.department}
                  onChange={() => {}}
                  disabled
                />

                {/* Job Title */}
                <FormField
                  label="Job Title"
                  value={editProfile.jobTitle}
                  onChange={() => {}}
                  disabled
                />

                {/* Manager */}
                <FormField
                  label="Manager"
                  value={editProfile.manager}
                  onChange={() => {}}
                  disabled
                />

                {/* Location */}
                <FormField
                  label="Work Location"
                  value={editProfile.location}
                  onChange={(value) =>
                    handleChange("location", value)
                  }
                />
              </div>

              {/* Employee ID */}
              <div className="mt-5 rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">
                  Employee ID
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {profile.employeeId}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Employee ID cannot be changed.
                </p>
              </div>

              {/* Error inside modal */}
              {error && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setError("");
                  }}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <p className="text-xs font-medium">
          {label}
        </p>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-700">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        disabled={disabled}
        className={`h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 ${
          disabled
            ? "cursor-not-allowed bg-slate-50 text-slate-500"
            : "bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        }`}
      />
    </div>
  );
}