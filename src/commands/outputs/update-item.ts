import type { UpdateCommandOutput } from "@aws-sdk/lib-dynamodb";
import { trusted } from "@infra-blocks/types";
import type { Attributes } from "../../types.js";
import { mapIfDefined, unsetUndefined } from "./lib.js";

export type UpdateItemOutput<T extends Attributes = Attributes> = {
  attributes?: T;
};

export const UpdateItemOutput = {
  decode,
};

function decode<T extends Attributes = Attributes>(
  output: UpdateCommandOutput,
): UpdateItemOutput<T> {
  return unsetUndefined({
    attributes: mapIfDefined(output.Attributes, trusted<T>),
  });
}
