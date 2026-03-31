## MODIFIED Requirements

### Requirement: Bikes page with table view
The system SHALL provide a Bikes page at `/bikes` that displays all bikes in a table with columns: ID, Marca, Tipo, Color, Status, and Actions. The page SHALL also display filter tabs above the table allowing the user to filter between All, Reserved, and Available bikes.

#### Scenario: Viewing the bikes list
- **WHEN** the user navigates to `/bikes`
- **THEN** a table SHALL display all bikes fetched from the API with columns for ID, Marca, Tipo, Color, Status, and an Actions column

#### Scenario: Loading state
- **WHEN** the bikes data is being fetched
- **THEN** the page SHALL display a loading indicator

#### Scenario: Error state
- **WHEN** the API request fails
- **THEN** the page SHALL display an error message

#### Scenario: Empty state
- **WHEN** there are no bikes in the system
- **THEN** the page SHALL display a message indicating no bikes exist

#### Scenario: Filter tabs are displayed
- **WHEN** the user is on the Bikes page
- **THEN** three filter tabs SHALL be visible above the table: "All", "Reserved", and "Available"

#### Scenario: Filtering to Reserved tab
- **WHEN** the user clicks the "Reserved" tab
- **THEN** the table SHALL display only bikes that currently have an active reservation

#### Scenario: Filtering to Available tab
- **WHEN** the user clicks the "Available" tab
- **THEN** the table SHALL display only bikes that do not currently have an active reservation

#### Scenario: Filtering to All tab
- **WHEN** the user clicks the "All" tab
- **THEN** the table SHALL display all bikes regardless of reservation status

## ADDED Requirements

### Requirement: Bike status badge in table
The system SHALL display a status badge in the Status column of each bike row indicating whether the bike is currently Reserved or Available.

#### Scenario: Reserved bike shows badge
- **WHEN** a bike has an active reservation (current time is between start_date and end_date)
- **THEN** the Status column SHALL show a "Reserved" badge with a visually distinct style (e.g., red/orange background)

#### Scenario: Available bike shows badge
- **WHEN** a bike has no active reservation
- **THEN** the Status column SHALL show an "Available" badge with a visually distinct style (e.g., green background)

### Requirement: Reserve action button per bike
The system SHALL display a "Reserve" button in the Actions column of each bike row.

#### Scenario: Reserve button opens modal
- **WHEN** the user clicks the "Reserve" button on a bike row
- **THEN** the ReservationModal SHALL open with the bike's ID pre-filled

#### Scenario: Successful reservation refreshes table
- **WHEN** the user successfully creates a reservation via the modal
- **THEN** the modal SHALL close and the bikes table's status badges SHALL reflect the updated reservation state
