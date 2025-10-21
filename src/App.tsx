import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-provider";
import { AppLayout } from "@/components/app-layout";
import NotFound from "@/pages/not-found";
import Auth from "@/pages/auth";
import StudentDashboard from "@/pages/student-dashboard";
import TeacherDashboard from "@/pages/teacher-dashboard";
import StudentSurveys from "@/pages/student-surveys";

function RootRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Redirect to={user.role === "student" ? "/student/dashboard" : "/teacher/dashboard"} />;
}

function ProtectedRoute({ 
  component: Component, 
  allowedRole 
}: { 
  component: () => JSX.Element; 
  allowedRole?: "student" | "teacher";
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Redirect to={user.role === "student" ? "/student/dashboard" : "/teacher/dashboard"} />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Root redirect */}
      <Route path="/" component={RootRedirect} />

      {/* Auth */}
      <Route path="/auth" component={Auth} />

      {/* Student Routes */}
      <Route path="/student/dashboard">
        {() => <ProtectedRoute component={StudentDashboard} allowedRole="student" />}
      </Route>
      <Route path="/student/surveys">
        {() => <ProtectedRoute component={StudentSurveys} allowedRole="student" />}
      </Route>
      <Route path="/student/profile">
        {() => <ProtectedRoute component={StudentDashboard} allowedRole="student" />}
      </Route>

      {/* Teacher Routes */}
      <Route path="/teacher/dashboard">
        {() => <ProtectedRoute component={TeacherDashboard} allowedRole="teacher" />}
      </Route>
      <Route path="/teacher/students">
        {() => <ProtectedRoute component={TeacherDashboard} allowedRole="teacher" />}
      </Route>
      <Route path="/teacher/analytics">
        {() => <ProtectedRoute component={TeacherDashboard} allowedRole="teacher" />}
      </Route>

      {/* 404 Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <AppLayout>
              <Router />
            </AppLayout>
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
