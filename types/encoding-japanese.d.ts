declare module 'encoding-japanese' {
  export function detect(data: Uint8Array | number[]): string | false;
  
  export function convert(
    data: Uint8Array | number[],
    options: {
      to: string;
      from?: string;
    }
  ): number[];
  
  export function codeToString(data: number[]): string;
}
