/**
 * Renvoie `value` si elle est définie, sinon lève une erreur (échec rapide).
 * Remplace les assertions non-null `!` sur des invariants garantis (sans `!` ni `as`).
 */
export function required<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
  return value;
}
