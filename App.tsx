import React, { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  LayoutDashboard, Users, Briefcase, CreditCard, BarChart2,
  Search, Bell, Settings, Plus, MoreHorizontal,
  ArrowUpRight, ArrowDownRight, Calendar, Zap,
  CheckCircle, TrendingUp, Download, MapPin,
  LogOut, HelpCircle, Star, UserCheck, Clock,
  ChevronRight, X, Mail, Phone, Home, Briefcase as BriefcaseIcon,
  User, Building2, , Trash2, ChevronLeft,
} from "lucide-react";

// ─── TYPES ─────────────────────────────────────────────────────────────────────

interface Employee {
  id: number;
  name: string;
  title: string;
  dept: string;
  location: string;
  status: "Active" | "On Leave" | "Inactive";
  initials: string;
  salary: number;
  joined: string;
  rating: number;
  email: string;
  phone: string;
  address: string;
}

// ─── SEED DATA ─────────────────────────────────────────────────────────────────

const SEED_EMPLOYEES: Employee[] = [
  { id: 1, name: "Sarah Chen", title: "VP of Engineering", dept: "Engineering", location: "San Francisco", status: "Active", initials: "SC", salary: 185000, joined: "Mar 2021", rating: 4.8, email: "sarah.chen@peopleos.io", phone: "+1 415 202 3841", address: "420 Market St, San Francisco, CA 94105" },
  { id: 2, name: "Marcus Rivera", title: "Senior Product Designer", dept: "Design", location: "New York", status: "Active", initials: "MR", salary: 142000, joined: "Jan 2022", rating: 4.6, email: "m.rivera@peopleos.io", phone: "+1 212 558 7920", address: "30 Hudson Yards, New York, NY 10001" },
  { id: 3, name: "Aisha Patel", title: "Lead Data Scientist", dept: "Analytics", location: "London", status: "Active", initials: "AP", salary: 168000, joined: "Aug 2020", rating: 4.9, email: "a.patel@peopleos.io", phone: "+44 20 7946 0311", address: "1 Canada Square, Canary Wharf, London E14 5AB" },
  { id: 4, name: "James O'Brien", title: "Sr. Backend Engineer", dept: "Engineering", location: "Austin", status: "Active", initials: "JO", salary: 155000, joined: "Nov 2021", rating: 4.5, email: "james.obrien@peopleos.io", phone: "+1 512 867 5309", address: "701 Brazos St, Austin, TX 78701" },
  { id: 5, name: "Priya Sharma", title: "Marketing Director", dept: "Marketing", location: "Singapore", status: "Active", initials: "PS", salary: 148000, joined: "Apr 2022", rating: 4.7, email: "p.sharma@peopleos.io", phone: "+65 6372 8844", address: "1 Raffles Place, #48-01, Singapore 048616" },
  { id: 6, name: "Daniel Koch", title: "Finance Director", dept: "Finance", location: "Berlin", status: "Active", initials: "DK", salary: 162000, joined: "Jun 2019", rating: 4.4, email: "d.koch@peopleos.io", phone: "+49 30 2093 5500", address: "Unter den Linden 77, 10117 Berlin" },
  { id: 7, name: "Emma Laurent", title: "HR Business Partner", dept: "HR", location: "Paris", status: "On Leave", initials: "EL", salary: 124000, joined: "Feb 2023", rating: 4.3, email: "e.laurent@peopleos.io", phone: "+33 1 42 68 53 00", address: "75 Avenue des Champs-Élysées, 75008 Paris" },
  { id: 8, name: "Liam Walsh", title: "Head of Sales", dept: "Sales", location: "Chicago", status: "Active", initials: "LW", salary: 172000, joined: "Sep 2020", rating: 4.6, email: "l.walsh@peopleos.io", phone: "+1 312 744 9800", address: "233 S Wacker Dr, Chicago, IL 60606" },
  { id: 9, name: "Yuki Tanaka", title: "DevOps Engineer", dept: "Engineering", location: "Tokyo", status: "Active", initials: "YT", salary: 138000, joined: "Jul 2022", rating: 4.5, email: "y.tanaka@peopleos.io", phone: "+81 3 6215 5100", address: "2-7-2 Marunouchi, Chiyoda-ku, Tokyo 100-0005" },
  { id: 10, name: "Sofia Rossi", title: "UX Researcher", dept: "Design", location: "Milan", status: "Active", initials: "SR", salary: 118000, joined: "Jan 2023", rating: 4.2, email: "s.rossi@peopleos.io", phone: "+39 02 7234 2345", address: "Via Monte Napoleone 8, 20121 Milano" },
  { id: 11, name: "Omar Hassan", title: "Platform Engineer", dept: "Engineering", location: "Dubai", status: "Active", initials: "OH", salary: 145000, joined: "May 2021", rating: 4.7, email: "o.hassan@peopleos.io", phone: "+971 4 391 1100", address: "Dubai Internet City, Building 1, Dubai" },
  { id: 12, name: "Nina Johansson", title: "Customer Success Lead", dept: "Operations", location: "Stockholm", status: "Inactive", initials: "NJ", salary: 112000, joined: "Oct 2022", rating: 3.9, email: "n.johansson@peopleos.io", phone: "+46 8 564 851 00", address: "Kungsgatan 12, 111 35 Stockholm" },
];

const HEADCOUNT_TREND = [
  { month: "Jan", headcount: 201, hires: 8, exits: 3 },
  { month: "Feb", headcount: 206, hires: 7, exits: 2 },
  { month: "Mar", headcount: 211, hires: 9, exits: 4 },
  { month: "Apr", headcount: 218, hires: 11, exits: 4 },
  { month: "May", headcount: 224, hires: 10, exits: 4 },
  { month: "Jun", headcount: 231, hires: 12, exits: 5 },
  { month: "Jul", headcount: 238, hires: 10, exits: 3 },
  { month: "Aug", headcount: 247, hires: 13, exits: 4 },
  { month: "Sep", headcount: 253, hires: 9, exits: 3 },
  { month: "Oct", headcount: 261, hires: 11, exits: 3 },
  { month: "Nov", headcount: 268, hires: 10, exits: 3 },
  { month: "Dec", headcount: 274, hires: 9, exits: 3 },
];

const DEPT_DATA = [
  { dept: "Engineering", count: 89 },
  { dept: "Sales", count: 52 },
  { dept: "Marketing", count: 38 },
  { dept: "Design", count: 27 },
  { dept: "Finance", count: 22 },
  { dept: "HR", count: 18 },
  { dept: "Analytics", count: 16 },
  { dept: "Operations", count: 12 },
];

const PIPELINE = [
  { stage: "Applied", count: 47 },
  { stage: "Screening", count: 23 },
  { stage: "Interview", count: 14 },
  { stage: "Offer", count: 5 },
  { stage: "Hired", count: 8 },
];

const OPEN_ROLES = [
  { id: 1, title: "Senior ML Engineer", dept: "Engineering", location: "Remote", applied: 24, urgency: "High" },
  { id: 2, title: "Product Marketing Manager", dept: "Marketing", location: "New York", applied: 18, urgency: "Medium" },
  { id: 3, title: "Staff Backend Engineer", dept: "Engineering", location: "San Francisco", applied: 31, urgency: "High" },
  { id: 4, title: "UX Designer", dept: "Design", location: "London", applied: 15, urgency: "Low" },
  { id: 5, title: "Sales Development Rep", dept: "Sales", location: "Chicago", applied: 42, urgency: "High" },
];

const PAYROLL_SEED = [
  { name: "Sarah Chen", dept: "Engineering", base: 185000, bonus: 22200, deductions: 43800, net: 163400 },
  { name: "Marcus Rivera", dept: "Design", base: 142000, bonus: 14200, deductions: 33600, net: 122600 },
  { name: "Aisha Patel", dept: "Analytics", base: 168000, bonus: 25200, deductions: 40200, net: 153000 },
  { name: "James O'Brien", dept: "Engineering", base: 155000, bonus: 15500, deductions: 36800, net: 133700 },
  { name: "Priya Sharma", dept: "Marketing", base: 148000, bonus: 18500, deductions: 35200, net: 131300 },
  { name: "Daniel Koch", dept: "Finance", base: 162000, bonus: 19440, deductions: 38640, net: 142800 },
  { name: "Liam Walsh", dept: "Sales", base: 172000, bonus: 34400, deductions: 41400, net: 165000 },
  { name: "Yuki Tanaka", dept: "Engineering", base: 138000, bonus: 13800, deductions: 32760, net: 119040 },
];

const PERFORMANCE_DIST = [
  { label: "Exceptional", score: 5, count: 34 },
  { label: "Exceeds Expectations", score: 4, count: 87 },
  { label: "Meets Expectations", score: 3, count: 112 },
  { label: "Below Expectations", score: 2, count: 18 },
  { label: "Unsatisfactory", score: 1, count: 4 },
];

const ACTIVITIES = [
  { text: "Priya Sharma completed onboarding in Singapore office", time: "2h ago", type: "success" },
  { text: "Q4 performance reviews due in 11 days — 56 pending", time: "4h ago", type: "warning" },
  { text: "December payroll processed — $2.4M disbursed", time: "6h ago", type: "info" },
  { text: "3 new offers sent for Engineering backend roles", time: "1d ago", type: "info" },
  { text: "Nina Johansson departure effective Jan 15, 2025", time: "1d ago", type: "danger" },
  { text: "Sofia Rossi promotion to Senior UX Researcher approved", time: "2d ago", type: "success" },
];

const DEPT_COLORS: Record<string, string> = {
  Engineering: "#3B6EF0", Sales: "#06D6A0", Marketing: "#F59E0B",
  Design: "#8B5CF6", Finance: "#EC4899", HR: "#14B8A6",
  Analytics: "#F97316", Operations: "#6366F1",
};

const PIPELINE_COLORS: Record<string, string> = {
  Applied: "#64748B", Screening: "#F59E0B", Interview: "#3B6EF0",
  Offer: "#8B5CF6", Hired: "#06D6A0",
};

const AVATAR_COLORS = [
  "bg-blue-600", "bg-purple-600", "bg-teal-600", "bg-orange-600",
  "bg-pink-600", "bg-indigo-500", "bg-emerald-600", "bg-amber-600",
];

const PERF_COLORS = ["#06D6A0", "#3B6EF0", "#F59E0B", "#F97316", "#F87171"];

const DEPT_OPTIONS = ["Engineering", "Design", "Analytics", "Marketing", "Finance", "HR", "Sales", "Operations"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmt$(n: number) { return "$" + n.toLocaleString(); }

function makeInitials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
}

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    Active: "bg-emerald-500/12 text-emerald-400 ring-emerald-500/20",
    "On Leave": "bg-amber-500/12 text-amber-400 ring-amber-500/20",
    Inactive: "bg-red-500/12 text-red-400 ring-red-500/20",
    High: "bg-red-500/12 text-red-400 ring-red-500/20",
    Medium: "bg-amber-500/12 text-amber-400 ring-amber-500/20",
    Low: "bg-blue-500/12 text-blue-400 ring-blue-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ring-1 ${cfg[status] ?? "bg-gray-500/12 text-gray-400 ring-gray-500/20"}`}>
      {status}
    </span>
  );
}

function KPICard({ label, value, delta, deltaLabel, icon: Icon, accent }: {
  label: string; value: string; delta: number; deltaLabel: string;
  icon: React.ElementType; accent: string;
}) {
  const up = delta >= 0;
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3 hover:border-white/[0.12] transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
        <div className="p-2 rounded-md" style={{ backgroundColor: accent + "25" }}>
          <Icon size={15} style={{ color: accent }} />
        </div>
      </div>
      <div className="text-[28px] font-bold tracking-tight text-foreground" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </div>
      <div className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}>
        {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
        {Math.abs(delta)}% {deltaLabel}
      </div>
    </div>
  );
}

function ChartTip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 px-3 py-2.5 text-xs shadow-2xl" style={{ background: "#1A2540" }}>
      <p className="text-muted-foreground mb-1.5 font-semibold">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>
          {p.name}: {p.value > 999 ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

function DeptTag({ dept }: { dept: string }) {
  const color = DEPT_COLORS[dept] ?? "#3B6EF0";
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: color + "20", color }}>
      {dept}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-md text-foreground focus:outline-none focus:border-primary/60 transition-all appearance-none"
    >
      <option value="">Select department…</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─── ADD EMPLOYEE PANEL ────────────────────────────────────────────────────────

interface AddEmployeeForm {
  name: string; email: string; phone: string; address: string;
  post: string; dept: string; salary: string; status: string;
}

const EMPTY_FORM: AddEmployeeForm = {
  name: "", email: "", phone: "", address: "",
  post: "", dept: "", salary: "", status: "Active",
};

function AddEmployeePanel({
  onClose, onSave,
}: {
  onClose: () => void;
  onSave: (emp: Employee) => void;
}) {
  const [form, setForm] = useState<AddEmployeeForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<AddEmployeeForm>>({});
  const [saved, setSaved] = useState(false);

  function set(key: keyof AddEmployeeForm) {
    return (v: string) => {
      setForm((f) => ({ ...f, [key]: v }));
      setErrors((e) => ({ ...e, [key]: undefined }));
    };
  }

  function validate() {
    const e: Partial<AddEmployeeForm> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.post.trim()) e.post = "Required";
    if (!form.dept) e.dept = "Required";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const newEmp: Employee = {
      id: Date.now(),
      name: form.name.trim(),
      title: form.post.trim(),
      dept: form.dept,
      location: form.address.split(",").pop()?.trim() ?? "Remote",
      status: form.status as Employee["status"],
      initials: makeInitials(form.name),
      salary: parseInt(form.salary.replace(/\D/g, "")) || 0,
      joined: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      rating: 0,
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    };

    onSave(newEmp);
    setSaved(true);
    setTimeout(() => { setSaved(false); setForm(EMPTY_FORM); }, 1800);
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <aside className="fixed right-0 top-0 h-full w-[460px] z-50 bg-card border-l border-border flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-foreground">Add New Employee</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Fill in the details to create a profile</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Success toast */}
        {saved && (
          <div className="mx-6 mt-4 flex items-center gap-2.5 px-4 py-3 bg-emerald-500/15 border border-emerald-500/25 rounded-lg shrink-0">
            <CheckCircle size={15} className="text-emerald-400 shrink-0" />
            <p className="text-sm font-semibold text-emerald-400">Employee profile created successfully!</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Avatar preview */}
          <div className="flex items-center gap-4 p-4 bg-background border border-border rounded-lg">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-lg font-extrabold text-white shrink-0">
              {form.name ? makeInitials(form.name) : <User size={22} />}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{form.name || "Employee Name"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{form.post || "Job Title"} {form.dept ? `· ${form.dept}` : ""}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{form.email || "email@company.com"}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Personal Information</p>
            <div className="space-y-4">
              <Field label="Full Name *">
                <Input value={form.name} onChange={set("name")} placeholder="e.g. Jordan Rivera" />
                {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
              </Field>
              <Field label="Email Address *">
                <Input value={form.email} onChange={set("email")} placeholder="jordan.rivera@company.com" type="email" />
                {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
              </Field>
              <Field label="Phone Number *">
                <Input value={form.phone} onChange={set("phone")} placeholder="+1 555 123 4567" type="tel" />
                {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
              </Field>
              <Field label="Address *">
                <textarea
                  value={form.address}
                  onChange={(e) => set("address")(e.target.value)}
                  placeholder="123 Main Street, City, State, Country"
                  rows={2}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                />
                {errors.address && <p className="text-xs text-red-400">{errors.address}</p>}
              </Field>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Employment Details</p>
            <div className="space-y-4">
              <Field label="Job Title / Post *">
                <Input value={form.post} onChange={set("post")} placeholder="e.g. Senior Software Engineer" />
                {errors.post && <p className="text-xs text-red-400">{errors.post}</p>}
              </Field>
              <Field label="Department *">
                <Select value={form.dept} onChange={set("dept")} options={DEPT_OPTIONS} />
                {errors.dept && <p className="text-xs text-red-400">{errors.dept}</p>}
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Annual Salary (USD)">
                  <Input value={form.salary} onChange={set("salary")} placeholder="95000" />
                </Field>
                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => set("status")(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-md text-foreground focus:outline-none focus:border-primary/60 transition-all appearance-none"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </Field>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-muted-foreground border border-border rounded-md hover:text-foreground hover:border-white/15 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            className="flex-1 py-2.5 text-sm font-bold bg-primary text-white rounded-md hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle size={14} /> Create Profile
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── EMPLOYEE PROFILE PANEL ────────────────────────────────────────────────────

function EmployeeProfilePanel({
  employee, avatarColor, onClose, onDelete,
}: {
  employee: Employee;
  avatarColor: string;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete(employee.id);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-[480px] z-50 bg-card border-l border-border flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0">
          <button onClick={onClose} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold">
            <ChevronLeft size={14} /> Back to Directory
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-semibold transition-colors ${
                confirmDelete
                  ? "bg-red-500 text-white hover:bg-red-400"
                  : "text-muted-foreground border border-border hover:text-red-400 hover:border-red-500/30"
              }`}
            >
              <Trash2 size={12} />
              {confirmDelete ? "Confirm Delete" : "Delete"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Hero section */}
          <div className="px-6 py-8 border-b border-border" style={{ background: "linear-gradient(135deg, #0D1627 0%, #111E38 100%)" }}>
            <div className="flex items-start gap-5">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white shrink-0 ${avatarColor} shadow-lg`}>
                {employee.initials}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-extrabold text-foreground tracking-tight">{employee.name}</h1>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{employee.title}</p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <DeptTag dept={employee.dept} />
                  <StatusBadge status={employee.status} />
                  {employee.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-foreground">{employee.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { label: "Joined", value: employee.joined },
                { label: "Salary", value: employee.salary ? fmt$(employee.salary) : "—" },
                { label: "ID", value: `EMP-${String(employee.id).padStart(4, "0")}` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/[0.04] rounded-lg px-3 py-2.5 border border-white/[0.06]">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact details */}
          <div className="px-6 py-5 space-y-0 border-b border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Contact Information</p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Email</p>
                  <a href={`mailto:${employee.email}`} className="text-sm font-semibold text-primary hover:text-blue-300 transition-colors">
                    {employee.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Phone</p>
                  <p className="text-sm font-semibold text-foreground">{employee.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Home size={14} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Address</p>
                  <p className="text-sm font-semibold text-foreground leading-relaxed">{employee.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Employment details */}
          <div className="px-6 py-5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Employment Details</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: BriefcaseIcon, label: "Job Title", value: employee.title, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                { icon: Building2, label: "Department", value: employee.dept, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
                { icon: MapPin, label: "Location", value: employee.location, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" },
                { icon: Calendar, label: "Start Date", value: employee.joined, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className={`flex items-start gap-3 p-3 rounded-lg border ${bg}`}>
                  <Icon size={14} className={`${color} mt-0.5 shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="mt-4 p-4 bg-background border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Employment Status</p>
                  <StatusBadge status={employee.status} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Employee ID</p>
                  <p className="text-sm font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    EMP-{String(employee.id).padStart(4, "0")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── DASHBOARD VIEW ────────────────────────────────────────────────────────────

function DashboardView({ totalEmployees }: { totalEmployees: number }) {
  return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Total Headcount" value={String(totalEmployees)} delta={8.7} deltaLabel="YoY" icon={Users} accent="#3B6EF0" />
        <KPICard label="New Hires (Dec)" value="9" delta={-10} deltaLabel="vs Nov" icon={UserCheck} accent="#06D6A0" />
        <KPICard label="Open Positions" value="23" delta={15.2} deltaLabel="vs Q3" icon={Briefcase} accent="#8B5CF6" />
        <KPICard label="Attrition Rate" value="3.2%" delta={-0.4} deltaLabel="vs Q3" icon={TrendingUp} accent="#F59E0B" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Headcount Trend — 2024</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly growth, hires &amp; exits</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" />Headcount</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#06D6A0" }} />Hires</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400" />Exits</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={196}>
            <AreaChart data={HEADCOUNT_TREND} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="hcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B6EF0" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#3B6EF0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#5A6A8A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#5A6A8A", fontSize: 11 }} axisLine={false} tickLine={false} width={38} />
              <Tooltip content={<ChartTip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />
              <Area type="monotone" dataKey="headcount" name="Headcount" stroke="#3B6EF0" fill="url(#hcGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="hires" name="Hires" stroke="#06D6A0" fill="transparent" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="exits" name="Exits" stroke="#F87171" fill="transparent" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-bold text-foreground mb-1">By Department</h3>
          <p className="text-xs text-muted-foreground mb-4">Current headcount breakdown</p>
          <div className="space-y-3">
            {DEPT_DATA.map((d) => (
              <div key={d.dept}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-foreground/75 font-medium">{d.dept}</span>
                  <span className="text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{d.count}</span>
                </div>
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(d.count / 89) * 100}%`, backgroundColor: DEPT_COLORS[d.dept] ?? "#3B6EF0" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3.5">
            {ACTIVITIES.map((a, i) => {
              const dot: Record<string, string> = { success: "bg-emerald-400", warning: "bg-amber-400", info: "bg-blue-400", danger: "bg-red-400" };
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-[7px] shrink-0 ${dot[a.type]}`} />
                  <p className="flex-1 text-sm text-foreground/75">{a.text}</p>
                  <span className="text-xs text-muted-foreground shrink-0 pt-0.5">{a.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-bold text-foreground mb-5">Org Metrics</h3>
          <div className="space-y-4">
            {[
              { label: "Avg. Tenure", value: "2.8 yrs" },
              { label: "Offer Acceptance", value: "82%" },
              { label: "Time to Fill", value: "28 days" },
              { label: "eNPS Score", value: "+42" },
              { label: "Training Completion", value: "91%" },
              { label: "Internal Mobility", value: "18%" },
              { label: "Remote Employees", value: "34%" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EMPLOYEES VIEW ────────────────────────────────────────────────────────────

function EmployeesView({
  employees, onAdd, onSelect,
}: {
  employees: Employee[];
  onAdd: () => void;
  onSelect: (emp: Employee) => void;
}) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const filtered = useMemo(() =>
    employees.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch = e.name.toLowerCase().includes(q) || e.title.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
      const matchDept = deptFilter === "All" || e.dept === deptFilter;
      return matchSearch && matchDept;
    }),
    [employees, search, deptFilter]
  );

  const depts = ["All", ...Array.from(new Set(employees.map((e) => e.dept))).sort()];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Employee Directory</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} of {employees.length} employees · click any row to view profile</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground border border-border rounded-md hover:border-white/15 hover:text-foreground transition-colors">
            <Download size={12} /> Export
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-blue-500 transition-colors font-semibold"
          >
            <Plus size={12} /> Add Employee
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, title or email…"
            className="pl-8 pr-3 py-1.5 text-xs bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors w-64"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {depts.map((d) => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              className={`px-2.5 py-1 text-xs rounded font-semibold transition-colors ${deptFilter === d ? "bg-primary text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-white/15"}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Employee", "Contact", "Department", "Location", "Salary", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No employees found</td>
              </tr>
            )}
            {filtered.map((emp, i) => (
              <tr
                key={emp.id}
                onClick={() => onSelect(emp)}
                className={`border-b border-border/40 hover:bg-white/[0.03] transition-colors cursor-pointer group ${i === filtered.length - 1 ? "border-b-0" : ""}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                      {emp.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.title}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-muted-foreground">{emp.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{emp.phone}</p>
                </td>
                <td className="px-4 py-3"><DeptTag dept={emp.dept} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={10} />{emp.location}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-foreground/70" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {emp.salary ? fmt$(emp.salary) : "—"}
                </td>
                <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                <td className="px-4 py-3">
                  <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── RECRUITMENT VIEW ──────────────────────────────────────────────────────────

function RecruitmentView() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Hiring Pipeline</h2>
          <p className="text-xs text-muted-foreground mt-0.5">97 active candidates across {OPEN_ROLES.length} roles</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-blue-500 transition-colors font-semibold">
          <Plus size={12} /> Post New Role
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {PIPELINE.map((p) => {
          const color = PIPELINE_COLORS[p.stage] ?? "#64748B";
          return (
            <div key={p.stage} className="bg-card border border-border rounded-lg p-4 hover:border-white/12 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{p.stage}</span>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              </div>
              <div className="text-3xl font-bold mb-3" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{p.count}</div>
              <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(p.count / 47) * 100}%`, backgroundColor: color }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">{((p.count / 97) * 100).toFixed(0)}% of pipeline</p>
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Open Positions</h3>
          <span className="text-xs text-muted-foreground">{OPEN_ROLES.length} active roles</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Position", "Department", "Location", "Applicants", "Priority", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {OPEN_ROLES.map((role, i) => (
              <tr key={role.id} className={`border-b border-border/40 hover:bg-white/[0.025] transition-colors cursor-pointer ${i === OPEN_ROLES.length - 1 ? "border-b-0" : ""}`}>
                <td className="px-5 py-3 text-sm font-semibold text-foreground">{role.title}</td>
                <td className="px-5 py-3"><DeptTag dept={role.dept} /></td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{role.location}</td>
                <td className="px-5 py-3 text-sm text-foreground/70" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{role.applied}</td>
                <td className="px-5 py-3"><StatusBadge status={role.urgency} /></td>
                <td className="px-5 py-3">
                  <button className="flex items-center gap-1 text-xs text-primary hover:text-blue-300 font-semibold transition-colors">
                    View Pipeline <ChevronRight size={11} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── PAYROLL VIEW ──────────────────────────────────────────────────────────────

function PayrollView() {
  const totalBase = PAYROLL_SEED.reduce((s, e) => s + e.base, 0);
  const totalBonus = PAYROLL_SEED.reduce((s, e) => s + e.bonus, 0);
  const totalDed = PAYROLL_SEED.reduce((s, e) => s + e.deductions, 0);
  const totalNet = PAYROLL_SEED.reduce((s, e) => s + e.net, 0);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Payroll — December 2024</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Monthly compensation disbursement</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground border border-border rounded-md hover:border-white/15 hover:text-foreground transition-colors">
            <Download size={12} /> Export CSV
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-500 transition-colors font-semibold">
            <CheckCircle size={12} /> Approve &amp; Run
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Annual Base (Org)", value: fmt$(totalBase) },
          { label: "Total Bonuses", value: fmt$(totalBonus) },
          { label: "Total Deductions", value: fmt$(totalDed) },
          { label: "Net Disbursed", value: fmt$(totalNet) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
            <p className="text-xl font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">Compensation Breakdown</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Employee", "Department", "Base Salary", "Bonus", "Deductions", "Net Pay"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAYROLL_SEED.map((row, i) => (
              <tr key={row.name} className={`border-b border-border/40 hover:bg-white/[0.025] transition-colors ${i === PAYROLL_SEED.length - 1 ? "border-b-0" : ""}`}>
                <td className="px-5 py-3 text-sm font-semibold text-foreground">{row.name}</td>
                <td className="px-5 py-3"><DeptTag dept={row.dept} /></td>
                <td className="px-5 py-3 text-sm text-foreground/70" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt$(row.base)}</td>
                <td className="px-5 py-3 text-sm font-semibold text-emerald-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>+{fmt$(row.bonus)}</td>
                <td className="px-5 py-3 text-sm text-red-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>−{fmt$(row.deductions)}</td>
                <td className="px-5 py-3 text-sm font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt$(row.net)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-white/[0.025]">
              <td className="px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-widest" colSpan={2}>Total</td>
              <td className="px-5 py-3 text-sm font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt$(totalBase)}</td>
              <td className="px-5 py-3 text-sm font-bold text-emerald-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>+{fmt$(totalBonus)}</td>
              <td className="px-5 py-3 text-sm font-bold text-red-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>−{fmt$(totalDed)}</td>
              <td className="px-5 py-3 text-sm font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt$(totalNet)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── PERFORMANCE VIEW ──────────────────────────────────────────────────────────

function PerformanceView({ employees }: { employees: Employee[] }) {
  const total = PERFORMANCE_DIST.reduce((s, d) => s + d.count, 0);
  const topPerformers = [...employees].sort((a, b) => b.rating - a.rating).slice(0, 7);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Performance Reviews — Q4 2024</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Annual cycle · Jan 15 deadline</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
            <Clock size={12} className="text-amber-400" />
            <span className="text-xs text-amber-400 font-semibold">11 days remaining</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-blue-500 transition-colors font-semibold">
            <Plus size={12} /> Start Review
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Reviews Completed", value: "218 / 274", pct: 79.6, color: "#3B6EF0" },
          { label: "Average Score", value: "3.87 / 5.0", pct: 77.4, color: "#06D6A0" },
          { label: "Top Performers", value: "34 employees", pct: 12.4, color: "#F59E0B" },
        ].map(({ label, value, pct, color }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
            <p className="text-2xl font-bold text-foreground tracking-tight mb-3">{value}</p>
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{pct.toFixed(1)}%</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-bold text-foreground mb-5">Rating Distribution</h3>
          <div className="space-y-4">
            {PERFORMANCE_DIST.map((d, idx) => {
              const pct = (d.count / total) * 100;
              return (
                <div key={d.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{d.score}★</span>
                      <span className="text-foreground/75 font-medium">{d.label}</span>
                    </div>
                    <span className="text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{d.count} · {pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: PERF_COLORS[idx] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-bold text-foreground mb-5">Top Performers</h3>
          <div className="space-y-3.5">
            {topPerformers.map((emp, i) => (
              <div key={emp.id} className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-muted-foreground w-3 text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}</span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                  {emp.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">{emp.dept}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {emp.rating > 0 ? emp.rating : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "employees", label: "Employees", icon: Users },
  { id: "recruitment", label: "Recruitment", icon: Briefcase },
  { id: "payroll", label: "Payroll", icon: CreditCard },
  { id: "performance", label: "Performance", icon: BarChart2 },
];

function Sidebar({ active, setActive }: { active: string; setActive: (v: string) => void }) {
  return (
    <aside className="w-[220px] shrink-0 bg-card border-r border-border flex flex-col">
      <div className="px-5 py-5 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-foreground tracking-tight leading-none">PeopleOS</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Enterprise · v2.4</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-2 mb-2 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.12em]">Modules</p>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-semibold transition-all ${
              active === id
                ? "bg-primary/15 text-primary border border-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            <Icon size={14} />
            {label}
            {active === id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-4 pt-4 border-t border-border space-y-0.5 shrink-0">
        {[{ icon: Settings, label: "Settings" }, { icon: HelpCircle, label: "Help & Docs" }, { icon: LogOut, label: "Sign Out" }].map(({ icon: Icon, label }) => (
          <button key={label} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all font-medium">
            <Icon size={13} />{label}
          </button>
        ))}
      </div>
    </aside>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────

const HEADERS: Record<string, { title: string; sub: string }> = {
  dashboard: { title: "Dashboard", sub: "Welcome back, Alex — here's your org at a glance" },
  employees: { title: "Employees", sub: "Manage your global workforce" },
  recruitment: { title: "Recruitment", sub: "Track hiring pipeline and open positions" },
  payroll: { title: "Payroll", sub: "Compensation management and monthly disbursements" },
  performance: { title: "Performance", sub: "Q4 2024 review cycle — 56 reviews pending" },
};

function Header({ active }: { active: string }) {
  const { title, sub } = HEADERS[active] ?? { title: "", sub: "" };
  return (
    <header className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-base font-extrabold text-foreground tracking-tight">{title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-border rounded-md px-3 py-1.5 font-medium">
          <Calendar size={11} /><span>Dec 4, 2024</span>
        </div>
        <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-white/[0.04] rounded-md transition-colors">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">AJ</div>
          <div className="text-xs">
            <p className="font-semibold text-foreground leading-none">Alex Johnson</p>
            <p className="text-muted-foreground mt-0.5">HR Director</p>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [active, setActive] = useState("employees");
  const [employees, setEmployees] = useState<Employee[]>(SEED_EMPLOYEES);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  function handleSave(emp: Employee) {
    setEmployees((prev) => [emp, ...prev]);
  }

  function handleSelect(emp: Employee, idx: number) {
    setSelectedEmployee(emp);
    setSelectedIdx(idx);
  }

  function handleDelete(id: number) {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setSelectedEmployee(null);
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden" style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}>
      <Sidebar active={active} setActive={setActive} />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header active={active} />
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}>
          {active === "dashboard" && <DashboardView totalEmployees={employees.length} />}
          {active === "employees" && (
            <EmployeesView
              employees={employees}
              onAdd={() => setAddOpen(true)}
              onSelect={(emp) => {
                const idx = employees.findIndex((e) => e.id === emp.id);
                handleSelect(emp, idx);
              }}
            />
          )}
          {active === "recruitment" && <RecruitmentView />}
          {active === "payroll" && <PayrollView />}
          {active === "performance" && <PerformanceView employees={employees} />}
        </div>
      </main>

      {/* Add Employee Slide-over */}
      {addOpen && (
        <AddEmployeePanel
          onClose={() => setAddOpen(false)}
          onSave={(emp) => {
            handleSave(emp);
            setTimeout(() => setAddOpen(false), 2000);
          }}
        />
      )}

      {/* Employee Profile Slide-over */}
      {selectedEmployee && (
        <EmployeeProfilePanel
          employee={selectedEmployee}
          avatarColor={AVATAR_COLORS[selectedIdx % AVATAR_COLORS.length]}
          onClose={() => setSelectedEmployee(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
