import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { TournamentStore } from '../../../application/tournament.store';
import { FILE_IO, OFFICIAL_RESULTS, PERSISTENCE } from '../../../application/tokens';
import { ScoreMap } from '../../../domain/models';
import {
  InMemoryPersistence,
  NoopFileIo,
  StaticOfficialResultsProvider,
} from '../../../testing/test-doubles';
import { GroupsComponent } from './groups.component';

async function setup(official: ScoreMap = {}): Promise<{
  fixture: ComponentFixture<GroupsComponent>;
  store: TournamentStore;
}> {
  TestBed.configureTestingModule({
    imports: [GroupsComponent],
    providers: [
      provideAnimationsAsync(),
      { provide: PERSISTENCE, useValue: new InMemoryPersistence() },
      { provide: OFFICIAL_RESULTS, useValue: new StaticOfficialResultsProvider(official) },
      { provide: FILE_IO, useValue: new NoopFileIo() },
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

  it('rend les 12 panneaux de groupe', async () => {
    const { fixture } = await setup();
    const panels = fixture.nativeElement.querySelectorAll('mat-expansion-panel');
    expect(panels.length).toBe(12);
  });

  it("verrouille l'input d'un match avec résultat officiel et affiche le score officiel", async () => {
    // M1 = A1 vs A2 (premier match du groupe A, panneau ouvert).
    const { fixture } = await setup({ M1: { home: 0, away: 3 } });
    const first = fixture.nativeElement.querySelector('input.score-input') as HTMLInputElement;
    expect(first.disabled).toBe(true);
    expect(first.value).toBe('0'); // score officiel domicile
  });
});
