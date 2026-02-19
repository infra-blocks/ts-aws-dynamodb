import type {
  CreateTableCommandInput,
  GlobalSecondaryIndex,
  KeySchemaElement,
  LocalSecondaryIndex,
} from "@aws-sdk/client-dynamodb";
import type { KeyAttributeType, KeySchema } from "../../../types.js";

export interface CreateTableInput<KS extends KeySchema = KeySchema> {
  name: string;
  keySchema: KS;
  // TODO: the index definition should be more complete.
  gsis?: Record<string, KeySchema>;
  lsis?: Record<string, KeySchema>;
}

export function encode<Def extends KeySchema = KeySchema>(
  input: CreateTableInput<Def>,
): CreateTableCommandInput {
  const attributeDefinitions: Map<string, KeyAttributeType> = new Map();
  const primaryKeySchema = encodeKeySchema({
    attributeDefinitions,
    key: input.keySchema,
  });

  const globalSecondaryIndexes = encodeGsis(attributeDefinitions, input.gsis);
  const localSecondaryIndexes = encodeLsis(attributeDefinitions, input.lsis);
  return {
    AttributeDefinitions: [...attributeDefinitions.entries()].map(
      ([name, type]) => ({
        AttributeName: name,
        AttributeType: type,
      }),
    ),
    TableName: input.name,
    KeySchema: primaryKeySchema,
    GlobalSecondaryIndexes:
      globalSecondaryIndexes.length > 0 ? globalSecondaryIndexes : undefined,
    LocalSecondaryIndexes:
      localSecondaryIndexes.length > 0 ? localSecondaryIndexes : undefined,
    BillingMode: "PAY_PER_REQUEST", // Use on-demand billing mode by default.
  };
}

function encodeKeySchema(params: {
  attributeDefinitions: Map<string, KeyAttributeType>;
  key: KeySchema;
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

function encodeGsis(
  attributeDefinitions: Map<string, KeyAttributeType>,
  gsis: CreateTableInput["gsis"],
): Array<GlobalSecondaryIndex> {
  const globalSecondaryIndexes: Array<GlobalSecondaryIndex> = [];
  for (const [indexName, field] of Object.entries(gsis ?? {})) {
    const ks = encodeKeySchema({
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

function encodeLsis(
  attributeDefinitions: Map<string, KeyAttributeType>,
  lsis: CreateTableInput["lsis"],
): Array<LocalSecondaryIndex> {
  const localSecondaryIndexes: Array<LocalSecondaryIndex> = [];
  for (const [indexName, field] of Object.entries(lsis ?? {})) {
    const ks = encodeKeySchema({
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
