export interface TradingSession {
  name: string;
  startHourUTC: number; // UTC hour (0-23)
  endHourUTC: number;   // UTC hour (0-23)
  color: string;        // RGBA color for background shading
}

export const SESSIONS: TradingSession[] = [
  { name: 'Asia', startHourUTC: 0, endHourUTC: 8, color: 'rgba(33, 150, 243, 0.1)' }, // 00:00 - 08:00 UTC
  { name: 'London', startHourUTC: 8, endHourUTC: 16, color: 'rgba(255, 152, 0, 0.1)' }, // 08:00 - 16:00 UTC
  { name: 'New York', startHourUTC: 13, endHourUTC: 22, color: 'rgba(156, 39, 176, 0.1)' } // 13:00 - 22:00 UTC (overlaps London)
];

/**
 * Determines the trading session for a given UTC timestamp.
 * @param utcTimestampSeconds UTC timestamp in seconds.
 * @returns The name of the session or null if no session matches.
 */
export function getSessionForTimestamp(utcTimestampSeconds: number): string | null {
  const date = new Date(utcTimestampSeconds * 1000); // Convert to milliseconds
  const utcHour = date.getUTCHours();

  for (const session of SESSIONS) {
    if (utcHour >= session.startHourUTC && utcHour < session.endHourUTC) {
      return session.name;
    }
  }
  return null;
}