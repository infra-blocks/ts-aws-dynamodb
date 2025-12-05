import {
  DeleteTableCommand,
  type DeleteTableCommandInput,
} from "@aws-sdk/client-dynamodb";
import type { Command } from "./types.js";

export interface DeleteTableParams {
  name: string;
}

export class DeleteTable
  implements Command<DeleteTableCommandInput, DeleteTableCommand>
{
  private readonly name: string;

  private constructor(params: DeleteTableParams) {
    const { name } = params;
    this.name = name;
  }

  toAwsCommandInput(): DeleteTableCommandInput {
    return {
      TableName: this.name,
    };
  }

  toAwsCommand(): DeleteTableCommand {
    return new DeleteTableCommand(this.toAwsCommandInput());
  }

  static from(params: DeleteTableParams): DeleteTable {
    return new DeleteTable(params);
  }
}
