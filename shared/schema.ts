import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number"),
  location: text("location"),
  bio: text("bio"),
  userType: text("user_type").notNull(), // 'volunteer' or 'recruiter'
  interests: text("interests").array(), // Array of interests
  ngoId: integer("ngo_id"), // Only for recruiters
});

// NGO schema
export const ngos = pgTable("ngos", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  cause: text("cause").notNull(),
  location: text("location").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number"),
  website: text("website"),
  logo: text("logo"),
});

// Opportunity schema
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ngoId: integer("ngo_id").notNull(),
  location: text("location").notNull(),
  remote: boolean("remote").default(false),
  skills: text("skills").array(),
  commitment: text("commitment").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  openings: integer("openings").default(1),
  deleted: boolean("deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Application schema
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull(),
  opportunityId: integer("opportunity_id").notNull(),
  ngoId: integer("ngo_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  message: text("message"),
  resume: text("resume"), // URL or base64 encoded string of the resume file
  createdAt: timestamp("created_at").defaultNow(),
});

// Suggestion schema
export const suggestions = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull(),
  ngoId: integer("ngo_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for inserting users
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Schema for inserting NGOs
export const insertNgoSchema = createInsertSchema(ngos).omit({
  id: true,
});

// Schema for inserting opportunities
export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  createdAt: true,
});

// Schema for inserting applications
export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
});

// Schema for inserting suggestions
export const insertSuggestionSchema = createInsertSchema(suggestions).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type NGO = typeof ngos.$inferSelect;
export type InsertNGO = z.infer<typeof insertNgoSchema>;
export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Suggestion = typeof suggestions.$inferSelect;
export type InsertSuggestion = z.infer<typeof insertSuggestionSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;
