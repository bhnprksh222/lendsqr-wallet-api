# Lendsqr Wallet API

Production-minded MVP wallet service for the Lendsqr backend engineering assessment.

## Features

- User onboarding with password hashing and wallet auto-creation
- Faux token authentication with `Authorization: Bearer <user_id>`
- Adjutor Karma blacklist check during onboarding
- Wallet funding, transfers, and withdrawals using Knex transactions
- Transaction history for the authenticated user's wallet
- Request validation with Joi and centralized error responses
- Jest + Supertest coverage for positive and negative API flows

## Tech Stack

- Node.js LTS
- TypeScript
- Express.js
- KnexJS
- MySQL
- Jest + Supertest

## ER Diagram

```mermaid
erDiagram
  USERS ||--|| WALLETS : owns
  WALLETS ||--o{ TRANSACTIONS : has
```

## Database Tables

- `users`: `id`, `first_name`, `last_name`, `email`, `phone`, `bvn`, `password_hash`, `created_at`, `updated_at`
- `wallets`: `id`, `user_id`, `balance`, `currency`, `created_at`, `updated_at`
- `transactions`: `id`, `wallet_id`, `sender_wallet_id`, `receiver_wallet_id`, `type`, `status`, `amount`, `reference`, `metadata`, `created_at`, `updated_at`

## Local Setup

1. Install dependencies:
   `npm install`
2. Create environment file:
   `cp .env.example .env`
3. Create MySQL databases:
   ```sql
   CREATE DATABASE lendsqr_wallet;
   CREATE DATABASE lendsqr_wallet_test;
   ```
4. Update `.env` with database and Adjutor credentials.
5. Run migrations:
   `npm run migrate`
6. Start development server:
   `npm run dev`

## Environment Variables

```env
PORT=4000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=lendsqr_wallet

TEST_DB_HOST=127.0.0.1
TEST_DB_PORT=3306
TEST_DB_USER=root
TEST_DB_PASSWORD=password
TEST_DB_NAME=lendsqr_wallet_test

ADJUTOR_BASE_URL=https://api.adjutor.io
ADJUTOR_API_KEY=your_adjutor_api_key
```

## Scripts

- `npm run dev`: start the API with `ts-node-dev`
- `npm run build`: compile TypeScript to `dist`
- `npm start`: run the compiled app
- `npm test`: run Jest/Supertest tests
- `npm run typecheck`: run TypeScript without emitting files
- `npm run migrate`: apply migrations
- `npm run migrate:rollback`: roll back the latest migration batch
- `npm run migrate:make -- <name>`: create a migration

## Authentication

Protected routes use faux token authentication:

```http
Authorization: Bearer <user_id>
```

The middleware looks up the user by ID and attaches it to the request.

## API Documentation

Base URL: `/api/v1`

Interactive Swagger docs are available after starting the server:

- `http://localhost:4000/docs`
- `http://localhost:4000/docs.json`

### Health

`GET /health`

Returns service status.

### Create User

`POST /api/v1/users`

```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "email": "ada@example.com",
  "phone": "08010000000",
  "bvn": "12345678901",
  "password": "secret1"
}
```

Creates a user, blocks blacklisted identities, auto-creates a wallet, and returns a faux token.

### Get Authenticated User

`GET /api/v1/users/me`

Requires `Authorization` header.

### Get Wallet

`GET /api/v1/wallets/me`

Requires `Authorization` header.

### Fund Wallet

`POST /api/v1/wallets/fund`

```json
{
  "amount": 5000,
  "reference": "optional-reference"
}
```

### Transfer Funds

`POST /api/v1/wallets/transfer`

```json
{
  "receiverUserId": "receiver-user-uuid",
  "amount": 1500,
  "reference": "optional-reference"
}
```

### Withdraw Funds

`POST /api/v1/wallets/withdraw`

```json
{
  "amount": 1000,
  "reference": "optional-reference"
}
```

### List Transactions

`GET /api/v1/transactions`

Requires `Authorization` header.

## Architecture Decisions

- Controllers are thin and delegate business rules to module services.
- Wallet balance mutations run inside Knex transactions for atomicity.
- Transfers create debit and credit transaction rows with a shared reference.
- Joi middleware validates and strips unknown payload fields before controllers run.
- Adjutor integration is isolated in `src/services/adjutor.service.ts`.
- Tests mock service boundaries for fast API coverage without requiring a live MySQL instance.

## Deployment Guide

Suitable platforms include Render, Railway, and Fly.io.

1. Provision a MySQL database.
2. Set all variables from `.env.example` in the platform dashboard.
3. Build command: `npm install && npm run build`
4. Release/migration command: `npm run migrate`
5. Start command: `npm start`

Expected deployed URL format:

```txt
https://<candidate-name>-lendsqr-be-test.<platform-domain>
```
