/**
 * Source de temps (PORT). Le domaine reste pur : il ne lit jamais l'horloge
 * système directement, il reçoit « maintenant » via cette abstraction.
 */
export interface ClockPort {
  /** Instant courant en millisecondes epoch. */
  now(): number;
}
