import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <FileQuestion className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-xl font-semibold">Página no encontrada</p>
            <p className="text-muted-foreground">
              La página que buscas no existe o ha sido movida.
            </p>
          </div>
          <Button onClick={() => setLocation("/auth")} data-testid="button-home">
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
