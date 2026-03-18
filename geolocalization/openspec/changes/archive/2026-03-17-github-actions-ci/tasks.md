## 1. Setup

- [x] 1.1 Create `.github/workflows/` directory structure
- [x] 1.2 Create `ci.yml` workflow file with trigger configuration (on pull_request to main, events: opened, synchronize, reopened)

## 2. Lint & Format Job

- [x] 2.1 Define the `lint` job on `ubuntu-latest` with `dtolnay/rust-toolchain` (stable) and `rustfmt`, `clippy` components
- [x] 2.2 Add `Swatinem/rust-cache` step for dependency caching
- [x] 2.3 Add steps for `cargo fmt --check`, `cargo clippy -- -D warnings`, and `cargo check`

## 3. Build Job

- [x] 3.1 Define the `build` job with `needs: lint` dependency
- [x] 3.2 Add toolchain setup and rust-cache steps
- [x] 3.3 Add `cargo build --release` step

## 4. Test Job

- [x] 4.1 Define the `test` job with `needs: build` dependency
- [x] 4.2 Configure PostGIS service container (`postgis/postgis:16-3.4`) with health check
- [x] 4.3 Add toolchain setup and rust-cache steps
- [x] 4.4 Set `DATABASE_URL` environment variable pointing to the service container
- [x] 4.5 Add `cargo test` step

## 5. Documentation

- [x] 5.1 Review whether CLAUDE.md or README.md need updates to reference the CI pipeline (no API or endpoint changes, so only add CI-related notes if relevant)
