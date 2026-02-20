import type { UpdateTimeToLiveCommandOutput } from "@aws-sdk/client-dynamodb";

export type UpdateTimeToLiveOutput = Record<string, never>;

export function decode(
  _: UpdateTimeToLiveCommandOutput,
): UpdateTimeToLiveOutput {
  return {};
}
