import type { GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../../../types.js";
import { maybeSet } from "./lib.js";

// TODO wrap in an object to support later upcoming types.
export type GetItemOutput<T extends Attributes = Attributes> = { item?: T };

export const decode = <T extends Attributes = Attributes>(
  output: GetCommandOutput,
): GetItemOutput<T> => maybeSet({}, "item", output, "Item");
