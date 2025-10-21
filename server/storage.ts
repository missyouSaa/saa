// Reference: javascript_database blueprint integration - DatabaseStorage implementation
import { 
  users, 
  students,
  surveyQuestions,
  surveyResponses,
  weeklyProgress,
  type User, 
  type InsertUser,
  type Student,
  type InsertStudent,
  type SurveyQuestion,
  type InsertSurveyQuestion,
  type SurveyResponse,
  type InsertSurveyResponse,
  type WeeklyProgress,
  type InsertWeeklyProgress,
  type UserWithStudent,
  type StudentWithUser,
  type StudentWithProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserWithStudent(id: string): Promise<UserWithStudent | undefined>;

  // Student operations
  getStudent(userId: string): Promise<Student | undefined>;
  getStudentById(id: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, data: Partial<Student>): Promise<Student>;
  getAllStudents(): Promise<StudentWithUser[]>;
  getStudentWithProgress(userId: string): Promise<StudentWithProgress | undefined>;

  // Survey operations
  getAllSurveyQuestions(): Promise<SurveyQuestion[]>;
  createSurveyQuestion(question: InsertSurveyQuestion): Promise<SurveyQuestion>;
  getSurveyResponsesByStudent(studentId: string): Promise<SurveyResponse[]>;
  createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse>;
  bulkCreateSurveyResponses(responses: InsertSurveyResponse[]): Promise<SurveyResponse[]>;

  // Weekly progress operations
  getWeeklyProgressByStudent(studentId: string): Promise<WeeklyProgress[]>;
  createWeeklyProgress(progress: InsertWeeklyProgress): Promise<WeeklyProgress>;
  updateWeeklyProgress(id: string, data: Partial<WeeklyProgress>): Promise<WeeklyProgress>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserWithStudent(id: string): Promise<UserWithStudent | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;

    const [student] = await db.select().from(students).where(eq(students.userId, id));
    
    return {
      ...user,
      student: student || null,
    };
  }

  // Student operations
  async getStudent(userId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    return student || undefined;
  }

  async getStudentById(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(students)
      .values(insertStudent)
      .returning();
    return student;
  }

  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    const [student] = await db
      .update(students)
      .set(data)
      .where(eq(students.id, id))
      .returning();
    return student;
  }

  async getAllStudents(): Promise<StudentWithUser[]> {
    const allStudents = await db
      .select()
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .orderBy(desc(students.average));

    return allStudents.map(row => ({
      ...row.students,
      user: row.users,
    }));
  }

  async getStudentWithProgress(userId: string): Promise<StudentWithProgress | undefined> {
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    if (!student) return undefined;

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return undefined;

    const progress = await db
      .select()
      .from(weeklyProgress)
      .where(eq(weeklyProgress.studentId, student.id))
      .orderBy(weeklyProgress.weekNumber);

    const responses = await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.studentId, student.id));

    return {
      ...student,
      user,
      weeklyProgress: progress,
      surveyResponses: responses,
    };
  }

  // Survey operations
  async getAllSurveyQuestions(): Promise<SurveyQuestion[]> {
    return await db.select().from(surveyQuestions).orderBy(surveyQuestions.order);
  }

  async createSurveyQuestion(insertQuestion: InsertSurveyQuestion): Promise<SurveyQuestion> {
    const [question] = await db
      .insert(surveyQuestions)
      .values(insertQuestion)
      .returning();
    return question;
  }

  async getSurveyResponsesByStudent(studentId: string): Promise<SurveyResponse[]> {
    return await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.studentId, studentId));
  }

  async createSurveyResponse(insertResponse: InsertSurveyResponse): Promise<SurveyResponse> {
    const [response] = await db
      .insert(surveyResponses)
      .values(insertResponse)
      .returning();
    return response;
  }

  async bulkCreateSurveyResponses(responses: InsertSurveyResponse[]): Promise<SurveyResponse[]> {
    if (responses.length === 0) return [];
    return await db
      .insert(surveyResponses)
      .values(responses)
      .returning();
  }

  // Weekly progress operations
  async getWeeklyProgressByStudent(studentId: string): Promise<WeeklyProgress[]> {
    return await db
      .select()
      .from(weeklyProgress)
      .where(eq(weeklyProgress.studentId, studentId))
      .orderBy(weeklyProgress.weekNumber);
  }

  async createWeeklyProgress(insertProgress: InsertWeeklyProgress): Promise<WeeklyProgress> {
    const [progress] = await db
      .insert(weeklyProgress)
      .values(insertProgress)
      .returning();
    return progress;
  }

  async updateWeeklyProgress(id: string, data: Partial<WeeklyProgress>): Promise<WeeklyProgress> {
    const [progress] = await db
      .update(weeklyProgress)
      .set(data)
      .where(eq(weeklyProgress.id, id))
      .returning();
    return progress;
  }
}

export const storage = new DatabaseStorage();
