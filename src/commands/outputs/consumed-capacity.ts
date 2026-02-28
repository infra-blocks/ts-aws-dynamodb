import type * as sdk from "@aws-sdk/client-dynamodb";
import { checkNotNull } from "@infra-blocks/checks";
import { mapValues } from "es-toolkit/object";
import { mapIfDefined, unsetUndefined } from "./lib.js";

export type ConsumedCapacity = CapacityUnits & {
  // Although the API marks it as optional, it's always there.
  tableName: string;
  // Only present when "INDEXES" is requested.
  table?: CapacityUnits;
  globalSecondaryIndexes?: {
    [key: string]: CapacityUnits;
  };
  localSecondaryIndexes?: {
    [key: string]: CapacityUnits;
  };
};

export const ConsumedCapacity = {
  decode(output: sdk.ConsumedCapacity): ConsumedCapacity {
    return unsetUndefined({
      ...CapacityUnits.decode(output),
      tableName: checkNotNull(output.TableName),
      table: mapIfDefined(output.Table, CapacityUnits.decode),
      globalSecondaryIndexes: mapIfDefined(
        output.GlobalSecondaryIndexes,
        (gsis) => mapValues(gsis, CapacityUnits.decode),
      ),
      localSecondaryIndexes: mapIfDefined(
        output.LocalSecondaryIndexes,
        (lsis) => mapValues(lsis, CapacityUnits.decode),
      ),
    });
  },
};

export type CapacityUnits = {
  // When capacity units are present, the total is always present.
  capacityUnits: number;
  readCapacityUnits?: number;
  writeCapacityUnits?: number;
};

export const CapacityUnits = {
  decode(output: {
    CapacityUnits?: number;
    ReadCapacityUnits?: number;
    WriteCapacityUnits?: number;
  }): CapacityUnits {
    return unsetUndefined({
      capacityUnits: checkNotNull(output.CapacityUnits),
      readCapacityUnits: output.ReadCapacityUnits,
      writeCapacityUnits: output.WriteCapacityUnits,
    });
  },
};
