import type { CreateTable } from "./create-table.js";
import type { DeleteItem } from "./delete-item.js";
import type { DeleteTable } from "./delete-table.js";
import type { GetItem } from "./get-item.js";
import type { PutItem } from "./put-item.js";

export type DynamoDbClientCommand =
  | DeleteItem
  | GetItem
  | CreateTable
  | DeleteTable
  | PutItem;

// TODO: runtime checks with instanceof checks
