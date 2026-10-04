// Talks to the workout-planner API (GET /api/workouts).

export type Exercise = { name: string; sets: number; reps: string };
export type Workout = { date: string; day: string; exercises: Exercise[] };
export type Week = { start: string; end: string; workouts: Workout[] };

export class AuthError extends Error {}

// Render's free tier can take up to a minute to wake up.
const TIMEOUT_MS = 75_000;

export async function fetchWeek(serverUrl: string, apiKey: string, anyDayInWeek: string): Promise<Week> {
  const url = `${serverUrl.replace(/\/+$/, '')}/api/workouts?week=${anyDayInWeek}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { 'X-API-Key': apiKey }, signal: controller.signal });
    if (res.status === 401) throw new AuthError('The API key was rejected. Check it in Settings.');
    if (!res.ok) throw new Error(`Server error (HTTP ${res.status}).`);
    return (await res.json()) as Week;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('The server took too long to answer. Is the Render service running?');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
