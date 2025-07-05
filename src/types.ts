import type { NativeAttributeValue } from "@aws-sdk/lib-dynamodb";
import type { ConditionExpression } from "./condition-expression.js";
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

/**
 * The input required to call the GetItem API.
 */
export interface GetItem {
  /**
   * The name of the table to query.
   */
  table: string;
  /**
   * The partition key value of the item to retrieve.
   */
  parititionKey: Attribute;
  /**
   * The optional sort key value of the item to retrieve.
   *
   * Note that this is only optional if the table's primary key is made only of the partition key.
   * It's mandatory otherwise.
   */
  sortKey?: Attribute;
}

export interface PutItem {
  table: string;
  item: Attributes;
  condition?: ConditionExpression;
}

export interface WriteTransaction {
  items: PutItem[];
}

// TODO: Target either index or table.
export interface Query {
  table: string;
  index?: string;
  condition: KeyConditionExpression;
}
