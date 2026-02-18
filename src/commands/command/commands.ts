import type { DeleteItem } from "./delete-item.js";
import type { GetItem } from "./get-item.js";

export type DynamoDbClientCommand = DeleteItem | GetItem;

// TODO: runtime checks with instanceof checks
