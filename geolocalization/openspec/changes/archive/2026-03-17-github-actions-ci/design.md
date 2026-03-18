## Context

The geolocalization microservice is a Rust + Axum project with PostgreSQL/PostGIS. The development workflow (documented in CLAUDE.md) requires running `cargo fmt`, `cargo clippy`, `cargo build`, and `cargo test` before every commit. There is currently no automated enforcement — compliance depends entirely on developer discipline.

The project uses Docker Compose to run the service alongside a PostGIS database. Tests that require a database connection will need a PostgreSQL service available in CI.

## Goals / Non-Goals

**Goals:**
- Automatically enforce lint, format, build, and test checks on every PR to `main`
- Fail fast: stop the pipeline early if formatting or linting fails (cheapest checks first)
- Keep CI configuration simple and maintainable in a single workflow file

**Non-Goals:**
- Deploying or publishing artifacts (CD pipeline) — out of scope
- Running integration tests against a live PostGIS instance (can be added later if needed)
- Caching strategies or CI performance optimization — keep it simple first
- Branch protection rules configuration — that's a GitHub repo settings concern

## Decisions

### Single workflow file with three dependent jobs

Use one `.github/workflows/ci.yml` file with three jobs: `lint`, `build`, `test`. Each job depends on the previous via `needs:` to fail fast and avoid wasting CI minutes.

**Alternative considered**: A single job with sequential steps. Rejected because separate jobs give clearer GitHub PR status checks per stage and allow parallel expansion later.

### Use `ubuntu-latest` runner with Rust stable toolchain

All jobs run on `ubuntu-latest` with `dtolnay/rust-toolchain` action pinned to `stable`. This avoids maintaining a specific Rust version while ensuring reproducible toolchain setup.

**Alternative considered**: Using a pre-built Rust Docker image. Rejected because GitHub-hosted runners with `dtolnay/rust-toolchain` are simpler and faster to set up.

### PostgreSQL service container for tests

The `test` job will use a GitHub Actions service container running `postgis/postgis:17-3.5` to provide a real database for `cargo test`. This matches the project's Docker Compose setup.

**Alternative considered**: Mocking the database or skipping DB tests in CI. Rejected because the project uses SQLx compile-time query verification and integration tests should run against a real database.

### Rust dependency caching with `Swatinem/rust-cache`

Use the `Swatinem/rust-cache` action to cache `~/.cargo` and `target/` between runs. This significantly reduces build times without complex manual cache configuration.

## Risks / Trade-offs

- **[CI minutes cost]** → Three separate jobs means three runner setups. Mitigation: the fail-fast ordering means most failing PRs only run the lint job. Rust caching reduces build times.
- **[PostGIS service startup]** → The database service may take a few seconds to become ready. Mitigation: use a health check in the service definition so GitHub waits for readiness.
- **[Stable toolchain drift]** → `stable` may introduce new clippy lints that break CI. Mitigation: acceptable for this project size; pin to a specific version only if this becomes a problem.
