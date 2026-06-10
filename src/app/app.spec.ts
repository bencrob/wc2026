import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';
import { FILE_IO, OFFICIAL_RESULTS, PERSISTENCE } from './application/tokens';
import {
  InMemoryPersistence,
  NoopFileIo,
  StaticOfficialResultsProvider,
} from './testing/test-doubles';

describe('App (shell)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideAnimationsAsync(),
        { provide: PERSISTENCE, useValue: new InMemoryPersistence() },
        { provide: OFFICIAL_RESULTS, useValue: new StaticOfficialResultsProvider() },
        { provide: FILE_IO, useValue: new NoopFileIo() },
      ],
    }).compileComponents();
  });

  it('se crée et affiche le titre dans la barre', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.title')?.textContent).toContain('Coupe du Monde FIFA 2026');
  });
});
