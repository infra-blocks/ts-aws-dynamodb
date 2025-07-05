# ts-aws-dynamodb
[![Build](https://github.com/infra-blocks/ts-aws-dynamodb/actions/workflows/build.yml/badge.svg)](https://github.com/infra-blocks/ts-aws-dynamodb/actions/workflows/build.yml)
[![Release](https://github.com/infra-blocks/ts-aws-dynamodb/actions/workflows/release.yml/badge.svg)](https://github.com/infra-blocks/ts-aws-dynamodb/actions/workflows/release.yml)
[![codecov](https://codecov.io/gh/infra-blocks/ts-aws-dynamodb/graph/badge.svg?token=4TB4Y7AINE)](https://codecov.io/gh/infra-blocks/ts-aws-dynamodb)

A convenience library wrapper around [`@aws-sdk/client-dynamodb`](https://www.npmjs.com/package/@aws-sdk/client-dynamodb) and
[`@aws-sdk/lib-dynamodb`](https://www.npmjs.com/package/@aws-sdk/lib-dynamodb). The wrapper offers:
- More type safe interfaces (trough the use of descriptive types, such as for condition expressions).
- More conventional field names. Input and output fields use the conventional `camelCase` JS/TS convention over the `PascalCase`
imposed by the AWS APIs.
- Every client error is wrapped into a error adding description about which operation triggered the error.
- Pagination is provided for APIs that support it and exposed as `AsyncIterators`.
