# ts-aws-dynamodb
[![Build](https://github.com/infra-blocks/ts-aws-dynamodb/actions/workflows/build.yml/badge.svg)](https://github.com/infra-blocks/ts-aws-dynamodb/actions/workflows/build.yml)
[![Release](https://github.com/infra-blocks/ts-aws-dynamodb/actions/workflows/release.yml/badge.svg)](https://github.com/infra-blocks/ts-aws-dynamodb/actions/workflows/release.yml)
[![codecov](https://codecov.io/gh/infra-blocks/ts-aws-dynamodb/graph/badge.svg?token=4TB4Y7AINE)](https://codecov.io/gh/infra-blocks/ts-aws-dynamodb)

A convenience library wrapper around [`@aws-sdk/client-dynamodb`](https://www.npmjs.com/package/@aws-sdk/client-dynamodb) and
[`@aws-sdk/lib-dynamodb`](https://www.npmjs.com/package/@aws-sdk/lib-dynamodb). The wrapper offers:
- A type safe expression language that automatically handles the aliasing of attribute names and values.
- More conventional field names. Input and output fields use the more common `camelCase` JS/TS convention
over the `PascalCase` imposed by the AWS APIs.
- Pagination is provided for APIs that support it and exposed as `AsyncIterators`.

## Noteworthy divergences in naming

- `TransactWriteItems` (dis engrish?) is renamed to `WriteTransaction`.
- `DeleteIem` and `PutItem`'s return payload contains an `item` field, and not and `Attributes` field. This is because
the user can only specify `ALL_OLD` as optional return value, which will always return a full item.
- The above is unlike the `UpdateItem` command, which *can* return attributes subsets when `UPDATED_[NEW|OLD]` is specified.
So, the `UpdateItemOutput` contains an `attributes` field instead of `item` field.
