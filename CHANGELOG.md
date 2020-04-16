# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [3.0.0] - 2020-04-16

### Changed
- Code refactor
- CLI copy updates

### Fixed
- Better support for large file count
- Config command shows all config files

## [2.0.0] - 2020-01-21
### Added
- Binary assets now converted to base64 strings on deploy.

### Changed
- By default base64 converted assets are converted to binary on fetch (keep previous behavior with `--keep-encode`).

- By default deploy wipes all upstream files first (preserve upstream files not found locally with `--preserve`)

### Fixed
- Support for large file count

## [1.0.0] - 2019-06-20

### Added

- Initial release

[Unreleased]: https://github.com/kong/kong-portal-cli/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/kong/kong-portal-cli/releases/tag/v0.0.1
