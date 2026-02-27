"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { computeIntervalStatuses, getRegattaMaintenanceFlags } from "@/lib/logic";
import { loadLocalCache, saveLocalCache } from "@/lib/local-cache";
import { fetchRemoteState, saveRemoteState } from "@/lib/remote";
import { defaultState } from "@/lib/seed";
import { AppState, CrewStatus, RegattaItem, TodoCategory } from "@/lib/types";
import { WeatherDay } from "@/lib/weather";
import { addDays, todayIso, uid } from "@/lib/utils";

type Tab = "Dashboard" | "Maintenance" | "Service" | "To-Do" | "Manuals" | "Specs" | "Regattas";
const tabs: Tab[] = ["Dashboard", "Maintenance", "Service", "To-Do", "Manuals", "Specs", "Regattas"];
const categories: TodoCategory[] = ["Engine", "Sailing", "Electronics", "Hull and Fittings", "Safety", "Other"];
const crewStatuses: CrewStatus[] = ["Confirmed", "Tentative", "Out"];
const EDIT_PASSWORD = "496";

type CalendarEvent = { label: string; kind: "regatta" | "service" | "todo" };

function normalizeState(raw: Partial<AppState> | null | undefined): AppState {
  const base = raw ?? {};
  const manualIds = new Set(defaultState.manuals.map((m) => m.id));
  const persistedManuals = (base.manuals ?? [])
    .filter((m: any) => manualIds.has(m.id))
    .map((m: any) => ({
      ...m,
      viewerUrl: m.viewerUrl ?? m.url ?? "",
      sourceUrl: m.sourceUrl ?? m.url ?? m.viewerUrl ?? ""
    }));
  return {
    maintenanceLogs: base.maintenanceLogs ?? defaultState.maintenanceLogs,
    serviceIntervals: base.serviceIntervals ?? defaultState.serviceIntervals,
    todos: base.todos ?? defaultState.todos,
    manuals: persistedManuals.length === defaultState.manuals.length ? persistedManuals : defaultState.manuals,
    specs: base.specs ?? defaultState.specs,
    regattas: (base.regattas ?? defaultState.regattas).map((r: any) => ({
      ...r,
      websiteUrl: r.websiteUrl ?? "",
      registered: Boolean(r.registered),
      crew: r.crew ?? []
    })),
    boatWeights: base.boatWeights ?? []
  };
}

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

function withinDays(dateIso: string, days: number) {
  const now = new Date(todayIso());
  const d = new Date(dateIso);
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [state, setState] = useState<AppState>(defaultState);
  const [anchor, setAnchor] = useState(todayIso());
  const [loaded, setLoaded] = useState(false);
  const [syncMode, setSyncMode] = useState<"cloud" | "local">("cloud");
  const [syncNote, setSyncNote] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [weather, setWeather] = useState<WeatherDay[]>([]);
  const [weatherError, setWeatherError] = useState("");
  const [isEditor, setIsEditor] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [manualQuery, setManualQuery] = useState("");
  const [selectedManual, setSelectedManual] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? window.sessionStorage.getItem("wm-editor") : null;
    setIsEditor(token === "1");
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const remote = await fetchRemoteState();
        if (!active) return;
        setState(normalizeState(remote.state));
        if (remote.mode === "fallback") {
          setSyncMode("local");
          setSyncNote("Cloud store not configured yet. Running in local browser mode.");
        }
      } catch {
        if (!active) return;
        setState(normalizeState(loadLocalCache()));
        setSyncMode("local");
        setSyncNote("Cloud sync unavailable. Loaded local browser cache.");
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/weather", { cache: "no-store" });
        if (!res.ok) throw new Error(`Weather request failed (${res.status})`);
        const data = await res.json();
        if (active) setWeather(Array.isArray(data.days) ? data.days : []);
      } catch (error) {
        if (active) setWeatherError(error instanceof Error ? error.message : "Unable to load forecast.");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      if (syncMode === "cloud") {
        try {
          setSaveStatus("saving");
          await saveRemoteState(state);
          setSaveStatus("saved");
          return;
        } catch {
          setSyncMode("local");
          setSyncNote("Cloud save failed. Using local browser cache.");
        }
      }
      saveLocalCache(state);
      setSaveStatus("saved");
    }, 400);
    return () => clearTimeout(t);
  }, [state, loaded, syncMode]);

  const statuses = useMemo(() => computeIntervalStatuses(state), [state]);
  const regattasSoon = useMemo(
    () => state.regattas.filter((r) => withinDays(r.date, 90)).sort((a, b) => a.date.localeCompare(b.date)),
    [state.regattas]
  );
  const nextRaceDate = regattasSoon[0]?.date ?? null;
  const maintenanceRacing = useMemo(() => {
    const oneMonth = addDays(todayIso(), 30);
    return statuses.filter((s) => s.status === "overdue" || s.status === "due" || (s.dueDate && (s.dueDate <= oneMonth || (nextRaceDate && s.dueDate <= nextRaceDate))));
  }, [statuses, nextRaceDate]);
  const latestHours = useMemo(() => {
    const values = state.maintenanceLogs.map((x) => x.engineHours).filter((x): x is number => typeof x === "number");
    return values.length ? Math.max(...values) : null;
  }, [state.maintenanceLogs]);
  const { cells, title } = useMemo(() => monthCells(anchor), [anchor]);
  const calendarEvents = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    state.regattas.forEach((r) => {
      const list = map.get(r.date) ?? [];
      list.push({ label: `Regatta: ${r.name}`, kind: "regatta" });
      map.set(r.date, list);
    });
    statuses.forEach((s) => {
      if (!s.dueDate) return;
      const list = map.get(s.dueDate) ?? [];
      list.push({ label: `Service: ${s.interval.task}`, kind: "service" });
      map.set(s.dueDate, list);
    });
    state.todos.filter((t) => !!t.dueDate && !t.done).forEach((t) => {
      const list = map.get(t.dueDate as string) ?? [];
      list.push({ label: `To-Do: ${t.title}`, kind: "todo" });
      map.set(t.dueDate as string, list);
    });
    return map;
  }, [state.regattas, state.todos, statuses]);

  const manualsFiltered = state.manuals.filter((m) =>
    [m.title, m.type, m.source, m.tags.join(" ")].join(" ").toLowerCase().includes(manualQuery.toLowerCase())
  );
  const currentManual = manualsFiltered.find((m) => m.id === selectedManual) ?? manualsFiltered[0];

  const guardedSetState = (updater: () => void) => {
    if (!isEditor) {
      setShowLogin(true);
      return;
    }
    updater();
  };

  return (
    <main className="shell">
      <div className="top">
        <div className="top-row">
          <div>
            <h1>Wildcard J/105 #496</h1>
          </div>
          <div className="row">
            <img className="brand-mark" src="/assets/j105-logo.png" alt="J/105 logo" />
            <img className="brand-mark" src="/assets/stfyc-burgee.svg" alt="StFYC burgee" />
            <button
              className={isEditor ? "secondary" : ""}
              onClick={() => {
                if (isEditor) {
                  window.sessionStorage.removeItem("wm-editor");
                  setIsEditor(false);
                } else {
                  setShowLogin((v) => !v);
                }
              }}
            >
              {isEditor ? "Log Out" : "Login"}
            </button>
          </div>
        </div>
        {showLogin && !isEditor && (
          <div className="login-box">
            <label>Editor password</label>
            <div className="row">
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
              <button onClick={() => {
                if (passwordInput === EDIT_PASSWORD) {
                  window.sessionStorage.setItem("wm-editor", "1");
                  setIsEditor(true);
                  setShowLogin(false);
                  setPasswordInput("");
                  setAuthError("");
                } else {
                  setAuthError("Incorrect password.");
                }
              }}>Unlock</button>
            </div>
            {authError && <div className="chip overdue">{authError}</div>}
          </div>
        )}
      </div>

      <section className="panel" style={{ marginBottom: "1rem" }}>
        <div className="row">
          <span className={`chip ${syncMode === "cloud" ? "upcoming" : "due"}`}>{syncMode === "cloud" ? "Cloud Sync" : "Local Mode"}</span>
          <span className={`chip ${saveStatus === "saving" ? "due" : "upcoming"}`}>{saveStatus === "saving" ? "Saving" : "Saved"}</span>
          {syncNote && <span className="muted">{syncNote}</span>}
        </div>
      </section>

      <div className="tabs">
        {tabs.map((t) => <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      {tab === "Dashboard" && (
        <section className="grid two-col">
          <div className="panel">
            <h2>Upcoming Regattas (3 months)</h2>
            <div className="list">
              {regattasSoon.length === 0 && <div className="muted">No regattas scheduled.</div>}
              {regattasSoon.map((r) => {
                const confirmed = r.crew.filter((c) => c.status === "Confirmed").length + 1;
                return (
                  <div className="item" key={r.id}>
                    <h4>{r.name} ({r.date})</h4>
                    <p>{r.location}</p>
                    <div className="row">
                      <span className={`chip ${confirmed >= 6 ? "upcoming" : "due"}`}>Crew incl. you: {confirmed}/6</span>
                      {r.registered ? <span className="chip upcoming">Registered</span> : <span className="chip due">Not registered</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="panel">
            <h2>Maintenance Due for Racing</h2>
            <p className="muted">Within 1 month, before race, or already due/overdue.</p>
            <div className="list">
              {maintenanceRacing.length === 0 && <div className="chip upcoming">No immediate service risks.</div>}
              {maintenanceRacing.map((s) => (
                <div key={s.interval.id} className="item">
                  <div className={`chip ${s.status}`}>{s.status.toUpperCase()}</div>
                  <h4>{s.interval.task}</h4>
                  <p className="muted">{s.message || "Check timeline."}</p>
                </div>
              ))}
            </div>
            <div className="item"><strong>Current engine hours:</strong> {latestHours ?? "Not set"}</div>
          </div>
          <div className="panel" style={{ gridColumn: "1 / -1" }}>
            <h2>Class and Club Links</h2>
            <div className="row">
              <a href="https://j105.org" target="_blank" rel="noreferrer"><button className="ghost">National J/105 Class</button></a>
              <a href="https://j105sf.com" target="_blank" rel="noreferrer"><button className="ghost">SF Fleet 1</button></a>
              <a href="https://www.stfyc.com" target="_blank" rel="noreferrer"><button className="ghost">St. Francis YC</button></a>
            </div>
          </div>
          <div className="panel" style={{ gridColumn: "1 / -1" }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h2 style={{ margin: 0 }}>1-Week Weather Snapshot (Pier 39)</h2>
              <Link href="/sources" className="muted">Sources</Link>
            </div>
            {weatherError && <div className="chip overdue">{weatherError}</div>}
            {!weatherError && (
              <div className="table-wrap">
                <table className="compact-table">
                  <thead><tr><th>Day</th><th>Temp</th><th>Wind</th><th>Sunrise/Sunset</th><th>High/Low Tide</th></tr></thead>
                  <tbody>
                    {weather.map((d) => (
                      <tr key={d.date}>
                        <td>{new Date(d.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</td>
                        <td>{d.tempHighF ?? "-"} / {d.tempLowF ?? "-"} F</td>
                        <td>{d.windMaxKts ?? "-"} kts @{d.windDirDeg ?? "-"}°</td>
                        <td>{d.sunrise ?? "-"} / {d.sunset ?? "-"}</td>
                        <td>H {d.highTide ?? "-"} / L {d.lowTide ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === "Maintenance" && (
        <section className="grid two-col">
          <SimpleLogPanel state={state} setState={setState} guardedSetState={guardedSetState} />
        </section>
      )}

      {tab === "Service" && (
        <section className="panel">
          <h2>Service Timelines</h2>
          <div className="row">
            <a href="https://www.dieselpartsdirect.com" target="_blank" rel="noreferrer">
              <button className="ghost">Diesel Parts Direct</button>
            </a>
          </div>
          {!isEditor && <div className="chip due">Read-only mode.</div>}
          <div className="list">
            {statuses.map((s) => (
              <div key={s.interval.id} className="item">
                <div className={`chip ${s.status}`}>{s.status.toUpperCase()}</div>
                <h4>{s.interval.system}: {s.interval.task}</h4>
                <p className="muted">{s.message || "No schedule details."}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "To-Do" && (
        <section className="grid two-col">
          <div className="panel">
            <h2>Project To-Dos</h2>
            {!isEditor && <div className="chip due">Read-only mode.</div>}
            <div className="list">
              {state.todos.map((t) => (
                <div key={t.id} className="item">
                  <strong>{t.title}</strong>
                  <p>{t.category} | Due: {t.dueDate ?? "n/a"}</p>
                  <p>{t.notes}</p>
                  <button onClick={() => guardedSetState(() => setState({ ...state, todos: state.todos.map((x) => x.id === t.id ? { ...x, done: !x.done } : x) }))}>
                    {t.done ? "Mark Open" : "Mark Done"}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <h2>Add To-Do</h2>
            <TodoComposer state={state} setState={setState} categories={categories} guardedSetState={guardedSetState} />
          </div>
        </section>
      )}

      {tab === "Manuals" && (
        <section className="panel">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h2>Manual Viewer</h2>
            <a href="https://www.dieselpartsdirect.com" target="_blank" rel="noreferrer">
              <button className="ghost">Diesel Parts Direct</button>
            </a>
          </div>
          <div className="row">
            <input placeholder="Search manuals..." value={manualQuery} onChange={(e) => setManualQuery(e.target.value)} />
          </div>
          <div className="row" style={{ marginTop: "0.5rem" }}>
            {manualsFiltered.map((m) => (
              <button key={m.id} className="ghost" onClick={() => setSelectedManual(m.id)}>{m.title}</button>
            ))}
          </div>
          {currentManual && (
            <div className="item" style={{ marginTop: "0.75rem" }}>
              <h3>{currentManual.title}</h3>
              <div className="pdf-wrap fullscreen"><iframe src={currentManual.viewerUrl} title={currentManual.title} /></div>
              <p className="muted">Citation: <a href={currentManual.sourceUrl} target="_blank" rel="noreferrer">{currentManual.sourceUrl}</a></p>
            </div>
          )}
        </section>
      )}

      {tab === "Specs" && (
        <section className="panel">
          <h2>J/105 Specifications</h2>
          <img className="rigging-large" src="/assets/j105-running-rigging.jpg" alt="J/105 running rigging" />
          <div className="spec-grid">
            {state.specs.map((s) => (
              <div key={s.id} className="spec-card">
                <div className="spec-sec">{s.section}</div>
                <div className="spec-key">{s.key}</div>
                <div className="spec-val">{s.value}</div>
                <div className="spec-src">{s.source}</div>
              </div>
            ))}
          </div>
          <details className="weight-lite">
            <summary>Boat weight log</summary>
            <WeightComposer state={state} setState={setState} guardedSetState={guardedSetState} />
          </details>
        </section>
      )}

      {tab === "Regattas" && (
        <section className="grid two-col">
          <div className="panel">
            <h2>Regattas</h2>
            <RegattaComposer state={state} setState={setState} guardedSetState={guardedSetState} />
            <div className="list" style={{ marginTop: "0.8rem" }}>
              {state.regattas.slice().sort((a, b) => a.date.localeCompare(b.date)).map((r) => (
                <RegattaCard key={r.id} regatta={r} state={state} setState={setState} guardedSetState={guardedSetState} />
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="row">
              <h2 style={{ margin: 0 }}>{title}</h2>
              <button className="ghost" onClick={() => { const d = new Date(anchor); d.setMonth(d.getMonth() - 1); setAnchor(d.toISOString().slice(0, 10)); }}>Previous</button>
              <button className="ghost" onClick={() => { const d = new Date(anchor); d.setMonth(d.getMonth() + 1); setAnchor(d.toISOString().slice(0, 10)); }}>Next</button>
            </div>
            <div className="calendar">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="muted" style={{ fontWeight: 700 }}>{d}</div>)}
              {cells.map((c) => (
                <div key={c.date + c.day} className={`cell ${c.inMonth ? "" : "other-month"}`}>
                  <div className="day">{c.day}</div>
                  {(calendarEvents.get(c.date) ?? []).slice(0, 3).map((e, i) => <div key={i} className={`event ${e.kind}`}>{e.label}</div>)}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function SimpleLogPanel({ state, setState, guardedSetState }: { state: AppState; setState: (v: AppState) => void; guardedSetState: (cb: () => void) => void }) {
  const [date, setDate] = useState(todayIso());
  const [engineHours, setEngineHours] = useState("");
  const [system, setSystem] = useState("Engine");
  const [task, setTask] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <>
      <div className="panel">
        <h2>Add Maintenance Log</h2>
        <div className="stack">
          <div><label>Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label>Engine Hours</label><input type="number" value={engineHours} onChange={(e) => setEngineHours(e.target.value)} /></div>
          <div><label>System</label><input value={system} onChange={(e) => setSystem(e.target.value)} /></div>
          <div><label>Task</label><input value={task} onChange={(e) => setTask(e.target.value)} /></div>
          <div><label>Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          <button onClick={() => guardedSetState(() => {
            if (!task.trim()) return;
            setState({ ...state, maintenanceLogs: [{ id: uid(), date, engineHours: engineHours ? Number(engineHours) : null, system, task, notes }, ...state.maintenanceLogs] });
            setTask("");
            setNotes("");
          })}>Add</button>
        </div>
      </div>
      <div className="panel">
        <h2>History</h2>
        <div className="list">
          {state.maintenanceLogs.slice().sort((a, b) => b.date.localeCompare(a.date)).map((l) => (
            <div key={l.id} className="item">
              <strong>{l.date} | {l.system}</strong>
              <p>{l.task}</p>
              <p className="muted">Hours: {l.engineHours ?? "n/a"}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function TodoComposer({ state, setState, categories, guardedSetState }: { state: AppState; setState: (v: AppState) => void; categories: TodoCategory[]; guardedSetState: (cb: () => void) => void }) {
  const [category, setCategory] = useState<TodoCategory>("Engine");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  return (
    <div className="stack">
      <div><label>Category</label><select value={category} onChange={(e) => setCategory(e.target.value as TodoCategory)}>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>
      <div><label>Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div><label>Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
      <div><label>Due Date</label><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
      <button onClick={() => guardedSetState(() => {
        if (!title.trim()) return;
        setState({ ...state, todos: [{ id: uid(), category, title, notes, dueDate: dueDate || null, done: false }, ...state.todos] });
        setTitle("");
      })}>Add To-Do</button>
    </div>
  );
}

function WeightComposer({ state, setState, guardedSetState }: { state: AppState; setState: (v: AppState) => void; guardedSetState: (cb: () => void) => void }) {
  const [date, setDate] = useState(todayIso());
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <div className="stack">
      <div><label>Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
      <div><label>Weight (lb)</label><input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} /></div>
      <div><label>Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
      <button onClick={() => guardedSetState(() => {
        if (!weight) return;
        setState({ ...state, boatWeights: [{ id: uid(), date, weightLb: Number(weight), notes }, ...state.boatWeights] });
        setWeight("");
      })}>Log Weight</button>
      <div className="list">
        {state.boatWeights.slice().sort((a, b) => b.date.localeCompare(a.date)).map((w) => (
          <div key={w.id} className="item"><strong>{w.date}</strong>: {w.weightLb} lb<div className="muted">{w.notes}</div></div>
        ))}
      </div>
    </div>
  );
}

function RegattaComposer({ state, setState, guardedSetState }: { state: AppState; setState: (v: AppState) => void; guardedSetState: (cb: () => void) => void }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(addDays(todayIso(), 21));
  const [location, setLocation] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <div className="stack">
      <div><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div><label>Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
      <div><label>Location</label><input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
      <div><label>Website</label><input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." /></div>
      <div><label>Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
      <button onClick={() => guardedSetState(() => {
        if (!name.trim()) return;
        setState({ ...state, regattas: [...state.regattas, { id: uid(), name, date, location, notes, websiteUrl, registered: false, crew: [] }] });
        setName("");
      })}>Add Regatta</button>
    </div>
  );
}

function RegattaCard({ regatta, state, setState, guardedSetState }: { regatta: RegattaItem; state: AppState; setState: (v: AppState) => void; guardedSetState: (cb: () => void) => void }) {
  const [crewName, setCrewName] = useState("");
  const [crewStatus, setCrewStatus] = useState<CrewStatus>("Tentative");
  const flags = getRegattaMaintenanceFlags(state, regatta.date);
  return (
    <div className="item">
      <h4>{regatta.name} ({regatta.date})</h4>
      <p>{regatta.location}</p>
      <div className="row">
        {regatta.websiteUrl && <a href={regatta.websiteUrl} target="_blank" rel="noreferrer"><button className="ghost">Website</button></a>}
        <button onClick={() => guardedSetState(() => setState({ ...state, regattas: state.regattas.map((r) => r.id === regatta.id ? { ...r, registered: !r.registered } : r) }))}>
          {regatta.registered ? "Registered" : "Mark Registered"}
        </button>
      </div>
      <div className="row">
        {crewStatuses.map((s) => <span key={s} className="chip">{s}: {regatta.crew.filter((c) => c.status === s).length}</span>)}
      </div>
      <div className="list">
        {flags.map((f, i) => <div key={i} className="chip overdue">{f}</div>)}
      </div>
      <div className="row">
        <button onClick={() => {
          if (regatta.crew.some((c) => c.name === "Owner (Me)")) return;
          setState({ ...state, regattas: state.regattas.map((r) => r.id === regatta.id ? { ...r, crew: [...r.crew, { id: uid(), name: "Owner (Me)", status: "Confirmed" }] } : r) });
        }}>Add Me (Confirmed)</button>
        <input placeholder="Crew name" value={crewName} onChange={(e) => setCrewName(e.target.value)} />
        <select value={crewStatus} onChange={(e) => setCrewStatus(e.target.value as CrewStatus)}>{crewStatuses.map((s) => <option key={s}>{s}</option>)}</select>
        <button onClick={() => guardedSetState(() => {
          if (!crewName.trim()) return;
          setState({ ...state, regattas: state.regattas.map((r) => r.id === regatta.id ? { ...r, crew: [...r.crew, { id: uid(), name: crewName, status: crewStatus }] } : r) });
          setCrewName("");
        })}>Add Crew</button>
      </div>
    </div>
  );
}
