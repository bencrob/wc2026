/** Entrée/sortie fichier (import/export JSON), abstraite pour la testabilité. */
export interface FileIoPort {
  download(filename: string, content: string): void;
  readText(file: File): Promise<string>;
}
