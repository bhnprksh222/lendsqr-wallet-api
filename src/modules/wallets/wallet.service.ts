import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import db from "../../database/db";
import type { TransactionType, WalletRecord } from "../../types";
import { AppError } from "../../utils/app-error";

const walletsTable = "wallets";
const transactionsTable = "transactions";

type AmountInput = {
  userId: string;
  amount: number;
  reference?: string;
};

type TransferInput = AmountInput & {
  receiverUserId: string;
};

type TransactionInput = {
  walletId: string;
  type: TransactionType;
  amount: number;
  reference?: string;
  senderWalletId?: string;
  receiverWalletId?: string;
  metadata?: Record<string, string>;
};

type TransferResult = {
  senderWallet: WalletRecord;
  receiverWallet: WalletRecord;
};

export class WalletLedgerService {
  constructor(private readonly database: Knex) {}

  getMyWallet(userId: string): Promise<WalletRecord> {
    return this.getWalletByUserId(this.database, userId);
  }

  fundWallet(input: AmountInput): Promise<WalletRecord> {
    return this.database.transaction(async (trx) => {
      const wallet = await this.getWalletByUserId(trx, input.userId, true);
      const nextBalance = Number(wallet.balance) + input.amount;

      await trx(walletsTable).where({ id: wallet.id }).update({ balance: nextBalance });
      await this.createTransaction(trx, {
        walletId: wallet.id,
        type: "funding",
        amount: input.amount,
        receiverWalletId: wallet.id,
        reference: input.reference,
      });

      return this.withBalance(wallet, nextBalance);
    });
  }

  withdrawFromWallet(input: AmountInput): Promise<WalletRecord> {
    return this.database.transaction(async (trx) => {
      const wallet = await this.getWalletByUserId(trx, input.userId, true);
      const currentBalance = Number(wallet.balance);

      if (currentBalance < input.amount) {
        throw new AppError("Insufficient wallet balance", 400);
      }

      const nextBalance = currentBalance - input.amount;

      await trx(walletsTable).where({ id: wallet.id }).update({ balance: nextBalance });
      await this.createTransaction(trx, {
        walletId: wallet.id,
        type: "withdrawal",
        amount: input.amount,
        senderWalletId: wallet.id,
        reference: input.reference,
      });

      return this.withBalance(wallet, nextBalance);
    });
  }

  transferFunds(input: TransferInput): Promise<TransferResult> {
    if (input.userId === input.receiverUserId) {
      throw new AppError("Sender and receiver must be different", 400);
    }

    return this.database.transaction(async (trx) => {
      const senderWallet = await this.getWalletByUserId(trx, input.userId, true);
      const receiverWallet = await this.getWalletByUserId(trx, input.receiverUserId, true);
      const senderBalance = Number(senderWallet.balance);

      if (senderBalance < input.amount) {
        throw new AppError("Insufficient wallet balance", 400);
      }

      const senderNextBalance = senderBalance - input.amount;
      const receiverNextBalance = Number(receiverWallet.balance) + input.amount;
      const reference = input.reference ?? randomUUID();

      await trx(walletsTable).where({ id: senderWallet.id }).update({ balance: senderNextBalance });
      await trx(walletsTable)
        .where({ id: receiverWallet.id })
        .update({ balance: receiverNextBalance });

      await this.createTransaction(trx, {
        walletId: senderWallet.id,
        type: "transfer",
        amount: input.amount,
        reference,
        senderWalletId: senderWallet.id,
        receiverWalletId: receiverWallet.id,
        metadata: { direction: "debit" },
      });

      await this.createTransaction(trx, {
        walletId: receiverWallet.id,
        type: "transfer",
        amount: input.amount,
        reference,
        senderWalletId: senderWallet.id,
        receiverWalletId: receiverWallet.id,
        metadata: { direction: "credit" },
      });

      return {
        senderWallet: this.withBalance(senderWallet, senderNextBalance),
        receiverWallet: this.withBalance(receiverWallet, receiverNextBalance),
      };
    });
  }

  private async getWalletByUserId(
    trx: Knex | Knex.Transaction,
    userId: string,
    lockForUpdate = false,
  ): Promise<WalletRecord> {
    const query = trx<WalletRecord>(walletsTable).where({ user_id: userId });
    const wallet = await (lockForUpdate ? query.forUpdate() : query).first();

    if (!wallet) {
      throw new AppError("Wallet not found", 404);
    }

    return wallet;
  }

  private async createTransaction(trx: Knex.Transaction, payload: TransactionInput) {
    await trx(transactionsTable).insert({
      id: randomUUID(),
      wallet_id: payload.walletId,
      sender_wallet_id: payload.senderWalletId ?? null,
      receiver_wallet_id: payload.receiverWalletId ?? null,
      type: payload.type,
      status: "successful",
      amount: payload.amount,
      reference: payload.reference ?? randomUUID(),
      metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
    });
  }

  private withBalance(wallet: WalletRecord, balance: number): WalletRecord {
    return { ...wallet, balance: balance.toFixed(2) };
  }
}

const walletLedgerService = new WalletLedgerService(db);

export const getMyWallet = (userId: string): Promise<WalletRecord> =>
  walletLedgerService.getMyWallet(userId);

export const fundWallet = (input: AmountInput): Promise<WalletRecord> =>
  walletLedgerService.fundWallet(input);

export const withdrawFromWallet = (input: AmountInput): Promise<WalletRecord> =>
  walletLedgerService.withdrawFromWallet(input);

export const transferFunds = (input: TransferInput): Promise<TransferResult> =>
  walletLedgerService.transferFunds(input);
