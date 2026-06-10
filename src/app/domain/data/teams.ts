import { GroupId, Team, TeamId } from '../models';

export const GROUPS: readonly GroupId[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
];

/**
 * Tirage final (5 déc. 2025). Ordre = ordre des chapeaux (cosmétique :
 * le classement réel est calculé d'après les résultats). Noms verrouillés.
 */
export const TEAMS: readonly Team[] = [
  { id: 'A1', name: 'Mexique', flag: '🇲🇽', groupId: 'A' },
  { id: 'A2', name: 'Afrique du Sud', flag: '🇿🇦', groupId: 'A' },
  { id: 'A3', name: 'Corée du Sud', flag: '🇰🇷', groupId: 'A' },
  { id: 'A4', name: 'Tchéquie', flag: '🇨🇿', groupId: 'A' },

  { id: 'B1', name: 'Canada', flag: '🇨🇦', groupId: 'B' },
  { id: 'B2', name: 'Bosnie-Herz.', flag: '🇧🇦', groupId: 'B' },
  { id: 'B3', name: 'Qatar', flag: '🇶🇦', groupId: 'B' },
  { id: 'B4', name: 'Suisse', flag: '🇨🇭', groupId: 'B' },

  { id: 'C1', name: 'Brésil', flag: '🇧🇷', groupId: 'C' },
  { id: 'C2', name: 'Maroc', flag: '🇲🇦', groupId: 'C' },
  { id: 'C3', name: 'Haïti', flag: '🇭🇹', groupId: 'C' },
  { id: 'C4', name: 'Écosse', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', groupId: 'C' },

  { id: 'D1', name: 'États-Unis', flag: '🇺🇸', groupId: 'D' },
  { id: 'D2', name: 'Paraguay', flag: '🇵🇾', groupId: 'D' },
  { id: 'D3', name: 'Australie', flag: '🇦🇺', groupId: 'D' },
  { id: 'D4', name: 'Turquie', flag: '🇹🇷', groupId: 'D' },

  { id: 'E1', name: 'Allemagne', flag: '🇩🇪', groupId: 'E' },
  { id: 'E2', name: 'Curaçao', flag: '🇨🇼', groupId: 'E' },
  { id: 'E3', name: "Côte d'Ivoire", flag: '🇨🇮', groupId: 'E' },
  { id: 'E4', name: 'Équateur', flag: '🇪🇨', groupId: 'E' },

  { id: 'F1', name: 'Pays-Bas', flag: '🇳🇱', groupId: 'F' },
  { id: 'F2', name: 'Japon', flag: '🇯🇵', groupId: 'F' },
  { id: 'F3', name: 'Suède', flag: '🇸🇪', groupId: 'F' },
  { id: 'F4', name: 'Tunisie', flag: '🇹🇳', groupId: 'F' },

  { id: 'G1', name: 'Belgique', flag: '🇧🇪', groupId: 'G' },
  { id: 'G2', name: 'Égypte', flag: '🇪🇬', groupId: 'G' },
  { id: 'G3', name: 'Iran', flag: '🇮🇷', groupId: 'G' },
  { id: 'G4', name: 'Nouvelle-Zél.', flag: '🇳🇿', groupId: 'G' },

  { id: 'H1', name: 'Espagne', flag: '🇪🇸', groupId: 'H' },
  { id: 'H2', name: 'Cap-Vert', flag: '🇨🇻', groupId: 'H' },
  { id: 'H3', name: 'Arabie saoud.', flag: '🇸🇦', groupId: 'H' },
  { id: 'H4', name: 'Uruguay', flag: '🇺🇾', groupId: 'H' },

  { id: 'I1', name: 'France', flag: '🇫🇷', groupId: 'I' },
  { id: 'I2', name: 'Sénégal', flag: '🇸🇳', groupId: 'I' },
  { id: 'I3', name: 'Irak', flag: '🇮🇶', groupId: 'I' },
  { id: 'I4', name: 'Norvège', flag: '🇳🇴', groupId: 'I' },

  { id: 'J1', name: 'Argentine', flag: '🇦🇷', groupId: 'J' },
  { id: 'J2', name: 'Algérie', flag: '🇩🇿', groupId: 'J' },
  { id: 'J3', name: 'Autriche', flag: '🇦🇹', groupId: 'J' },
  { id: 'J4', name: 'Jordanie', flag: '🇯🇴', groupId: 'J' },

  { id: 'K1', name: 'Portugal', flag: '🇵🇹', groupId: 'K' },
  { id: 'K2', name: 'RD Congo', flag: '🇨🇩', groupId: 'K' },
  { id: 'K3', name: 'Ouzbékistan', flag: '🇺🇿', groupId: 'K' },
  { id: 'K4', name: 'Colombie', flag: '🇨🇴', groupId: 'K' },

  { id: 'L1', name: 'Angleterre', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', groupId: 'L' },
  { id: 'L2', name: 'Croatie', flag: '🇭🇷', groupId: 'L' },
  { id: 'L3', name: 'Ghana', flag: '🇬🇭', groupId: 'L' },
  { id: 'L4', name: 'Panama', flag: '🇵🇦', groupId: 'L' },
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
