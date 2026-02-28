import type { DeleteCommandOutput } from "@aws-sdk/lib-dynamodb";
import { trusted } from "@infra-blocks/types";
import type { Attributes } from "../../types.js";
import { mapIfDefined, unsetUndefined } from "./lib.js";

export type DeleteItemOutput<T extends Attributes = Attributes> = { item?: T };

export const DeleteItemOutput = {
  decode,
};

function decode<T extends Attributes = Attributes>(
  output: DeleteCommandOutput,
): DeleteItemOutput<T> {
  return unsetUndefined({
    item: mapIfDefined(output.Attributes, trusted<T>),
  });
}
