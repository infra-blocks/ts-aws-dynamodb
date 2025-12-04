import {
  UpdateTimeToLiveCommand,
  type UpdateTimeToLiveCommandInput,
} from "@aws-sdk/client-dynamodb";
import type { Command } from "./types.js";

export interface UpdateTimeToLiveParams {
  table: string;
  attribute: string;
  enabled: boolean;
}

export class UpdateTimeToLive
  implements Command<UpdateTimeToLiveCommandInput, UpdateTimeToLiveCommand>
{
  private readonly table: string;
  private readonly attribute: string;
  private readonly enabled: boolean;

  private constructor(params: UpdateTimeToLiveParams) {
    const { table, attribute, enabled } = params;
    this.table = table;
    this.attribute = attribute;
    this.enabled = enabled;
  }

  toAwsCommandInput(): UpdateTimeToLiveCommandInput {
    return {
      TableName: this.table,
      TimeToLiveSpecification: {
        AttributeName: this.attribute,
        Enabled: this.enabled,
      },
    };
  }

  toAwsCommand(): UpdateTimeToLiveCommand {
    return new UpdateTimeToLiveCommand(this.toAwsCommandInput());
  }

  static from(params: UpdateTimeToLiveParams): UpdateTimeToLive {
    return new UpdateTimeToLive(params);
  }
}
