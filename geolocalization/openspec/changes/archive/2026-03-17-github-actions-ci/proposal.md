## Why

The project currently has no automated CI pipeline. Developers must manually run `cargo fmt`, `cargo clippy`, `cargo build`, and `cargo test` before merging. This is error-prone and slows down code review. A GitHub Actions workflow triggered on PRs against `main` will enforce code quality gates automatically.

## What Changes

- Add a GitHub Actions workflow file (`.github/workflows/ci.yml`) triggered on pull requests to `main`
- The workflow has three sequential stages:
  1. **Lint & Format** — runs `cargo fmt --check`, `cargo clippy -- -D warnings`, and `cargo check`
  2. **Build** — runs `cargo build --release` to verify the project compiles
  3. **Test** — runs `cargo test` to verify all tests pass
- Each stage depends on the previous one to fail fast and save CI minutes

## Capabilities

### New Capabilities
- `ci-pipeline`: GitHub Actions workflow with lint, build, and test stages for PRs against main

### Modified Capabilities
<!-- No existing capabilities are changing at the spec level -->

## Impact

- New file: `.github/workflows/ci.yml`
- No changes to existing source code, APIs, or dependencies
- PRs to `main` will be gated by passing CI checks
