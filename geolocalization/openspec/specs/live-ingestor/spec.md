### Requirement: Live ingestor mode via CLI flag
The seed binary SHALL accept a `--live` CLI flag. When `--live` is passed, the binary MUST enter a continuous ingestor mode instead of performing the one-shot seed.

#### Scenario: Binary starts in live mode
- **WHEN** the seed binary is executed with `--live`
- **THEN** the binary enters a continuous loop inserting location data
- **AND** the binary logs that it has entered live ingestor mode

#### Scenario: Binary defaults to one-shot seed
- **WHEN** the seed binary is executed without `--live`
- **THEN** the binary performs the existing one-shot seed behavior unchanged

### Requirement: Insert one location per bicycle per second
In live mode, the binary SHALL insert one new location row per bicycle per tick. The tick interval MUST be 1 second. The `bicycle_id` values SHALL be integers matching the seed bicycle IDs.

#### Scenario: Positions inserted every second
- **WHEN** the binary is running in live mode
- **THEN** after each 1-second tick, a new row appears in `bicycles_location` for each of the 4 seed bicycles using their integer IDs
- **AND** each row has `updated_at` set to the current wall-clock time

### Requirement: Positions advance along predefined routes
In live mode, each bicycle SHALL advance to the next interpolated waypoint on each tick. The position sequence MUST follow the same route definitions used by the one-shot seed.

#### Scenario: Sequential route traversal
- **WHEN** the live ingestor has been running for N seconds
- **THEN** each bicycle's latest position corresponds to the Nth interpolated waypoint in its route

### Requirement: Routes loop indefinitely
When a bicycle reaches the end of its route, the ingestor SHALL wrap back to the first waypoint and continue. The loop MUST be seamless (no pause or gap).

#### Scenario: Route wraps at the end
- **WHEN** a bicycle has advanced past its last interpolated waypoint
- **THEN** the next position inserted is the first waypoint of the same route
- **AND** insertion continues without interruption

### Requirement: Graceful shutdown on SIGINT
The live ingestor SHALL handle Ctrl+C (SIGINT) gracefully. Upon receiving the signal, the binary MUST stop inserting, log a summary of total positions inserted, and exit with code 0.

#### Scenario: User presses Ctrl+C
- **WHEN** the binary is running in live mode and the user sends SIGINT
- **THEN** the binary stops the insertion loop
- **AND** logs a summary including total positions inserted and runtime duration
- **AND** exits with code 0

### Requirement: Live mode logs tick progress
The ingestor SHALL log periodic progress updates. It MUST log at `info` level when starting and at `debug` level for each tick.

#### Scenario: Progress logging
- **WHEN** the live ingestor completes a tick
- **THEN** a `debug`-level log is emitted showing the tick number and positions inserted
