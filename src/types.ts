import type { ScalarAttributeType } from "@aws-sdk/client-dynamodb";
import type {
  NativeAttributeBinary,
  NativeAttributeValue,
  NumberValue,
} from "@aws-sdk/lib-dynamodb";

export type AttributeName = string;
export type AttributeValue = NativeAttributeValue;

/**
 * A type regrouping all javascript native types that correspond to a valid DynamoDB
 * number attribute.
 */
export type AttributeValueNumber = number | NumberValue | bigint;

/**
 * A type regrouping all javascript native types that corerspond to a valid DynamoDB
 * set attribute.
 */
export type AttributeValueSet = Set<
  AttributeValueNumber | string | NativeAttributeBinary | undefined
>;
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
export interface Attribute {
  name: AttributeName;
  value: AttributeValue;
}
export type Attributes = Record<AttributeName, AttributeValue>;

export type IndexFieldType = ScalarAttributeType;

export interface IndexField {
  name: string;
  type: IndexFieldType;
}

export interface Index {
  partitionKey: IndexField;
  sortKey?: IndexField;
}
