import type { ScanCommandOutput } from "@aws-sdk/lib-dynamodb";
import { checkNotNull } from "@infra-blocks/checks";
import { ifDefined } from "@infra-blocks/toolkit";
import { trusted } from "@infra-blocks/types";
import type { Attributes, KeyAttributes } from "../../index.js";
import { unsetUndefined } from "../lib.js";
import { ConsumedCapacity } from "./consumed-capacity.js";

export type ScanOutput<
  T extends Attributes = Attributes,
  K extends KeyAttributes = KeyAttributes,
> = {
  count: number;
  items: Array<T>;
  scannedCount: number;
  lastEvaluatedKey?: K;
  consumedCapacity?: ConsumedCapacity;
};

export const ScanOutput = {
  decode,
};

function decode<
  T extends Attributes = Attributes,
  K extends KeyAttributes = KeyAttributes,
>(output: ScanCommandOutput): ScanOutput<T, K> {
  return unsetUndefined({
    count: checkNotNull(output.Count),
    items: (output.Items ?? []) as Array<T>,
    scannedCount: checkNotNull(output.ScannedCount),
    consumedCapacity: ifDefined(
      output.ConsumedCapacity,
      ConsumedCapacity.decode,
    ),
    lastEvaluatedKey: ifDefined(output.LastEvaluatedKey, trusted<K>),
  });
}
