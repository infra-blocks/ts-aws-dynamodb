# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.10.0] - 2025-07-12

### Added

- `ConditionExpression` now supports the `begins_with` function.

## [0.9.0] - 2025-07-11

### Added

- `ConditionExpression` logical operators `not`, `and` and `or`. `not` is provided as
a free floating function, whereas `and` and `or` are provided as methods. This choice
is made because it's the natural pronunciation of those constructs:
  - `not(attributeExists(...))`
  - `attributeNotExists(...).and(attributeType(...))`

## [0.8.0] - 2025-07-11

### Changed

- Reduce verbosity by moving `ConditionExpression` and `KeyConditionExpression` factory
functions outside of the classes and provide them as free floating functions.

## [0.7.0] - 2025-07-10

### Changed

- Similar refactoring as before but around `KeyConditionExpression`, which are used in
`Query` type APIs.

### Removed

- `KeyConditionExpression.partitionKeyEquals` since the specialization makes
less sense now that the substitutions are automated.

## [0.6.0] - 2025-07-10

### Changed

- Refactoring around how expressions and conditions will generate substitutions and
value references automatically. This is technically not a breaking change, but since
the `ConditionExpression` class *is* public and was changed, it could be. Although
external code is not expected to call methods like *toAwsInput* or *stringify* for
example.

## [0.5.0] - 2025-07-09

### Changed

- Renamed `Query` to `QueryParams`
- Moved `client.query` and `client.queryOne` internal implementation to use a new
command class.
- Renamed `KeyCondition` factory function params `attributeName` to just `name`.
- Moved expressions under `commands/expressions`. This is non-breaking.

## [0.4.0] - 2025-07-08

### Changed

- Renamed `WriteTransaction` to `WriteTransactionParams`.
- Renamed `WriteTransactionParams.items` to `WriteTransactionParams.writes`.
- Renamed `client.transactWriteItems` to `client.writeTransaction` for coherence.
- Moved internal implementation to use an internal command class.

## [0.3.2] - 2025-07-07

### Changed

- Introduce a non-breaking change where the implementation of `getItem` is leveraging
a new internal command class.

## [0.3.1] - 2025-07-07

### Changed

- Introduce a non-breaking change where the implementation of `putItem` is leveraging
a new internal command class.

## [0.3.0] - 2025-07-07

### Added

- The `createTable` command on the client.

## [0.2.1] - 2025-07-06

### Fixed

- A previous iteration of the package moved the rootDir configuration in tsconfig.json
to `./`, since it was complaining about the ambiguity of the root directory following
the bootstrapping of the first tests. Because we set that, the build output was rerouted
under cjs/src and esm/src respectively, instead of being available directly under cjs
and esm. The package.json makes this assumption in its "main" and "exports" declarations,
and so that assumption was broken and the package was unusable.

## [0.2.0] - 2025-07-06

### Changed

- Reviewed the names of the DynamoDbClient.create parameters to be shorter and more
intuitive.

### Added

- More code documentation.

## [0.1.1] - 2025-07-05

### Added

- A tiny bit of documentation. That's it!

## [0.1.0] - 2025-07-05

### Added

- Initial release of the package! Move the implementation work in progress from another
project to here.

[0.5.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/infra-blocks/ts-aws-dynamodb/releases/tag/v0.1.0
