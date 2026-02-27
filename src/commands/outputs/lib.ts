import assert from "node:assert";
import { type Nullable, type Transform, trusted } from "@infra-blocks/types";

// TODO: lib for this bitch.
// TODO: use in inputs as well!
export type ObjectBuilder<A extends Record<string, unknown>> = {
  enforceNotNull<K extends keyof A, T>(
    key: K,
    value: T,
  ): ObjectBuilder<A & { [key in K]: NonNullable<T> }>;
  map<K extends keyof A, T, R>(
    key: K,
    value: T,
    transform: Transform<T, R>,
  ): ObjectBuilder<A & { [key in K]: R }>;
  mapValuesIfNotNull<K extends keyof A, T extends Record<string, unknown>, R>(
    key: K,
    value: Nullable<T>,
    transform: Transform<T[keyof T], R>,
  ): ObjectBuilder<A & { [key in K]?: { [subKey in keyof T]: R } }>;
  mapIfNotNull<K extends keyof A, T, R>(
    key: K,
    value: Nullable<T>,
    transform: Transform<T, R>,
  ): ObjectBuilder<A & { [key in K]?: R }>;
  setIfNotNull<K extends keyof A, T>(
    key: K,
    value: T,
  ): ObjectBuilder<A & { [key in K]?: T }>;
  unwrap(): A;
};

export const ObjectBuilder = {
  of<A extends Record<string, unknown>>(): ObjectBuilder<Partial<A>> {
    return wrap({});
  },
};

function wrap<A extends Record<string, unknown>>(payload: A): ObjectBuilder<A> {
  return {
    enforceNotNull(key, value) {
      enforceNotNull(payload, key, value);
      return trusted(this);
    },
    map(key, value, transform) {
      map(payload, key, value, transform);
      return trusted(this);
    },
    mapValuesIfNotNull(key, value, transform) {
      mapValuesIfNotNull(payload, key, value, transform);
      return trusted(this);
    },
    mapIfNotNull(key, value, transform) {
      mapIfNotNull(payload, key, value, transform);
      return trusted(this);
    },
    setIfNotNull(key, value) {
      mapIfNotNull(payload, key, value, (v) => v);
      return trusted(this);
    },
    unwrap: () => payload,
  };
}

function mapValuesIfNotNull<
  A extends Record<string, unknown>,
  AK extends keyof A,
  T extends Record<string, unknown>,
  R,
>(
  acc: A,
  accKey: AK,
  record: Nullable<T>,
  transform: Transform<T[keyof T], R>,
): A & { [k in AK]?: { [k2 in keyof T]: R } } {
  if (record != null) {
    acc[accKey] = {} as A[AK];
    for (const [key, value] of Object.entries(record)) {
      acc[accKey][key as keyof A[AK]] = trusted(transform(trusted(value)));
    }
  }
  return trusted(acc);
}

function mapIfNotNull<
  A extends Record<string, unknown>,
  AK extends keyof A,
  T,
  R,
>(
  acc: A,
  accKey: AK,
  value: Nullable<T>,
  transform: Transform<T, R>,
): A & { [k in AK]?: R } {
  if (value != null) {
    acc[accKey] = trusted(transform(value));
  }
  return trusted(acc);
}

function map<A extends Record<string, unknown>, AK extends keyof A, T, R>(
  acc: A,
  accKey: AK,
  value: T,
  transform: Transform<T, R>,
): A & { [k in AK]: R } {
  acc[accKey] = trusted(transform(value));
  return trusted(acc);
}

function enforceNotNull<
  A extends Record<string, unknown>,
  AK extends keyof A,
  T,
>(acc: A, accKey: AK, value: T): A & { [k in AK]: NonNullable<T> } {
  assert(value != null, "unexpected null value");
  acc[accKey] = trusted(value);
  return trusted(acc);
}
