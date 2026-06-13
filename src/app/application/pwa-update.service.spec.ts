import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PwaUpdateService } from './pwa-update.service';

function makeSwUpdate(isEnabled: boolean) {
  return {
    isEnabled,
    versionUpdates: new Subject<any>(),
    unrecoverable: new Subject<any>(),
    activateUpdate: vi.fn().mockResolvedValue(true),
    checkForUpdate: vi.fn().mockResolvedValue(true),
  };
}

function configure(sw: ReturnType<typeof makeSwUpdate>) {
  const open = vi.fn().mockReturnValue({ onAction: () => new Subject<void>() });
  TestBed.configureTestingModule({
    providers: [
      { provide: SwUpdate, useValue: sw as unknown as SwUpdate },
      { provide: MatSnackBar, useValue: { open } as unknown as MatSnackBar },
    ],
  });
  return { service: TestBed.inject(PwaUpdateService), open };
}

describe('PwaUpdateService', () => {
  beforeEach(() => TestBed.resetTestingModule());

  test('SW désactivé (dev) : ne s’abonne à rien', () => {
    const sw = makeSwUpdate(false);
    const { service, open } = configure(sw);
    service.start();
    sw.versionUpdates.next({ type: 'VERSION_READY' });
    expect(open).not.toHaveBeenCalled();
  });

  test('nouvelle version prête : propose le rechargement', () => {
    const sw = makeSwUpdate(true);
    const { service, open } = configure(sw);
    service.start();
    sw.versionUpdates.next({ type: 'NO_NEW_VERSION_DETECTED' }); // ignoré
    sw.versionUpdates.next({ type: 'VERSION_READY' });
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith('Nouvelle version disponible.', 'Recharger');
  });

  test('état irrécupérable : propose un rechargement de récupération', () => {
    const sw = makeSwUpdate(true);
    const { service, open } = configure(sw);
    service.start();
    sw.unrecoverable.next({ reason: 'cache' });
    expect(open).toHaveBeenCalledWith('Problème de cache détecté.', 'Recharger');
  });
});
