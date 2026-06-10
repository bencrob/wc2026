import { describe, expect, it } from 'vitest';
import { MatchId } from '../models';
import { GROUP_FIXTURES } from './fixtures';
import {
  BRACKET_LINKS,
  KO_MATCH_IDS,
  R32_SLOTS,
  THIRD_PLACE_SLOTS,
} from './knockout-structure';
import { SCHEDULE } from './schedule';
import { GROUPS, TEAMS } from './teams';

const num = (id: MatchId): number => Number(id.slice(1));

describe('Invariants des données du tournoi', () => {
  it('48 équipes, 4 par groupe, ids uniques', () => {
    expect(TEAMS.length).toBe(48);
    expect(new Set(TEAMS.map((t) => t.id)).size).toBe(48);
    for (const g of GROUPS) {
      expect(TEAMS.filter((t) => t.groupId === g).length).toBe(4);
    }
  });

  it('72 matchs de poule M1..M72 uniques', () => {
    expect(GROUP_FIXTURES.length).toBe(72);
    const ids = GROUP_FIXTURES.map((f) => f.id);
    expect(new Set(ids).size).toBe(72);
    expect(Math.min(...ids.map(num))).toBe(1);
    expect(Math.max(...ids.map(num))).toBe(72);
  });

  it('32 matchs KO M73..M104', () => {
    expect(KO_MATCH_IDS.length).toBe(32);
    expect(KO_MATCH_IDS[0]).toBe('M73');
    expect(KO_MATCH_IDS.at(-1)).toBe('M104');
  });

  it('8 créneaux 3es, groupes éligibles valides', () => {
    const slots = Object.keys(THIRD_PLACE_SLOTS);
    expect(slots.length).toBe(8);
    for (const groupsForSlot of Object.values(THIRD_PLACE_SLOTS)) {
      for (const g of groupsForSlot) expect(GROUPS).toContain(g);
    }
  });

  it('16 matchs R32, chaque côté résoluble', () => {
    expect(R32_SLOTS.length).toBe(16);
    for (const slot of R32_SLOTS) {
      for (const side of [slot.home, slot.away]) {
        if (side.kind === 'third') {
          expect(Object.keys(THIRD_PLACE_SLOTS)).toContain(side.slot);
        } else {
          expect(GROUPS).toContain(side.group);
        }
      }
    }
  });

  it('liens du bracket = DAG topologique se terminant en M104', () => {
    const feeds = new Set<string>();
    for (const link of BRACKET_LINKS) {
      for (const t of [link.winnerTo, link.loserTo]) {
        if (!t) continue;
        // topologie : la source alimente toujours un match de numéro supérieur
        expect(num(t.match)).toBeGreaterThan(num(link.match));
        // pas deux sources vers le même emplacement
        const slot = `${t.match}-${t.side}`;
        expect(feeds.has(slot), `doublon ${slot}`).toBe(false);
        feeds.add(slot);
      }
    }
    // finale et 3e place entièrement alimentées
    expect(feeds.has('M104-home')).toBe(true);
    expect(feeds.has('M104-away')).toBe(true);
    expect(feeds.has('M103-home')).toBe(true);
    expect(feeds.has('M103-away')).toBe(true);
  });

  it('calendrier : une date+stade pour les 104 matchs', () => {
    const allIds = [...GROUP_FIXTURES.map((f) => f.id), ...KO_MATCH_IDS];
    expect(allIds.length).toBe(104);
    for (const id of allIds) {
      expect(SCHEDULE[id], `manque ${id}`).toBeDefined();
      expect(SCHEDULE[id]!.venue.length).toBeGreaterThan(0);
    }
  });
});
