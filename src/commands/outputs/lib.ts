import { isUndefined, type Transform } from "@infra-blocks/types";

// biome-ignore lint/suspicious/noExplicitAny: Record<..., any> include interfaces. Record<..., unknown> doesn't.
export function unsetUndefined<O extends Record<PropertyKey, any>>(obj: O): O {
  for (const [key, value] of Object.entries(obj)) {
    if (isUndefined(value)) {
      delete obj[key];
    }
  }
  return obj;
}

export function mapIfDefined<T, R>(
  value: T | undefined,
  transform: Transform<T, R>,
): R | undefined {
  return value && transform(value);
}
