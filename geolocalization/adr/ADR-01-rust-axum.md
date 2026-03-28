# ADR-01: Rust + Axum as the Microservice Language and Framework

## Architectural Decision

The Geolocalization microservice will be implemented using Rust as the programming language and Axum as the HTTP framework. This decision applies exclusively to the service layer of the microservice, covering the definition of REST endpoints, handling of concurrent requests, and communication with the database.

## Impacts and Implications

Adopting Rust implies a steeper learning curve compared to languages such as Node.js or Python, given that the ownership and borrowing model requires prior familiarization. However, once this curve is overcome, the language offers guarantees that eliminate entire categories of runtime errors. In terms of infrastructure, Rust binaries are self-contained and produce significantly smaller Docker images than Node.js or Python runtimes, reducing resource consumption on the server. No commercial licenses are required, as both Rust and Axum are open source projects with permissive licenses (MIT / Apache 2.0).

## Problem & Constraints

### Problem

The microservice must handle concurrent HTTP requests reliably and continuously in a resource-constrained environment, ensuring that no memory errors or undefined behaviors occur during operation.

### Context

The Geolocalization microservice is part of the EAFIT Bikes platform, a bicycle rental system with a frontend that consumes real-time location data. The service is deployed in Docker containers on self-hosted infrastructure.

### Scope

This decision applies only to the Geolocalization microservice. Other microservices in the platform (users, reservations) may use different technologies.

### Constraints

- Scale is small: fewer than 1,000 bicycles with a low update frequency.
- The development team must be able to bring up the environment locally without complex configuration.

### Assumptions

- The team has or is willing to acquire basic Rust knowledge.
- No paid enterprise support is required for the language or framework.
- Expected traffic does not exceed hundreds of simultaneous concurrent requests.

## Solution Analysis

### Solution Architecture

The microservice exposes a REST API built with Axum on top of the Tokio asynchronous runtime. Each HTTP request is handled asynchronously without blocking operating system threads, enabling high concurrency with low memory usage. The service compiles to a native binary that runs inside a minimal Docker image, and communicates with PostgreSQL asynchronously via SQLx.

### Rationale

Rust was selected because its ownership model guarantees the absence of memory errors and data races at compile time, without the need for a garbage collector, resulting in a stable, low-resource service ideal for a self-hosted environment. Axum complements this choice by being built on the Tokio ecosystem — lightweight, idiomatic, and natively integrated with the other libraries in the selected Rust stack.
