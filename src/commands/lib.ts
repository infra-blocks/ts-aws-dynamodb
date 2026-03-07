import type { AnyRecord, Transform } from "@infra-blocks/types";
import { isUndefined } from "es-toolkit";

// TODO: this should make it to my own toolkit lib mfk.
/**
 * Modifies an object inplace by removing `undefined` properties.
 *
 * @param obj - The starting point.
 *
 * @returns A new object with the input's properties, but where the `undefined`
 * properties have been omitted.
 */
export function unsetUndefined<O extends AnyRecord>(obj: O): O {
  for (const [k, v] of Object.entries(obj)) {
    if (isUndefined(v)) {
      delete obj[k];
    }
  }
  return obj;
}

/**
 * Takes a value and transforms it only if it is not `undefined`.
 *
 * If the value is `undefined`, than the transformation function is not called
 * and the function immediately returns `undefined`.
 *
 * Otherwise, the function is called with the guarantee that T is defined.
 *
 * This is a useful function to shorten certain snippets.
 * @example
 * const x = someVariable !== undefined ? someFunction(someVariable) : undefined;
 * // Becomes
 * const x = ifDefined(someVariable, someFunction);
 *
 * @param value - The value to test and forward to the function.
 * @param transform - The transformation function.
 *
 * @returns Either `undefined` when the input is `undefined`, or the return value
 * of the transform.
 */
export function ifDefined<T, R>(
  value: T | undefined,
  transform: Transform<T, R>,
): R | undefined {
  return value !== undefined ? transform(value) : undefined;
}
