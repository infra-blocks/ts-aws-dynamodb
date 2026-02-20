import type { GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../../../types.js";
import { maybeSet } from "./lib.js";

export type GetItemOutput<T extends Attributes = Attributes> = { item?: T };

export const GetItemOutput = {
  decode,
};

function decode<T extends Attributes = Attributes>(
  output: GetCommandOutput,
): GetItemOutput<T> {
  return maybeSet({}, "item", output, "Item");
}
