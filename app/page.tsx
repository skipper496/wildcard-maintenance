"use client";

import { useEffect, useMemo, useState } from "react";
import { computeIntervalStatuses, getRegattaMaintenanceFlags } from "@/lib/logic";
import { defaultState } from "@/lib/seed";
import { fetchRemoteState, saveRemoteState } from "@/lib/remote";
import { AppState, CrewStatus, RegattaItem, TodoCategory } from "@/lib/types";
import { addDays, todayIso, uid } from "@/lib/utils";

type Tab =
  | "Dashboard"
  | "Maintenance"
  | "Service"
  | "To-Do"
  | "Manuals"
  | "Specs"
  | "Regattas"
  | "Calendar";

const tabs: Tab[] = [
  "Dashboard",
  "Maintenance",
  "Service",
  "To-Do",
  "Manuals",
  "Specs",
  "Regattas",
  "Calendar"
];

const categories: TodoCategory[] = [
  "Engine",
  "Sailing",
  "Electronics",
  "Hull and Fittings",
  "Safety",
  "Other"
];

const crewStatuses: CrewStatus[] = ["Confirmed", "Tentative", "Out"];

function monthCells(anchorIso: string) {
  const d = new Date(anchorIso);
  const year = d.getFullYear();
  const month = d.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startWeekday = first.getDay();
  const totalDays = last.getDate();
  const cells: { date: string; day: number; inMonth: boolean }[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const x = new Date(year, month, -i);
    cells.push({ date: x.toISOString().slice(0, 10), day: x.getDate(), inMonth: false });
  }
  for (let day = 1; day <= totalDays; day++) {
    const x = new Date(year, month, day);
    cells.push({ date: x.toISOString().slice(0, 10), day, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const x = new Date(year, month + 1, cells.length - (startWeekday + totalDays) + 1);
    cells.push({ date: x.toISOString().slice(0, 10), day: x.getDate(), inMonth: false });
  }
  return { cells, title: d.toLocaleString(undefined, { month: "long", year: "numeric" }) };
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [state, setState] = useState<AppState>(defaultState);
  const [anchor, setAnchor] = useState(todayIso());
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const remote = await fetchRemoteState();
        if (!active) return;
        setState(remote);
        setLoadError(null);
      } catch (error) {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load cloud data");
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        await saveRemoteState(state);
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 500);
    return () => clearTimeout(t);
  }, [state, loaded]);

  const statuses = useMemo(() => computeIntervalStatuses(state), [state]);
  const alerts = useMemo(() => statuses.filter((s) => s.status !== "upcoming"), [statuses]);
  const upcoming = useMemo(() => statuses.filter((s) => s.status === "upcoming"), [statuses]);
  const latestHours = useMemo(() => {
    const values = state.maintenanceLogs
      .map((x) => x.engineHours)
      .filter((x): x is number => typeof x === "number");
    return values.length ? Math.max(...values) : null;
  }, [state.maintenanceLogs]);

  const { cells, title } = useMemo(() => monthCells(anchor), [anchor]);

  const calendarEvents = useMemo(() => {
    const map = new Map<string, { label: string; kind: "regatta" | "service" | "todo" }[]>();
    state.regattas.forEach((r) => {
      const list = map.get(r.date) ?? [];
      list.push({ label: `Regatta: ${r.name}`, kind: "regatta" });
      map.set(r.date, list);
    });
    statuses.forEach((s) => {
      if (s.dueDate) {
        const list = map.get(s.dueDate) ?? [];
        list.push({ label: `Service: ${s.interval.task}`, kind: "service" });
        map.set(s.dueDate, list);
      }
    });
    state.todos
      .filter((t) => !!t.dueDate && !t.done)
      .forEach((t) => {
        const list = map.get(t.dueDate as string) ?? [];
        list.push({ label: `To-Do: ${t.title}`, kind: "todo" });
        map.set(t.dueDate as string, list);
      });
    return map;
  }, [state.regattas, state.todos, statuses]);

  return (
    <main className="shell">
      <div className="top">
        <h1>Wildcard Maintenance</h1>
        <p>J/105 maintenance, manuals, and regatta readiness planner</p>
      </div>

      <div className="tabs">
        {tabs.map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <section className="panel" style={{ marginBottom: "1rem" }}>
        {!loaded && <span className="muted">Loading cloud data...</span>}
        {loaded && !loadError && (
          <div className="row">
            <span className="muted">Cloud sync status:</span>
            <span className={`chip ${saveStatus === "error" ? "overdue" : saveStatus === "saving" ? "due" : "upcoming"}`}>
              {saveStatus === "idle" && "READY"}
              {saveStatus === "saving" && "SAVING"}
              {saveStatus === "saved" && "SAVED"}
              {saveStatus === "error" && "SAVE ERROR"}
            </span>
          </div>
        )}
        {loadError && (
          <div className="chip overdue">
            Cloud data unavailable: {loadError}. Configure Vercel KV and redeploy.
          </div>
        )}
      </section>

      {tab === "Dashboard" && (
        <section className="grid two-col">
          <div className="panel">
            <h2>Status Snapshot</h2>
            <div className="stack">
              <div className="item">
                <strong>Current Engine Hours:</strong> {latestHours ?? "Not set"}
              </div>
              <div className="item">
                <strong>Alerts:</strong> {alerts.length}
              </div>
              <div className="item">
                <strong>Open To-Dos:</strong> {state.todos.filter((t) => !t.done).length}
              </div>
            </div>
          </div>
          <div className="panel">
            <h2>Maintenance Alerts</h2>
            <div className="list">
              {alerts.length === 0 && <div className="muted">No due or overdue service items.</div>}
              {alerts.map((s) => (
                <div key={s.interval.id} className="item">
                  <div className={`chip ${s.status}`}>{s.status.toUpperCase()}</div>
                  <h4>{s.interval.task}</h4>
                  <p>{s.message}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <h3>Upcoming Service</h3>
            <div className="list">
              {upcoming.map((s) => (
                <div key={s.interval.id} className="item">
                  <h4>{s.interval.task}</h4>
                  <p className="muted">{s.message}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <h3>Next Regattas</h3>
            <div className="list">
              {state.regattas.length === 0 && <div className="muted">No regattas added yet.</div>}
              {state.regattas
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 5)
                .map((r) => (
                  <div key={r.id} className="item">
                    <h4>
                      {r.name} ({r.date})
                    </h4>
                    <p>{r.location}</p>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {tab === "Maintenance" && (
        <MaintenanceLog state={state} setState={setState} />
      )}

      {tab === "Service" && <ServiceIntervals state={state} setState={setState} statuses={statuses} />}

      {tab === "To-Do" && <TodoBoard state={state} setState={setState} />}

      {tab === "Manuals" && <ManualLibrary state={state} setState={setState} />}

      {tab === "Specs" && <SpecsPanel state={state} setState={setState} />}

      {tab === "Regattas" && <RegattasPanel state={state} setState={setState} />}

      {tab === "Calendar" && (
        <section className="panel">
          <div className="row">
            <h2 style={{ margin: 0 }}>{title}</h2>
            <button
              className="ghost"
              onClick={() => {
                const d = new Date(anchor);
                d.setMonth(d.getMonth() - 1);
                setAnchor(d.toISOString().slice(0, 10));
              }}
            >
              Previous
            </button>
            <button
              className="ghost"
              onClick={() => {
                const d = new Date(anchor);
                d.setMonth(d.getMonth() + 1);
                setAnchor(d.toISOString().slice(0, 10));
              }}
            >
              Next
            </button>
          </div>
          <div className="calendar">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="muted" style={{ fontWeight: 700 }}>
                {d}
              </div>
            ))}
            {cells.map((c) => (
              <div key={c.date + c.day} className={`cell ${c.inMonth ? "" : "other-month"}`}>
                <div className="day">{c.day}</div>
                {(calendarEvents.get(c.date) ?? []).slice(0, 3).map((e, i) => (
                  <div key={i} className={`event ${e.kind}`}>
                    {e.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function MaintenanceLog({
  state,
  setState
}: {
  state: AppState;
  setState: (next: AppState) => void;
}) {
  const [date, setDate] = useState(todayIso());
  const [engineHours, setEngineHours] = useState("");
  const [system, setSystem] = useState("Engine");
  const [task, setTask] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <section className="grid two-col">
      <div className="panel">
        <h2>Log Completed Maintenance</h2>
        <div className="stack">
          <div>
            <label>Date</label>
            <input value={date} type="date" onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label>Engine Hours (optional)</label>
            <input value={engineHours} type="number" onChange={(e) => setEngineHours(e.target.value)} />
          </div>
          <div>
            <label>System</label>
            <input value={system} onChange={(e) => setSystem(e.target.value)} />
          </div>
          <div>
            <label>Task</label>
            <input value={task} onChange={(e) => setTask(e.target.value)} />
          </div>
          <div>
            <label>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button
            onClick={() => {
              if (!task.trim()) return;
              setState({
                ...state,
                maintenanceLogs: [
                  {
                    id: uid(),
                    date,
                    engineHours: engineHours ? Number(engineHours) : null,
                    system,
                    task,
                    notes
                  },
                  ...state.maintenanceLogs
                ]
              });
              setTask("");
              setNotes("");
            }}
          >
            Add Log Entry
          </button>
        </div>
      </div>
      <div className="panel">
        <h2>History</h2>
        <div className="list">
          {state.maintenanceLogs
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((log) => (
              <div key={log.id} className="item">
                <h4>
                  {log.date} | {log.system}
                </h4>
                <p>
                  <strong>{log.task}</strong>
                </p>
                <p>{log.notes}</p>
                <p className="muted">Engine hours: {log.engineHours ?? "n/a"}</p>
                <button
                  className="secondary"
                  onClick={() =>
                    setState({ ...state, maintenanceLogs: state.maintenanceLogs.filter((x) => x.id !== log.id) })
                  }
                >
                  Delete
                </button>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

function ServiceIntervals({
  state,
  setState,
  statuses
}: {
  state: AppState;
  setState: (next: AppState) => void;
  statuses: ReturnType<typeof computeIntervalStatuses>;
}) {
  const [task, setTask] = useState("");
  const [system, setSystem] = useState("Engine");
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [lastDate, setLastDate] = useState(todayIso());
  const [lastHours, setLastHours] = useState("");

  return (
    <section className="grid two-col">
      <div className="panel">
        <h2>Service Timelines</h2>
        <div className="list">
          {statuses.map((s) => (
            <div key={s.interval.id} className="item">
              <div className={`chip ${s.status}`}>{s.status.toUpperCase()}</div>
              <h4>
                {s.interval.system}: {s.interval.task}
              </h4>
              <p className="muted">{s.message || "No schedule data yet"}</p>
              <p className="muted">
                Due date: {s.dueDate ?? "n/a"} | Due hours: {s.dueHours ?? "n/a"}
              </p>
              <button
                className="secondary"
                onClick={() =>
                  setState({
                    ...state,
                    serviceIntervals: state.serviceIntervals.filter((x) => x.id !== s.interval.id)
                  })
                }
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <h2>Add/Update Interval</h2>
        <div className="stack">
          <div>
            <label>System</label>
            <input value={system} onChange={(e) => setSystem(e.target.value)} />
          </div>
          <div>
            <label>Task</label>
            <input value={task} onChange={(e) => setTask(e.target.value)} />
          </div>
          <div>
            <label>Due Every Days (optional)</label>
            <input value={days} type="number" onChange={(e) => setDays(e.target.value)} />
          </div>
          <div>
            <label>Due Every Engine Hours (optional)</label>
            <input value={hours} type="number" onChange={(e) => setHours(e.target.value)} />
          </div>
          <div>
            <label>Last Done Date</label>
            <input value={lastDate} type="date" onChange={(e) => setLastDate(e.target.value)} />
          </div>
          <div>
            <label>Last Done Engine Hours (optional)</label>
            <input value={lastHours} type="number" onChange={(e) => setLastHours(e.target.value)} />
          </div>
          <button
            onClick={() => {
              if (!task.trim()) return;
              setState({
                ...state,
                serviceIntervals: [
                  {
                    id: uid(),
                    system,
                    task,
                    dueEveryDays: days ? Number(days) : null,
                    dueEveryHours: hours ? Number(hours) : null,
                    lastDoneDate: lastDate || null,
                    lastDoneHours: lastHours ? Number(lastHours) : null
                  },
                  ...state.serviceIntervals
                ]
              });
              setTask("");
            }}
          >
            Save Interval
          </button>
        </div>
      </div>
    </section>
  );
}

function TodoBoard({
  state,
  setState
}: {
  state: AppState;
  setState: (next: AppState) => void;
}) {
  const [category, setCategory] = useState<TodoCategory>("Engine");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");

  return (
    <section className="grid two-col">
      <div className="panel">
        <h2>Add To-Do</h2>
        <div className="stack">
          <div>
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as TodoCategory)}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div>
            <label>Due Date (optional)</label>
            <input value={dueDate} type="date" onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <button
            onClick={() => {
              if (!title.trim()) return;
              setState({
                ...state,
                todos: [{ id: uid(), category, title, notes, dueDate: dueDate || null, done: false }, ...state.todos]
              });
              setTitle("");
              setNotes("");
            }}
          >
            Add To-Do
          </button>
        </div>
      </div>
      <div className="panel">
        <h2>Editable To-Do Lists</h2>
        <div className="stack">
          {categories.map((c) => (
            <div key={c} className="item">
              <h3>{c}</h3>
              <div className="list">
                {state.todos
                  .filter((t) => t.category === c)
                  .map((t) => (
                    <div key={t.id} className="item">
                      <div className="row">
                        <input
                          style={{ width: "auto" }}
                          type="checkbox"
                          checked={t.done}
                          onChange={() =>
                            setState({
                              ...state,
                              todos: state.todos.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x))
                            })
                          }
                        />
                        <strong style={{ textDecoration: t.done ? "line-through" : "none" }}>{t.title}</strong>
                      </div>
                      <p>{t.notes}</p>
                      <p className="muted">Due: {t.dueDate ?? "n/a"}</p>
                      <button
                        className="secondary"
                        onClick={() =>
                          setState({
                            ...state,
                            todos: state.todos.filter((x) => x.id !== t.id)
                          })
                        }
                      >
                        Delete
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ManualLibrary({
  state,
  setState
}: {
  state: AppState;
  setState: (next: AppState) => void;
}) {
  const [q, setQ] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Manual");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [source, setSource] = useState("");

  const filtered = state.manuals.filter((m) =>
    [m.title, m.type, m.source, m.tags.join(" ")].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <section className="grid two-col">
      <div className="panel">
        <h2>Search and Browse Manuals</h2>
        <label>Search</label>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="YGM20F, impeller, fuel, wiring..." />
        <div className="list" style={{ marginTop: "0.7rem" }}>
          {filtered.map((m) => (
            <div className="item" key={m.id}>
              <h4>{m.title}</h4>
              <p>
                {m.type} | Source: {m.source}
              </p>
              <p className="muted">Tags: {m.tags.join(", ")}</p>
              <div className="row">
                <a href={m.url} target="_blank" rel="noreferrer">
                  <button>Open Link</button>
                </a>
                <button
                  className="secondary"
                  onClick={() => setState({ ...state, manuals: state.manuals.filter((x) => x.id !== m.id) })}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <h2>Add Manual/Reference Link</h2>
        <div className="stack">
          <div>
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label>Type</label>
            <input value={type} onChange={(e) => setType(e.target.value)} />
          </div>
          <div>
            <label>URL</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div>
            <label>Source</label>
            <input value={source} onChange={(e) => setSource(e.target.value)} />
          </div>
          <div>
            <label>Tags (comma separated)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <button
            onClick={() => {
              if (!title.trim() || !url.trim()) return;
              setState({
                ...state,
                manuals: [
                  ...state.manuals,
                  {
                    id: uid(),
                    title,
                    type,
                    url,
                    source: source || "Owner",
                    tags: tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                  }
                ]
              });
              setTitle("");
              setUrl("");
              setTags("");
            }}
          >
            Add Link
          </button>
        </div>
      </div>
    </section>
  );
}

function SpecsPanel({
  state,
  setState
}: {
  state: AppState;
  setState: (next: AppState) => void;
}) {
  const [section, setSection] = useState("Rigging");
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [source, setSource] = useState("");

  const sections = Array.from(new Set(state.specs.map((s) => s.section)));

  return (
    <section className="grid two-col">
      <div className="panel">
        <h2>J/105 Specifications</h2>
        <p className="muted">Seeded from J/Boats references; edit/add as needed for your exact boat setup.</p>
        {sections.map((s) => (
          <div key={s} className="item">
            <h3>{s}</h3>
            <div className="list">
              {state.specs
                .filter((x) => x.section === s)
                .map((x) => (
                  <div key={x.id} className="item">
                    <strong>{x.key}</strong>: {x.value}
                    <div className="muted">Source: {x.source}</div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      <div className="panel">
        <h2>Add Spec Line</h2>
        <div className="stack">
          <div>
            <label>Section</label>
            <input value={section} onChange={(e) => setSection(e.target.value)} />
          </div>
          <div>
            <label>Key</label>
            <input value={key} onChange={(e) => setKey(e.target.value)} />
          </div>
          <div>
            <label>Value</label>
            <input value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div>
            <label>Source</label>
            <input value={source} onChange={(e) => setSource(e.target.value)} />
          </div>
          <button
            onClick={() => {
              if (!key.trim() || !value.trim()) return;
              setState({
                ...state,
                specs: [...state.specs, { id: uid(), section, key, value, source: source || "Owner notes" }]
              });
              setKey("");
              setValue("");
            }}
          >
            Add Spec
          </button>
        </div>
      </div>
    </section>
  );
}

function RegattasPanel({
  state,
  setState
}: {
  state: AppState;
  setState: (next: AppState) => void;
}) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(addDays(todayIso(), 21));
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <section className="grid two-col">
      <div className="panel">
        <h2>Add Regatta</h2>
        <div className="stack">
          <div>
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>Date</label>
            <input value={date} type="date" onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label>Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <label>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button
            onClick={() => {
              if (!name.trim()) return;
              setState({
                ...state,
                regattas: [...state.regattas, { id: uid(), name, date, location, notes, crew: [] }]
              });
              setName("");
              setLocation("");
              setNotes("");
            }}
          >
            Add Regatta
          </button>
        </div>
      </div>
      <div className="panel">
        <h2>Regatta Planner</h2>
        <div className="list">
          {state.regattas.length === 0 && <div className="muted">No regattas planned yet.</div>}
          {state.regattas
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((r) => (
              <RegattaCard key={r.id} regatta={r} state={state} setState={setState} />
            ))}
        </div>
      </div>
    </section>
  );
}

function RegattaCard({
  regatta,
  state,
  setState
}: {
  regatta: RegattaItem;
  state: AppState;
  setState: (next: AppState) => void;
}) {
  const [crewName, setCrewName] = useState("");
  const [crewStatus, setCrewStatus] = useState<CrewStatus>("Tentative");
  const flags = getRegattaMaintenanceFlags(state, regatta.date);

  return (
    <div className="item">
      <h3>
        {regatta.name} ({regatta.date})
      </h3>
      <p>{regatta.location}</p>
      <p>{regatta.notes}</p>
      <div className="item">
        <strong>Maintenance risk by race date</strong>
        <div className="list">
          {flags.length === 0 && <div className="chip upcoming">No known service conflicts</div>}
          {flags.map((f, i) => (
            <div key={i} className="chip overdue">
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="item">
        <strong>Crew</strong>
        <div className="row">
          {crewStatuses.map((s) => (
            <div key={s} className="chip">
              {s}: {regatta.crew.filter((c) => c.status === s).length}
            </div>
          ))}
        </div>
        <div className="list" style={{ marginTop: "0.5rem" }}>
          {regatta.crew.map((c) => (
            <div key={c.id} className="row item">
              <strong>{c.name}</strong>
              <select
                style={{ width: "180px" }}
                value={c.status}
                onChange={(e) =>
                  setState({
                    ...state,
                    regattas: state.regattas.map((r) =>
                      r.id === regatta.id
                        ? {
                            ...r,
                            crew: r.crew.map((x) =>
                              x.id === c.id ? { ...x, status: e.target.value as CrewStatus } : x
                            )
                          }
                        : r
                    )
                  })
                }
              >
                {crewStatuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <button
                className="secondary"
                onClick={() =>
                  setState({
                    ...state,
                    regattas: state.regattas.map((r) =>
                      r.id === regatta.id ? { ...r, crew: r.crew.filter((x) => x.id !== c.id) } : r
                    )
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="row">
        <input
          placeholder="Crew name"
          value={crewName}
          onChange={(e) => setCrewName(e.target.value)}
          style={{ maxWidth: "240px" }}
        />
        <select value={crewStatus} onChange={(e) => setCrewStatus(e.target.value as CrewStatus)} style={{ width: "160px" }}>
          {crewStatuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={() => {
            if (!crewName.trim()) return;
            setState({
              ...state,
              regattas: state.regattas.map((r) =>
                r.id === regatta.id
                  ? { ...r, crew: [...r.crew, { id: uid(), name: crewName, status: crewStatus }] }
                  : r
              )
            });
            setCrewName("");
          }}
        >
          Add Crew
        </button>
        <button
          className="secondary"
          onClick={() => setState({ ...state, regattas: state.regattas.filter((x) => x.id !== regatta.id) })}
        >
          Delete Regatta
        </button>
      </div>
    </div>
  );
}
