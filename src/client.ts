import type { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBClient as BaseClient,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";
import type {
  PutCommandInput,
  TransactWriteCommandInput,
  TranslateConfig,
} from "@aws-sdk/lib-dynamodb";
import {
  DynamoDBDocumentClient as Client,
  GetCommand,
  PutCommand,
  QueryCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import type { Logger } from "@infra-blocks/logger-interface";
import { NullLogger } from "@infra-blocks/null-logger";
import { type Retry, retry } from "@infra-blocks/retry";
import type {
  Attributes,
  GetItem,
  PutItem,
  Query,
  WriteTransaction,
} from "./types.js";

export class DynamoDbClientError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DynamoDbClientError";
  }
}

/*
The uniqueness constraint of an attribute, for example an email, can be enforced in DynamoDB using
this scheme: https://aws.amazon.com/blogs/database/simulating-amazon-dynamodb-unique-constraints-using-transactions/#:~:text=Primary%20keys%20are%20guaranteed%20to,are%20not%20the%20primary%20key.

This is to say, we can create items in a different table that only has a pk for this specific use case, or we could
also use the same table. It's just going to add some sheeet to the table.
*/
export class DynamoDbClient {
  private readonly client: Client;
  private readonly logger: Logger;

  private constructor(params: { client: Client; logger: Logger }) {
    const { client, logger } = params;
    this.client = client;
    this.logger = logger;
  }

  ready(): Retry<void> {
    return retry(
      async () => {
        await this.client.send(new ListTablesCommand({}));
      },
      {
        isRetryableError: (err: Error) => {
          if ("code" in err) {
            return err.code === "ECONNRESET";
          }
          return false;
        },
      },
    );
  }

  async getItem<T>(params: GetItem): Promise<T | undefined> {
    try {
      const { table, parititionKey, sortKey } = params;
      const key = {
        [parititionKey.name]: parititionKey.value,
      };
      if (sortKey != null) {
        key[sortKey.name] = sortKey.value;
      }

      const response = await this.client.send(
        new GetCommand({
          TableName: table,
          Key: key,
        }),
      );

      return response.Item as T | undefined;
    } catch (err) {
      throw new DynamoDbClientError(
        `error while getting item from DynamoDB: ${JSON.stringify(params)}`,
        {
          cause: err,
        },
      );
    }
  }

  async putItem(params: PutItem): Promise<void> {
    try {
      await this.client.send(toPutCommand(params));
    } catch (err) {
      this.logger.error(
        "error while putting item in DynamoDB caused by %s",
        err,
      );
      throw new DynamoDbClientError("error while putting item in DynamoDB", {
        cause: err,
      });
    }
  }

  async transactWriteItems(params: WriteTransaction): Promise<void> {
    try {
      const commandInput = toTransactWriteItemsCommandInput(params);
      if (this.logger.isDebugEnabled()) {
        this.logger.debug(
          "executing transaction write: %s",
          JSON.stringify(commandInput),
        );
      }
      const command = new TransactWriteCommand(commandInput);
      await this.client.send(command);
    } catch (err) {
      throw new DynamoDbClientError(
        "error while transactionally writing items in DynamoDB",
        {
          cause: err,
        },
      );
    }
  }

  async *query<T extends Attributes = Attributes>(
    query: Query,
  ): AsyncGenerator<T> {
    try {
      const { expression, attributeValues } = query.condition.toJson();
      let response = await this.client.send(
        new QueryCommand({
          TableName: query.table,
          IndexName: query.index,
          KeyConditionExpression: expression,
          ExpressionAttributeValues: attributeValues,
        }),
      );

      for (const item of response.Items || []) {
        yield item as T;
      }

      while (response.LastEvaluatedKey != null) {
        response = await this.client.send(
          new QueryCommand({
            TableName: query.table,
            IndexName: query.index,
            KeyConditionExpression: expression,
            ExpressionAttributeValues: attributeValues,
            ExclusiveStartKey: response.LastEvaluatedKey,
          }),
        );

        for (const item of response.Items || []) {
          yield item as T;
        }
      }
    } catch (err) {
      throw new DynamoDbClientError(
        "error while querying DynamoDB on the lookup index",
        {
          cause: err,
        },
      );
    }
  }

  async queryOne<T extends Attributes = Attributes>(
    query: Query,
  ): Promise<T | undefined> {
    try {
      let item: T | undefined;
      for await (const queryItem of this.query<T>(query)) {
        if (item != null) {
          throw new DynamoDbClientError(
            "expected one item in query but found at least 2",
          );
        }
        item = queryItem;
      }
      return item;
    } catch (err) {
      // TODO: careful here as email is PII.
      throw new DynamoDbClientError(
        `error while querying one: ${JSON.stringify(query)}`,
        {
          cause: err,
        },
      );
    }
  }

  static fromBase(params: {
    client: BaseClient;
    document?: TranslateConfig;
    logger?: Logger;
  }): DynamoDbClient {
    const { client, document: documentClientConfig, logger } = params;
    const documentClient = Client.from(client, documentClientConfig);
    return DynamoDbClient.from({ client: documentClient, logger });
  }

  static from(params: { client: Client; logger?: Logger }): DynamoDbClient {
    const { client, logger = NullLogger.create() } = params;
    return new DynamoDbClient({ client, logger });
  }

  static create(params?: {
    base?: DynamoDBClientConfig;
    document?: TranslateConfig;
    logger?: Logger;
  }): DynamoDbClient {
    const { base, document, logger } = params || {};
    const baseClient = new BaseClient(base || {});
    return DynamoDbClient.fromBase({ client: baseClient, document, logger });
  }
}

// Could be associated on the PutItem type if it was an opaque type rather
// than an interface.
function toPutCommand(params: PutItem): PutCommand {
  return new PutCommand(toToPutCommandInput(params));
}

function toToPutCommandInput(params: PutItem): PutCommandInput {
  const { table, item, condition } = params;
  const conditionPayload = condition != null ? condition.toAwsInput() : {};
  return {
    TableName: table,
    Item: item,
    ...conditionPayload,
  };
}

function toTransactWriteItemsCommandInput(
  params: WriteTransaction,
): TransactWriteCommandInput {
  return {
    TransactItems: params.items.map((item) => ({
      Put: toToPutCommandInput(item),
    })),
  };
}
