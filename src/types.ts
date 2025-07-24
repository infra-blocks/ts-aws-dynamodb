// DynamoDB supported types and their TypeScript representations
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

export type AttributeType =
  | "S" // String
  | "N" // Number
  | "B" // Binary
  | "BOOL" // Boolean
  | "NULL" // Null
  | "M" // Map
  | "L" // List
  | "SS" // String Set
  | "NS" // Number Set
  | "BS"; // Binary Set
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

// TODO: remove when we review the query interfaces to use "key" instead of pk/sk bullshat.
export interface Attribute {
  name: AttributeName;
  value: AttributeValue;
}
export type Attributes = Record<AttributeName, AttributeValue>;

export type IndexAttributeType = Extract<AttributeType, "B" | "N" | "S">;

export interface IndexAttributeDefinition {
  name: string;
  type: IndexAttributeType;
}

export interface Index {
  partitionKey: IndexAttributeDefinition;
  sortKey?: IndexAttributeDefinition;
}
