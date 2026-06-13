import { Result } from '../validation/result';

/** Utilisateur authentifié (projection minimale d'une identité via Supabase). */
export interface AuthUser {
  readonly id: string;
  readonly email: string;
}

/**
 * Authentification (compte unique). LECTURE de session synchrone, actions
 * asynchrones. L'unicité du compte est garantie en amont par le fournisseur
 * (email unique), quel que soit le moyen de connexion (Google ou e-mail).
 */
export interface AuthPort {
  /** Instantané synchrone de la session courante (null = anonyme). */
  currentUser(): AuthUser | null;
  /** Lance la connexion Google (redirection OAuth). */
  signInWithGoogle(): Promise<void>;
  /**
   * Connexion par e-mail sans mot de passe : envoie un code à usage unique (OTP).
   * Idéal iOS/PWA car il n'y a aucune redirection (l'utilisateur reste dans l'app).
   */
  requestEmailCode(email: string): Promise<Result<void>>;
  /** Vérifie le code OTP reçu par e-mail et ouvre la session. */
  verifyEmailCode(email: string, code: string): Promise<Result<void>>;
  /** Déconnecte l'utilisateur courant. */
  signOut(): Promise<void>;
  /** S'abonne aux changements de session ; renvoie une fonction de désabonnement. */
  onChange(cb: (user: AuthUser | null) => void): () => void;
}
