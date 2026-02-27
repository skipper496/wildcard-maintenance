import { AppState } from "./types";

export interface RemoteStateResponse {
  state: AppState;
  mode?: string;
  warning?: string;
}

export const fetchRemoteState = async (): Promise<RemoteStateResponse> => {
  const res = await fetch("/api/state", { method: "GET", cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load state (${res.status})`);
  }
  return (await res.json()) as RemoteStateResponse;
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
