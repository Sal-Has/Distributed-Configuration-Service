# Distributed Configuration Service

A mini Azure App Configuration–style service built with Node.js, Express, PostgreSQL, Redis, and JWT authentication.

It provides a centralized API for managing application configuration across multiple environments (development, staging, production), with versioning, caching, and role-based access control.

---

## Features

- Centralized configuration store (no more hardcoding or redeploys for simple config changes).
- Environment-aware keys: per-env configs, e.g. `development`, `staging`, `production`.
- Versioning: each update increments a `version` field.
- Redis caching for low-latency config reads.
- JWT-based authentication:
  - Public read access (GET endpoints).
  - Admin-only write access (POST/PUT).
- Health check endpoint for monitoring.

---

## High-Level Architecture

- **Client apps / services** call this API to read configuration values.
- **Admins** call this API (with an admin JWT) to create/update configuration keys.
- **Express server** exposes REST endpoints.
- **PostgreSQL** stores persistent config data in a `configs` table.
- **Redis** caches hot configuration values for fast `GET /config/:key` reads.

Data flow for a read:

1. Client calls `GET /config/:key?env=production`.
2. Service checks Redis for `production:key`.
3. If found → returns cached value.
4. If not found → reads from PostgreSQL, stores result in Redis, returns response.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL
- **Cache:** Redis (via `ioredis`)
- **Auth:** JWT (`jsonwebtoken`) with role-based access
- **Env management:** dotenv

---

## Database Schema

PostgreSQL table `configs`:

```sql
CREATE TABLE IF NOT EXISTS configs (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    environment TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (key, environment)
);