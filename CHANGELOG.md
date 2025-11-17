# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive open source infrastructure
  - CODE_OF_CONDUCT.md with Contributor Covenant v2.1
  - CONTRIBUTING.md with detailed contributor guidelines
  - SECURITY.md with vulnerability disclosure process
  - Issue templates (bug report, feature request)
  - Pull request template
  - CODEOWNERS file
  - Dependabot configuration for automated dependency updates
- CI/CD improvements
  - Comprehensive CI workflow for Rust and TypeScript
  - Security audit workflow
  - Multi-platform build testing
- Code quality tooling
  - ESLint and Prettier configurations
  - New npm scripts for linting and formatting
  - Rust clippy and rustfmt checks in CI
- License clarification (MIT License)
- Package.json metadata improvements (name, description, repository, etc.)

### Changed

- Updated LICENSE from CC0 to MIT
- Fixed package name from "r2-t2" to "founders-dilemma"
- Package visibility changed from private to public

### Fixed

- Security vulnerability in js-yaml (CVE-2025-64718)
- Security vulnerability in vite (CVE-2025-62522)
- Missing package.json metadata fields

### Security

- Fixed prototype pollution vulnerability in js-yaml
- Fixed server.fs.deny bypass in vite
- Added pnpm overrides for security patches
- Implemented automated security audits

## [0.2.5] - 2025-01-XX

### Added

- GitHub Pages health checker with real-time status monitoring (#4)
- Enhanced UX and optimized web deployment for GitHub Pages (#3)

### Changed

- Updated .nvmrc to reflect current Node.js version (#2)

### Fixed

- Resolved package.json preinstall script issue (#1)
- Updated .gitignore for better file handling (#1)

## [0.2.0] - Previous Release

### Added

- Core game mechanics
  - 15 strategic actions
  - Synergy bonuses for action combinations
  - Dynamic market conditions
  - Strategic dilemmas with educational feedback
- Win condition: Escape Velocity (sustained growth across 4 metrics)
- Defeat conditions (bankruptcy, burnout, reputation loss)
- Educational systems
  - Weekly insights with feedback
  - Compounding effects for sustained practices
  - Failure warnings before crises
- Difficulty modes (Easy, Normal, Hard)
- Achievements system
- Keyboard shortcuts

### Technical

- Built with Tauri 2 + React 19
- Rust backend for game logic
- TypeScript frontend with strict mode
- Mantine UI components
- Modular game engine architecture

---

## Version History Format

### Categories

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security fixes and improvements

### Version Numbers

Following [Semantic Versioning](https://semver.org/):

- **MAJOR** - Incompatible API changes
- **MINOR** - New functionality (backwards compatible)
- **PATCH** - Bug fixes (backwards compatible)

[Unreleased]: https://github.com/acailic/founders-dilemma/compare/v0.2.5...HEAD
[0.2.5]: https://github.com/acailic/founders-dilemma/releases/tag/v0.2.5
