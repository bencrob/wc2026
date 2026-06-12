/** Utilisateur authentifié (projection minimale d'une identité Google via Supabase). */
export interface AuthUser {
  readonly id: string;
  readonly email: string;
}

/**
 * Authentification (compte unique via Google). LECTURE de session synchrone,
 * actions asynchrones. L'unicité du compte est garantie en amont par le
 * fournisseur (email unique) — ce port n'expose qu'un instantané + des actions.
 */
export interface AuthPort {
  /** Instantané synchrone de la session courante (null = anonyme). */
  currentUser(): AuthUser | null;
  /** Lance la connexion Google (redirection OAuth). */
  signInWithGoogle(): Promise<void>;
  /** Déconnecte l'utilisateur courant. */
  signOut(): Promise<void>;
  /** S'abonne aux changements de session ; renvoie une fonction de désabonnement. */
  onChange(cb: (user: AuthUser | null) => void): () => void;
}
