import type { QueryCommandOutput } from "@aws-sdk/lib-dynamodb";
import { trusted } from "@infra-blocks/types";
import type { Attributes, KeyAttributes } from "../../index.js";
import { ObjectBuilder } from "./lib.js";

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
  return ObjectBuilder.of<QueryOutput>()
    .enforceNotNull("count", output.Count)
    .enforceNotNull("scannedCount", output.ScannedCount)
    .map("items", output.Items, (items) => (items ?? []) as Array<T>)
    .mapIfNotNull("lastEvaluatedKey", output.LastEvaluatedKey, trusted<K>)
    .unwrap();
}
