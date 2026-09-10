import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  ExternalLink,
  FileText,
  Inbox,
  ListTodo,
  Mail,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Undo2,
  Users,
  Video,
  X
} from "lucide-react";

const TODAY = "2026-09-04";

/* Ownership. Captured actions default to ME because the assistant records them
   as the user's own - reassign from the task detail to correct that. */
const ME = "Me";
const TEAM = ["Himanshi", "Steve", "Amirah", "Unassigned"];
const OWNERS = [ME, ...TEAM];

const seedTasks = [
  {
    id: 1, title: "Coordinate the change for UPD and PSS deployment",
    details: "Ask Himanshi to raise the required change and coordinate the phased rollout.",
    project: "MAT2548 PSO", owner: ME, source: "Meeting transcript",
    sourceName: "Approach for MAC Devices", created: "2026-09-04", due: "2026-09-11",
    status: "Open", priority: "High", isNew: true,
    discussion: [
      { speaker: "Steve", text: "We can't push UPD and PSS together without a change record - last time it went out unannounced and the service desk got hit." },
      { speaker: "Himanshi", text: "I can raise it, but I need the device scope and the rollout window before I can submit." },
      { speaker: "You", text: "I'll pull the device list together and come back with the phasing so you can raise it this week." }
    ],
    steps: [
      "Pull the target device list for UPD and PSS from Intune.",
      "Agree the phased rollout windows with Retail Ops.",
      "Send the scope and windows to Himanshi so she can raise the change.",
      "Confirm the change reference once submitted."
    ],
    sourceRef: {
      kind: "meeting", title: "Approach for MAC Devices",
      when: "2026-09-04T10:00", attendees: ["Steve", "Himanshi", "Amirah"],
      link: "https://teams.microsoft.com/l/meetup-join/placeholder-mac-devices",
      linkLabel: "Open transcript"
    }
  },
  {
    id: 2, title: "Start the phased UPD and PSS rollout",
    details: "Begin the agreed rollout after change approval and coordinate delivery across the relevant devices.",
    project: "MAT2548 PSO", owner: ME, source: "Meeting notes",
    sourceName: "Approach for the Rollout", created: "2026-09-04", due: "2026-09-14",
    status: "Open", priority: "High", isNew: true,
    discussion: [
      { speaker: "Steve", text: "Once the change lands we start with the pilot ring, not the full estate." },
      { speaker: "You", text: "Agreed - pilot first, then DC, then stores, with a checkpoint between each ring." }
    ],
    steps: [
      "Wait for change approval before any deployment.",
      "Deploy to the pilot ring and hold for 48 hours.",
      "Review pilot results before promoting to the next ring.",
      "Report progress at the weekly PSO call."
    ],
    sourceRef: {
      kind: "meeting", title: "Approach for the Rollout",
      when: "2026-09-04T11:30", attendees: ["Steve", "Amirah"],
      link: "https://teams.microsoft.com/l/meetup-join/placeholder-rollout",
      linkLabel: "Open notes"
    }
  },
  {
    id: 3, title: "Confirm the Secure Print Entra group",
    details: "Investigate the correct group or user source for secure-print membership and targeted deployment.",
    project: "MAT2548 PSO", owner: ME, source: "Email",
    sourceName: "RE: Secure Print - group membership", created: "2026-09-03", due: "",
    status: "Open", priority: "Medium", isNew: true,
    discussion: [
      { speaker: "Amirah", text: "Which Entra group is actually driving secure print? I can see two that look similar and I don't want to target the wrong one." },
      { speaker: "HP (Pharos)", text: "Membership should come from a single security group. Attached is the group mapping we were given at PoC - please confirm it still matches." }
    ],
    steps: [
      "Open the attached group mapping and compare against Entra.",
      "Identify which group is authoritative for secure print.",
      "Confirm back to Amirah so targeting can be finalised.",
      "Document the decision in the MAT2548 notes."
    ],
    sourceRef: {
      kind: "email",
      subject: "RE: Secure Print - group membership",
      from: "Amirah Khan", to: "You, HP Support",
      when: "2026-09-03T16:42",
      link: "https://outlook.office.com/mail/deeplink/read/PLACEHOLDER-MESSAGE-ID",
      linkLabel: "Open in Outlook",
      attachments: [
        { name: "SecurePrint_Group_Mapping.xlsx", size: "184 KB", link: "https://outlook.office.com/mail/deeplink/attachment/PLACEHOLDER-1" },
        { name: "PoC_Membership_Notes.pdf", size: "62 KB", link: "https://outlook.office.com/mail/deeplink/attachment/PLACEHOLDER-2" }
      ]
    }
  },
  {
    id: 4, title: "Validate the Mac Print Scout package",
    details: "Check the Mac Print Scout package and associated secret or encryption files from the Secure Print portal.",
    project: "Mac Printing", owner: ME, source: "Meeting transcript",
    sourceName: "Approach for MAC Devices", created: "2026-09-04", due: "",
    status: "Open", priority: "High", isNew: true,
    discussion: [
      { speaker: "Steve", text: "The Mac side needs the installer plus the customer secret and Setup.ini - they have to sit together or the install comes out unconfigured." },
      { speaker: "You", text: "I'll validate the package and work out how we wrap it for Intune, since Intune only takes a single file." }
    ],
    steps: [
      "Verify MacPrintScoutInstaller.pkg, CustomerSecret.dat and Setup.ini are the correct production set.",
      "Confirm the version with HP before packaging.",
      "Wrap the three files into a single deployable package.",
      "Check whether a Developer ID Installer certificate is available for signing."
    ],
    sourceRef: {
      kind: "meeting", title: "Approach for MAC Devices",
      when: "2026-09-04T10:00", attendees: ["Steve", "Himanshi", "Amirah"],
      link: "https://teams.microsoft.com/l/meetup-join/placeholder-mac-devices",
      linkLabel: "Open transcript"
    }
  },
  {
    id: 5, title: "Package and deploy the Z9 plotter driver",
    details: "After validation, coordinate packaging and deployment of the separate Z9 driver to the design team.",
    project: "MAT2548 PSO", owner: ME, source: "Email",
    sourceName: "Z9 plotter - driver package", created: "2026-09-02", due: "2026-09-21",
    status: "Waiting", priority: "High", isNew: false,
    discussion: [
      { speaker: "Design team", text: "The Z9 is the only plotter we use for print-ready artwork - it can't go through the standard driver." },
      { speaker: "You", text: "Understood, it needs its own package. I'll handle it separately once the main rollout is validated." }
    ],
    steps: [
      "Wait for the main UPD and PSS validation to complete.",
      "Package the Z9 driver from the attached vendor bundle.",
      "Test with one design team machine before wider release.",
      "Deploy to the design team group only."
    ],
    sourceRef: {
      kind: "email",
      subject: "Z9 plotter - driver package",
      from: "Design Team", to: "You",
      when: "2026-09-02T09:15",
      link: "https://outlook.office.com/mail/deeplink/read/PLACEHOLDER-Z9",
      linkLabel: "Open in Outlook",
      attachments: [
        { name: "HP_DesignJet_Z9_Driver_v3.2.zip", size: "48.6 MB", link: "https://outlook.office.com/mail/deeplink/attachment/PLACEHOLDER-Z9-1" }
      ]
    }
  },
  {
    id: 6, title: "Complete printer mapping validation",
    details: "Complete printer-mapping testing and validation with Steve and Amirah.",
    project: "MAT2548 PSO", owner: ME, source: "Meeting notes",
    sourceName: "Approach for the Rollout", created: "2026-09-04", due: "",
    status: "Open", priority: "Medium", isNew: false,
    discussion: [
      { speaker: "Amirah", text: "Mapping looked right for the DC but we never finished the store list." },
      { speaker: "Steve", text: "Let's finish validation before the pilot, otherwise users get pointed at the wrong queue." }
    ],
    steps: [
      "Complete the outstanding store printer mappings.",
      "Validate each mapping with Steve and Amirah.",
      "Record any exceptions in the printer list.",
      "Sign off mapping before pilot begins."
    ],
    sourceRef: {
      kind: "meeting", title: "Approach for the Rollout",
      when: "2026-09-04T11:30", attendees: ["Steve", "Amirah"],
      link: "https://teams.microsoft.com/l/meetup-join/placeholder-rollout",
      linkLabel: "Open notes"
    }
  },
  {
    id: 7, title: "Confirm the WebJet Admin scan-to-email template",
    details: "Confirm the implementation approach and deployment timing for pilot users.",
    project: "MAT2548 PSO", owner: ME, source: "Meeting notes",
    sourceName: "Approach for the Rollout", created: "2026-09-04", due: "",
    status: "Open", priority: "Medium", isNew: false,
    discussion: [
      { speaker: "Steve", text: "Scan-to-email is templated in WebJet Admin, but we haven't agreed whether pilot users get it from day one." },
      { speaker: "You", text: "I'll confirm the template config and come back on timing." }
    ],
    steps: [
      "Review the scan-to-email template in WebJet Admin.",
      "Confirm the SMTP and authentication settings.",
      "Agree whether pilot users receive it at launch.",
      "Feed the decision back into the rollout plan."
    ],
    sourceRef: {
      kind: "meeting", title: "Approach for the Rollout",
      when: "2026-09-04T11:30", attendees: ["Steve", "Amirah"],
      link: "https://teams.microsoft.com/l/meetup-join/placeholder-rollout",
      linkLabel: "Open notes"
    }
  }
];

const statusStyles = {
  Open: "border-[#A9D3F2] bg-[#EFF8FF] text-[#005A9E]",
  Waiting: "border-[#D6CCF2] bg-[#F4F0FF] text-[#6B4EBB]",
  Overdue: "border-[#F3B7B9] bg-[#FDE7E9] text-[#D13438]",
  Completed: "border-[#A7DFA7] bg-[#DFF6DD] text-[#0B6A0B]"
};

const priorityDot = { High: "bg-[#D13438]", Medium: "bg-[#B87A00]", Low: "bg-slate-400" };

const SECTIONS = [
  { key: "New", label: "New today", icon: Inbox },
  { key: "Pending", label: "Pending", icon: ListTodo },
  { key: "Waiting", label: "Waiting", icon: Clock3 },
  { key: "Overdue", label: "Overdue", icon: AlertTriangle },
  { key: "Completed", label: "Completed", icon: CheckCircle2 }
];

const SCOPES = [
  { key: "Mine", label: "My actions" },
  { key: "Team", label: "Team" },
  { key: "All", label: "Everyone" }
];

const DAY_OPTIONS = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "180 days" },
  { value: "365", label: "365 days" },
  { value: "All", label: "All history" }
];

const formatDate = value =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

const initials = owner =>
  owner === ME ? "ME"
    : owner === "Unassigned" ? "?"
    : owner.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();

function Avatar({ owner, size = "sm" }) {
  const dim = size === "xs" ? "h-[18px] w-[18px] text-[8.5px]" : "h-6 w-6 text-[10px]";
  const tone =
    owner === ME ? "bg-gradient-to-br from-[#0078D4] to-[#4CA6E8] text-white"
      : owner === "Unassigned" ? "bg-[#C8C6C4] text-[#605E5C]"
      : "bg-[#0078D4] text-white";
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-bold ${dim} ${tone}`}>
      {initials(owner)}
    </span>
  );
}

export default function ActionTracker() {
  const [tasks, setTasks] = useState(seedTasks);
  const [section, setSection] = useState("Pending");
  const [ownerScope, setOwnerScope] = useState("Mine");
  const [ownerFilter, setOwnerFilter] = useState(null);
  const [days, setDays] = useState("30");
  const [project, setProject] = useState("All projects");
  const [source, setSource] = useState("All sources");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [draft, setDraft] = useState({ title: "", details: "", project: "MAT2548 PSO", owner: ME, due: "", priority: "Medium" });

  const effectiveStatus = task =>
    task.status !== "Completed" && task.due && task.due < TODAY ? "Overdue" : task.status;

  const inOwnerScope = task => {
    if (ownerFilter) return task.owner === ownerFilter;
    if (ownerScope === "Mine") return task.owner === ME;
    if (ownerScope === "Team") return task.owner !== ME;
    return true;
  };

  const projects = ["All projects", ...new Set(tasks.map(task => task.project))];
  const sources = ["All sources", ...new Set(tasks.map(task => task.source))];

  const scopedTasks = useMemo(
    () => tasks.filter(inOwnerScope),
    [tasks, ownerScope, ownerFilter]
  );

  const counts = useMemo(() => ({
    New: scopedTasks.filter(task => task.isNew && effectiveStatus(task) !== "Completed").length,
    Pending: scopedTasks.filter(task => effectiveStatus(task) !== "Completed").length,
    Waiting: scopedTasks.filter(task => effectiveStatus(task) === "Waiting").length,
    Overdue: scopedTasks.filter(task => effectiveStatus(task) === "Overdue").length,
    Completed: scopedTasks.filter(task => effectiveStatus(task) === "Completed").length
  }), [scopedTasks]);

  const openByOwner = owner =>
    tasks.filter(task => task.owner === owner && effectiveStatus(task) !== "Completed").length;

  const scopeCounts = useMemo(() => ({
    Mine: tasks.filter(t => t.owner === ME && effectiveStatus(t) !== "Completed").length,
    Team: tasks.filter(t => t.owner !== ME && effectiveStatus(t) !== "Completed").length,
    All: tasks.filter(t => effectiveStatus(t) !== "Completed").length
  }), [tasks]);

  const visibleTasks = useMemo(() => scopedTasks.filter(task => {
    const status = effectiveStatus(task);
    const statusMatch =
      section === "New" ? task.isNew && status !== "Completed" :
      section === "Pending" ? status !== "Completed" :
      section === "Waiting" ? status === "Waiting" :
      section === "Overdue" ? status === "Overdue" :
      section === "Completed" ? status === "Completed" : true;

    const text = `${task.title} ${task.details} ${task.project} ${task.source} ${task.sourceName} ${task.owner}`.toLowerCase();
    const projectMatch = project === "All projects" || task.project === project;
    const sourceMatch = source === "All sources" || task.source === source;
    const historicalMatch = days === "All" || !task.created ||
      Math.floor((new Date(TODAY) - new Date(task.created)) / 86400000) <= Number(days);

    return statusMatch && projectMatch && sourceMatch && historicalMatch && text.includes(query.toLowerCase());
  }), [scopedTasks, section, days, project, source, query]);

  const groupedTasks = useMemo(() => visibleTasks.reduce((groups, task) => {
    (groups[task.project] = groups[task.project] || []).push(task);
    return groups;
  }, {}), [visibleTasks]);

  useEffect(() => {
    const onKey = event => { if (event.key === "Escape") setShowForm(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const setOwner = (id, owner) =>
    setTasks(current => current.map(task => task.id === id ? { ...task, owner } : task));

  const toggleComplete = id => setTasks(current => current.map(task =>
    task.id === id
      ? { ...task, status: task.status === "Completed" ? "Open" : "Completed", isNew: false }
      : task
  ));

  const addTask = () => {
    if (!draft.title.trim()) { setFormError("Give the action a title."); return; }
    setTasks(current => [{
      id: Date.now(), ...draft,
      project: draft.project.trim() || "MAT2548 PSO",
      source: "Manually added", sourceName: "My Action Tracker",
      created: TODAY, status: "Open", isNew: true
    }, ...current]);
    setDraft({ title: "", details: "", project: "MAT2548 PSO", owner: ME, due: "", priority: "Medium" });
    setFormError("");
    setShowForm(false);
  };

  const filtersActive = showFilters || project !== "All projects" || source !== "All sources";
  const heading = section === "New" ? "New today" : section;
  const scopeLabel = ownerFilter
    ? (ownerFilter === ME ? "Me" : ownerFilter)
    : SCOPES.find(item => item.key === ownerScope).label;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F3F2F1] via-white to-[#EEF6FF] text-[#1B1A19]">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">

        <aside className="hidden w-60 shrink-0 border-r border-[#0078D4]/20 bg-white/70 px-3.5 py-5 backdrop-blur lg:block">
          <div className="mb-7 flex items-center gap-2.5 px-1.5">
            <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-gradient-to-br from-[#0078D4] to-[#4CA6E8] text-white shadow-lg shadow-[#0078D4]/30">
              <ListTodo size={18} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Action Tracker</p>
              <p className="text-[11px] text-slate-500">Personal work queue</p>
            </div>
          </div>

          <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">Views</p>
          <nav className="space-y-0.5">
            {SECTIONS.map(item => (
              <NavItem key={item.key} icon={item.icon} label={item.label}
                count={counts[item.key]}
                alert={item.key === "Overdue" && counts.Overdue > 0}
                active={section === item.key}
                onClick={() => { setSection(item.key); setExpanded(null); }} />
            ))}
          </nav>

          <p className="mt-7 px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">People</p>
          <div className="space-y-0.5">
            {OWNERS.map(owner => (
              <button key={owner}
                onClick={() => { setOwnerFilter(ownerFilter === owner ? null : owner); setExpanded(null); }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition ${
                  ownerFilter === owner ? "bg-[#DEECF9] font-semibold text-[#005A9E]" : "text-slate-600 hover:bg-[#0078D4]/5"
                }`}>
                <Avatar owner={owner} />
                <span className="truncate">{owner === ME ? "Me" : owner}</span>
                <span className="ml-auto rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                  {openByOwner(owner)}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-7 px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">Projects</p>
          <div className="space-y-0.5">
            {projects.slice(1).map(item => (
              <button key={item}
                onClick={() => setProject(project === item ? "All projects" : item)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition ${
                  project === item ? "bg-[#DEECF9] font-semibold text-[#005A9E]" : "text-slate-600 hover:bg-[#0078D4]/5"
                }`}>
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#0078D4]" />
                <span className="truncate">{item}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[#0078D4]/20 bg-white/90 px-4 py-4 backdrop-blur md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold tracking-tight">{heading} actions</h1>
                <p className="mt-0.5 text-xs text-slate-500">
                  {scopeLabel} · {visibleTasks.length} action{visibleTasks.length === 1 ? "" : "s"} in this view
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="hidden items-center gap-2 rounded-full bg-[#DFF6DD] px-3 py-1.5 text-xs text-[#0B6A0B] sm:flex">
                  <RefreshCw size={13} /> Last scan 17:00 · Next 18:00
                </div>
                <button onClick={() => { setShowForm(true); setFormError(""); }}
                  className="flex items-center gap-1.5 rounded-lg bg-[#0078D4] px-4 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-[#0078D4]/25 transition hover:bg-[#005A9E] active:translate-y-px">
                  <Plus size={16} /> Add action
                </button>
              </div>
            </div>

            {/* Ownership scope */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex gap-0.5 rounded-full bg-black/5 p-0.5">
                {SCOPES.map(item => (
                  <button key={item.key}
                    onClick={() => { setOwnerScope(item.key); setOwnerFilter(null); setExpanded(null); }}
                    className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition ${
                      !ownerFilter && ownerScope === item.key
                        ? "bg-white text-[#005A9E] shadow-sm"
                        : "text-slate-600 hover:text-[#005A9E]"
                    }`}>
                    {item.label} <span className="opacity-60">{scopeCounts[item.key]}</span>
                  </button>
                ))}
              </div>

              {ownerFilter && (
                <button onClick={() => setOwnerFilter(null)}
                  className="flex items-center gap-2 rounded-full border border-[#0078D4] bg-[#DEECF9] py-1 pl-1 pr-3 text-xs font-semibold text-[#005A9E]">
                  <Avatar owner={ownerFilter} size="xs" />
                  Showing {ownerFilter === ME ? "Me" : ownerFilter} only · clear
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <label className="relative min-w-0 flex-1 basis-64">
                <span className="sr-only">Search actions</span>
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={event => setQuery(event.target.value)}
                  placeholder="Search actions, people, projects or sources"
                  className="h-[38px] w-full rounded-lg border border-[#0078D4]/20 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#0078D4] focus:ring-[3px] focus:ring-[#0078D4]/15" />
              </label>

              <Select value={days} onChange={setDays} options={DAY_OPTIONS} label="Date range" />

              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex h-[38px] items-center gap-2 rounded-lg border px-3.5 text-[13px] transition ${
                  filtersActive ? "border-[#0078D4] bg-[#DEECF9] font-semibold text-[#005A9E]"
                    : "border-[#0078D4]/20 bg-white text-slate-600 hover:border-[#0078D4] hover:text-[#005A9E]"
                }`}>
                <SlidersHorizontal size={15} /> Filters
              </button>
            </div>

            {showFilters && (
              <div className="mt-2.5 flex flex-wrap gap-2 rounded-[10px] border border-[#0078D4]/20 bg-[#DEECF9]/40 p-2.5">
                <Select value={project} onChange={setProject} wide label="Project"
                  options={projects.map(value => ({ value, label: value }))} />
                <Select value={source} onChange={setSource} wide label="Source"
                  options={sources.map(value => ({ value, label: value }))} />
                <button onClick={() => { setProject("All projects"); setSource("All sources"); }}
                  className="h-[38px] rounded-lg border border-[#0078D4]/20 bg-white px-3.5 text-xs font-semibold text-slate-500 transition hover:text-[#005A9E]">
                  Clear filters
                </button>
              </div>
            )}

            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5 lg:hidden">
              {SECTIONS.map(item => (
                <button key={item.key}
                  onClick={() => { setSection(item.key); setExpanded(null); }}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    section === item.key ? "bg-[#0078D4] text-white" : "bg-black/5 text-slate-600"
                  }`}>
                  {item.label} {counts[item.key]}
                </button>
              ))}
            </div>
          </header>

          <div className="p-4 md:p-6">
            {Object.entries(groupedTasks).map(([group, groupTasks]) => (
              <section key={group}
                className="mb-4 overflow-hidden rounded-xl border border-[#0078D4]/20 bg-white shadow-[0_4px_16px_rgba(0,120,212,0.08)]">
                <div className="flex items-center gap-2.5 border-b border-[#0078D4]/20 bg-gradient-to-r from-[#DEECF9]/70 to-[#DEECF9]/10 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-[#0078D4]" />
                  <h2 className="text-[13px] font-bold tracking-tight">{group}</h2>
                  <span className="rounded-full border border-[#0078D4]/20 bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                    {groupTasks.length}
                  </span>
                </div>

                <div>
                  {groupTasks.map(task => {
                    const taskStatus = effectiveStatus(task);
                    const isExpanded = expanded === task.id;
                    const isDone = task.status === "Completed";

                    return (
                      <article key={task.id} className="border-b border-black/5 last:border-b-0">
                        <div className="flex items-start gap-3 px-3 py-3 transition hover:bg-[#0078D4]/[0.035] md:items-center md:px-4">
                          <button onClick={() => toggleComplete(task.id)}
                            className={`mt-0.5 shrink-0 transition md:mt-0 ${isDone ? "text-[#0B6A0B]" : "text-slate-400 hover:text-[#0B6A0B]"}`}
                            aria-label={isDone ? "Mark as not complete" : "Mark as complete"}>
                            {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                          </button>

                          <button onClick={() => setExpanded(isExpanded ? null : task.id)}
                            aria-expanded={isExpanded} className="min-w-0 flex-1 text-left">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className={`h-[7px] w-[7px] shrink-0 rounded-full ${priorityDot[task.priority]}`} aria-hidden="true" />
                              <p className={`truncate text-[13.5px] font-semibold ${isDone ? "text-slate-400 line-through" : "text-slate-800"}`}>
                                {task.title}
                              </p>
                              {task.isNew && taskStatus !== "Completed" && (
                                <span className="shrink-0 rounded bg-[#DEECF9] px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-[#005A9E]">New</span>
                              )}
                            </div>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {task.sourceName} · {task.source} · {task.priority} priority
                            </p>

                            {/* Owner, status and due stay visible on small screens */}
                            <div className="mt-2 flex flex-wrap items-center gap-2 md:hidden">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0078D4]/20 bg-white py-0.5 pl-0.5 pr-2.5 text-[11px] text-slate-600">
                                <Avatar owner={task.owner} size="xs" />
                                {task.owner === ME ? "Mine" : task.owner}
                              </span>
                              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[taskStatus]}`}>
                                {taskStatus}
                              </span>
                              <span className={`text-xs ${taskStatus === "Overdue" ? "font-bold text-[#D13438]" : "text-slate-500"}`}>
                                {task.due ? formatDate(task.due) : "No date"}
                              </span>
                            </div>
                          </button>

                          <div className="hidden w-32 shrink-0 items-center gap-2 md:flex">
                            <Avatar owner={task.owner} />
                            <span className="truncate text-xs text-slate-600">
                              {task.owner === ME ? "Me" : task.owner}
                            </span>
                          </div>

                          <div className="hidden w-28 shrink-0 md:block">
                            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[taskStatus]}`}>
                              {taskStatus}
                            </span>
                          </div>

                          <div className={`hidden w-20 shrink-0 text-xs md:block ${taskStatus === "Overdue" ? "font-bold text-[#D13438]" : "text-slate-500"}`}>
                            {task.due ? formatDate(task.due) : "No date"}
                          </div>

                          <button onClick={() => setExpanded(isExpanded ? null : task.id)}
                            className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-black/5"
                            aria-label="Toggle details">
                            {isExpanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-black/5 bg-[#DEECF9]/30 px-5 py-4 md:px-14">
                            <p className="max-w-[74ch] text-[13px] leading-relaxed text-slate-600">{task.details}</p>

                            {task.discussion?.length > 0 && (
                              <div className="mt-4">
                                <DetailLabel icon={Users}>What was discussed</DetailLabel>
                                <div className="max-w-[78ch] rounded-r-lg border-l-[3px] border-[#0078D4] bg-white px-3.5 py-3">
                                  {task.discussion.map((line, index) => (
                                    <p key={index} className="mb-2 text-[13px] leading-relaxed text-slate-600 last:mb-0">
                                      <span className="font-bold text-[#005A9E]">{line.speaker}:</span> {line.text}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}

                            {task.steps?.length > 0 && (
                              <div className="mt-4">
                                <DetailLabel icon={CheckCheck}>What you need to do</DetailLabel>
                                <ol className="flex max-w-[78ch] flex-col gap-1.5">
                                  {task.steps.map((step, index) => (
                                    <li key={index} className="flex items-start gap-2.5 text-[13px] leading-snug text-slate-600">
                                      <span className="mt-px grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full bg-[#DEECF9] text-[10.5px] font-bold text-[#005A9E]">
                                        {index + 1}
                                      </span>
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {task.sourceRef && <SourceCard refData={task.sourceRef} />}

                            <div className="mt-4">
                              <DetailLabel>Details</DetailLabel>
                              <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                                <span className={`rounded-full border px-2.5 py-1 font-semibold ${statusStyles[taskStatus]}`}>{taskStatus}</span>
                                <span className="rounded-full border border-[#0078D4]/20 bg-white px-2.5 py-1">Priority: {task.priority}</span>
                                <span className="rounded-full border border-[#0078D4]/20 bg-white px-2.5 py-1">Detected: {formatDate(task.created)}</span>
                                <span className="rounded-full border border-[#0078D4]/20 bg-white px-2.5 py-1">Source: {task.source}</span>
                                {task.due && (
                                  <span className="rounded-full border border-[#0078D4]/20 bg-white px-2.5 py-1">Due: {formatDate(task.due)}</span>
                                )}
                              </div>
                            </div>

                            {/* Correct a wrongly attributed action */}
                            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-dashed border-[#0078D4]/25 pt-3.5">
                              <label htmlFor={`owner-${task.id}`} className="text-xs font-semibold text-slate-600">
                                Responsible
                              </label>
                              <div className="relative">
                                <select
                                  id={`owner-${task.id}`}
                                  value={task.owner}
                                  onChange={event => setOwner(task.id, event.target.value)}
                                  className="h-[38px] w-48 appearance-none rounded-lg border border-[#0078D4]/25 bg-white px-3 pr-9 text-sm outline-none transition focus:border-[#0078D4] focus:ring-[3px] focus:ring-[#0078D4]/15"
                                >
                                  {OWNERS.map(owner => (
                                    <option key={owner} value={owner}>{owner === ME ? "Me" : owner}</option>
                                  ))}
                                </select>
                                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              </div>

                              {task.owner !== ME && (
                                <button onClick={() => setOwner(task.id, ME)}
                                  className="flex h-[38px] items-center gap-1.5 rounded-lg border border-[#0078D4]/20 bg-white px-3.5 text-xs font-semibold text-slate-600 transition hover:border-[#0078D4] hover:text-[#005A9E]">
                                  <Undo2 size={14} /> Take it back
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}

            {!visibleTasks.length && (
              <div className="rounded-xl border border-dashed border-[#0078D4]/30 bg-white/70 px-6 py-16 text-center">
                <CheckCircle2 size={34} className="mx-auto text-slate-300" strokeWidth={1.5} />
                <p className="mt-3.5 text-sm font-semibold text-slate-700">No actions in this view</p>
                <p className="mt-1 text-xs text-slate-500">
                  {ownerScope === "Team" && !ownerFilter
                    ? "Nothing is assigned to the team yet. Open an action and change who is responsible."
                    : "Try a different date range, or clear the filters."}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B1A19]/45 p-4 backdrop-blur-sm"
          onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog" aria-modal="true" aria-label="Add action"
            onClick={event => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-[17px] font-bold">Add action</h2>
                <p className="mt-0.5 text-xs text-slate-500">Capture a manual follow-up</p>
              </div>
              <button onClick={() => setShowForm(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-black/5"
                aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <Field label="Title" htmlFor="title">
                <input id="title" value={draft.title}
                  onChange={event => { setDraft({ ...draft, title: event.target.value }); setFormError(""); }}
                  placeholder="What needs doing?"
                  className="h-10 w-full rounded-lg border border-[#0078D4]/25 px-3 text-sm outline-none transition focus:border-[#0078D4] focus:ring-[3px] focus:ring-[#0078D4]/15" />
                {formError && <p className="mt-1 text-xs text-[#D13438]">{formError}</p>}
              </Field>

              <Field label="Details" htmlFor="details">
                <textarea id="details" value={draft.details}
                  onChange={event => setDraft({ ...draft, details: event.target.value })}
                  placeholder="Any context or next steps"
                  className="min-h-[84px] w-full resize-y rounded-lg border border-[#0078D4]/25 p-3 text-sm outline-none transition focus:border-[#0078D4] focus:ring-[3px] focus:ring-[#0078D4]/15" />
              </Field>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Project" htmlFor="project">
                  <input id="project" value={draft.project}
                    onChange={event => setDraft({ ...draft, project: event.target.value })}
                    className="h-10 w-full rounded-lg border border-[#0078D4]/25 px-3 text-sm outline-none transition focus:border-[#0078D4] focus:ring-[3px] focus:ring-[#0078D4]/15" />
                </Field>
                <Field label="Due date" htmlFor="due">
                  <input id="due" type="date" value={draft.due}
                    onChange={event => setDraft({ ...draft, due: event.target.value })}
                    className="h-10 w-full rounded-lg border border-[#0078D4]/25 px-3 text-sm outline-none transition focus:border-[#0078D4] focus:ring-[3px] focus:ring-[#0078D4]/15" />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Responsible" htmlFor="owner">
                  <div className="relative">
                    <select id="owner" value={draft.owner}
                      onChange={event => setDraft({ ...draft, owner: event.target.value })}
                      className="h-10 w-full appearance-none rounded-lg border border-[#0078D4]/25 px-3 pr-9 text-sm outline-none transition focus:border-[#0078D4] focus:ring-[3px] focus:ring-[#0078D4]/15">
                      {OWNERS.map(owner => (
                        <option key={owner} value={owner}>{owner === ME ? "Me" : owner}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </Field>

                <Field label="Priority" htmlFor="priority">
                  <div className="relative">
                    <select id="priority" value={draft.priority}
                      onChange={event => setDraft({ ...draft, priority: event.target.value })}
                      className="h-10 w-full appearance-none rounded-lg border border-[#0078D4]/25 px-3 pr-9 text-sm outline-none transition focus:border-[#0078D4] focus:ring-[3px] focus:ring-[#0078D4]/15">
                      <option>High</option><option>Medium</option><option>Low</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </Field>
              </div>

              <button onClick={addTask}
                className="mt-1 w-full rounded-lg bg-[#0078D4] py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0078D4]/25 transition hover:bg-[#005A9E]">
                Save action
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function DetailLabel({ icon: Icon, children }) {
  return (
    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.07em] text-slate-400">
      {Icon && <Icon size={13} />}
      {children}
    </div>
  );
}

function formatStamp(value) {
  if (!value) return "";
  const date = new Date(value);
  return `${date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} \u00b7 ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

function SourceCard({ refData }) {
  const isEmail = refData.kind === "email";
  const Icon = isEmail ? Mail : refData.kind === "meeting" ? Video : FileText;
  const title = isEmail ? refData.subject : refData.title;

  const meta = isEmail
    ? `From ${refData.from}${refData.to ? ` \u00b7 To ${refData.to}` : ""} \u00b7 ${formatStamp(refData.when)}`
    : `${formatStamp(refData.when)}${refData.attendees ? ` \u00b7 ${refData.attendees.join(", ")}` : ""}`;

  return (
    <div className="mt-4">
      <DetailLabel icon={Icon}>Source</DetailLabel>
      <div className="max-w-[640px] rounded-[10px] border border-[#0078D4]/20 bg-white p-3.5">
        <div className="flex items-start gap-2.5">
          <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg bg-[#DEECF9] text-[#005A9E]">
            <Icon size={15} />
          </span>
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-[#1B1A19]">{title}</div>
            <div className="mt-0.5 text-[11.5px] text-slate-400">{meta}</div>
          </div>
          <a href={refData.link} target="_blank" rel="noopener noreferrer"
            className="ml-auto flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#0078D4] bg-[#DEECF9] px-3.5 py-1.5 text-xs font-semibold text-[#005A9E] no-underline transition hover:bg-[#0078D4] hover:text-white">
            <ExternalLink size={13} /> {refData.linkLabel || "Open"}
          </a>
        </div>

        {isEmail && refData.attachments?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-dashed border-[#0078D4]/20 pt-3">
            {refData.attachments.map(file => (
              <a key={file.name} href={file.link} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-[#0078D4]/20 bg-[#FAFAFA] px-2.5 py-1.5 text-[11.5px] text-slate-600 no-underline transition hover:border-[#0078D4] hover:bg-[#DEECF9] hover:text-[#005A9E]">
                <Paperclip size={13} />
                <span>{file.name}</span>
                <span className="text-[10.5px] text-slate-400">{file.size}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, count, active, alert, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm transition ${
        active ? "bg-[#DEECF9] font-semibold text-[#005A9E] shadow-[inset_2px_0_0_#0078D4]"
          : "text-slate-600 hover:bg-[#0078D4]/5 hover:text-[#005A9E]"
      }`}>
      <Icon size={16} className="shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      <span className={`min-w-[22px] rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
        alert ? "bg-[#FDE7E9] text-[#D13438]"
          : active ? "bg-white text-[#005A9E]" : "bg-black/5 text-slate-500"
      }`}>
        {count}
      </span>
    </button>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options, label, wide = false }) {
  return (
    <label className={`relative ${wide ? "w-full sm:w-52" : "w-full sm:w-[150px]"}`}>
      <span className="sr-only">{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)}
        className="h-[38px] w-full appearance-none rounded-lg border border-[#0078D4]/20 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-[#0078D4] focus:ring-[3px] focus:ring-[#0078D4]/15">
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </label>
  );
}
