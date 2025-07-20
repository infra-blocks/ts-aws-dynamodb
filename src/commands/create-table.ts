import {
  CreateTableCommand,
  type CreateTableCommandInput,
  type GlobalSecondaryIndex,
  type KeySchemaElement,
  type LocalSecondaryIndex,
} from "@aws-sdk/client-dynamodb";
import type { Index, IndexFieldType } from "../types.js";
import type { Command } from "./types.js";

export interface CreateTableParams {
  name: string;
  primaryKey: Index;
  gsis?: Record<string, Index>;
  lsis?: Record<string, Index>;
}

export class CreateTable
  implements Command<CreateTableCommandInput, CreateTableCommand>
{
  private readonly name: string;
  private readonly primaryKey: Index;
  private readonly gsis?: Record<string, Index>;
  private readonly lsis?: Record<string, Index>;

  private constructor(params: CreateTableParams) {
    const { name, primaryKey, gsis, lsis } = params;
    this.name = name;
    this.primaryKey = primaryKey;
    this.gsis = gsis;
    this.lsis = lsis;
  }

  toAwsCommandInput(): CreateTableCommandInput {
    const attributeDefinitions: Map<string, IndexFieldType> = new Map();
    const primaryKeySchema = keySchema({
      attributeDefinitions,
      key: this.primaryKey,
    });

    const globalSecondaryIndexes: Array<GlobalSecondaryIndex> =
      this.gsiInput(attributeDefinitions);
    const localSecondaryIndexes: Array<LocalSecondaryIndex> =
      this.lsiInput(attributeDefinitions);

    return {
      AttributeDefinitions: [...attributeDefinitions.entries()].map(
        ([name, type]) => ({
          AttributeName: name,
          AttributeType: type,
        }),
      ),
      TableName: this.name,
      KeySchema: primaryKeySchema,
      GlobalSecondaryIndexes:
        globalSecondaryIndexes.length > 0 ? globalSecondaryIndexes : undefined,
      LocalSecondaryIndexes:
        localSecondaryIndexes.length > 0 ? localSecondaryIndexes : undefined,
      BillingMode: "PAY_PER_REQUEST", // Use on-demand billing mode by default.
    };
  }

  toAwsCommand(): CreateTableCommand {
    return new CreateTableCommand(this.toAwsCommandInput());
  }

  private gsiInput(
    attributeDefinitions: Map<string, IndexFieldType>,
  ): Array<GlobalSecondaryIndex> {
    const gsis = this.gsis ?? {};

    const globalSecondaryIndexes: Array<GlobalSecondaryIndex> = [];
    for (const [indexName, field] of Object.entries(gsis)) {
      const ks = keySchema({
        attributeDefinitions,
        key: field,
      });
      globalSecondaryIndexes.push({
        IndexName: indexName,
        KeySchema: ks,
        Projection: {
          ProjectionType: "ALL",
        },
      });
    }
    return globalSecondaryIndexes;
  }

  private lsiInput(
    attributeDefinitions: Map<string, IndexFieldType>,
  ): Array<LocalSecondaryIndex> {
    const lsis = this.lsis ?? {};

    const localSecondaryIndexes: Array<LocalSecondaryIndex> = [];
    for (const [indexName, field] of Object.entries(lsis)) {
      const ks = keySchema({
        attributeDefinitions,
        key: {
          partitionKey: field.partitionKey,
          sortKey: field.sortKey,
        },
      });
      localSecondaryIndexes.push({
        IndexName: indexName,
        KeySchema: ks,
        Projection: {
          ProjectionType: "ALL",
        },
      });
    }
    return localSecondaryIndexes;
  }

  static from(params: CreateTableParams): CreateTable {
    return new CreateTable(params);
  }
}

function keySchema(params: {
  attributeDefinitions: Map<string, IndexFieldType>;
  key: Index;
}): Array<KeySchemaElement> {
  const { attributeDefinitions, key } = params;
  const keySchema: Array<KeySchemaElement> = [];
  attributeDefinitions.set(key.partitionKey.name, key.partitionKey.type);
  keySchema.push({
    AttributeName: key.partitionKey.name,
    KeyType: "HASH",
  });
  if (key.sortKey != null) {
    attributeDefinitions.set(key.sortKey.name, key.sortKey.type);
    keySchema.push({
      AttributeName: key.sortKey.name,
      KeyType: "RANGE",
    });
  }
  return keySchema;
}
