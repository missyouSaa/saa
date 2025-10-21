# ITSU Analytics - Educational Analytics Platform

## Overview

ITSU Analytics is an educational analytics platform designed for tracking student progress, analyzing cognitive profiles, and generating performance metrics. The system serves two primary user roles: students (who can view their own progress and complete surveys) and teachers (who can monitor all students, view analytics, and track completion rates).

The platform features a comprehensive dashboard with interactive visualizations, weekly progress tracking across 16-week semesters, cognitive profile assessments based on learning style dimensions, and a personalized recommendation system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, chosen for fast HMR and optimized production builds
- Wouter for client-side routing, selected as a lightweight alternative to React Router

**State Management & Data Fetching**
- TanStack Query v5 handles all server state, with configured options to disable automatic refetching (staleTime: Infinity, refetchOnWindowFocus: false)
- React Context API for authentication state via custom AuthProvider
- React Hook Form with Zod validation for form state management

**UI Components & Styling**
- Shadcn UI component library built on Radix UI primitives for accessibility
- Tailwind CSS with Material Design-inspired custom theme
- CSS variables for theming with light/dark mode support
- Custom color system defined in design_guidelines.md featuring educational blue primary color (210 90% 48%) and specialized data visualization palette

**Design System Decisions**
- Material Design principles adapted for information-dense educational data
- Custom border radius scale (9px/6px/3px) for consistent component sizing
- Typography hierarchy using Inter (UI), Merriweather (headers/data labels), and JetBrains Mono (codes/IDs)
- Semantic colors for performance indicators (green for high, amber for medium, red for low)

### Backend Architecture

**Server Framework**
- Express.js with TypeScript running in ESM mode
- Session-based authentication using Passport.js with LocalStrategy
- Password hashing via Node.js native scrypt with random salt generation
- Custom middleware for role-based access control (requireAuth, requireStudent, requireTeacher)

**API Design**
- RESTful endpoints organized by user role (/api/student/*, /api/teacher/*)
- Consistent error handling with proper HTTP status codes
- Request/response logging middleware for debugging

**Authentication Flow**
- Session persistence using connect-pg-simple for PostgreSQL-backed sessions
- Cookie-based sessions with 7-day expiration
- Protected routes redirect unauthenticated users to /auth
- User sanitization removes sensitive fields (password) from API responses

### Database Architecture

**ORM & Schema Management**
- Drizzle ORM for type-safe database operations
- Neon Serverless PostgreSQL adapter with WebSocket support
- Schema definitions in shared/schema.ts using drizzle-zod for runtime validation

**Data Model**
The system uses four primary tables:

1. **users** - Authentication and basic user info (username, password, email, role, firstName, lastName)
2. **students** - Extended profile data including academic info (studentId, career, semester, average), cognitive profile scores (profileSequentialGlobal, profileActiveReflective, profileSensorialIntuitive stored as -100 to 100 integers), and completion metrics
3. **surveyQuestions** - Question definitions with type (likert, text, multiple_choice, cognitive_scale), category, and dimension mapping
4. **surveyResponses** - Student answers linked to questions and students
5. **weeklyProgress** - 16-week tracking grid (week number, tasksCompleted, tasksTotal, weeklyAverage)

**Schema Decisions**
- UUID primary keys generated via PostgreSQL gen_random_uuid()
- Cascade deletes on user deletion to maintain referential integrity
- Cognitive profiles stored as integers (-100 to 100) representing spectrum positions rather than discrete categories
- Decimal types with precision for academic metrics (average, completionRate)

### Module Organization

**Shared Code**
- `/shared/schema.ts` - Database schema and Zod validation schemas shared between client and server
- Ensures type consistency across the full stack

**Path Aliases**
- `@/*` resolves to client/src for frontend imports
- `@shared/*` resolves to shared directory for cross-platform types
- `@assets/*` resolves to attached_assets directory

## External Dependencies

### Database
- **Neon Serverless PostgreSQL** - Primary data store, accessed via DATABASE_URL environment variable
- **Drizzle ORM** - Type-safe database operations with schema migrations in ./migrations directory

### Authentication
- **Passport.js** - Authentication middleware with LocalStrategy for username/password
- **connect-pg-simple** - PostgreSQL session store for persistent sessions
- **express-session** - Session middleware requiring SESSION_SECRET environment variable

### UI Component Libraries
- **Radix UI** - Headless component primitives (@radix-ui/react-* packages) providing 20+ accessible components
- **Shadcn UI** - Pre-styled component wrappers configured in components.json with New York style variant
- **Recharts** - Data visualization library for charts and graphs
- **Lucide React** - Icon library

### Utilities
- **date-fns** - Date manipulation and formatting
- **class-variance-authority** - Component variant management
- **clsx & tailwind-merge** - Conditional className composition
- **zod** - Runtime type validation with zod-validation-error for user-friendly error messages

### Development Tools
- **Vite Plugins** - Runtime error overlay, Replit-specific plugins (cartographer, dev-banner) in development mode only
- **TypeScript** - Strict mode enabled with ESNext target and bundler module resolution