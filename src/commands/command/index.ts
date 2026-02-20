export type { CommandInput, CommandOutput } from "./base.js";
export { CreateTable } from "./create-table.js";
export { DeleteItem } from "./delete-item.js";
export { DeleteTable } from "./delete-table.js";
export { GetItem } from "./get-item.js";
// TODO: selective import when changing inputs/outputs indexes to export everything that is public from outside
export * from "./inputs/index.js";
export * from "./outputs/index.js";
export { PutItem } from "./put-item.js";
export { Query } from "./query.js";
export { UpdateItem } from "./update-item.js";
