### Requirement: Bikes page with table view
The system SHALL provide a Bikes page at `/bikes` that displays all bikes in a table with columns: ID, Marca, Tipo, Color, and Actions.

#### Scenario: Viewing the bikes list
- **WHEN** the user navigates to `/bikes`
- **THEN** a table SHALL display all bikes fetched from the API with columns for ID, Marca, Tipo, Color, and an Actions column

#### Scenario: Loading state
- **WHEN** the bikes data is being fetched
- **THEN** the page SHALL display a loading indicator

#### Scenario: Error state
- **WHEN** the API request fails
- **THEN** the page SHALL display an error message

#### Scenario: Empty state
- **WHEN** there are no bikes in the system
- **THEN** the page SHALL display a message indicating no bikes exist

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
