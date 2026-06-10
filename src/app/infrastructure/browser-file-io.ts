import { Injectable } from '@angular/core';
import { FileIoPort } from '../domain/ports/file-io.port';

/** Import/export fichier via les API navigateur (Blob / FileReader). */
@Injectable({ providedIn: 'root' })
export class BrowserFileIo implements FileIoPort {
  download(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  readText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error ?? new Error('Lecture du fichier impossible.'));
      reader.readAsText(file);
    });
  }
}
