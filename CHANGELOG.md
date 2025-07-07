# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.2] - 2025-07-07

### Changed

- Introduce a non-breaking change where th implementation of `getItem` is leveraging
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

[0.1.0]: https://github.com/infra-blocks/ts-aws-dynamodb/releases/tag/v0.1.0
