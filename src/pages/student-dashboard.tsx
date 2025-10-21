import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { 
  BarChart3, 
  BookOpen, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import type { StudentWithProgress } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: studentData, isLoading } = useQuery<StudentWithProgress>({
    queryKey: ["/api/student/profile"],
    enabled: !!user && user.role === "student",
  });

  const { data: pendingSurveys } = useQuery<any[]>({
    queryKey: ["/api/student/surveys/pending"],
    enabled: !!user && user.role === "student",
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <div className="space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">No se encontró el perfil de estudiante</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completionPercentage = studentData.completionRate ? parseFloat(studentData.completionRate) : 0;
  const weeklyData = studentData.weeklyProgress?.map(week => ({
    week: `S${week.weekNumber}`,
    promedio: parseFloat(week.weeklyAverage || "0"),
    completadas: week.tasksCompleted,
    total: week.tasksTotal,
  })) || [];

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">
          Hola, {studentData.user.firstName}
        </h1>
        <p className="text-muted-foreground">
          {studentData.career} • Semestre {studentData.semester}
        </p>
      </div>

      {/* Pending Surveys Alert */}
      {pendingSurveys && pendingSurveys.length > 0 && (
        <Card className="border-l-4 border-l-primary bg-primary/5">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Encuestas Pendientes</CardTitle>
                  <CardDescription className="mt-1">
                    Tienes {pendingSurveys.length} encuesta{pendingSurveys.length !== 1 ? 's' : ''} por completar
                  </CardDescription>
                </div>
              </div>
              <Button data-testid="button-view-surveys" onClick={() => setLocation("/student/surveys")}>
                Ver Encuestas
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-average">
              {parseFloat(studentData.average || "0").toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              De 100.00
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Completitud</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-completion">
              {completionPercentage.toFixed(0)}%
            </div>
            <Progress value={completionPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encuestas Completadas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-surveys">
              {studentData.surveysCompleted || 0} / {studentData.surveysTotal || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfil Cognitivo</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full mt-1"
              onClick={() => setLocation("/student/profile")}
              data-testid="button-view-profile"
            >
              Ver Análisis
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Chart */}
      {weeklyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progreso Semanal</CardTitle>
            <CardDescription>
              Seguimiento de tu rendimiento a lo largo del semestre (16 semanas)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="week" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="promedio" 
                    stroke="hsl(var(--chart-1))" 
                    fillOpacity={1}
                    fill="url(#colorAverage)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cognitive Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Dimensiones del Perfil Cognitivo</CardTitle>
          <CardDescription>
            Análisis de tu estilo de aprendizaje
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Secuencial ↔ Global</span>
              <span className="text-sm text-muted-foreground font-mono">
                {studentData.profileSequentialGlobal || 0}
              </span>
            </div>
            <Progress 
              value={((studentData.profileSequentialGlobal || 0) + 100) / 2} 
              className="h-2"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Activo ↔ Reflexivo</span>
              <span className="text-sm text-muted-foreground font-mono">
                {studentData.profileActiveReflective || 0}
              </span>
            </div>
            <Progress 
              value={((studentData.profileActiveReflective || 0) + 100) / 2} 
              className="h-2"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Sensorial ↔ Intuitivo</span>
              <span className="text-sm text-muted-foreground font-mono">
                {studentData.profileSensorialIntuitive || 0}
              </span>
            </div>
            <Progress 
              value={((studentData.profileSensorialIntuitive || 0) + 100) / 2} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
