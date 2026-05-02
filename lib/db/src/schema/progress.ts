import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userProgressTable = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  challengeId: text("challenge_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertUserProgressSchema = createInsertSchema(userProgressTable).omit({ id: true, completedAt: true });
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgressTable.$inferSelect;
