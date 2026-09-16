export {};

declare global {
  interface Set<T> {
    has(value: T | (T extends string ? string : never)): boolean;
  }
}
