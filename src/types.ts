import type { ScalarAttributeType } from "@aws-sdk/client-dynamodb";
import type { NativeAttributeValue } from "@aws-sdk/lib-dynamodb";
import type { PutItemParams } from "./commands/put-item.js";
import type { KeyConditionExpression } from "./key-condition-expression.js";

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

export interface WriteTransaction {
  items: PutItemParams[];
}

// TODO: Target either index or table.
export interface Query {
  table: string;
  index?: string;
  condition: KeyConditionExpression;
}
