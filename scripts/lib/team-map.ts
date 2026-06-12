/**
 * Maps a feed team (football-data.org) to our internal `TeamId` (A1..L4).
 *
 * Primary key = the feed's FIFA 3-letter `tla` (stable). Fallback = a normalized
 * name match (English feed names + our French names + common variants).
 * Unknown teams resolve to `null` — the caller logs them loudly.
 */
import { TeamId } from '../../src/app/domain/models';
import { FeedTeam } from './sports-api';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

/** FIFA 3-letter code → our team id (primary, most stable key). */
const TLA_TO_ID: Readonly<Record<string, TeamId>> = {
  MEX: 'A1', RSA: 'A2', KOR: 'A3', CZE: 'A4',
  CAN: 'B1', BIH: 'B2', QAT: 'B3', SUI: 'B4',
  BRA: 'C1', MAR: 'C2', HAI: 'C3', SCO: 'C4',
  USA: 'D1', PAR: 'D2', AUS: 'D3', TUR: 'D4',
  GER: 'E1', CUW: 'E2', CIV: 'E3', ECU: 'E4',
  NED: 'F1', JPN: 'F2', SWE: 'F3', TUN: 'F4',
  BEL: 'G1', EGY: 'G2', IRN: 'G3', NZL: 'G4',
  ESP: 'H1', CPV: 'H2', KSA: 'H3', URU: 'H4',
  FRA: 'I1', SEN: 'I2', IRQ: 'I3', NOR: 'I4',
  ARG: 'J1', ALG: 'J2', AUT: 'J3', JOR: 'J4',
  POR: 'K1', COD: 'K2', UZB: 'K3', COL: 'K4',
  ENG: 'L1', CRO: 'L2', GHA: 'L3', PAN: 'L4',
};

/** Accepted names per team id (English feed + French + variants). */
const NAME_ALIASES: Readonly<Record<TeamId, readonly string[]>> = {
  A1: ['Mexico', 'Mexique'],
  A2: ['South Africa', 'Afrique du Sud'],
  A3: ['South Korea', 'Korea Republic', 'Corée du Sud'],
  A4: ['Czechia', 'Czech Republic', 'Tchéquie'],
  B1: ['Canada'],
  B2: ['Bosnia and Herzegovina', 'Bosnia-Herzegovina', 'Bosnie-Herz.', 'Bosnie-Herzégovine'],
  B3: ['Qatar'],
  B4: ['Switzerland', 'Suisse'],
  C1: ['Brazil', 'Brésil'],
  C2: ['Morocco', 'Maroc'],
  C3: ['Haiti', 'Haïti'],
  C4: ['Scotland', 'Écosse'],
  D1: ['United States', 'USA', 'États-Unis'],
  D2: ['Paraguay'],
  D3: ['Australia', 'Australie'],
  D4: ['Turkey', 'Türkiye', 'Turquie'],
  E1: ['Germany', 'Allemagne'],
  E2: ['Curacao', 'Curaçao'],
  E3: ["Cote d'Ivoire", "Côte d'Ivoire", 'Ivory Coast'],
  E4: ['Ecuador', 'Équateur'],
  F1: ['Netherlands', 'Pays-Bas'],
  F2: ['Japan', 'Japon'],
  F3: ['Sweden', 'Suède'],
  F4: ['Tunisia', 'Tunisie'],
  G1: ['Belgium', 'Belgique'],
  G2: ['Egypt', 'Égypte'],
  G3: ['Iran', 'IR Iran'],
  G4: ['New Zealand', 'Nouvelle-Zélande', 'Nouvelle-Zél.'],
  H1: ['Spain', 'Espagne'],
  H2: ['Cape Verde', 'Cabo Verde', 'Cap-Vert'],
  H3: ['Saudi Arabia', 'Arabie saoud.', 'Arabie saoudite'],
  H4: ['Uruguay'],
  I1: ['France'],
  I2: ['Senegal', 'Sénégal'],
  I3: ['Iraq', 'Irak'],
  I4: ['Norway', 'Norvège'],
  J1: ['Argentina', 'Argentine'],
  J2: ['Algeria', 'Algérie'],
  J3: ['Austria', 'Autriche'],
  J4: ['Jordan', 'Jordanie'],
  K1: ['Portugal'],
  K2: ['DR Congo', 'Congo DR', 'Congo', 'RD Congo'],
  K3: ['Uzbekistan', 'Ouzbékistan'],
  K4: ['Colombia', 'Colombie'],
  L1: ['England', 'Angleterre'],
  L2: ['Croatia', 'Croatie'],
  L3: ['Ghana'],
  L4: ['Panama'],
};

const NAME_TO_ID = new Map<string, TeamId>();
for (const id of Object.keys(NAME_ALIASES)) {
  for (const alias of NAME_ALIASES[id] ?? []) {
    NAME_TO_ID.set(normalize(alias), id);
  }
}

/** Resolves a feed team to our team id (tla first, then name aliases). Null if unknown. */
export function resolveTeam(team: FeedTeam): TeamId | null {
  const byTla = team.tla ? TLA_TO_ID[team.tla.toUpperCase()] : undefined;
  if (byTla) return byTla;
  for (const candidate of [team.name, team.shortName]) {
    if (!candidate) continue;
    const id = NAME_TO_ID.get(normalize(candidate));
    if (id) return id;
  }
  return null;
}
