declare module "*.svg" {
  const content: string;
  export default content;
}
declare module "*.css" {
  const content: CSSStyleSheet;
  export default content;
}

// Augment `bun` with the `Image` API (and `BunFile.image()`) until they ship
// in `@types/bun` / `bun-types`.
declare module "bun" {
  interface ImageMetadata {
    width: number;
    height: number;
    format: string;
  }
  interface ImageResizeOptions {
    fit?: "fill" | "inside";
    withoutEnlargement?: boolean;
    filter?: string;
  }
  interface ImageOptions {
    maxPixels?: number;
    autoOrient?: boolean;
  }
  class Image {
    constructor(
      input: string | ArrayBufferView | ArrayBuffer | Blob,
      options?: ImageOptions,
    );
    resize(width: number, height?: number, options?: ImageResizeOptions): Image;
    rotate(degrees: number): Image;
    flip(): Image;
    flop(): Image;
    modulate(opts: { brightness?: number; saturation?: number }): Image;
    jpeg(opts?: { quality?: number; progressive?: boolean }): Image;
    png(opts?: {
      compressionLevel?: number;
      palette?: boolean;
      colors?: number;
      dither?: boolean;
    }): Image;
    webp(opts?: { quality?: number; lossless?: boolean }): Image;
    heic(opts?: { quality?: number }): Image;
    avif(opts?: { quality?: number }): Image;
    metadata(): Promise<ImageMetadata>;
    bytes(): Promise<Uint8Array>;
    buffer(): Promise<Buffer>;
    blob(): Promise<Blob>;
    toBase64(): Promise<string>;
    dataurl(): Promise<string>;
    write(destination: string | BunFile | number): Promise<number>;
    placeholder(): Promise<string>;
    width: number;
    height: number;
  }
  interface BunFile {
    image(options?: ImageOptions): Image;
  }
}
