import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { 
  Users, 
  TrendingUp, 
  BookOpen, 
  Download,
  CheckCircle2,
  Clock
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ClassMetrics {
  totalStudents: number;
  averageGrade: number;
  completionRate: number;
  surveysCompleted: number;
  surveysTotal: number;
}

interface StudentSummary {
  id: string;
  name: string;
  studentId: string;
  career: string;
  semester: number;
  average: string;
  completionRate: string;
  surveysCompleted: number;
}

export default function TeacherDashboard() {
  const { user } = useAuth();

  const { data: metrics, isLoading: metricsLoading } = useQuery<ClassMetrics>({
    queryKey: ["/api/teacher/metrics"],
    enabled: !!user && user.role === "teacher",
  });

  const { data: students, isLoading: studentsLoading } = useQuery<StudentSummary[]>({
    queryKey: ["/api/teacher/students"],
    enabled: !!user && user.role === "teacher",
  });

  if (metricsLoading || studentsLoading) {
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

  const completionPercentage = metrics?.completionRate || 0;
  
  const performanceData = students?.reduce((acc: any[], student) => {
    const avg = parseFloat(student.average || "0");
    const range = avg >= 90 ? "90-100" : avg >= 80 ? "80-89" : avg >= 70 ? "70-79" : avg >= 60 ? "60-69" : "0-59";
    const existing = acc.find(d => d.range === range);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ range, count: 1 });
    }
    return acc;
  }, []) || [];

  const COLORS = ['hsl(var(--chart-4))', 'hsl(var(--chart-1))', 'hsl(var(--chart-5))', 'hsl(var(--destructive))'];

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Dashboard de Profesor
          </h1>
          <p className="text-muted-foreground">
            Panel de análisis y gestión de clase
          </p>
        </div>
        <Button variant="outline" data-testid="button-export">
          <Download className="h-4 w-4 mr-2" />
          Exportar Datos
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-students">
              {metrics?.totalStudents || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Inscritos en el curso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-class-average">
              {metrics?.averageGrade.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Promedio de la clase
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Completitud</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-class-completion">
              {completionPercentage.toFixed(0)}%
            </div>
            <Progress value={completionPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encuestas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-surveys-completed">
              {metrics?.surveysCompleted || 0} / {metrics?.surveysTotal || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Completadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Rendimiento</CardTitle>
            <CardDescription>
              Estudiantes por rango de calificación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="range" 
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
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Survey Completion Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Encuestas</CardTitle>
            <CardDescription>
              Progreso de completitud por estudiante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {students?.slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-md border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.studentId}</p>
                  </div>
                  <Badge variant={parseFloat(student.completionRate) >= 80 ? "default" : "secondary"}>
                    {parseFloat(student.completionRate).toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudiantes</CardTitle>
          <CardDescription>
            Todos los estudiantes inscritos en el curso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium">Nombre</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Carrera</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Semestre</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Promedio</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Completitud</th>
                </tr>
              </thead>
              <tbody>
                {students?.map((student) => (
                  <tr key={student.id} className="border-b hover-elevate" data-testid={`row-student-${student.id}`}>
                    <td className="py-3 px-4 text-sm">{student.name}</td>
                    <td className="py-3 px-4 text-sm font-mono">{student.studentId}</td>
                    <td className="py-3 px-4 text-sm">{student.career}</td>
                    <td className="py-3 px-4 text-sm">{student.semester}</td>
                    <td className="py-3 px-4 text-sm font-semibold">{parseFloat(student.average).toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm">
                      <Badge variant={parseFloat(student.completionRate) >= 80 ? "default" : "secondary"}>
                        {parseFloat(student.completionRate).toFixed(0)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
