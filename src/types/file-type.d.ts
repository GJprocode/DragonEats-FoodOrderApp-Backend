// src/types/file-type.d.ts
declare module 'file-type' {
    export function fromBuffer(buffer: Buffer): Promise<{ ext: string; mime: string } | undefined>;
  }
  