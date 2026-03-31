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

### Requirement: Create bike form
The system SHALL provide a form to create a new bike with fields for Marca (text input), Tipo (dropdown select with options Cross, Mountain bike, Ruta), and Color (text input).

#### Scenario: Creating a bike successfully
- **WHEN** the user fills in the form with valid data and submits
- **THEN** the system SHALL call the create API, close/reset the form, and refresh the bikes table

#### Scenario: Form validation
- **WHEN** the user attempts to submit the form with empty required fields
- **THEN** the form SHALL prevent submission and indicate which fields are required

### Requirement: Edit bike functionality
The system SHALL allow users to edit an existing bike. The edit form SHALL be pre-populated with the bike's current data.

#### Scenario: Editing a bike
- **WHEN** the user clicks the edit action on a bike row
- **THEN** a form SHALL appear pre-filled with the bike's current marca, tipo, and color

#### Scenario: Saving edits
- **WHEN** the user modifies fields and saves
- **THEN** the system SHALL call the update API and refresh the bikes table

#### Scenario: Cancelling edits
- **WHEN** the user cancels the edit
- **THEN** the form SHALL close without making API calls

### Requirement: Delete bike with confirmation
The system SHALL allow users to delete a bike after confirming the action.

#### Scenario: Deleting a bike
- **WHEN** the user clicks the delete action on a bike row
- **THEN** a confirmation prompt SHALL appear asking the user to confirm deletion

#### Scenario: Confirming deletion
- **WHEN** the user confirms the deletion
- **THEN** the system SHALL call the delete API and refresh the bikes table

#### Scenario: Cancelling deletion
- **WHEN** the user cancels the deletion
- **THEN** no API call SHALL be made and the table remains unchanged

### Requirement: useBikes custom hook
The system SHALL provide a `useBikes` hook in `src/hooks/useBikes.ts` that manages bike data fetching and mutations.

#### Scenario: Hook provides bike data and operations
- **WHEN** a component calls `useBikes()`
- **THEN** it SHALL return `{ bikes, loading, error, createBike, updateBike, deleteBike, refreshBikes }`

#### Scenario: Initial fetch on mount
- **WHEN** the hook mounts
- **THEN** it SHALL fetch the bikes list from the API

#### Scenario: Refetch after mutation
- **WHEN** a create, update, or delete operation completes successfully
- **THEN** the hook SHALL automatically refetch the bikes list

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
