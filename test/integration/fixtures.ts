import {
  DeleteTableCommand,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";
import type { Func } from "mocha";

export type Fixture = Func;

export function dropAllTables(): Fixture {
  return async function (this: Mocha.Context) {
    const client = this.createTestClient();
    const response = await client.send(new ListTablesCommand({}));
    for (const tableName of response.TableNames ?? []) {
      await client.send(new DeleteTableCommand({ TableName: tableName }));
    }
  };
}
