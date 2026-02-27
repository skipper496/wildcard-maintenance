export const todayIso = () => new Date().toISOString().slice(0, 10);

export const addDays = (dateIso: string, days: number): string => {
  const d = new Date(dateIso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const daysBetween = (fromIso: string, toIso: string): number => {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

export const uid = () =>
  Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
