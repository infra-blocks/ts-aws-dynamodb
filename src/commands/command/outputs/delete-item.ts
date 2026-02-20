import type { DeleteCommandOutput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../../../types.js";

export type DeleteItemOutput<T extends Attributes = Attributes> = { item?: T };

export const DeleteItemOutput = {
  decode,
};

function decode<T extends Attributes = Attributes>(
  output: DeleteCommandOutput,
): DeleteItemOutput<T> {
  // TODO: use maybeSet
  const result: Partial<DeleteItemOutput<T>> = {};
  if (output.Attributes != null) {
    result.item = output.Attributes as T;
  }
  return result;
}
