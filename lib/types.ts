export type Mode = "chill" | "balanced" | "ambitious" | "beast";
export type Status = "active" | "paused" | "completed";
export type FormState = { error?: string; ok?: string } | undefined;

export interface Goal {
  id: string; user_id: string; name: string; description: string | null; icon: string;
  target_cents: number; target_date: string; status: Status; mode: Mode;
  created_at: string; completed_at: string | null; saved_cents: number;
}
export interface Tx {
  id: string; goal_id: string; amount_cents: number; kind: "contribution" | "correction";
  reverses_id: string | null; note: string | null; occurred_on: string; created_at: string;
}
export interface Profile { id: string; display_name: string | null; currency: string; timezone: string }
