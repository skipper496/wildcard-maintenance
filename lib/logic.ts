import { AppState, MaintenanceLogEntry, ServiceInterval } from "./types";
import { addDays, daysBetween, todayIso } from "./utils";

export type DueStatus = "upcoming" | "due" | "overdue";

export interface IntervalStatus {
  interval: ServiceInterval;
  status: DueStatus;
  message: string;
  dueDate: string | null;
  dueHours: number | null;
}

const parseHours = (logs: MaintenanceLogEntry[]): number | null => {
  const withHours = logs.filter((l) => typeof l.engineHours === "number");
  if (!withHours.length) return null;
  return Math.max(...withHours.map((l) => l.engineHours as number));
};

export const computeIntervalStatuses = (state: AppState): IntervalStatus[] => {
  const currentDate = todayIso();
  const currentHours = parseHours(state.maintenanceLogs);

  return state.serviceIntervals.map((interval) => {
    let dueDate: string | null = null;
    let dueHours: number | null = null;
    const reasons: string[] = [];
    let status: DueStatus = "upcoming";

    if (interval.dueEveryDays && interval.lastDoneDate) {
      dueDate = addDays(interval.lastDoneDate, interval.dueEveryDays);
      const daysLeft = daysBetween(currentDate, dueDate);
      if (daysLeft < 0) status = "overdue";
      else if (daysLeft <= 14) status = "due";
      reasons.push(daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`);
    } else if (interval.dueEveryDays && !interval.lastDoneDate) {
      status = "due";
      reasons.push("No last service date");
    }

    if (interval.dueEveryHours && typeof interval.lastDoneHours === "number") {
      dueHours = interval.lastDoneHours + interval.dueEveryHours;
      if (typeof currentHours === "number") {
        const hoursLeft = dueHours - currentHours;
        if (hoursLeft < 0) status = "overdue";
        else if (hoursLeft <= 10 && status !== "overdue") status = "due";
        reasons.push(hoursLeft < 0 ? `${Math.abs(hoursLeft)}h overdue` : `${hoursLeft}h left`);
      } else {
        reasons.push("No current engine hour reading");
      }
    } else if (interval.dueEveryHours && typeof interval.lastDoneHours !== "number") {
      status = "due";
      reasons.push("No last service hour reading");
    }

    return {
      interval,
      status,
      message: reasons.join(" | "),
      dueDate,
      dueHours
    };
  });
};

export const getRegattaMaintenanceFlags = (state: AppState, regattaDate: string): string[] => {
  const issues: string[] = [];
  const statuses = computeIntervalStatuses(state);

  for (const s of statuses) {
    if (s.dueDate && s.dueDate <= regattaDate) {
      issues.push(`${s.interval.task} due by ${s.dueDate}`);
    }
    if (s.status === "overdue") {
      issues.push(`${s.interval.task} is already overdue`);
    }
  }

  return Array.from(new Set(issues));
};
