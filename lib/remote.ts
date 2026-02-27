import { AppState } from "./types";

export interface RemoteStateResponse {
  state: AppState;
}

export const fetchRemoteState = async (): Promise<AppState> => {
  const res = await fetch("/api/state", { method: "GET", cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load state (${res.status})`);
  }
  const data = (await res.json()) as RemoteStateResponse;
  return data.state;
};

export const saveRemoteState = async (state: AppState): Promise<void> => {
  const res = await fetch("/api/state", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state })
  });
  if (!res.ok) {
    throw new Error(`Failed to save state (${res.status})`);
  }
};
