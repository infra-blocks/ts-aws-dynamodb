import type { UpdateCommandOutput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../../types.js";
import { ObjectBuilder } from "./lib.js";

export type UpdateItemOutput<T extends Attributes = Attributes> = {
  attributes?: T;
};

export const UpdateItemOutput = {
  decode,
};

function decode<T extends Attributes = Attributes>(
  output: UpdateCommandOutput,
): UpdateItemOutput<T> {
  return ObjectBuilder.of<UpdateItemOutput<T>>()
    .setIfNotNull("attributes", output.Attributes)
    .unwrap();
}
