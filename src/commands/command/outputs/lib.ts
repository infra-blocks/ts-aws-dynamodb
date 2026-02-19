import { trusted } from "@infra-blocks/types";

export function maybeSet<
  T,
  A extends Record<string, unknown>,
  AK extends string,
  S extends Record<string, unknown>,
  SK extends keyof S,
>(
  acc: A,
  accKey: AK,
  source: S,
  sourceKey: SK,
  transform?: (value: S[SK]) => T,
): A & { [k in AK]?: T } {
  if (source[sourceKey] != null) {
    const newValue: unknown =
      transform != null ? transform(source[sourceKey]) : source[sourceKey];
    acc[accKey] = trusted(newValue);
  }
  return trusted(acc);
}
