import {
  DeleteTableCommand,
  type DynamoDBClient,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";

export async function dropAllTables(client: DynamoDBClient) {
  const response = await client.send(new ListTablesCommand({}));
  for (const tableName of response.TableNames ?? []) {
    await client.send(new DeleteTableCommand({ TableName: tableName }));
  }
}
