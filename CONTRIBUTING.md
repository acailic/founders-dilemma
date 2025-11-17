# Contributing to Founder's Dilemma

Thank you for your interest in contributing to Founder's Dilemma! This educational startup simulation game is built by the community, for the community. We welcome contributions of all kinds.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node version, etc.)
- **Game state** (what week, what metrics, what difficulty)

### Suggesting Features

We love feature suggestions! When proposing new features:

- **Use a clear title** describing the feature
- **Provide detailed description** of the proposed functionality
- **Explain the motivation** - what problem does it solve?
- **Consider scope** - does it fit the educational game mission?

### Gameplay Contributions

The game is designed to teach real founder principles. You can contribute:

**New Actions**: Suggest strategic actions founders can take

- Must teach a real principle
- Should have interesting trade-offs
- Need clear success/failure conditions

**Synergies**: Propose action combinations that work well together

- Based on real startup best practices
- Should provide meaningful bonuses
- Must be balanced for gameplay

**Market Conditions**: Add dynamic events based on real experiences

- Reflect actual market dynamics
- Create meaningful strategic choices
- Should be educational, not just random

**Strategic Dilemmas**: Create tough choices that teach decision-making

- Based on real founder experiences
- Multiple valid approaches
- Clear educational value

### Code Contributions

We welcome code contributions! Areas to contribute:

- **Bug fixes** - Fix existing issues
- **Feature implementation** - Build approved features
- **Performance improvements** - Optimize game engine
- **UI/UX enhancements** - Improve player experience
- **Test coverage** - Add missing tests
- **Documentation** - Improve code docs

## Development Setup

### Prerequisites

- **Node.js 18+** (we use nvm: `nvm use`)
- **pnpm** - `npm install -g pnpm`
- **Rust** - Install from [rustup.rs](https://rustup.rs)
- **Tauri prerequisites** - See [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/acailic/founders-dilemma.git
cd founders-dilemma

# Use correct Node version
nvm use

# Install dependencies
pnpm install

# Run in development mode
pnpm dev
```

### Project Structure

```
founders-dilemma/
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── types/              # TypeScript type definitions
│   └── ...
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── game/           # Game logic modules
│   │   └── lib.rs          # Main Tauri app
│   └── Cargo.toml
├── test/                   # Test files
├── docs/                   # Documentation
└── ...
```

## Development Workflow

### 1. Create a Branch

```bash
# Update your main branch
git checkout main
git pull origin main

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run Rust tests
cd src-tauri
cargo test
cargo clippy
cargo fmt --check

# Run frontend tests (if available)
pnpm test

# Test the game manually
pnpm dev
```

### 4. Commit Your Changes

See [Commit Messages](#commit-messages) section below.

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Coding Standards

### TypeScript/React

- **Use TypeScript** - No plain JavaScript
- **Strict mode enabled** - Follow TypeScript strict mode
- **Functional components** - Use React hooks
- **Type all props** - No implicit any types
- **Descriptive names** - Clear variable and function names

Example:

```typescript
interface ActionButtonProps {
  actionId: string;
  isEnabled: boolean;
  onClick: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ actionId, isEnabled, onClick }) => {
  // Implementation
};
```

### Rust

- **Follow rustfmt** - Run `cargo fmt` before committing
- **Pass clippy** - Run `cargo clippy` and fix warnings
- **Write tests** - Add unit tests for game logic
- **Document public APIs** - Use doc comments
- **Handle errors properly** - Use Result types

Example:

```rust
/// Calculates the compound effect bonus for a specific metric
///
/// # Arguments
/// * `streak` - Number of consecutive weeks of good practice
/// * `base_bonus` - Base percentage bonus per week
///
/// # Returns
/// The total bonus percentage (capped at max)
pub fn calculate_compound_bonus(streak: u32, base_bonus: f64) -> f64 {
    // Implementation with proper error handling
}
```

### Code Organization

- **Keep files focused** - Single responsibility
- **Avoid deep nesting** - Extract functions
- **DRY principle** - Don't repeat yourself
- **Clear naming** - Self-documenting code

## Testing Guidelines

### Rust Tests

Every game logic module should have comprehensive tests:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compound_bonus_calculation() {
        let bonus = calculate_compound_bonus(5, 2.0);
        assert_eq!(bonus, 10.0);
    }
}
```

### Frontend Tests

(To be added - Jest/Vitest setup planned)

### Manual Testing

Before submitting:

- Play through multiple weeks
- Test all difficulty modes
- Verify win/loss conditions
- Check UI responsiveness
- Test keyboard shortcuts

## Commit Messages

We follow conventional commits for clear history:

### Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```
feat(actions): add "Hire Advisor" strategic action

Adds new action that provides momentum boost and reduces founder
burnout risk. Costs $5k and requires 30+ reputation.

Closes #123
```

```
fix(economy): prevent negative bank balance from rounding errors

Financial calculations now use proper decimal precision to avoid
rounding errors that could cause bank < 0 without triggering defeat.

Fixes #456
```

```
docs(readme): add gameplay screenshots and GIFs

Makes it easier for new players to understand the game without
running it first.
```

### Guidelines

- **Use imperative mood** - "add" not "added" or "adds"
- **Keep subject under 50 chars** - Concise summary
- **Capitalize first letter** - Proper formatting
- **No period at end** - Subject line convention
- **Reference issues** - Use "Closes #123" or "Fixes #456"

## Pull Request Process

### Before Submitting

- [ ] Tests pass (`cargo test`, `pnpm test`)
- [ ] Linting passes (`cargo clippy`, `cargo fmt`)
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Commits follow convention
- [ ] Branch is up to date with main

### PR Description Template

Your PR should include:

1. **Summary** - What does this change?
2. **Motivation** - Why is this needed?
3. **Changes** - What specifically changed?
4. **Testing** - How was this tested?
5. **Screenshots** - If UI changes
6. **Breaking changes** - If any

### Review Process

1. **Automated checks** - CI must pass
2. **Code review** - At least one approval required
3. **Testing** - Maintainers may test manually
4. **Merge** - Squash and merge once approved

### After Merge

- Your contribution will be in the next release
- You'll be added to contributors list
- We may ask for follow-up improvements

## Community

### Where to Get Help

- **GitHub Issues** - Bug reports and feature requests
- **Discussions** - Questions and community chat
- **Documentation** - Check README and docs/

### Recognition

All contributors are recognized:

- Listed in README contributors section
- Mentioned in release notes
- Appreciated by the community!

### Giving Feedback

We value your feedback on:

- Game balance and difficulty
- Educational effectiveness
- UI/UX improvements
- Documentation clarity
- Development experience

---

## Thank You!

Every contribution makes this game better for everyone learning about startups. Whether you're fixing a typo, suggesting a feature, or building major functionality - thank you for being part of the Founder's Dilemma community!

**Ready to contribute?** Pick an issue labeled `good first issue` or `help wanted` to get started!
