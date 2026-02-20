import type { CreateTable } from "./create-table.js";
import type { DeleteItem } from "./delete-item.js";
import type { DeleteTable } from "./delete-table.js";
import type { GetItem } from "./get-item.js";
import type { PutItem } from "./put-item.js";
import type { Query } from "./query.js";
import type { UpdateItem } from "./update-item.js";
import type { UpdateTimeToLive } from "./update-time-to-live.js";

export type DynamoDbClientCommand =
  | DeleteItem
  | GetItem
  | CreateTable
  | DeleteTable
  | PutItem
  | Query
  | UpdateItem
  | UpdateTimeToLive;

// TODO: runtime checks with instanceof checks
