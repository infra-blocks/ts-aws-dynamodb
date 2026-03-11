import type { DeleteCommandOutput } from "@aws-sdk/lib-dynamodb";
import { ifDefined } from "@infra-blocks/toolkit";
import { trusted } from "@infra-blocks/types";
import type { Attributes } from "../../types.js";
import { unsetUndefined } from "../lib.js";
import { ConsumedCapacity } from "./consumed-capacity.js";

export type DeleteItemOutput<T extends Attributes = Attributes> = {
  item?: T;
  consumedCapacity?: ConsumedCapacity;
};

export const DeleteItemOutput = {
  decode,
};

function decode<T extends Attributes = Attributes>(
  output: DeleteCommandOutput,
): DeleteItemOutput<T> {
  return unsetUndefined({
    item: ifDefined(output.Attributes, trusted<T>),
    consumedCapacity: ifDefined(
      output.ConsumedCapacity,
      ConsumedCapacity.decode,
    ),
  });
}
