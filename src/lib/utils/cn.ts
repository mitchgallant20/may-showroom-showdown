/**
 * Tiny className combiner. Falsy values are dropped.
 * Pulled in instead of `clsx` to keep the dependency tree small.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
