import { GroupId, Team, TeamId } from '../models';

export const GROUPS: readonly GroupId[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
];

/**
 * Tirage final (5 déc. 2025). Ordre = ordre des chapeaux (cosmétique :
 * le classement réel est calculé d'après les résultats). Noms verrouillés.
 *
 * `fifaRank` = classement FIFA masculin (dernier connu avant la CDM 2026,
 * source https://inside.fifa.com/en/fifa-rankings). À ajuster si besoin —
 * donnée centralisée ici, affichée à côté des équipes.
 */
export const TEAMS: readonly Team[] = [
  { id: 'A1', name: 'Mexique', flag: '🇲🇽', groupId: 'A', fifaRank: 17 },
  { id: 'A2', name: 'Afrique du Sud', flag: '🇿🇦', groupId: 'A', fifaRank: 60 },
  { id: 'A3', name: 'Corée du Sud', flag: '🇰🇷', groupId: 'A', fifaRank: 23 },
  { id: 'A4', name: 'Tchéquie', flag: '🇨🇿', groupId: 'A', fifaRank: 43 },

  { id: 'B1', name: 'Canada', flag: '🇨🇦', groupId: 'B', fifaRank: 31 },
  { id: 'B2', name: 'Bosnie-Herz.', flag: '🇧🇦', groupId: 'B', fifaRank: 76 },
  { id: 'B3', name: 'Qatar', flag: '🇶🇦', groupId: 'B', fifaRank: 36 },
  { id: 'B4', name: 'Suisse', flag: '🇨🇭', groupId: 'B', fifaRank: 19 },

  { id: 'C1', name: 'Brésil', flag: '🇧🇷', groupId: 'C', fifaRank: 5 },
  { id: 'C2', name: 'Maroc', flag: '🇲🇦', groupId: 'C', fifaRank: 12 },
  { id: 'C3', name: 'Haïti', flag: '🇭🇹', groupId: 'C', fifaRank: 87 },
  { id: 'C4', name: 'Écosse', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', groupId: 'C', fifaRank: 44 },

  { id: 'D1', name: 'États-Unis', flag: '🇺🇸', groupId: 'D', fifaRank: 16 },
  { id: 'D2', name: 'Paraguay', flag: '🇵🇾', groupId: 'D', fifaRank: 54 },
  { id: 'D3', name: 'Australie', flag: '🇦🇺', groupId: 'D', fifaRank: 26 },
  { id: 'D4', name: 'Turquie', flag: '🇹🇷', groupId: 'D', fifaRank: 27 },

  { id: 'E1', name: 'Allemagne', flag: '🇩🇪', groupId: 'E', fifaRank: 9 },
  { id: 'E2', name: 'Curaçao', flag: '🇨🇼', groupId: 'E', fifaRank: 90 },
  { id: 'E3', name: "Côte d'Ivoire", flag: '🇨🇮', groupId: 'E', fifaRank: 41 },
  { id: 'E4', name: 'Équateur', flag: '🇪🇨', groupId: 'E', fifaRank: 24 },

  { id: 'F1', name: 'Pays-Bas', flag: '🇳🇱', groupId: 'F', fifaRank: 7 },
  { id: 'F2', name: 'Japon', flag: '🇯🇵', groupId: 'F', fifaRank: 15 },
  { id: 'F3', name: 'Suède', flag: '🇸🇪', groupId: 'F', fifaRank: 35 },
  { id: 'F4', name: 'Tunisie', flag: '🇹🇳', groupId: 'F', fifaRank: 49 },

  { id: 'G1', name: 'Belgique', flag: '🇧🇪', groupId: 'G', fifaRank: 8 },
  { id: 'G2', name: 'Égypte', flag: '🇪🇬', groupId: 'G', fifaRank: 33 },
  { id: 'G3', name: 'Iran', flag: '🇮🇷', groupId: 'G', fifaRank: 20 },
  { id: 'G4', name: 'Nouvelle-Zél.', flag: '🇳🇿', groupId: 'G', fifaRank: 86 },

  { id: 'H1', name: 'Espagne', flag: '🇪🇸', groupId: 'H', fifaRank: 1 },
  { id: 'H2', name: 'Cap-Vert', flag: '🇨🇻', groupId: 'H', fifaRank: 70 },
  { id: 'H3', name: 'Arabie saoud.', flag: '🇸🇦', groupId: 'H', fifaRank: 58 },
  { id: 'H4', name: 'Uruguay', flag: '🇺🇾', groupId: 'H', fifaRank: 14 },

  { id: 'I1', name: 'France', flag: '🇫🇷', groupId: 'I', fifaRank: 3 },
  { id: 'I2', name: 'Sénégal', flag: '🇸🇳', groupId: 'I', fifaRank: 18 },
  { id: 'I3', name: 'Irak', flag: '🇮🇶', groupId: 'I', fifaRank: 59 },
  { id: 'I4', name: 'Norvège', flag: '🇳🇴', groupId: 'I', fifaRank: 42 },

  { id: 'J1', name: 'Argentine', flag: '🇦🇷', groupId: 'J', fifaRank: 2 },
  { id: 'J2', name: 'Algérie', flag: '🇩🇿', groupId: 'J', fifaRank: 38 },
  { id: 'J3', name: 'Autriche', flag: '🇦🇹', groupId: 'J', fifaRank: 22 },
  { id: 'J4', name: 'Jordanie', flag: '🇯🇴', groupId: 'J', fifaRank: 62 },

  { id: 'K1', name: 'Portugal', flag: '🇵🇹', groupId: 'K', fifaRank: 6 },
  { id: 'K2', name: 'RD Congo', flag: '🇨🇩', groupId: 'K', fifaRank: 56 },
  { id: 'K3', name: 'Ouzbékistan', flag: '🇺🇿', groupId: 'K', fifaRank: 57 },
  { id: 'K4', name: 'Colombie', flag: '🇨🇴', groupId: 'K', fifaRank: 13 },

  { id: 'L1', name: 'Angleterre', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', groupId: 'L', fifaRank: 4 },
  { id: 'L2', name: 'Croatie', flag: '🇭🇷', groupId: 'L', fifaRank: 10 },
  { id: 'L3', name: 'Ghana', flag: '🇬🇭', groupId: 'L', fifaRank: 73 },
  { id: 'L4', name: 'Panama', flag: '🇵🇦', groupId: 'L', fifaRank: 46 },
];

export const TEAM_BY_ID: ReadonlyMap<TeamId, Team> = new Map(
  TEAMS.map((t) => [t.id, t]),
);

export const TEAMS_BY_GROUP: Readonly<Record<GroupId, readonly TeamId[]>> =
  GROUPS.reduce(
    (acc, g) => {
      acc[g] = TEAMS.filter((t) => t.groupId === g).map((t) => t.id);
      return acc;
    },
    {} as Record<GroupId, TeamId[]>,
  );

/** Nom d'équipe (ou null si id absent). */
export function teamName(id: TeamId | null | undefined): string | null {
  return id ? (TEAM_BY_ID.get(id)?.name ?? id) : null;
}

/** Drapeau d'équipe (chaîne vide si id absent). */
export function teamFlag(id: TeamId | null | undefined): string {
  return id ? (TEAM_BY_ID.get(id)?.flag ?? '') : '';
}

/** Classement FIFA d'une équipe (null si id absent). */
export function teamFifaRank(id: TeamId | null | undefined): number | null {
  return id ? (TEAM_BY_ID.get(id)?.fifaRank ?? null) : null;
}
