import type { DeleteCommandOutput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../../types.js";
import { ObjectBuilder } from "./lib.js";

export type DeleteItemOutput<T extends Attributes = Attributes> = { item?: T };

export const DeleteItemOutput = {
  decode,
};

function decode<T extends Attributes = Attributes>(
  output: DeleteCommandOutput,
): DeleteItemOutput<T> {
  return ObjectBuilder.of<DeleteItemOutput<T>>()
    .setIfNotNull("item", output.Attributes)
    .unwrap();
}
