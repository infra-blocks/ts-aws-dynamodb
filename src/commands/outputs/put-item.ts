import type { PutCommandOutput } from "@aws-sdk/lib-dynamodb";
import { trusted } from "@infra-blocks/types";
import type { Attributes } from "../../types.js";
import { mapIfDefined, unsetUndefined } from "./lib.js";

// TODO wrap in an object to support later upcoming types.
export type PutItemOutput<T extends Attributes = Attributes> = { item?: T };

export const PutItemOutput = {
  decode,
};

function decode<T extends Attributes = Attributes>(
  output: PutCommandOutput,
): PutItemOutput<T> {
  return unsetUndefined({
    item: mapIfDefined(output.Attributes, trusted<T>),
  });
}
