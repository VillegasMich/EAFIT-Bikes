## ADDED Requirements

### Requirement: CI workflow triggers on pull requests to main
The CI workflow SHALL be triggered when a pull request is opened, synchronized, or reopened against the `main` branch.

#### Scenario: PR opened against main
- **WHEN** a developer opens a pull request targeting the `main` branch
- **THEN** the CI workflow SHALL start executing

#### Scenario: PR opened against a non-main branch
- **WHEN** a developer opens a pull request targeting a branch other than `main`
- **THEN** the CI workflow SHALL NOT be triggered

### Requirement: Lint and format stage runs first
The CI pipeline SHALL execute a lint and format stage as its first job, which runs `cargo fmt --check`, `cargo clippy -- -D warnings`, and `cargo check`.

#### Scenario: Code passes all lint checks
- **WHEN** the code passes `cargo fmt --check`, `cargo clippy -- -D warnings`, and `cargo check`
- **THEN** the lint stage SHALL succeed and the build stage SHALL start

#### Scenario: Code has formatting issues
- **WHEN** `cargo fmt --check` detects formatting differences
- **THEN** the lint stage SHALL fail and subsequent stages SHALL NOT run

#### Scenario: Code has clippy warnings
- **WHEN** `cargo clippy -- -D warnings` reports any warnings
- **THEN** the lint stage SHALL fail and subsequent stages SHALL NOT run

### Requirement: Build stage compiles the project
The CI pipeline SHALL execute a build stage that runs `cargo build --release` after the lint stage succeeds.

#### Scenario: Project compiles successfully
- **WHEN** the lint stage has passed and `cargo build --release` succeeds
- **THEN** the build stage SHALL succeed and the test stage SHALL start

#### Scenario: Project fails to compile
- **WHEN** `cargo build --release` fails
- **THEN** the build stage SHALL fail and the test stage SHALL NOT run

### Requirement: Test stage runs the test suite
The CI pipeline SHALL execute a test stage that runs `cargo test` after the build stage succeeds. A PostgreSQL + PostGIS database SHALL be available for tests that require database access.

#### Scenario: All tests pass
- **WHEN** the build stage has passed and `cargo test` succeeds against a running PostGIS database
- **THEN** the test stage SHALL succeed and the overall CI check SHALL pass

#### Scenario: A test fails
- **WHEN** any test in `cargo test` fails
- **THEN** the test stage SHALL fail and the overall CI check SHALL fail

### Requirement: Stages execute in dependency order
The CI pipeline SHALL enforce that the build stage depends on the lint stage, and the test stage depends on the build stage. If any stage fails, subsequent stages SHALL be skipped.

#### Scenario: Lint fails, build and test are skipped
- **WHEN** the lint stage fails
- **THEN** the build and test stages SHALL NOT execute

#### Scenario: Build fails, test is skipped
- **WHEN** the lint stage passes but the build stage fails
- **THEN** the test stage SHALL NOT execute
