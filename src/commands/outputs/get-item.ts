import type { GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../../types.js";
import { ConsumedCapacity } from "./consumed-capacity.js";
import { ObjectBuilder } from "./lib.js";

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
  return ObjectBuilder.of<GetItemOutput<T>>()
    .setIfNotNull("item", output.Item)
    .mapIfNotNull(
      "consumedCapacity",
      output.ConsumedCapacity,
      ConsumedCapacity.decode,
    )
    .unwrap();
}
