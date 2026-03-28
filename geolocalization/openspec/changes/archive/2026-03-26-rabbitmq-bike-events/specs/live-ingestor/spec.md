## MODIFIED Requirements

### Requirement: Insert one location per bicycle per second
In live mode, the binary SHALL insert one new location row per bicycle per tick. The tick interval MUST be 1 second. The `bicycle_id` values SHALL be integers matching the seed bicycle IDs.

#### Scenario: Positions inserted every second
- **WHEN** the binary is running in live mode
- **THEN** after each 1-second tick, a new row appears in `bicycles_location` for each of the 4 seed bicycles using their integer IDs
- **AND** each row has `updated_at` set to the current wall-clock time
