import request from "supertest";
import app from "../src/app";
import { AppError } from "../src/utils/app-error";
import * as adjutorService from "../src/services/adjutor.service";
import * as userService from "../src/modules/users/user.service";
import * as walletService from "../src/modules/wallets/wallet.service";
import * as transactionService from "../src/modules/transactions/transaction.service";

jest.mock("../src/database/db", () => jest.fn());
jest.mock("../src/services/adjutor.service");
jest.mock("../src/modules/users/user.service");
jest.mock("../src/modules/wallets/wallet.service");
jest.mock("../src/modules/transactions/transaction.service");

const user = {
  id: "11111111-1111-4111-8111-111111111111",
  first_name: "Ada",
  last_name: "Lovelace",
  email: "ada@example.com",
  phone: "08010000000",
  bvn: "12345678901",
  password_hash: "hashed",
};

const receiverUserId = "22222222-2222-4222-8222-222222222222";
const wallet = {
  id: "33333333-3333-4333-8333-333333333333",
  user_id: user.id,
  balance: "0.00",
  currency: "NGN",
};

const auth = { Authorization: `Bearer ${user.id}` };

beforeEach(() => {
  jest.mocked(userService.findUserById).mockResolvedValue(user);
  jest.mocked(userService.getProfile).mockResolvedValue({
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    bvn: user.bvn,
  });
});

describe("wallet API", () => {
  it("creates an account and returns a faux token with an auto-created wallet", async () => {
    jest.mocked(adjutorService.isBlacklisted).mockResolvedValue(false);
    jest.mocked(userService.createUser).mockResolvedValue({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        bvn: user.bvn,
      },
      wallet,
      token: user.id,
    });

    const response = await request(app).post("/api/v1/users").send({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phone: "08010000000",
      bvn: "12345678901",
      password: "secret1",
    });

    expect(response.status).toBe(201);
    expect(response.body.data.token).toBe(user.id);
    expect(response.body.data.wallet.id).toBe(wallet.id);
  });

  it("rejects blacklisted onboarding", async () => {
    jest
      .mocked(userService.createUser)
      .mockRejectedValue(new AppError("User is blacklisted on Adjutor Karma", 403));

    const response = await request(app).post("/api/v1/users").send({
      firstName: "Bad",
      lastName: "Actor",
      email: "bad@example.com",
      phone: "08020000000",
      password: "secret1",
    });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("User is blacklisted on Adjutor Karma");
  });

  it("rejects duplicate email or phone", async () => {
    jest
      .mocked(userService.createUser)
      .mockRejectedValue(new AppError("User already exists with email or phone", 409));

    const response = await request(app).post("/api/v1/users").send({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phone: "08010000000",
      password: "secret1",
    });

    expect(response.status).toBe(409);
  });

  it("rejects invalid signup payloads", async () => {
    const response = await request(app).post("/api/v1/users").send({
      firstName: "Ada",
      email: "not-an-email",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  it("returns the authenticated user's wallet", async () => {
    jest.mocked(walletService.getMyWallet).mockResolvedValue(wallet);

    const response = await request(app).get("/api/v1/wallets/me").set(auth);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(wallet.id);
  });

  it("funds a wallet", async () => {
    jest.mocked(walletService.fundWallet).mockResolvedValue({ ...wallet, balance: "5000.00" });

    const response = await request(app)
      .post("/api/v1/wallets/fund")
      .set(auth)
      .send({ amount: 5000 });

    expect(response.status).toBe(200);
    expect(response.body.data.balance).toBe("5000.00");
  });

  it("transfers funds", async () => {
    jest.mocked(walletService.transferFunds).mockResolvedValue({
      senderWallet: { ...wallet, balance: "3500.00" },
      receiverWallet: { ...wallet, user_id: receiverUserId, balance: "1500.00" },
    });

    const response = await request(app)
      .post("/api/v1/wallets/transfer")
      .set(auth)
      .send({ receiverUserId, amount: 1500 });

    expect(response.status).toBe(200);
    expect(response.body.data.senderWallet.balance).toBe("3500.00");
  });

  it("rejects transfers with insufficient funds", async () => {
    jest
      .mocked(walletService.transferFunds)
      .mockRejectedValue(new AppError("Insufficient wallet balance", 400));

    const response = await request(app)
      .post("/api/v1/wallets/transfer")
      .set(auth)
      .send({ receiverUserId, amount: 1500 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Insufficient wallet balance");
  });

  it("withdraws funds", async () => {
    jest.mocked(walletService.withdrawFromWallet).mockResolvedValue({
      ...wallet,
      balance: "2500.00",
    });

    const response = await request(app)
      .post("/api/v1/wallets/withdraw")
      .set(auth)
      .send({ amount: 500 });

    expect(response.status).toBe(200);
    expect(response.body.data.balance).toBe("2500.00");
  });

  it("rejects invalid auth", async () => {
    jest.mocked(userService.findUserById).mockResolvedValue(undefined);

    const response = await request(app)
      .post("/api/v1/wallets/fund")
      .set({ Authorization: "Bearer unknown-user" })
      .send({ amount: 500 });

    expect(response.status).toBe(401);
  });

  it("rejects missing auth", async () => {
    const response = await request(app).get("/api/v1/wallets/me");

    expect(response.status).toBe(401);
  });

  it("rejects invalid wallet amount payloads", async () => {
    const response = await request(app)
      .post("/api/v1/wallets/fund")
      .set(auth)
      .send({ amount: 0 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  it("lists transactions", async () => {
    jest.mocked(transactionService.getTransactionsForUser).mockResolvedValue([
      {
        id: "44444444-4444-4444-8444-444444444444",
        wallet_id: wallet.id,
        type: "funding",
        status: "successful",
        amount: "500.00",
        reference: "ref-1",
        sender_wallet_id: null,
        receiver_wallet_id: wallet.id,
        metadata: null,
      },
    ]);

    const response = await request(app).get("/api/v1/transactions").set(auth);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });
});
