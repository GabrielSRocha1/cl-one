import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Wallets table - Smart Wallet (Safe) addresses per user and chain
 */
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  address: varchar("address", { length: 42 }).notNull(), // Smart Wallet address
  chainId: int("chainId").notNull(), // 1 = Ethereum, 137 = Polygon, etc
  safeAddress: varchar("safeAddress", { length: 42 }).notNull(),
  owners: text("owners").notNull(), // JSON array of owner addresses
  threshold: int("threshold").default(1),
  isActive: int("isActive").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

/**
 * Tokens table - Supported tokens across chains
 */
export const tokens = mysqlTable("tokens", {
  id: int("id").autoincrement().primaryKey(),
  address: varchar("address", { length: 42 }).notNull(),
  chainId: int("chainId").notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  decimals: int("decimals").default(18),
  logoUrl: text("logoUrl"),
  isActive: int("isActive").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Token = typeof tokens.$inferSelect;
export type InsertToken = typeof tokens.$inferInsert;

/**
 * Balances table - Token balances per wallet
 */
export const balances = mysqlTable("balances", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").notNull().references(() => wallets.id),
  tokenId: int("tokenId").notNull().references(() => tokens.id),
  balance: varchar("balance", { length: 100 }).notNull(), // BigInt as string
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Balance = typeof balances.$inferSelect;
export type InsertBalance = typeof balances.$inferInsert;

/**
 * Transactions table - All user transactions (swaps, liquidity, deposits, withdrawals)
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  type: mysqlEnum("type", ["SWAP", "LIQUIDITY_ADD", "LIQUIDITY_REMOVE", "DEPOSIT", "WITHDRAW", "TRANSFER"]).notNull(),
  fromToken: varchar("fromToken", { length: 42 }),
  toToken: varchar("toToken", { length: 42 }),
  amount: varchar("amount", { length: 100 }).notNull(),
  hash: varchar("hash", { length: 66 }).unique(),
  status: mysqlEnum("status", ["PENDING", "CONFIRMED", "FAILED"]).default("PENDING"),
  chainId: int("chainId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Liquidity Pools table - User's liquidity positions
 */
export const liquidityPools = mysqlTable("liquidityPools", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  poolAddress: varchar("poolAddress", { length: 42 }).notNull(),
  token0: varchar("token0", { length: 42 }).notNull(),
  token1: varchar("token1", { length: 42 }).notNull(),
  liquidity: varchar("liquidity", { length: 100 }).notNull(),
  fee: int("fee").notNull(), // 500, 3000, 10000
  tickLower: int("tickLower"),
  tickUpper: int("tickUpper"),
  chainId: int("chainId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LiquidityPool = typeof liquidityPools.$inferSelect;
export type InsertLiquidityPool = typeof liquidityPools.$inferInsert;

/**
 * Rewards table - Cashback and trading rewards
 */
export const rewards = mysqlTable("rewards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  type: mysqlEnum("type", ["CASHBACK", "REFERRAL", "TRADING", "LIQUIDITY"]).notNull(),
  amount: varchar("amount", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["PENDING", "CLAIMED"]).default("PENDING"),
  claimedAt: timestamp("claimedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = typeof rewards.$inferInsert;

/**
 * Deposits table - PIX deposits
 */
export const deposits = mysqlTable("deposits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  pixKey: varchar("pixKey", { length: 255 }).notNull(),
  amount: varchar("amount", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["PENDING", "CONFIRMED", "FAILED"]).default("PENDING"),
  txHash: varchar("txHash", { length: 66 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Deposit = typeof deposits.$inferSelect;
export type InsertDeposit = typeof deposits.$inferInsert;

/**
 * Withdrawals table - PIX withdrawals
 */
export const withdrawals = mysqlTable("withdrawals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  pixKey: varchar("pixKey", { length: 255 }).notNull(),
  amount: varchar("amount", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["PENDING", "CONFIRMED", "FAILED"]).default("PENDING"),
  txHash: varchar("txHash", { length: 66 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = typeof withdrawals.$inferInsert;

/**
 * Referrals table - User referral tracking
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  referralCode: varchar("referralCode", { length: 20 }).notNull().unique(),
  referredBy: int("referredBy").references(() => users.id),
  totalReferred: int("totalReferred").default(0),
  totalRewards: varchar("totalRewards", { length: 100 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * KYC table - Know Your Customer verification
 */
export const kyc = mysqlTable("kyc", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id).unique(),
  level: mysqlEnum("level", ["NONE", "BASIC", "ADVANCED", "FULL"]).default("NONE"),
  status: mysqlEnum("status", ["PENDING", "APPROVED", "REJECTED", "EXPIRED"]).default("PENDING"),
  sumsubApplicantId: varchar("sumsubApplicantId", { length: 100 }),
  documentType: varchar("documentType", { length: 50 }),
  documentNumber: varchar("documentNumber", { length: 50 }),
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  dateOfBirth: varchar("dateOfBirth", { length: 10 }),
  country: varchar("country", { length: 2 }),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KYC = typeof kyc.$inferSelect;
export type InsertKYC = typeof kyc.$inferInsert;

/**
 * Admin table - Administradores do sistema
 */
export const admins = mysqlTable("admins", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  role: mysqlEnum("role", ["superadmin", "admin", "moderator"]).default("admin"),
  isActive: int("isActive").default(1),
  lastLogin: timestamp("lastLogin"),
  passwordChangedAt: timestamp("passwordChangedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = typeof admins.$inferInsert;

/**
 * Audit logs table - Registro de ações administrativas
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull().references(() => admins.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: int("entityId"),
  description: text("description"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;