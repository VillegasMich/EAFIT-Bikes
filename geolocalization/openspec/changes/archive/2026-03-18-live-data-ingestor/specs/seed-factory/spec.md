## MODIFIED Requirements

### Requirement: Seed binary populates multiple bicycles
The system SHALL provide a Rust binary target (`cargo run --bin seed`) that inserts location entries for at least 4 distinct bicycles directly into the PostgreSQL database via SQLx. The binary MUST use `clap` for CLI argument parsing and accept a `--live` flag. When `--live` is not passed, the binary MUST perform the existing one-shot seed behavior.

#### Scenario: Running seed creates multiple bicycles
- **WHEN** the seed binary is executed with a valid `DATABASE_URL` and without `--live`
- **THEN** location entries for at least 4 bicycles with distinct UUIDs are present in the `bicycles_location` table

#### Scenario: Running seed with --live enters live mode
- **WHEN** the seed binary is executed with a valid `DATABASE_URL` and `--live`
- **THEN** the binary enters continuous ingestor mode instead of one-shot seed
