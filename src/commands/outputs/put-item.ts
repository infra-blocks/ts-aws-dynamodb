import type { PutCommandOutput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../../types.js";
import { ObjectBuilder } from "./lib.js";

// TODO wrap in an object to support later upcoming types.
export type PutItemOutput<T extends Attributes = Attributes> = { item?: T };

export const PutItemOutput = {
  decode,
};

function decode<T extends Attributes = Attributes>(
  output: PutCommandOutput,
): PutItemOutput<T> {
  return ObjectBuilder.of<PutItemOutput<T>>()
    .setIfNotNull("item", output.Attributes)
    .unwrap();
}
