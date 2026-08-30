import AppLayout from "@/components/layout/AppLayout";

export default function Home() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <p className="text-sm font-medium text-[#0B63F6]">
            Friday, 30 August 2026
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#102A43]">
            Welcome back, John Doe! 👋
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your work today.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Clock In"
            value="09:05 AM"
            description="Today"
          />

          <StatCard
            title="Total Working"
            value="05h 20m"
            description="Today"
          />

          <StatCard
            title="Break Time"
            value="00h 45m"
            description="Today"
          />

          {/* Current Status */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Current Status
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

              <span className="text-lg font-semibold text-green-600">
                Working
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Active session
            </p>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Today's Timeline */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#102A43]">
              Today&apos;s Timeline
            </h2>

            <div className="mt-6 space-y-5">
              <TimelineItem
                time="09:05 AM"
                title="Clock In"
                description="Started work"
                color="bg-blue-500"
              />

              <TimelineItem
                time="12:30 PM"
                title="Break Start"
                description="Lunch break"
                color="bg-orange-500"
              />

              <TimelineItem
                time="01:15 PM"
                title="Break End"
                description="Back to work"
                color="bg-green-500"
              />

              <TimelineItem
                time="01:15 PM - Now"
                title="Working"
                description="Current session"
                color="bg-green-500"
              />
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#102A43]">
              This Week
            </h2>

            <div className="mt-6 space-y-5">
              <SummaryItem
                label="Total Working Hours"
                value="40h 30m"
              />

              <SummaryItem
                label="Total Break Hours"
                value="04h 15m"
              />

              <SummaryItem
                label="Overtime"
                value="02h 30m"
              />

              <SummaryItem
                label="Late Arrivals"
                value="1"
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/* Statistics Card */
function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* Timeline Item */
function TimelineItem({
  time,
  title,
  description,
  color,
}: {
  time: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <span
          className={`mt-1 h-3 w-3 rounded-full ${color}`}
        />

        <span className="mt-1 h-10 w-px bg-slate-200" />
      </div>

      <div>
        <p className="text-xs font-medium text-slate-400">
          {time}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* Weekly Summary Item */
function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}