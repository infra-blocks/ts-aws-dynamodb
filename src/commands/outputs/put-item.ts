import type { PutCommandOutput } from "@aws-sdk/lib-dynamodb";
import { trusted } from "@infra-blocks/types";
import type { Attributes } from "../../types.js";
import { ifDefined, unsetUndefined } from "../lib.js";
import { ConsumedCapacity } from "./consumed-capacity.js";

export type PutItemOutput<T extends Attributes = Attributes> = {
  item?: T;
  consumedCapacity?: ConsumedCapacity;
};

export const PutItemOutput = {
  decode,
};

function decode<T extends Attributes = Attributes>(
  output: PutCommandOutput,
): PutItemOutput<T> {
  return unsetUndefined({
    item: ifDefined(output.Attributes, trusted<T>),
    consumedCapacity: ifDefined(
      output.ConsumedCapacity,
      ConsumedCapacity.decode,
    ),
  });
}
