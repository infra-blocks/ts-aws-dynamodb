# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.16.0] - 2025-07-16

### Changed

- Refactoring around the generic `Expression` context. While thinking about the
upcoming `Update` expressions, it seemed a good idea to isolate operands and
reuse their concepts differently within each expression types (`Condition`s and
upcoming `Update`s). This lead to removing the `Expression` type altogether in
favor of the `Condition` type.
- To allow for coherent code reuse, `Condition`s are no longer created from operand
type methods but rather require being wrapped in a `where` call first. For example,
what used to be `attribute(<name>).exists()` is now `where(attribute(<name>)).exists()`.
This way, functions that provide `Condition`s won't pollute functions that provide
`Update`s.
- Made `size` a floating function instead of a method as it reads more clearly
and makes more sense within the new split. What used to be `attribute(<name>).size()`
is now `where(size(attribute(<name>)))...`.

## [0.15.0] - 2025-07-15

### Changed

- Refactored the `Expression.stringify` and associated type's parameters to 
`names` and `values` instead of `attributeNames` and `attributeValues` respectively.
Saving on chars y'all.

## [0.14.0] - 2025-07-15

### Added

- The `between` and `in` expression operators. 

### Changed

- Renamed `attribute(<name>).type(<type>)` for `attribute(<name>).isType(<type>)`.
- Now requires the argument to `isType` to be an `ExpressionValue` and no longer implies
it. Before, you could call `attribute(<name>).type("S")` (before the renaming). Now,
you have to be explicit: `attribute(<name>).isType(value("S"))`.

## [0.13.0] - 2025-07-14

### Added

- New `Operand` class method allowing comparison operators:
  - `notEquals`
  - `greaterThan`
  - `greaterThanOrEquals`
  - `lowerThan`
  - `lowerThanOrEquals`
- And matching aliases: `eq` (new alias for previous `equals` operator), `ne`, `lt`, `lte`, `gt`, and `gte`.


## [0.12.0] - 2025-07-14

### Changed

- Reviewed the `Expression` interface significantly to reflect better the behavior of the
actual engine. For example, DynamoDB accepts `contains` to be called with attributes names
or values for both operands, whereas `attribute_exists` requires an attribute as its
argument. This was reflected by grouping attribute names and values under the generic
`Operand` type, and specialize with subclasses.

## [0.11.0] - 2025-07-13

### Added

- `ConditionExpression` `contains` and `size` functions. The `size` function is peculiar
in that, contrary to the other functions, it does not return a boolean but rather a
number that should be used within the context of a higher order expression. Therefore,
we introduced a new type: `FunctionExpression`, that is returned by the factory and
that is different than `ConditionExpression` (so it cannot be used alone with a `putItem`
command, for example). The only place right now where it can be embedded is within the
`contains` function, where it can be called as such: `contains(Tata, size(Toto))`.

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

[0.15.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/infra-blocks/ts-aws-dynamodb/releases/tag/v0.1.0
