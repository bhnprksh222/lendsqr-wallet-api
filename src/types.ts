export type TransactionType = "funding" | "transfer" | "withdrawal";
export type TransactionStatus = "pending" | "successful" | "failed";

export interface UserRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bvn: string | null;
  password_hash: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface WalletRecord {
  id: string;
  user_id: string;
  balance: string;
  currency: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface TransactionRecord {
  id: string;
  wallet_id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  reference: string;
  sender_wallet_id: string | null;
  receiver_wallet_id: string | null;
  metadata: string | null;
  created_at?: Date;
  updated_at?: Date;
}
