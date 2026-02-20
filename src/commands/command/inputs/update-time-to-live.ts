import type { UpdateTimeToLiveCommandInput } from "@aws-sdk/client-dynamodb";

export interface UpdateTimeToLiveInput {
  table: string;
  attribute: string;
  enabled: boolean;
}

export function encode(
  input: UpdateTimeToLiveInput,
): UpdateTimeToLiveCommandInput {
  return {
    TableName: input.table,
    TimeToLiveSpecification: {
      AttributeName: input.attribute,
      Enabled: input.enabled,
    },
  };
}
