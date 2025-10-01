declare module 'jsnes' {
  interface NesOptions {
    onFrame: (frameBuffer: number[]) => void;
    onAudioSample?: (left: number, right: number) => void;
    sampleRate?: number;
  }

  export class NES {
    constructor(options: NesOptions);
    loadROM(romData: string): void;
    frame(): void;
    buttonDown(player: number, button: number): void;
    buttonUp(player: number, button: number): void;
    toJSON(): object;
    fromJSON(state: object): void;
    reset(): void;
  }

  export const Controller: {
    BUTTON_A: number;
    BUTTON_B: number;
    BUTTON_SELECT: number;
    BUTTON_START: number;
    BUTTON_UP: number;
    BUTTON_DOWN: number;
    BUTTON_LEFT: number;
    BUTTON_RIGHT: number;
  };
}
declare module 'base-64' {
  export function encode(input: string): string;
  export function decode(input: string): string;
  export default {
    encode: encode,
    decode: decode,
  };
}