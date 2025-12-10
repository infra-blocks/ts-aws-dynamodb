# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.37.0] - 2025-12-10

### Added

- Support for `putItem` `returnValues`. This also required the introducion of the
`PutItemResult`. When `returnValues` is set to `"NONE"` or just
omitted, the method now returns an empty object instead of `void`. When `returnValues`
is `ALL_OLD`, the method now returns a response of the type: `{ item: Attributes }`.

## [0.36.0] - 2025-12-08

### Added

- `client.deleteItem`

## [0.35.0] - 2025-12-07

### Added

- Re-exporting all [@aws-sdk/client-dynamodb](https://www.npmjs.com/package/@aws-sdk/client-dynamodb) exception/error types for consumers.

## [0.34.0] - 2025-12-05

### Added

- The `deleteTable` client method.

## [0.33.0] - 2025-12-04

### Added

- Implementing the `updateTimeToLive` client method.

## [0.32.2] - 2025-08-24

### Changed

- Rewrote the `NativeMap` type to be an interface that extends `Attributes` instead of a type
definition that mimicks the signature of `Attributes`. This works because interfaces are bound
lazily as opposed to eagerly like type definitions. This has the added benefit of immediately
supporting/invalidating any changes that are made to `Attributes`.

### Fixed

- Bring the `@infra-blocks/types` package into prod dependencies, as type guards are now being
composed to become DynamoDB native type guards.

## [0.32.1] - 2025-08-23

### Added

- Small documentation update on the `Attributes` type specifying that `undefined` fields are
ignored and undefined elements within collections will throw errors. Both of these cases
won't compile, however. This is mostly for describing the behavior when the user *cheats* the
types.

## [0.32.0] - 2025-08-13

### Added

- Support for `RawOperand` and path/value unified normalization. It's the union of the work done
for `RawPath` and `RawValue`. Basically, APIs that support both types of operands now expose the
`RawOperand`, or a variant of it, to allow users to pass native types directly. The types that are
supported are described by `AttributeValue`, with one important distinction: strings are *paths*
by default, and every other type is a value. This change covers the remaining of the condition
APIs that weren't covered in the previous homologous patches for `Path` and `Value` operands.

## [0.31.0] - 2025-08-05

### Changed

- Renamed `IfNotExistsOperand` to `IfNotExists`. This is coherent with `Path`, `Value` and
`Size`.
- `IfNotExists` is now carrying the generic attribute value type of the corresponding default value.

## [0.30.0] - 2025-08-05

### Added

- Support for `RawPath` and value normalization. Very similar to the change in version [0.29.0],
but applied to value operands. The APIs that now support raw values are the `add` and `delete`
update actions.


## [0.29.0] - 2025-08-04

### Added

- Support for `RawPath` and path normalization. This feature introduce the idea of using
unwrapped types directly with the query expression API in certain circumstances. In specific,
this change introduce the ability to use `string`s instead of `Path`s in APIs where `Path`s
are required. This is accomplish with the use of a union type as input: `RawPath`, and a
normalization function behind the scene that normalizes the input to a `Path` object:
`Path.normalize`. Let's take the `remove` update action as an example. Before, the user
*had* to pass in a `Path` object using the `path` function, as such:
`update: [remove(path("the.attribute.))]`. With this change, the user can pass the attribute
path directly as a string: `update: [remove("the.attribute")]`. Affected APIs are:
  - The `attributeExists` condition function.
  - The `attributeNotExists` condition function.
  - The `attributeType` condition function.
  - All update actions (`set`, `remove`, `add`, `delete`) and the
  `ifNotExists` update action function.


## [0.28.0] - 2025-07-31

### Changed

- `ValueOperand` and `PathOperand` for shorter `Value` and `Path` type names respectively.
Just less characters overall bro.

## [0.27.0] - 2025-07-31

### Changed

- Big condition refactoring. The new syntax allows more flexibility in terms of operands
and is required for the planned changed regarding "loose" types. For example, the previous
`path("toto").exists()` syntax would work poorly to support using strings directly as
the default path type: `"toto".exists() # NOPE!`. So, functions were reworked to be
free floating and not methods. `.exists()` became `attributeExists(<lhs>, <rhs>)` for example.
This will work just fine with strings instead of operand types.
- The refactoring not only affected functions, but also reworked how *comparisons* are
handled. Before, to express a comparison such as "lower than", the user had to call a
`lowerThan` method on an operand object. This has been changed in favor of a more intuitive
syntax using arrays and tokens. `lowerThan` is now expressed as `[<lhs>, "<", <rhs>]`.
- These new functions and comparisons are overall better typed. Every function has been examined
to support exactly and only the types that DynamoDB supports. For example, going back to
comparisons, operators are not supported for just about every type. There is a specific subset
of values that can be used in comparisons. Those have been typed properly such that some
errors that can be caught at compile time will. For example, trying to compare to compare
sets with the `<` operator will not compile. At the time of this writing, however, no checks
are made to verify that a `number` is compared with another `number`, for example. This may
come in a future edition.

## [0.26.0] - 2025-07-28

### Changed

- Renamed `AttributeOperand` for `PathOperand`. It's less ambiguous. The factory
function has also been renamed from `attribute` to `path`.

## [0.25.0] - 2025-07-26

### Changed

- The `getItem` and `updateItem` client methods now take a `key` parameter instead
of a combination of `partitionKey` and optional `sortKey` parameters. This new
design is a little more concise and more aligned with what the native implementation
requires. The drawback is that user code could make a mistake a put three fields in
the key, for example.

## [0.24.0] - 2025-07-25

### Added

- Several convenient type definitions were added. In particular, a bunch of `Native<...>`
types were added to map every supported DynamoDB type with its typescript equivalent(s).
For example, `NativeNumber` maps to `bigint | number` to showcase that the API will accept
both and marshall them to DynamoDB numbers.

### Changed

- Minimized the types covered by `AttributeValue`. Instead of trying to match `lib-dynamodb`'s
type definition one for one, we just focus on the types we think will be useful in our context.
Most notably, the binary type is trimmed down to only `Buffer` and the `NumberValue` number
type has been removed for now (the user can just pass the numbers as string in the meantime,
where required).

## [0.23.0] - 2025-07-21

### Changed

- The syntax used to create `SetAction`s has changed to be more conventional with
the remaining action factory functions. Instead of being called like 
`set(attribute(<name>)).to(value(<value>))`, it has been streamlined to
`set(attribute(<name>), value(<value>))`. Addition and subtraction expressions are
also supported: `set(attribute(<name>), value(<value>), "+", value(<value>))`, where
`"+"` can be substituted by `"-"`.

## [0.22.0] - 2025-07-21

### Changed

- Reduced the footprint of the visible classes related to update expressions. Most
of the action classes are not exported anymore and only their factory functions are.
For example, `add` now returns an `UpdateAction` instead of an `AddAction`. `set`
is currently the only exception to this rule, since the behavior is in the returned
type.

## [0.21.0] - 2025-07-20

### Added

- Support for `DELETE` update clause through the `deleteFrom` function. Such as in:
`update: [deleteFrom(attribute(<name>), value(new Set([1, 2])))]`

### Changed

- Removed obsolete parameters from operand stringification methods. For example,
the `value` operand's stringify would look like this: `value.stringify({ names, values })`.
Now, this doesn't compile. The correct way to call it is like this: `value.stringify({ values })`.
A similar change was made for `attribute` operands, but regarding the `values` parameter.

## [0.20.0] - 2025-07-20

### Added

- Support for `ADD` update clause through the `add` function. Such as in:
`update: [add(attribute(<name>), value(<value>))]`.

### Changed

- Renamed `assign` to `set`. Originally, it was called `assign` because it was thought
that it was going to be part of a bigger offering of set actions. More specifically,
I thought that `increment` and `decrement` operations might also be provided. I realized
midway that those terms where not exact, since this: `SET x = y + 5` is perfectly legal
and does not represent an "increment", but rather a simple addition followed by an assignment.
`set` is better because it maps directly to the matching update clause: `SET`.

## [0.19.0] - 2025-07-18

### Added

- Support for removal actions in update expressions through the exported function
`remove`. You use it like that pal: `update: [remove(<name>)]`. There have it.

## [0.18.1] - 2025-07-18

### Changed

- To follow conventions across the board, the `AttributeValues` substitution generation
logic was also changed. This does not intentionally fix any known bug, however.
Instead of generating substitutes as such: `:<number>`, they are now slightly more
verbose and readable by being generated as such: `:value<number>`.

### Fixed

- Changed the attribute name substitution logic to correctly implement nested path.
Before, the substitution of `field.nested` would return `#field.nested`. This was
invalid because the substitution mapped `#field.nested` to `field.nested`, whereas
it really should map every path token alone. See
 [here](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html#Expressions.ExpressionAttributeNames.NestedAttributes).
Now, the algorithm correctly generates a substitution per path token. I.e., the previous
example resolves to `#attr1.#attr2`, with one substitution per path. This new naming
convention of substitutes handles the case of special characters: they won't be found
in the substitutions anymore.

## [0.18.0] - 2025-07-18

### Added

- Added baseline support for `client.updateItem`. It can handle condition expressions
are update expressions. The update expressions, however, currently only support the
`SET` clauses with the `assign` action type. More are coming.

### Changed

- Removed the `condition` factory function in favor of having a more conventional
`Condition.from` static factory. This should not impact client code, however, as
the condition function was not meant to be called outside. Neither was the `Condition`
constructor, which is now private and only accessed by the new factory method.

## [0.17.1] - 2025-07-17

### Changed

- Renamed the `AttributeValues.reference` and `AttributeValues.getReferences` function
names to `AttributeValues.substitute` and `AttributeValues.getSubstitutions` respectively.
This is just to be more coherent across the board. Those classes are not exported
(or if they are it's a bug) and therefore should not impact client code.

## [0.17.0] - 2025-07-17

### Added

- The first `UpdateExpression`s foundational unit: the `Assignement`! It is the only
supported action so far, but his fully implemented: `path = operand`,
`path = operand + operand`, `path = operand - operand` and the `if_not_exists` function
can be used in place of any `operand`.

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


[0.37.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.36.0...v0.37.0
[0.36.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.35.0...v0.36.0
[0.35.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.34.0...v0.35.0
[0.34.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.33.0...v0.34.0
[0.33.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.32.2...v0.33.0
[0.32.2]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.32.1...v0.32.2
[0.32.1]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.32.0...v0.32.1
[0.32.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.31.0...v0.32.0
[0.31.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.30.0...v0.31.0
[0.30.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.29.0...v0.30.0
[0.29.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.28.0...v0.29.0
[0.28.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.27.0...v0.28.0
[0.27.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.26.0...v0.27.0
[0.26.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.25.0...v0.26.0
[0.25.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.24.0...v0.25.0
[0.24.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.23.0...v0.24.0
[0.23.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.22.0...v0.23.0
[0.22.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.21.0...v0.22.0
[0.21.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.20.0...v0.21.0
[0.20.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.19.0...v0.20.0
[0.19.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.18.0...v0.19.0
[0.18.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.17.1...v0.18.0
[0.17.1]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.17.0...v0.17.1
[0.17.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/infra-blocks/ts-aws-dynamodb/compare/v0.15.0...v0.16.0
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
