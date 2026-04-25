import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Dog,
  FileText,
  MapPin,
  CalendarDays,
  Camera,
  HeartHandshake,
  Users,
  PawPrint,
} from "lucide-react";

type ReportStatus = "New" | "Assigned" | "In Progress" | "Resolved" | "Closed";
type ReportPriority = "Low" | "Medium" | "High" | "Critical";

type ReportItem = {
  id: number;
  title: string;
  location: string;
  city: string;
  reporter: string;
  date: string;
  priority: ReportPriority;
  status: ReportStatus;
  description: string;
  dogCondition: string;
  photoAvailable: boolean;
  notes?: string;
};

const reports: ReportItem[] = [
  {
    id: 1,
    title: "Stray dog near main road",
    location: "Near Cairo University Gate",
    city: "Cairo",
    reporter: "Ahmed Ali",
    date: "2026-04-10",
    priority: "Critical",
    status: "New",
    description: "Brown dog, appears injured and unable to walk properly.",
    dogCondition: "Injured leg, stressed, needs immediate help",
    photoAvailable: true,
    notes: "Critical case. Rescue team should be assigned immediately.",
  },
  {
    id: 2,
    title: "Group of dogs in empty lot",
    location: "Behind City Mall",
    city: "Giza",
    reporter: "Mona Hassan",
    date: "2026-04-09",
    priority: "High",
    status: "Assigned",
    description: "Two small dogs and one medium dog staying in an empty lot.",
    dogCondition: "Looks hungry but not injured",
    photoAvailable: true,
    notes: "Team assigned for inspection.",
  },
  {
    id: 3,
    title: "Dog under bridge",
    location: "Ring Road underpass",
    city: "Cairo",
    reporter: "Omar Nabil",
    date: "2026-04-08",
    priority: "Medium",
    status: "In Progress",
    description: "White dog with collar, seems scared and hiding under bridge.",
    dogCondition: "Healthy but scared",
    photoAvailable: false,
    notes: "Rescue mission is currently in progress.",
  },
];

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReportDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const report = reports.find((item) => item.id === Number(id));

  if (!report) {
    notFound();
  }

  const getStatusClass = (status: ReportStatus) => {
    switch (status) {
      case "New":
        return "bg-amber-100 text-amber-700";
      case "Assigned":
        return "bg-blue-100 text-blue-700";
      case "In Progress":
        return "bg-purple-100 text-purple-700";
      case "Resolved":
        return "bg-emerald-100 text-emerald-700";
      case "Closed":
        return "bg-slate-200 text-slate-700";
      default:
        return "bg-slate-200 text-slate-700";
    }
  };

  const getPriorityClass = (priority: ReportPriority) => {
    switch (priority) {
      case "Low":
        return "bg-slate-100 text-slate-700";
      case "Medium":
        return "bg-blue-100 text-blue-700";
      case "High":
        return "bg-orange-100 text-orange-700";
      case "Critical":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/shelter-admin/reports"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Reports
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <PawPrint className="h-7 w-7" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-950">{report.title}</h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                    report.priority
                  )}`}
                >
                  {report.priority}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                    report.status
                  )}`}
                >
                  {report.status}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600">
                Reported by <span className="font-semibold">{report.reporter}</span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CalendarDays className="h-4 w-4" />
              Submitted on {report.date}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-bold text-slate-950">Report Details</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {report.description}
              </p>

              {report.notes && (
                <p className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-700">
                  {report.notes}
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-bold text-slate-950">Case Timeline</h2>

              <div className="mt-5 space-y-4">
                <TimelineItem
                  title="Report submitted"
                  description="Case was received by the shelter system."
                  active
                />
                <TimelineItem
                  title="Assigned to team"
                  description="A rescue team will review or has already been assigned."
                  active={report.status !== "New"}
                />
                <TimelineItem
                  title="Resolution"
                  description={`Current status: ${report.status}`}
                  active={report.status === "Resolved" || report.status === "Closed"}
                />
              </div>
            </div>
          </div>

          {/* Side */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="text-xl font-bold text-slate-950">Summary</h3>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-950">Priority:</span>{" "}
                  {report.priority}
                </p>
                <p>
                  <span className="font-semibold text-slate-950">Status:</span>{" "}
                  {report.status}
                </p>
                <p>
                  <span className="font-semibold text-slate-950">Location:</span>{" "}
                  {report.location}, {report.city}
                </p>
                <p>
                  <span className="font-semibold text-slate-950">Condition:</span>{" "}
                  {report.dogCondition}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-xl font-bold text-slate-950">Actions</h3>

              <div className="mt-5 space-y-3">
                <button className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Contact Reporter
                </button>

                <button className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  Assign Team
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="text-xl font-bold text-slate-950">Extra Info</h3>

              <div className="mt-5 space-y-4 text-sm text-slate-600">
                <InfoRow icon={MapPin} text={`${report.location}, ${report.city}`} />
                <InfoRow icon={Camera} text={report.photoAvailable ? "Photo attached" : "No photo attached"} />
                <InfoRow icon={HeartHandshake} text={report.dogCondition} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  title,
  description,
  active,
}: {
  title: string;
  description: string;
  active: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-300"
        }`}
      >
        {active ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
        ) : (
          <Clock3 className="h-3.5 w-3.5 text-white" />
        )}
      </div>

      <div>
        <p className="font-semibold text-slate-950">{title}</p>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-slate-500" />
      <p>{text}</p>
    </div>
  );
}