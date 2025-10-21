import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - base authentication and profile
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["student", "teacher"] }).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Students table - extended profile for students
export const students = pgTable("students", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  studentId: text("student_id").notNull().unique(),
  career: text("career").notNull(),
  semester: integer("semester").notNull(),
  average: decimal("average", { precision: 4, scale: 2 }).default("0"),
  
  // Cognitive profiles (-100 to 100 scale)
  profileSequentialGlobal: integer("profile_sequential_global").default(0),
  profileActiveReflective: integer("profile_active_reflective").default(0),
  profileSensorialIntuitive: integer("profile_sensorial_intuitive").default(0),
  
  // Completion metrics
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }).default("0"),
  surveysCompleted: integer("surveys_completed").default(0),
  surveysTotal: integer("surveys_total").default(0),
});

// Survey questions
export const surveyQuestions = pgTable("survey_questions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  questionText: text("question_text").notNull(),
  questionType: text("question_type", { 
    enum: ["likert", "text", "multiple_choice", "cognitive_scale"] 
  }).notNull(),
  category: text("category").notNull(),
  dimension: text("dimension"), // For cognitive profile questions
  options: text("options").array(), // For multiple choice
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Survey responses
export const surveyResponses = pgTable("survey_responses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => surveyQuestions.id, { onDelete: "cascade" }),
  responseValue: text("response_value").notNull(),
  responseNumeric: integer("response_numeric"), // For likert/scale responses
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Weekly progress tracking (16 weeks)
export const weeklyProgress = pgTable("weekly_progress", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  weekNumber: integer("week_number").notNull(),
  tasksCompleted: integer("tasks_completed").default(0).notNull(),
  tasksTotal: integer("tasks_total").default(0).notNull(),
  weeklyAverage: decimal("weekly_average", { precision: 4, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  surveyResponses: many(surveyResponses),
  weeklyProgress: many(weeklyProgress),
}));

export const surveyQuestionsRelations = relations(surveyQuestions, ({ many }) => ({
  responses: many(surveyResponses),
}));

export const surveyResponsesRelations = relations(surveyResponses, ({ one }) => ({
  student: one(students, {
    fields: [surveyResponses.studentId],
    references: [students.id],
  }),
  question: one(surveyQuestions, {
    fields: [surveyResponses.questionId],
    references: [surveyQuestions.id],
  }),
}));

export const weeklyProgressRelations = relations(weeklyProgress, ({ one }) => ({
  student: one(students, {
    fields: [weeklyProgress.studentId],
    references: [students.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["student", "teacher"]),
}).omit({ id: true, createdAt: true });

export const insertStudentSchema = createInsertSchema(students, {
  studentId: z.string().min(1),
  career: z.string().min(1),
  semester: z.number().int().min(1).max(12),
  average: z.string().optional(),
}).omit({ id: true });

export const insertSurveyQuestionSchema = createInsertSchema(surveyQuestions, {
  questionText: z.string().min(1),
  questionType: z.enum(["likert", "text", "multiple_choice", "cognitive_scale"]),
  category: z.string().min(1),
  order: z.number().int(),
}).omit({ id: true, createdAt: true });

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses, {
  responseValue: z.string().min(1),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertWeeklyProgressSchema = createInsertSchema(weeklyProgress, {
  weekNumber: z.number().int().min(1).max(16),
  tasksCompleted: z.number().int().min(0),
  tasksTotal: z.number().int().min(0),
}).omit({ id: true, createdAt: true });

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type SurveyQuestion = typeof surveyQuestions.$inferSelect;
export type InsertSurveyQuestion = z.infer<typeof insertSurveyQuestionSchema>;

export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;

export type WeeklyProgress = typeof weeklyProgress.$inferSelect;
export type InsertWeeklyProgress = z.infer<typeof insertWeeklyProgressSchema>;

// Extended types with relations
export type UserWithStudent = User & {
  student?: Student | null;
};

export type StudentWithUser = Student & {
  user: User;
};

export type StudentWithProgress = Student & {
  user: User;
  weeklyProgress: WeeklyProgress[];
  surveyResponses: SurveyResponse[];
};
