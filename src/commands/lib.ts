import type { AnyRecord } from "@infra-blocks/types";
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
