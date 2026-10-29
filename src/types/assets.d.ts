declare module '*.wav' {
  const asset: number;
  export default asset;
}

declare module '@shopify/react-native-skia/lib/module/web' {
  export function LoadSkiaWeb(options?: {
    locateFile?: (file: string) => string;
  }): Promise<void>;
}

