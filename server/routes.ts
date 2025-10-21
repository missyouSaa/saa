import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { hashPassword } from "./auth";
import { insertUserSchema, insertStudentSchema, insertSurveyResponseSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// Middleware to check authentication
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "No autenticado" });
  }
  next();
}

// Middleware to check student role
function requireStudent(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "No autenticado" });
  }
  if (req.user!.role !== "student") {
    return res.status(403).json({ message: "Acceso denegado" });
  }
  next();
}

// Middleware to check teacher role
function requireTeacher(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "No autenticado" });
  }
  if (req.user!.role !== "teacher") {
    return res.status(403).json({ message: "Acceso denegado" });
  }
  next();
}

// Sanitize user (remove password)
function sanitizeUser(user: any) {
  const { password, ...sanitized } = user;
  return sanitized;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ============= AUTH ROUTES =============
  
  // Get current user
  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(sanitizeUser(req.user));
    } else {
      res.status(401).json({ message: "No autenticado" });
    }
  });

  // Login
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Error del servidor" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Credenciales inválidas" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error al iniciar sesión" });
        }
        return res.json(sanitizeUser(user));
      });
    })(req, res, next);
  });

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { studentId, career, semester, ...userData } = req.body;

      // Validate user data
      const validatedUser = insertUserSchema.parse(userData);

      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(validatedUser.username);
      if (existingUsername) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }

      const existingEmail = await storage.getUserByEmail(validatedUser.email);
      if (existingEmail) {
        return res.status(400).json({ message: "El email ya está registrado" });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedUser.password);

      // Create user
      const user = await storage.createUser({
        ...validatedUser,
        password: hashedPassword,
      });

      // If student role, create student profile
      if (user.role === "student" && studentId && career && semester) {
        const validatedStudent = insertStudentSchema.parse({
          userId: user.id,
          studentId,
          career,
          semester,
        });

        await storage.createStudent(validatedStudent);

        // Initialize 16 weeks of progress
        for (let week = 1; week <= 16; week++) {
          const student = await storage.getStudent(user.id);
          if (student) {
            await storage.createWeeklyProgress({
              studentId: student.id,
              weekNumber: week,
              tasksCompleted: 0,
              tasksTotal: 10,
              weeklyAverage: "0",
            });
          }
        }
      }

      res.status(201).json({ message: "Usuario registrado exitosamente", user: sanitizeUser(user) });
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error al registrar usuario:", error);
      res.status(500).json({ message: "Error al registrar usuario" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error al cerrar sesión" });
      }
      res.json({ message: "Sesión cerrada" });
    });
  });

  // ============= STUDENT ROUTES =============
  
  // Get student profile with progress
  app.get("/api/student/profile", requireStudent, async (req, res) => {
    try {
      const studentData = await storage.getStudentWithProgress(req.user!.id);
      
      if (!studentData) {
        return res.status(404).json({ message: "Perfil de estudiante no encontrado" });
      }

      res.json(studentData);
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      res.status(500).json({ message: "Error al obtener perfil" });
    }
  });

  // Get pending surveys
  app.get("/api/student/surveys/pending", requireStudent, async (req, res) => {
    try {
      const student = await storage.getStudent(req.user!.id);
      if (!student) {
        return res.json([]);
      }

      const allQuestions = await storage.getAllSurveyQuestions();
      const responses = await storage.getSurveyResponsesByStudent(student.id);
      const answeredQuestionIds = new Set(responses.map(r => r.questionId));
      
      const pendingQuestions = allQuestions.filter(q => !answeredQuestionIds.has(q.id));

      res.json(pendingQuestions);
    } catch (error) {
      console.error("Error al obtener encuestas pendientes:", error);
      res.status(500).json({ message: "Error al obtener encuestas" });
    }
  });

  // Get all survey questions
  app.get("/api/student/surveys/questions", requireStudent, async (req, res) => {
    try {
      const student = await storage.getStudent(req.user!.id);
      if (!student) {
        return res.json([]);
      }

      const allQuestions = await storage.getAllSurveyQuestions();
      const responses = await storage.getSurveyResponsesByStudent(student.id);
      const answeredQuestionIds = new Set(responses.map(r => r.questionId));
      
      const unansweredQuestions = allQuestions.filter(q => !answeredQuestionIds.has(q.id));

      res.json(unansweredQuestions);
    } catch (error) {
      console.error("Error al obtener preguntas:", error);
      res.status(500).json({ message: "Error al obtener preguntas" });
    }
  });

  // Submit survey responses
  app.post("/api/student/surveys/submit", requireStudent, async (req, res) => {
    try {
      const student = await storage.getStudent(req.user!.id);
      if (!student) {
        return res.status(404).json({ message: "Perfil de estudiante no encontrado" });
      }

      const { responses } = req.body;
      if (!Array.isArray(responses) || responses.length === 0) {
        return res.status(400).json({ message: "Respuestas inválidas" });
      }

      // Validate and create responses
      const validatedResponses = responses.map(r => 
        insertSurveyResponseSchema.parse({
          ...r,
          studentId: student.id,
        })
      );

      await storage.bulkCreateSurveyResponses(validatedResponses);

      // Update student completion metrics
      const allQuestions = await storage.getAllSurveyQuestions();
      const allResponses = await storage.getSurveyResponsesByStudent(student.id);
      const surveysCompleted = allResponses.length;
      const surveysTotal = allQuestions.length;
      const completionRate = surveysTotal > 0 ? ((surveysCompleted / surveysTotal) * 100).toFixed(2) : "0";

      await storage.updateStudent(student.id, {
        surveysCompleted,
        surveysTotal,
        completionRate,
      });

      res.json({ message: "Respuestas guardadas exitosamente" });
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error al guardar respuestas:", error);
      res.status(500).json({ message: "Error al guardar respuestas" });
    }
  });

  // ============= TEACHER ROUTES =============
  
  // Get class metrics
  app.get("/api/teacher/metrics", requireTeacher, async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      
      const totalStudents = students.length;
      const averageGrade = students.length > 0
        ? students.reduce((sum, s) => sum + parseFloat(s.average || "0"), 0) / students.length
        : 0;
      const completionRate = students.length > 0
        ? students.reduce((sum, s) => sum + parseFloat(s.completionRate || "0"), 0) / students.length
        : 0;
      const surveysCompleted = students.reduce((sum, s) => sum + (s.surveysCompleted || 0), 0);
      const surveysTotal = students.reduce((sum, s) => sum + (s.surveysTotal || 0), 0);

      res.json({
        totalStudents,
        averageGrade,
        completionRate,
        surveysCompleted,
        surveysTotal,
      });
    } catch (error) {
      console.error("Error al obtener métricas:", error);
      res.status(500).json({ message: "Error al obtener métricas" });
    }
  });

  // Get all students
  app.get("/api/teacher/students", requireTeacher, async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      
      const studentsData = students.map(s => ({
        id: s.id,
        name: `${s.user.firstName} ${s.user.lastName}`,
        studentId: s.studentId,
        career: s.career,
        semester: s.semester,
        average: s.average || "0",
        completionRate: s.completionRate || "0",
        surveysCompleted: s.surveysCompleted || 0,
      }));

      res.json(studentsData);
    } catch (error) {
      console.error("Error al obtener estudiantes:", error);
      res.status(500).json({ message: "Error al obtener estudiantes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
