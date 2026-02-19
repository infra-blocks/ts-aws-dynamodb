import type { PutCommandOutput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../../../types.js";
import { maybeSet } from "./lib.js";

// TODO wrap in an object to support later upcoming types.
export type PutItemOutput<T extends Attributes = Attributes> = { item?: T };

export const decode = <T extends Attributes = Attributes>(
  output: PutCommandOutput,
): PutItemOutput<T> => maybeSet({}, "item", output, "Attributes");
