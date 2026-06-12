import { MatchId, MatchSchedule } from '../models';

/**
 * Dates / stades / coups d'envoi officiels (calendrier FIFA 2026).
 * Clé = id de match. Les ids M1..M72 suivent l'ordre interne des poules
 * (cf. GROUP_FIXTURES), pas la numérotation officielle ; date+stade+kickoff
 * restent ceux du créneau réel.
 *
 * `kickoff` = heure officielle du coup d'envoi (ISO 8601 + fuseau) → verrou en écriture.
 * Offsets juin/juillet 2026 : ET = -04:00 · CDT (US) = -05:00 · CST (Mexique) = -06:00 · PT = -07:00.
 */
export const SCHEDULE: Readonly<Record<MatchId, MatchSchedule>> = {
  // ---- Phase de poules (M1..M72) ----
  M1: { date: '11 juin', venue: 'Estadio Azteca, Mexico', kickoff: '2026-06-11T13:00:00-06:00' },
  M2: { date: '11 juin', venue: 'Estadio Akron, Guadalajara' },
  M3: { date: '18 juin', venue: 'Estadio Akron, Guadalajara', kickoff: '2026-06-18T19:00:00-06:00' },
  M4: { date: '18 juin', venue: 'Mercedes-Benz Stadium, Atlanta', kickoff: '2026-06-18T12:00:00-04:00' },
  M5: { date: '24 juin', venue: 'Estadio Azteca, Mexico', kickoff: '2026-06-24T19:00:00-06:00' },
  M6: { date: '24 juin', venue: 'Estadio BBVA, Monterrey', kickoff: '2026-06-24T19:00:00-06:00' },
  M7: { date: '12 juin', venue: 'BMO Field, Toronto', kickoff: '2026-06-12T15:00:00-04:00' },
  M8: { date: '13 juin', venue: "Levi's Stadium, San Francisco", kickoff: '2026-06-13T12:00:00-07:00' },
  M9: { date: '18 juin', venue: 'BC Place, Vancouver', kickoff: '2026-06-18T15:00:00-07:00' },
  M10: { date: '18 juin', venue: 'SoFi Stadium, Los Angeles', kickoff: '2026-06-18T12:00:00-07:00' },
  M11: { date: '24 juin', venue: 'BC Place, Vancouver', kickoff: '2026-06-24T12:00:00-07:00' },
  M12: { date: '24 juin', venue: 'Lumen Field, Seattle', kickoff: '2026-06-24T12:00:00-07:00' },
  M13: { date: '13 juin', venue: 'MetLife Stadium, New York/NJ', kickoff: '2026-06-13T18:00:00-04:00' },
  M14: { date: '13 juin', venue: 'Gillette Stadium, Boston', kickoff: '2026-06-13T21:00:00-04:00' },
  M15: { date: '19 juin', venue: 'Lincoln Financial Field, Philadelphie', kickoff: '2026-06-19T20:30:00-04:00' },
  M16: { date: '19 juin', venue: 'Gillette Stadium, Boston', kickoff: '2026-06-19T18:00:00-04:00' },
  M17: { date: '24 juin', venue: 'Hard Rock Stadium, Miami', kickoff: '2026-06-24T18:00:00-04:00' },
  M18: { date: '24 juin', venue: 'Mercedes-Benz Stadium, Atlanta', kickoff: '2026-06-24T18:00:00-04:00' },
  M19: { date: '12 juin', venue: 'SoFi Stadium, Los Angeles', kickoff: '2026-06-12T18:00:00-07:00' },
  M20: { date: '13 juin', venue: 'BC Place, Vancouver', kickoff: '2026-06-13T18:00:00-07:00' },
  M21: { date: '19 juin', venue: 'Lumen Field, Seattle', kickoff: '2026-06-19T12:00:00-07:00' },
  M22: { date: '19 juin', venue: "Levi's Stadium, San Francisco", kickoff: '2026-06-19T21:00:00-07:00' },
  M23: { date: '25 juin', venue: 'SoFi Stadium, Los Angeles', kickoff: '2026-06-25T19:00:00-07:00' },
  M24: { date: '25 juin', venue: "Levi's Stadium, San Francisco", kickoff: '2026-06-25T19:00:00-07:00' },
  M25: { date: '14 juin', venue: 'NRG Stadium, Houston', kickoff: '2026-06-14T12:00:00-05:00' },
  M26: { date: '14 juin', venue: 'Lincoln Financial Field, Philadelphie', kickoff: '2026-06-14T19:00:00-04:00' },
  M27: { date: '20 juin', venue: 'BMO Field, Toronto', kickoff: '2026-06-20T16:00:00-04:00' },
  M28: { date: '20 juin', venue: 'Arrowhead Stadium, Kansas City', kickoff: '2026-06-20T19:00:00-05:00' },
  M29: { date: '25 juin', venue: 'MetLife Stadium, New York/NJ', kickoff: '2026-06-25T16:00:00-04:00' },
  M30: { date: '25 juin', venue: 'Lincoln Financial Field, Philadelphie', kickoff: '2026-06-25T16:00:00-04:00' },
  M31: { date: '14 juin', venue: 'AT&T Stadium, Dallas', kickoff: '2026-06-14T15:00:00-05:00' },
  M32: { date: '14 juin', venue: 'Estadio BBVA, Monterrey', kickoff: '2026-06-14T20:00:00-06:00' },
  M33: { date: '20 juin', venue: 'NRG Stadium, Houston', kickoff: '2026-06-20T12:00:00-05:00' },
  M34: { date: '20 juin', venue: 'Estadio BBVA, Monterrey', kickoff: '2026-06-20T22:00:00-06:00' },
  M35: { date: '25 juin', venue: 'Arrowhead Stadium, Kansas City', kickoff: '2026-06-25T18:00:00-05:00' },
  M36: { date: '25 juin', venue: 'AT&T Stadium, Dallas', kickoff: '2026-06-25T18:00:00-05:00' },
  M37: { date: '15 juin', venue: 'Lumen Field, Seattle' },
  M38: { date: '15 juin', venue: 'SoFi Stadium, Los Angeles', kickoff: '2026-06-15T18:00:00-07:00' },
  M39: { date: '21 juin', venue: 'SoFi Stadium, Los Angeles', kickoff: '2026-06-21T12:00:00-07:00' },
  M40: { date: '21 juin', venue: 'BC Place, Vancouver', kickoff: '2026-06-21T18:00:00-07:00' },
  M41: { date: '26 juin', venue: 'BC Place, Vancouver', kickoff: '2026-06-26T20:00:00-07:00' },
  M42: { date: '26 juin', venue: 'Lumen Field, Seattle', kickoff: '2026-06-26T20:00:00-07:00' },
  M43: { date: '15 juin', venue: 'Mercedes-Benz Stadium, Atlanta', kickoff: '2026-06-15T12:00:00-04:00' },
  M44: { date: '15 juin', venue: 'Hard Rock Stadium, Miami', kickoff: '2026-06-15T18:00:00-04:00' },
  M45: { date: '21 juin', venue: 'Mercedes-Benz Stadium, Atlanta', kickoff: '2026-06-21T12:00:00-04:00' },
  M46: { date: '21 juin', venue: 'Hard Rock Stadium, Miami', kickoff: '2026-06-21T18:00:00-04:00' },
  M47: { date: '26 juin', venue: 'Estadio Akron, Guadalajara', kickoff: '2026-06-26T18:00:00-06:00' },
  M48: { date: '26 juin', venue: 'NRG Stadium, Houston', kickoff: '2026-06-26T19:00:00-05:00' },
  M49: { date: '16 juin', venue: 'MetLife Stadium, New York/NJ', kickoff: '2026-06-16T15:00:00-04:00' },
  M50: { date: '16 juin', venue: 'Gillette Stadium, Boston', kickoff: '2026-06-16T18:00:00-04:00' },
  M51: { date: '22 juin', venue: 'Lincoln Financial Field, Philadelphie', kickoff: '2026-06-22T17:00:00-04:00' },
  M52: { date: '22 juin', venue: 'MetLife Stadium, New York/NJ', kickoff: '2026-06-22T20:00:00-04:00' },
  M53: { date: '26 juin', venue: 'Gillette Stadium, Boston', kickoff: '2026-06-26T15:00:00-04:00' },
  M54: { date: '26 juin', venue: 'BMO Field, Toronto', kickoff: '2026-06-26T15:00:00-04:00' },
  M55: { date: '16 juin', venue: 'Arrowhead Stadium, Kansas City', kickoff: '2026-06-16T20:00:00-05:00' },
  M56: { date: '16 juin', venue: "Levi's Stadium, San Francisco", kickoff: '2026-06-16T21:00:00-07:00' },
  M57: { date: '22 juin', venue: 'AT&T Stadium, Dallas', kickoff: '2026-06-22T12:00:00-05:00' },
  M58: { date: '22 juin', venue: "Levi's Stadium, San Francisco", kickoff: '2026-06-22T20:00:00-07:00' },
  M59: { date: '27 juin', venue: 'AT&T Stadium, Dallas', kickoff: '2026-06-27T21:00:00-05:00' },
  M60: { date: '27 juin', venue: 'Arrowhead Stadium, Kansas City', kickoff: '2026-06-27T21:00:00-05:00' },
  M61: { date: '17 juin', venue: 'NRG Stadium, Houston', kickoff: '2026-06-17T12:00:00-05:00' },
  M62: { date: '17 juin', venue: 'Estadio Azteca, Mexico', kickoff: '2026-06-17T20:00:00-06:00' },
  M63: { date: '23 juin', venue: 'NRG Stadium, Houston', kickoff: '2026-06-23T12:00:00-05:00' },
  M64: { date: '23 juin', venue: 'Estadio Akron, Guadalajara', kickoff: '2026-06-23T20:00:00-06:00' },
  M65: { date: '27 juin', venue: 'Hard Rock Stadium, Miami', kickoff: '2026-06-27T19:30:00-04:00' },
  M66: { date: '27 juin', venue: 'Mercedes-Benz Stadium, Atlanta', kickoff: '2026-06-27T19:30:00-04:00' },
  M67: { date: '17 juin', venue: 'AT&T Stadium, Dallas', kickoff: '2026-06-17T15:00:00-05:00' },
  M68: { date: '17 juin', venue: 'BMO Field, Toronto', kickoff: '2026-06-17T19:00:00-04:00' },
  M69: { date: '23 juin', venue: 'Gillette Stadium, Boston', kickoff: '2026-06-23T16:00:00-04:00' },
  M70: { date: '23 juin', venue: 'BMO Field, Toronto', kickoff: '2026-06-23T19:00:00-04:00' },
  M71: { date: '27 juin', venue: 'MetLife Stadium, New York/NJ', kickoff: '2026-06-27T17:00:00-04:00' },
  M72: { date: '27 juin', venue: 'Lincoln Financial Field, Philadelphie', kickoff: '2026-06-27T17:00:00-04:00' },
  // ---- 16es de finale (M73..M88) ----
  M73: { date: '28 juin', venue: 'SoFi Stadium, Los Angeles', kickoff: '2026-06-28T12:00:00-07:00' },
  M74: { date: '29 juin', venue: 'Gillette Stadium, Boston', kickoff: '2026-06-29T16:30:00-04:00' },
  M75: { date: '29 juin', venue: 'Estadio BBVA, Monterrey', kickoff: '2026-06-29T19:00:00-06:00' },
  M76: { date: '29 juin', venue: 'NRG Stadium, Houston', kickoff: '2026-06-29T12:00:00-05:00' },
  M77: { date: '30 juin', venue: 'MetLife Stadium, New York/NJ', kickoff: '2026-06-30T17:00:00-04:00' },
  M78: { date: '30 juin', venue: 'AT&T Stadium, Dallas', kickoff: '2026-06-30T12:00:00-05:00' },
  M79: { date: '30 juin', venue: 'Estadio Azteca, Mexico', kickoff: '2026-06-30T19:00:00-06:00' },
  M80: { date: '1ᵉʳ juillet', venue: 'Mercedes-Benz Stadium, Atlanta', kickoff: '2026-07-01T12:00:00-04:00' },
  M81: { date: '1ᵉʳ juillet', venue: "Levi's Stadium, San Francisco", kickoff: '2026-07-01T17:00:00-07:00' },
  M82: { date: '1ᵉʳ juillet', venue: 'Lumen Field, Seattle', kickoff: '2026-07-01T13:00:00-07:00' },
  M83: { date: '2 juillet', venue: 'BMO Field, Toronto', kickoff: '2026-07-02T19:00:00-04:00' },
  M84: { date: '2 juillet', venue: 'SoFi Stadium, Los Angeles', kickoff: '2026-07-02T12:00:00-07:00' },
  M85: { date: '2 juillet', venue: 'BC Place, Vancouver', kickoff: '2026-07-02T20:00:00-07:00' },
  M86: { date: '3 juillet', venue: 'Hard Rock Stadium, Miami', kickoff: '2026-07-03T18:00:00-04:00' },
  M87: { date: '3 juillet', venue: 'Arrowhead Stadium, Kansas City', kickoff: '2026-07-03T20:30:00-05:00' },
  M88: { date: '3 juillet', venue: 'AT&T Stadium, Dallas', kickoff: '2026-07-03T13:00:00-05:00' },
  // ---- 8es de finale (M89..M96) ----
  M89: { date: '4 juillet', venue: 'Lincoln Financial Field, Philadelphie', kickoff: '2026-07-04T17:00:00-04:00' },
  M90: { date: '4 juillet', venue: 'NRG Stadium, Houston', kickoff: '2026-07-04T12:00:00-05:00' },
  M91: { date: '5 juillet', venue: 'MetLife Stadium, New York/NJ', kickoff: '2026-07-05T16:00:00-04:00' },
  M92: { date: '5 juillet', venue: 'Estadio Azteca, Mexico', kickoff: '2026-07-05T18:00:00-06:00' },
  M93: { date: '6 juillet', venue: 'AT&T Stadium, Dallas', kickoff: '2026-07-06T14:00:00-05:00' },
  M94: { date: '6 juillet', venue: 'Lumen Field, Seattle', kickoff: '2026-07-06T17:00:00-07:00' },
  M95: { date: '7 juillet', venue: 'Mercedes-Benz Stadium, Atlanta', kickoff: '2026-07-07T12:00:00-04:00' },
  M96: { date: '7 juillet', venue: 'BC Place, Vancouver', kickoff: '2026-07-07T13:00:00-07:00' },
  // ---- Quarts (M97..M100) ----
  M97: { date: '9 juillet', venue: 'Gillette Stadium, Boston', kickoff: '2026-07-09T16:00:00-04:00' },
  M98: { date: '10 juillet', venue: 'SoFi Stadium, Los Angeles', kickoff: '2026-07-10T12:00:00-07:00' },
  M99: { date: '11 juillet', venue: 'Hard Rock Stadium, Miami', kickoff: '2026-07-11T17:00:00-04:00' },
  M100: { date: '11 juillet', venue: 'Arrowhead Stadium, Kansas City', kickoff: '2026-07-11T20:00:00-05:00' },
  // ---- Demies / 3e place / Finale ----
  M101: { date: '14 juillet', venue: 'AT&T Stadium, Dallas', kickoff: '2026-07-14T14:00:00-05:00' },
  M102: { date: '15 juillet', venue: 'Mercedes-Benz Stadium, Atlanta', kickoff: '2026-07-15T15:00:00-04:00' },
  M103: { date: '18 juillet', venue: 'Hard Rock Stadium, Miami', kickoff: '2026-07-18T17:00:00-04:00' },
  M104: { date: '19 juillet', venue: 'MetLife Stadium, New York/NJ', kickoff: '2026-07-19T15:00:00-04:00' },
};

/** Mois 2026 utilisés par les libellés de date (« 11 juin », « 1ᵉʳ juillet »). */
const MONTHS: ReadonlyMap<string, string> = new Map([
  ['juin', '06'],
  ['juillet', '07'],
]);

/**
 * Repli quand le coup d'envoi précis manque : début du jour du match
 * (00:00 fuseau hôte UTC-6) → le pronostic se verrouille dès le jour du match.
 */
function dayStartMs(date: string): number | undefined {
  const dayMatch = /^(\d+)/.exec(date.trim());
  const dayStr = dayMatch?.[1];
  if (dayStr === undefined) return undefined;
  const monthName = date.includes('juillet') ? 'juillet' : date.includes('juin') ? 'juin' : '';
  const month = MONTHS.get(monthName);
  if (month === undefined) return undefined;
  const ms = Date.parse(`2026-${month}-${dayStr.padStart(2, '0')}T00:00:00-06:00`);
  return Number.isNaN(ms) ? undefined : ms;
}

/** Coup d'envoi du match en ms epoch (kickoff précis, sinon repli début de journée). */
export function kickoffMsOf(id: MatchId): number | undefined {
  const entry = SCHEDULE[id];
  if (entry === undefined) return undefined;
  if (entry.kickoff !== undefined) {
    const ms = Date.parse(entry.kickoff);
    if (!Number.isNaN(ms)) return ms;
  }
  return dayStartMs(entry.date);
}
