# ADR-02: PostgreSQL as the Microservice Database

## Architectural Decision

The decision is to use PostgreSQL as the persistent storage system for event and activity data in the Events microservice. The database will contain the tables required to store cycling events and participant enrollments.

## Impacts and Implications

PostgreSQL provides referential integrity and full ACID transactions, which guarantees strong consistency in critical operations such as participant enrollment, preventing over-enrollment through constraints and atomic transactions.

The Sequelize ORM provides versioned migrations, model validation, and full support for relationships between entities (events → enrollments → users).

PostgreSQL is deployed as a Docker container inside the Amazon EKS cluster with persistent volumes (EBS) to guarantee durability across Pod restarts. No commercial licenses are required; PostgreSQL is open source under the PostgreSQL license (similar to MIT).

## Problem & Constraints

### Problem

Cycling events must be stored with clear relationships between entities: one event has multiple enrollments, and each enrollment belongs to one user and one event. Enrollment must be atomic to prevent two users from taking the same slot simultaneously when an event reaches maximum capacity.

### Context

The most frequent queries are by event type, date, status (active/finished), and slot availability. The volume is low (tens to hundreds per semester), but transactional integrity for enrollments is a non-negotiable business invariant.

### Scope

This decision applies only to the database of the Events microservice. User and bike data reside in their respective microservices.

### Constraints

- The database must run as a Docker container within Amazon EKS.
- Data must persist across Pod restarts through persistent volumes (Amazon EBS).
- Participant enrollment requires strong consistency (ACID) to prevent over-enrollment.
- The schema must support adding new event types through versioned migrations.

### Assumptions

- Volume will not exceed 10,000 event records and 50,000 enrollments within the current planning horizon.
- A single PostgreSQL instance is sufficient for the service load at this stage.
- Sequelize provides the necessary abstractions for migrations and model validation.

## Solution Analysis

### Solution Architecture

PostgreSQL is deployed using the official `postgres:16-alpine` image as a Docker container inside Amazon EKS, with a persistent volume backed by Amazon EBS to guarantee durability.

The schema consists of the following main tables:

- **events**: stores event data (id, name, description, type, start date, end date, status, location, maximum capacity).
- **enrollments**: stores enrollments with foreign keys to the event and user identifier, including enrollment date and status.

Indexes are created on the `type`, `status`, and `start_date` fields to optimize list queries.

Enrollment operations run inside a transaction that verifies available capacity and registers the participant atomically, using `SELECT ... FOR UPDATE` to prevent race conditions.

Communication between the microservice and PostgreSQL is handled through Sequelize as the ORM.

### Rationale

PostgreSQL was selected because referential integrity and ACID transactions are fundamental to the events and enrollments domain. Unlike a document model where transactional consistency requires additional configuration, PostgreSQL natively guarantees that capacity checks and participant registration happen atomically through `SELECT ... FOR UPDATE`, eliminating the possibility of over-enrollment by design.

Foreign keys between `events` and `enrollments` ensure there are no orphan enrollments, and Sequelize versioned migrations allow controlled schema evolution when adding new event types or attributes.

Additionally, PostgreSQL is already used by the Geolocation microservice (with PostGIS), which reduces the diversity of database engines to operate in the system.
