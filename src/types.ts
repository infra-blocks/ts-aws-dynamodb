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
export type NativeMap = { [key: AttributeName]: AttributeValue };
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
