import type { QueryCommandOutput } from "@aws-sdk/lib-dynamodb";
import { trusted } from "@infra-blocks/types";
import type { Attributes, KeyAttributes } from "../../../index.js";

export type QueryOutput<
  T extends Attributes = Attributes,
  K extends KeyAttributes = KeyAttributes,
> = {
  count: number;
  items: Array<T>;
  scannedCount: number;
  lastEvaluatedKey?: K;
};

export function decode<
  T extends Attributes = Attributes,
  K extends KeyAttributes = KeyAttributes,
>(output: QueryCommandOutput): QueryOutput<T, K> {
  const items = (output.Items ?? []) as Array<T>;
  return trusted({
    items,
    lastEvaluatedKey: output.LastEvaluatedKey,
    count: output.Count,
    scannedCount: output.ScannedCount,
  });
}
