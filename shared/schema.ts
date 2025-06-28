import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  language: text("language").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  content: text("content").notNull().default(""),
  language: text("language"),
  isDirectory: boolean("is_directory").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const executionSessions = pgTable("execution_sessions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  command: text("command").notNull(),
  status: text("status").notNull().default("running"), // running, completed, failed
  output: text("output").default(""),
  exitCode: integer("exit_code"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExecutionSessionSchema = createInsertSchema(executionSessions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;
export type InsertExecutionSession = z.infer<typeof insertExecutionSessionSchema>;
export type ExecutionSession = typeof executionSessions.$inferSelect;

// Language configuration types
export const LanguageConfig = z.object({
  id: z.string(),
  name: z.string(),
  fileExtensions: z.array(z.string()),
  monacoLanguage: z.string(),
  defaultFile: z.string(),
  template: z.record(z.string(), z.string()), // filename -> content
  buildCommand: z.string().optional(),
  runCommand: z.string(),
});

export type LanguageConfig = z.infer<typeof LanguageConfig>;
