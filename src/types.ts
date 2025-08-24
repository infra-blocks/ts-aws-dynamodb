import { isSet } from "node:util/types";
import {
  isBigint,
  isBoolean,
  isNull,
  isNumber,
  isPlainObject,
  isString,
} from "@infra-blocks/types";

// DynamoDB supported types and their TypeScript representations
export type NativeType =
  | "B" // Binary
  | "BS" // Binary Set
  | "BOOL" // Boolean
  | "L" // List
  | "M" // Map
  | "N" // Number
  | "NS" // Number Set
  | "NULL" // Null
  | "S" // String
  | "SS"; // String Set
export const NATIVE_TYPES = [
  "B",
  "BS",
  "BOOL",
  "L",
  "M",
  "N",
  "NS",
  "NULL",
  "S",
  "SS",
] as const;

export type NativeBinary = Buffer;
export type NativeBinarySet = Set<NativeBinary>;
export type NativeBoolean = boolean;
export type NativeList = Array<AttributeValue>;
export interface NativeMap extends Attributes {}
export type NativeNull = null;
export type NativeNumber = bigint | number;
export type NativeNumberSet = Set<NativeNumber>;
export type NativeScalar =
  | NativeBinary
  | NativeBoolean
  | NativeNull
  | NativeNumber
  | NativeString;
export type NativeSet = NativeNumberSet | NativeStringSet | NativeBinarySet;
export type NativeString = string;
export type NativeStringSet = Set<NativeString>;

// Native type guards.
export function isNativeBinary(value: unknown): value is NativeBinary {
  return Buffer.isBuffer(value);
}

export function isNativeBoolean(value: unknown): value is NativeBoolean {
  return isBoolean(value);
}

// Note: the type of the elements is not checked.
export function isNativeList(value: unknown): value is NativeList {
  return Array.isArray(value);
}

// Note: the type of the elements is not checked.
export function isNativeMap(value: unknown): value is NativeMap {
  return isPlainObject(value);
}

export function isNativeNull(value: unknown): value is NativeNull {
  return isNull(value);
}

export function isNativeNumber(value: unknown): value is NativeNumber {
  return isNumber(value) || isBigint(value);
}

export function isNativeSet(value: unknown): value is NativeSet {
  return isSet(value);
}

export function isNativeString(value: unknown): value is NativeString {
  return isString(value);
}

// Package wide types used to interact with the APIs.

/**
 * The type of an attribute name in DynamoDB.
 *
 * This is an alias for string. This type is used in preference
 * to {@link AttributePath} when the API does not expect a document path.
 *
 * @see AttributePath
 */
export type AttributeName = string;

/**
 * The path to an attribute in DynamoDB.
 *
 * This is also an alias for string, like {@link AttributeName}, but it is
 * used in APIs where document paths are supported.
 *
 * @see AttributeName
 */
export type AttributePath = AttributeName;

export type AttributeValue =
  | NativeBinary
  | NativeBinarySet
  | NativeBoolean
  | NativeList
  | NativeMap
  | NativeNull
  | NativeNumber
  | NativeNumberSet
  | NativeSet
  | NativeString
  | NativeStringSet;

/**
 * Type representing a record of attributes belonging to a DynamoDB item.
 *
 * Undefined fields are stripped off before being marshalled, and undefined
 * values within collections result in errors being thrown.
 */
export type Attributes = Record<AttributeName, AttributeValue>;

export type IndexAttributeType = Extract<NativeType, "B" | "N" | "S">;

export interface IndexAttributeDefinition {
  name: string;
  type: IndexAttributeType;
}

export interface Index {
  partitionKey: IndexAttributeDefinition;
  sortKey?: IndexAttributeDefinition;
}
