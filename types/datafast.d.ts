declare global {
  type DatafastParams = Record<string, string | undefined | null>;
  type DatafastFn = ((goal: string, params?: DatafastParams) => void) & { q?: unknown[] };

  interface Window {
    datafast?: DatafastFn;
  }
}

export {};
