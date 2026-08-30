import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TENĀR | Employee Work Time Tracker",
  description:
    "TENĀR Employee Work Time and Attendance Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}