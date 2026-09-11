declare module 'gifenc' {
  export type RgbColor = [number, number, number];
  export type RgbaColor = [number, number, number, number];
  export type PaletteColor = RgbColor | RgbaColor;

  export interface QuantizeOptions {
    format?: 'rgb565' | 'rgb444' | 'rgba4444';
    oneBitAlpha?: boolean | number;
    clearAlpha?: boolean;
    clearAlphaThreshold?: number;
    clearAlphaColor?: number;
  }

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: QuantizeOptions,
  ): PaletteColor[];

  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: PaletteColor[],
    format?: 'rgb565' | 'rgb444' | 'rgba4444',
  ): Uint8Array;

  export interface WriteFrameOptions {
    palette?: PaletteColor[];
    first?: boolean;
    transparent?: boolean;
    transparentIndex?: number;
    delay?: number;
    repeat?: number;
    dispose?: number;
  }

  export interface GIFEncoderInstance {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: WriteFrameOptions): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    writeHeader(): void;
    reset(): void;
    readonly buffer: ArrayBuffer;
  }

  export function GIFEncoder(opts?: { auto?: boolean; initialCapacity?: number }): GIFEncoderInstance;

  export function nearestColorIndex(palette: PaletteColor[], pixel: PaletteColor): number;
  export function nearestColorIndexWithDistance(
    palette: PaletteColor[],
    pixel: PaletteColor,
  ): [number, number];
}
