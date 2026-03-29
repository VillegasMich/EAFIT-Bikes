# ADR-01: Node.js + Express as the Microservice Language and Framework

## Architectural Decision

The decision is to implement the Events microservice using Node.js as the runtime environment and Express as the HTTP framework. This decision applies to the microservice service layer, covering REST endpoint definition, request handling, and communication with the database.

## Impacts and Implications

Adopting Node.js with Express maintains technological consistency with the other microservices in the EAFIT Bike system (Bike Management, Reservations), reducing the team's cognitive load and allowing reuse of Docker configurations, CI/CD pipelines, and code patterns. The non-blocking I/O model is suitable for the service access pattern, characterized by moderate reads and occasional writes.

The service is deployed as a Pod inside Amazon EKS, exposed internally through a Kubernetes Service (ClusterIP), and accessed from the frontend through Amazon API Gateway. No commercial licenses are required, since both Node.js and Express are open-source projects under the MIT license.

## Problem & Constraints

### Problem

The microservice must expose a REST API for publishing, querying, and managing cycling events (competitions, bike lanes, recreational routes), as well as participant enrollment in those events.

### Context

The Events microservice is part of the EAFIT Bike platform, deployed on AWS with Amazon EKS as the container orchestrator. It has medium code volatility, medium scalability, and medium fault tolerance according to the granularity matrix. Events have structured attributes with clear relationships between entities (events, enrollments, participants), which favors a relational model.

### Scope

This decision applies only to the Events microservice. Other microservices may use different technologies according to their specific requirements.

### Constraints

- The team already works with Node.js and Express in the other backend microservices.
- The delivery timeline is tight and does not allow for long learning curves.
- The infrastructure budget is at a university level.
- Deployment is done on Amazon EKS.

### Assumptions

- The team has solid experience with Node.js and Express.
- Expected traffic is moderate, with predictable peaks during event publication or enrollment periods.
- Operations are predominantly database reads and writes, with no CPU-intensive processing.

## Solution Analysis

### Solution Architecture

The microservice exposes a REST API built with Express on Node.js. Each request is handled asynchronously through the event loop, allowing multiple concurrent connections without blocking the main thread.

The service is structured following a layered pattern (routes → controllers → services → repositories) to ensure separation of concerns. Communication with PostgreSQL is done through Sequelize as the ORM.

The service is packaged in a Docker image based on `node:20-alpine`, deployed as a Pod in Amazon EKS, and exposed internally through a Kubernetes Service. External traffic arrives through Amazon CloudFront → Amazon API Gateway → EKS.

### Rationale

Node.js with Express was selected because it maximizes technological consistency across the project without sacrificing performance for the Events service load profile. The non-blocking I/O model is suitable for a service whose access pattern is predominantly moderate reads, where the bottleneck is network latency to the database, not CPU processing.

Reusing team knowledge, Docker configurations, and code patterns reduces development time and the risk of operational errors, which is critical given the tight timeline and small team size.
