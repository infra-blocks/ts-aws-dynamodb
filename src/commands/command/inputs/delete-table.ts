import type { DeleteTableCommandInput } from "@aws-sdk/client-dynamodb";

export interface DeleteTableInput {
  name: string;
}

export function encode(input: DeleteTableInput): DeleteTableCommandInput {
  return {
    TableName: input.name,
  };
}
