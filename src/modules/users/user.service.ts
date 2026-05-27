import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import db from "../../database/db";
import { isBlacklisted } from "../../services/adjutor.service";
import type { UserRecord, WalletRecord } from "../../types";
import { AppError } from "../../utils/app-error";

const usersTable = "users";
const walletsTable = "wallets";

export type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bvn?: string | null;
  password: string;
};

export type PublicUser = Omit<UserRecord, "password_hash">;

const toPublicUser = (user: UserRecord): PublicUser => {
  const { password_hash: _passwordHash, ...publicUser } = user;
  return publicUser;
};

export const findUserById = async (
  userId: string,
  trx: Knex | Knex.Transaction = db,
): Promise<UserRecord | undefined> => trx<UserRecord>(usersTable).where({ id: userId }).first();

export const createUser = async (
  input: CreateUserInput,
): Promise<{ user: PublicUser; wallet: WalletRecord; token: string }> => {
  const blacklistIdentifiers = [input.email, input.phone, input.bvn].filter(Boolean) as string[];

  for (const identifier of blacklistIdentifiers) {
    if (await isBlacklisted(identifier)) {
      throw new AppError("User is blacklisted on Adjutor Karma", 403);
    }
  }

  return db.transaction(async (trx) => {
    const existingUser = await trx<UserRecord>(usersTable)
      .where({ email: input.email })
      .orWhere({ phone: input.phone })
      .first();

    if (existingUser) {
      throw new AppError("User already exists with email or phone", 409);
    }

    const userId = randomUUID();
    const walletId = randomUUID();
    const passwordHash = await bcrypt.hash(input.password, 10);

    await trx(usersTable).insert({
      id: userId,
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone,
      bvn: input.bvn || null,
      password_hash: passwordHash,
    });

    await trx(walletsTable).insert({
      id: walletId,
      user_id: userId,
      balance: 0,
      currency: "NGN",
    });

    const user = await trx<UserRecord>(usersTable).where({ id: userId }).first();
    const wallet = await trx<WalletRecord>(walletsTable).where({ id: walletId }).first();

    if (!user || !wallet) {
      throw new AppError("Unable to complete onboarding", 500);
    }

    return {
      user: toPublicUser(user),
      wallet,
      token: userId,
    };
  });
};

export const getProfile = async (userId: string): Promise<PublicUser> => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return toPublicUser(user);
};
