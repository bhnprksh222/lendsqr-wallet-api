export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Lendsqr Wallet API",
    version: "1.0.0",
    description:
      "Interactive documentation for the Lendsqr backend assessment wallet service.",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Users" },
    { name: "Wallets" },
    { name: "Transactions" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "user_id",
        description: "Use the faux token returned from signup. It is the user's UUID.",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Validation failed" },
          errors: {
            type: "array",
            items: { type: "string" },
            example: ['"amount" must be a positive number'],
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          first_name: { type: "string", example: "Ada" },
          last_name: { type: "string", example: "Lovelace" },
          email: { type: "string", format: "email", example: "ada@example.com" },
          phone: { type: "string", example: "08010000000" },
          bvn: { type: "string", nullable: true, example: "12345678901" },
        },
      },
      Wallet: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          user_id: { type: "string", format: "uuid" },
          balance: { type: "string", example: "5000.00" },
          currency: { type: "string", example: "USD" },
        },
      },
      Transaction: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          wallet_id: { type: "string", format: "uuid" },
          sender_wallet_id: { type: "string", format: "uuid", nullable: true },
          receiver_wallet_id: { type: "string", format: "uuid", nullable: true },
          type: { type: "string", enum: ["funding", "transfer", "withdrawal"] },
          status: { type: "string", enum: ["pending", "successful", "failed"] },
          amount: { type: "string", example: "1500.00" },
          reference: { type: "string", example: "ref-123" },
          metadata: { type: "string", nullable: true },
        },
      },
      CreateUserRequest: {
        type: "object",
        required: ["firstName", "lastName", "email", "phone", "password"],
        properties: {
          firstName: { type: "string", example: "Ada" },
          lastName: { type: "string", example: "Lovelace" },
          email: { type: "string", format: "email", example: "ada@example.com" },
          phone: { type: "string", example: "08010000000" },
          bvn: { type: "string", example: "12345678901" },
          password: { type: "string", minLength: 6, example: "secret1" },
        },
      },
      AmountRequest: {
        type: "object",
        required: ["amount"],
        properties: {
          amount: { type: "number", minimum: 0.01, example: 5000 },
          reference: {
            type: "string",
            description: "Optional transaction reference. Omit it to let the API generate one.",
            example: "wallet-ref-001",
          },
        },
      },
      TransferRequest: {
        type: "object",
        required: ["receiverUserId", "amount"],
        properties: {
          receiverUserId: { type: "string", format: "uuid" },
          amount: { type: "number", minimum: 0.01, example: 1500 },
          reference: {
            type: "string",
            description: "Optional transaction reference shared by the debit and credit entries.",
            example: "transfer-ref-001",
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                example: { status: "ok", service: "lendsqr-wallet-api" },
              },
            },
          },
        },
      },
    },
    "/ready": {
      get: {
        tags: ["Health"],
        summary: "Check API and database readiness",
        responses: {
          "200": {
            description: "Service and database are ready",
            content: {
              "application/json": {
                example: { status: "ready", database: "ok" },
              },
            },
          },
          "500": { description: "Database readiness check failed" },
        },
      },
    },
    "/api/v1/users": {
      post: {
        tags: ["Users"],
        summary: "Create a user and wallet",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateUserRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "User and wallet created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" },
                        wallet: { $ref: "#/components/schemas/Wallet" },
                        token: { type: "string", format: "uuid" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": { description: "Invalid payload" },
          "403": { description: "Blacklisted user" },
          "409": { description: "Duplicate email or phone" },
        },
      },
    },
    "/api/v1/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get authenticated user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Authenticated user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/User" } },
                },
              },
            },
          },
          "401": { description: "Invalid auth token" },
        },
      },
    },
    "/api/v1/wallets/me": {
      get: {
        tags: ["Wallets"],
        summary: "Get authenticated user's wallet",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Wallet details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Wallet" } },
                },
              },
            },
          },
          "401": { description: "Invalid auth token" },
        },
      },
    },
    "/api/v1/wallets/fund": {
      post: {
        tags: ["Wallets"],
        summary: "Fund authenticated user's wallet",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AmountRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Wallet funded" },
          "400": { description: "Invalid payload" },
          "401": { description: "Invalid auth token" },
        },
      },
    },
    "/api/v1/wallets/transfer": {
      post: {
        tags: ["Wallets"],
        summary: "Transfer funds to another user's wallet",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TransferRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Transfer completed" },
          "400": { description: "Insufficient funds or invalid payload" },
          "401": { description: "Invalid auth token" },
        },
      },
    },
    "/api/v1/wallets/withdraw": {
      post: {
        tags: ["Wallets"],
        summary: "Withdraw funds from authenticated user's wallet",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AmountRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Withdrawal completed" },
          "400": { description: "Insufficient funds or invalid payload" },
          "401": { description: "Invalid auth token" },
        },
      },
    },
    "/api/v1/transactions": {
      get: {
        tags: ["Transactions"],
        summary: "List authenticated user's transactions",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: "type",
            in: "query",
            schema: { type: "string", enum: ["funding", "transfer", "withdrawal"] },
          },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["pending", "successful", "failed"] },
          },
        ],
        responses: {
          "200": {
            description: "Transaction list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Transaction" },
                    },
                    meta: {
                      type: "object",
                      properties: {
                        page: { type: "integer", example: 1 },
                        limit: { type: "integer", example: 20 },
                        total: { type: "integer", example: 42 },
                        totalPages: { type: "integer", example: 3 },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": { description: "Invalid transaction filter" },
          "401": { description: "Invalid auth token" },
        },
      },
    },
  },
};
