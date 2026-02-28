import type { GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import { trusted } from "@infra-blocks/types";
import type { Attributes } from "../../types.js";
import { ConsumedCapacity } from "./consumed-capacity.js";
import { mapIfDefined, unsetUndefined } from "./lib.js";

export type GetItemOutput<T extends Attributes = Attributes> = {
  item?: T;
  consumedCapacity?: ConsumedCapacity;
};

export const GetItemOutput = {
  decode,
};

function decode<T extends Attributes = Attributes>(
  output: GetCommandOutput,
): GetItemOutput<T> {
  return unsetUndefined({
    item: mapIfDefined(output.Item, trusted<T>),
    consumedCapacity: mapIfDefined(
      output.ConsumedCapacity,
      ConsumedCapacity.decode,
    ),
  });
}
