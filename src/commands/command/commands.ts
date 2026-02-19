import type { CreateTable } from "./create-table.js";
import type { DeleteItem } from "./delete-item.js";
import type { GetItem } from "./get-item.js";

export type DynamoDbClientCommand = DeleteItem | GetItem | CreateTable;

// TODO: runtime checks with instanceof checks
