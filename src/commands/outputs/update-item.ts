import type { UpdateCommandOutput } from "@aws-sdk/lib-dynamodb";
import { ifDefined } from "@infra-blocks/toolkit";
import { trusted } from "@infra-blocks/types";
import type { Attributes } from "../../types.js";
import { unsetUndefined } from "../lib.js";
import { ConsumedCapacity } from "./consumed-capacity.js";

export type UpdateItemOutput<T extends Attributes = Attributes> = {
  attributes?: T;
  consumedCapacity?: ConsumedCapacity;
};

export const UpdateItemOutput = {
  decode,
};

function decode<T extends Attributes = Attributes>(
  output: UpdateCommandOutput,
): UpdateItemOutput<T> {
  return unsetUndefined({
    attributes: ifDefined(output.Attributes, trusted<T>),
    consumedCapacity: ifDefined(
      output.ConsumedCapacity,
      ConsumedCapacity.decode,
    ),
  });
}
