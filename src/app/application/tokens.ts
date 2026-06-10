import { InjectionToken } from '@angular/core';
import { FileIoPort } from '../domain/ports/file-io.port';
import { OfficialResultsPort } from '../domain/ports/official-results.port';
import { PersistencePort } from '../domain/ports/persistence.port';

/** Jetons DI pour brancher les implémentations concrètes sur les abstractions (DIP). */
export const PERSISTENCE = new InjectionToken<PersistencePort>('PersistencePort');
export const OFFICIAL_RESULTS = new InjectionToken<OfficialResultsPort>('OfficialResultsPort');
export const FILE_IO = new InjectionToken<FileIoPort>('FileIoPort');
