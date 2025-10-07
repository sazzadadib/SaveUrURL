// src/db/schema.ts
import { pgTable, serial, varchar, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationCode: text("verification_code"),
  verificationCodeExpiry: timestamp("verification_code_expiry"),
  resetPasswordCode: text("reset_password_code"),
  resetPasswordCodeExpiry: timestamp("reset_password_code_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Create a new table for storing temporary verification attempts
export const verificationAttempts = pgTable("verification_attempts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  attemptCount: integer("attempt_count").default(0).notNull(),
  lastAttempt: timestamp("last_attempt").defaultNow().notNull(),
  blockedUntil: timestamp("blocked_until"),
});

// Links table - now with visibility field
export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  title: varchar("title", { length: 255 }),
  source: text("source").notNull(),
  category: text("category").notNull(),
  tags: text("tags"),
  description: text("description"),
  visibility: text("visibility").notNull().default("private"), // 'private', 'public', or 'group'
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }), // null if not group link
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Groups table
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Group members table
export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(), // Email of the member
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

// Custom categories table
export const customCategories = pgTable("custom_categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Custom sources table
export const customSources = pgTable("custom_sources", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type inference for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert;
export type CustomCategory = typeof customCategories.$inferSelect;
export type NewCustomCategory = typeof customCategories.$inferInsert;
export type CustomSource = typeof customSources.$inferSelect;
export type NewCustomSource = typeof customSources.$inferInsert;