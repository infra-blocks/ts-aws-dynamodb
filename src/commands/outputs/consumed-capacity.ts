import type * as sdk from "@aws-sdk/client-dynamodb";
import { ObjectBuilder } from "./lib.js";

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
    return {
      ...CapacityUnits.decode(output),
      ...ObjectBuilder.of<ConsumedCapacity>()
        .enforceNotNull("tableName", output.TableName)
        .mapIfNotNull("table", output.Table, CapacityUnits.decode)
        .mapValuesIfNotNull(
          "globalSecondaryIndexes",
          output.GlobalSecondaryIndexes,
          CapacityUnits.decode,
        )
        .mapValuesIfNotNull(
          "localSecondaryIndexes",
          output.LocalSecondaryIndexes,
          CapacityUnits.decode,
        )
        .unwrap(),
    };
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
    return ObjectBuilder.of<CapacityUnits>()
      .enforceNotNull("capacityUnits", output.CapacityUnits)
      .setIfNotNull("readCapacityUnits", output.ReadCapacityUnits)
      .setIfNotNull("writeCapacityUnits", output.WriteCapacityUnits)
      .unwrap();
  },
};
