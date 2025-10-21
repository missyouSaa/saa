import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { GraduationCap } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const registerSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  email: z.string().email("Email inválido"),
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  role: z.enum(["student", "teacher"]),
  studentId: z.string().optional(),
  career: z.string().optional(),
  semester: z.coerce.number().int().min(1).max(12).optional(),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function Auth() {
  const [, setLocation] = useLocation();
  const { login, register, user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher">("student");

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "student",
      studentId: "",
      career: "",
      semester: 1,
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation(user.role === "student" ? "/student/dashboard" : "/teacher/dashboard");
    }
  }, [user, setLocation]);

  const onLogin = async (data: LoginForm) => {
    try {
      await login(data.username, data.password);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido a ITSU Analytics",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Credenciales inválidas",
        variant: "destructive",
      });
    }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      await register(data);
      
      toast({
        title: "Registro exitoso",
        description: "Ahora puedes iniciar sesión",
      });
      setActiveTab("login");
      registerForm.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al registrar usuario",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-md bg-primary flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">ITSU Analytics</CardTitle>
          <CardDescription>
            Plataforma de análisis educativo y seguimiento de progreso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login" data-testid="tab-login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Usuario</Label>
                  <Input
                    id="login-username"
                    data-testid="input-username"
                    {...loginForm.register("username")}
                    placeholder="Ingresa tu usuario"
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.username.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input
                    id="login-password"
                    type="password"
                    data-testid="input-password"
                    {...loginForm.register("password")}
                    placeholder="Ingresa tu contraseña"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginForm.formState.isSubmitting}
                  data-testid="button-login"
                >
                  {loginForm.formState.isSubmitting ? "Iniciando..." : "Iniciar Sesión"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <div className="mb-4">
                <Label className="mb-2 block">Tipo de usuario</Label>
                <Tabs value={selectedRole} onValueChange={(v) => {
                  setSelectedRole(v as "student" | "teacher");
                  registerForm.setValue("role", v as "student" | "teacher");
                }}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="student" data-testid="role-student">Estudiante</TabsTrigger>
                    <TabsTrigger value="teacher" data-testid="role-teacher">Profesor</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      data-testid="input-firstname"
                      {...registerForm.register("firstName")}
                      placeholder="Nombre"
                    />
                    {registerForm.formState.errors.firstName && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      data-testid="input-lastname"
                      {...registerForm.register("lastName")}
                      placeholder="Apellido"
                    />
                    {registerForm.formState.errors.lastName && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="input-email"
                    {...registerForm.register("email")}
                    placeholder="correo@ejemplo.com"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-username">Usuario</Label>
                  <Input
                    id="reg-username"
                    data-testid="input-reg-username"
                    {...registerForm.register("username")}
                    placeholder="Elige un usuario"
                  />
                  {registerForm.formState.errors.username && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password">Contraseña</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    data-testid="input-reg-password"
                    {...registerForm.register("password")}
                    placeholder="Mínimo 6 caracteres"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                {selectedRole === "student" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="studentId">ID de Estudiante</Label>
                      <Input
                        id="studentId"
                        data-testid="input-studentid"
                        {...registerForm.register("studentId")}
                        placeholder="Ej: 2024001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="career">Carrera</Label>
                      <Input
                        id="career"
                        data-testid="input-career"
                        {...registerForm.register("career")}
                        placeholder="Ingeniería en Sistemas"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semestre</Label>
                      <Input
                        id="semester"
                        type="number"
                        min="1"
                        max="12"
                        data-testid="input-semester"
                        {...registerForm.register("semester")}
                        placeholder="1-12"
                      />
                    </div>
                  </>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={registerForm.formState.isSubmitting}
                  data-testid="button-register"
                >
                  {registerForm.formState.isSubmitting ? "Registrando..." : "Registrarse"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
