### Requirement: Display success notification after bike creation
The system SHALL display a success toast notification when a bike is successfully created.

#### Scenario: Bike created successfully
- **WHEN** the user submits the create bike form and the API returns success
- **THEN** a green success toast appears with the message "Bike created successfully"
- **THEN** the toast auto-dismisses after 4 seconds

### Requirement: Display success notification after bike update
The system SHALL display a success toast notification when a bike is successfully updated.

#### Scenario: Bike updated successfully
- **WHEN** the user submits the edit bike form and the API returns success
- **THEN** a green success toast appears with the message "Bike updated successfully"
- **THEN** the toast auto-dismisses after 4 seconds

### Requirement: Display success notification after bike deletion
The system SHALL display a success toast notification when a bike is successfully deleted.

#### Scenario: Bike deleted successfully
- **WHEN** the user confirms bike deletion and the API returns success
- **THEN** a green success toast appears with the message "Bike deleted successfully"
- **THEN** the toast auto-dismisses after 4 seconds

### Requirement: Display error notification on failed bike operation
The system SHALL display an error toast notification when a bike CRUD operation fails.

#### Scenario: Bike operation fails
- **WHEN** a create, update, or delete bike API call returns an error
- **THEN** a red error toast appears with a message describing the failure
- **THEN** the error toast persists until the user manually dismisses it

### Requirement: Toast notifications are dismissible
The system SHALL allow users to manually dismiss any toast notification.

#### Scenario: User dismisses a toast
- **WHEN** a toast is visible and the user clicks the close button
- **THEN** the toast is removed from the screen immediately

### Requirement: Multiple toasts stack vertically
The system SHALL display multiple simultaneous toasts stacked vertically in the top-right corner.

#### Scenario: Multiple operations trigger toasts
- **WHEN** more than one toast notification is active at the same time
- **THEN** toasts stack vertically with spacing between them
- **THEN** the oldest toast is removed first if more than 5 toasts are visible
