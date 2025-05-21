import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  clerkId: text("clerk_id").unique(),
  role: text("role").$type<"writer" | "designer" | "developer" | "marketer">(),
  plan: text("plan").$type<"free" | "pro">().default("free"),
  promptsUsedToday: integer("prompts_used_today").default(0),
  lastPromptDate: timestamp("last_prompt_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  clerkId: true,
  role: true,
  plan: true,
});

// Prompts table
export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  originalPrompt: text("original_prompt").notNull(),
  enhancedPrompt: text("enhanced_prompt").notNull(),
  role: text("role").$type<"writer" | "designer" | "developer" | "marketer">(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPromptSchema = createInsertSchema(prompts).pick({
  userId: true,
  originalPrompt: true,
  enhancedPrompt: true,
  role: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;
