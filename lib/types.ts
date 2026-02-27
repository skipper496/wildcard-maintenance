export type TodoCategory =
  | "Engine"
  | "Sailing"
  | "Electronics"
  | "Hull and Fittings"
  | "Safety"
  | "Other";

export type CrewStatus = "Confirmed" | "Tentative" | "Out";

export interface MaintenanceLogEntry {
  id: string;
  date: string;
  engineHours: number | null;
  system: string;
  task: string;
  notes: string;
}

export interface ServiceInterval {
  id: string;
  system: string;
  task: string;
  dueEveryDays: number | null;
  dueEveryHours: number | null;
  lastDoneDate: string | null;
  lastDoneHours: number | null;
}

export interface TodoItem {
  id: string;
  category: TodoCategory;
  title: string;
  notes: string;
  dueDate: string | null;
  done: boolean;
}

export interface ManualItem {
  id: string;
  title: string;
  type: string;
  viewerUrl: string;
  sourceUrl: string;
  tags: string[];
  source: string;
}

export interface SpecItem {
  id: string;
  section: string;
  key: string;
  value: string;
  source: string;
}

export interface CrewPerson {
  id: string;
  name: string;
  status: CrewStatus;
}

export interface RegattaItem {
  id: string;
  name: string;
  date: string;
  location: string;
  notes: string;
  websiteUrl: string;
  registered: boolean;
  crew: CrewPerson[];
}

export interface BoatWeightEntry {
  id: string;
  date: string;
  weightLb: number;
  notes: string;
}

export interface AppState {
  maintenanceLogs: MaintenanceLogEntry[];
  serviceIntervals: ServiceInterval[];
  todos: TodoItem[];
  manuals: ManualItem[];
  specs: SpecItem[];
  regattas: RegattaItem[];
  boatWeights: BoatWeightEntry[];
}
