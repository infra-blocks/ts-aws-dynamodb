import type { GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import { ifDefined } from "@infra-blocks/toolkit";
import { trusted } from "@infra-blocks/types";
import type { Attributes } from "../../types.js";
import { unsetUndefined } from "../lib.js";
import { ConsumedCapacity } from "./consumed-capacity.js";

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
    item: ifDefined(output.Item, trusted<T>),
    consumedCapacity: ifDefined(
      output.ConsumedCapacity,
      ConsumedCapacity.decode,
    ),
  });
}
