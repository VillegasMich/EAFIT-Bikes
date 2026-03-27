### Requirement: Continuous position movement binary
The system SHALL provide a `mover` binary (`src/bin/mover.rs`) that runs as a long-lived process, inserting new position rows for every bicycle in the database at a regular interval.

#### Scenario: Binary starts and begins ticking
- **WHEN** the user runs `cargo run --bin mover`
- **THEN** the binary connects to the database using `DATABASE_URL`, applies migrations, and begins a 1-second tick loop

#### Scenario: Binary exits on missing DATABASE_URL
- **WHEN** `DATABASE_URL` is not set
- **THEN** the binary logs an error and exits with code 1

### Requirement: Discover all bicycles each tick
Each tick, the mover SHALL query the database to find all distinct `bicycle_id` values and their most recent position (latest `updated_at`). This ensures newly inserted bicycles are picked up immediately.

#### Scenario: New bicycle appears between ticks
- **WHEN** an external process inserts a row with a new `bicycle_id` while the mover is running
- **THEN** the next tick includes that bicycle in its movement cycle

#### Scenario: No bicycles in database
- **WHEN** the database contains no rows in `bicycles_location`
- **THEN** the tick completes without inserting anything and logs a debug message

### Requirement: Random position offset
For each bicycle, the mover SHALL insert a new `bicycles_location` row with coordinates offset by a small random delta from the bicycle's latest position. The offset SHALL be in the range ±0.0001° to ±0.0005° for both latitude and longitude independently.

#### Scenario: Position is nudged within valid range
- **WHEN** a bicycle's latest position is `(6.2006, -75.5785)`
- **THEN** the new inserted position has latitude within `[6.1996, 6.2016]` and longitude within `[-75.5795, -75.5775]`

### Requirement: Coordinate clamping
After applying the random offset, the mover SHALL clamp latitude to `[-90, 90]` and longitude to `[-180, 180]`.

#### Scenario: Latitude near boundary
- **WHEN** a bicycle's latest latitude is `89.9999` and the random offset is `+0.0004`
- **THEN** the inserted latitude is clamped to `90.0`

### Requirement: Graceful shutdown
The mover SHALL handle `Ctrl+C` (SIGINT) and shut down gracefully, logging the total number of positions inserted and the elapsed time.

#### Scenario: User presses Ctrl+C
- **WHEN** the mover is running and the user sends SIGINT
- **THEN** the current tick completes (or is interrupted) and the binary logs a shutdown summary and exits with code 0

### Requirement: Structured logging
The mover SHALL use `tracing` macros for all output. It SHALL log at `info` level on startup, each tick summary, and shutdown. It SHALL log at `debug` level per-bicycle details.

#### Scenario: Tick logging
- **WHEN** a tick completes with 4 bicycles moved
- **THEN** an `info!` log line is emitted with the tick number and count of bicycles moved
