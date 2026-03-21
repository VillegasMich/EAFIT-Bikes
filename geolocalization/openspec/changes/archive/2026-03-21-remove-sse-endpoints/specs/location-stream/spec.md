## REMOVED Requirements

### Requirement: Stream all location events via SSE
**Reason**: SSE streaming is being removed to simplify the codebase and reduce the API surface.
**Migration**: Clients should poll GET `/locations?latest=true` instead.

### Requirement: Stream location events for a specific bicycle via SSE
**Reason**: SSE streaming is being removed to simplify the codebase and reduce the API surface.
**Migration**: Clients should poll GET `/locations/bicycle/:bicycle_id?latest=true` instead.

### Requirement: Broadcast channel in AppState
**Reason**: The broadcast channel existed solely to support SSE streaming. With SSE removed, the channel has no consumers and is dead code.
**Migration**: No client-facing migration needed. Internal code change only.
