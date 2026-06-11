import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { beforeEach, describe, expect, test } from 'vitest';
import { TournamentStore } from '../../../application/tournament.store';
import { FILE_IO, OFFICIAL_RESULTS, PERSISTENCE } from '../../../application/tokens';
import { ScoreMap } from '../../../domain/models';
import { FileIoSpy, OfficialResultsStub, PersistenceStub } from '../../../testing/test-doubles';
import { GroupsComponent } from './groups.component';

async function setup(official: ScoreMap = {}): Promise<{
  fixture: ComponentFixture<GroupsComponent>;
  store: TournamentStore;
}> {
  TestBed.configureTestingModule({
    imports: [GroupsComponent],
    providers: [
      provideAnimationsAsync(),
      { provide: PERSISTENCE, useValue: new PersistenceStub() },
      { provide: OFFICIAL_RESULTS, useValue: new OfficialResultsStub(official) },
      { provide: FILE_IO, useValue: new FileIoSpy() },
    ],
  });
  const store = TestBed.inject(TournamentStore);
  await store.loadOfficial();
  const fixture = TestBed.createComponent(GroupsComponent);
  fixture.detectChanges();
  return { fixture, store };
}

describe('GroupsComponent', () => {
  beforeEach(() => TestBed.resetTestingModule());

  describe('rendu', () => {
    test('rend les 12 panneaux de groupe', async () => {
      const { fixture } = await setup();
      const panels = fixture.nativeElement.querySelectorAll('mat-expansion-panel');
      expect(panels.length).toBe(12);
    });

    test("verrouille l'input d'un match officiel et affiche le score officiel", async () => {
      // M1 = A1 vs A2 (premier match du groupe A, panneau ouvert).
      const { fixture } = await setup({ M1: { home: 0, away: 3 } });
      const first: HTMLInputElement | null = fixture.nativeElement.querySelector('input.score-input');
      expect(first?.disabled).toBe(true);
      expect(first?.value).toBe('0');
    });
  });
});
