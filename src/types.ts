import type { ScalarAttributeType } from "@aws-sdk/client-dynamodb";
import type { NativeAttributeValue } from "@aws-sdk/lib-dynamodb";

export type AttributeName = string;
export type AttributeValue = NativeAttributeValue;
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
export type Attributes = Record<AttributeName, NativeAttributeValue>;

export type IndexFieldType = ScalarAttributeType;

export interface IndexField {
  name: string;
  type: IndexFieldType;
}

export interface Index {
  partitionKey: IndexField;
  sortKey?: IndexField;
}
