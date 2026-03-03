import type { QueryCommandOutput } from "@aws-sdk/lib-dynamodb";
import { checkNotNull } from "@infra-blocks/checks";
import { trusted } from "@infra-blocks/types";
import type { Attributes, KeyAttributes } from "../../index.js";
import { mapIfDefined, unsetUndefined } from "./lib.js";

export type QueryOutput<
  T extends Attributes = Attributes,
  K extends KeyAttributes = KeyAttributes,
> = {
  count: number;
  items: Array<T>;
  scannedCount: number;
  lastEvaluatedKey?: K;
};

export const QueryOutput = {
  decode,
};

function decode<
  T extends Attributes = Attributes,
  K extends KeyAttributes = KeyAttributes,
>(output: QueryCommandOutput): QueryOutput<T, K> {
  return unsetUndefined({
    count: checkNotNull(output.Count),
    items: (output.Items ?? []) as Array<T>,
    scannedCount: checkNotNull(output.ScannedCount),
    lastEvaluatedKey: mapIfDefined(output.LastEvaluatedKey, trusted<K>),
  });
}
