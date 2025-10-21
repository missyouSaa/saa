import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle2, Clipboard } from "lucide-react";
import type { SurveyQuestion } from "@shared/schema";

export default function StudentSurveys() {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});

  const { data: questions, isLoading } = useQuery<SurveyQuestion[]>({
    queryKey: ["/api/student/surveys/questions"],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/student/surveys/submit", data);
    },
    onSuccess: () => {
      toast({
        title: "¡Encuesta enviada!",
        description: "Tus respuestas han sido guardadas exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/student/surveys/pending"] });
      setResponses({});
      setCurrentQuestionIndex(0);
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-2xl">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">Cargando encuestas...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-2xl">
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-chart-4" />
            <h2 className="text-2xl font-bold mb-2">¡Todo al día!</h2>
            <p className="text-muted-foreground">
              No tienes encuestas pendientes en este momento
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleResponse = (value: any) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const formattedResponses = Object.entries(responses).map(([questionId, value]) => ({
      questionId,
      responseValue: typeof value === 'number' ? value.toString() : value,
      responseNumeric: typeof value === 'number' ? value : null,
    }));

    submitMutation.mutate({ responses: formattedResponses });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">
                {currentQuestionIndex + 1} de {questions.length}
              </span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clipboard className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">
                {currentQuestion.questionText}
              </CardTitle>
              <CardDescription>
                Categoría: {currentQuestion.category}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Likert Scale */}
          {currentQuestion.questionType === "likert" && (
            <div className="space-y-4">
              <RadioGroup
                value={responses[currentQuestion.id]?.toString()}
                onValueChange={(value) => handleResponse(parseInt(value))}
              >
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} className="flex flex-col items-center gap-2">
                      <Label 
                        htmlFor={`likert-${value}`}
                        className="cursor-pointer flex flex-col items-center gap-2 p-4 rounded-md border-2 hover-elevate transition-all"
                        style={{
                          borderColor: responses[currentQuestion.id] === value 
                            ? 'hsl(var(--primary))' 
                            : 'hsl(var(--border))',
                          backgroundColor: responses[currentQuestion.id] === value
                            ? 'hsl(var(--primary) / 0.1)'
                            : 'transparent',
                        }}
                      >
                        <RadioGroupItem value={value.toString()} id={`likert-${value}`} />
                        <span className="text-sm font-medium">{value}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Muy en desacuerdo</span>
                <span>Muy de acuerdo</span>
              </div>
            </div>
          )}

          {/* Cognitive Scale (-100 to 100) */}
          {currentQuestion.questionType === "cognitive_scale" && (
            <div className="space-y-4">
              <Slider
                value={[responses[currentQuestion.id] || 0]}
                onValueChange={(value) => handleResponse(value[0])}
                min={-100}
                max={100}
                step={10}
                className="py-4"
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">-100</span>
                <span className="font-semibold text-lg">{responses[currentQuestion.id] || 0}</span>
                <span className="text-muted-foreground">+100</span>
              </div>
              {currentQuestion.dimension && (
                <p className="text-xs text-muted-foreground text-center">
                  Dimensión: {currentQuestion.dimension}
                </p>
              )}
            </div>
          )}

          {/* Multiple Choice */}
          {currentQuestion.questionType === "multiple_choice" && currentQuestion.options && (
            <RadioGroup
              value={responses[currentQuestion.id]}
              onValueChange={handleResponse}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <Label
                    key={index}
                    htmlFor={`option-${index}`}
                    className="flex items-center gap-3 p-4 rounded-md border-2 cursor-pointer hover-elevate transition-all"
                    style={{
                      borderColor: responses[currentQuestion.id] === option
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--border))',
                      backgroundColor: responses[currentQuestion.id] === option
                        ? 'hsl(var(--primary) / 0.1)'
                        : 'transparent',
                    }}
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <span>{option}</span>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          )}

          {/* Text Response */}
          {currentQuestion.questionType === "text" && (
            <div className="space-y-2">
              <Textarea
                value={responses[currentQuestion.id] || ""}
                onChange={(e) => handleResponse(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                className="min-h-32 resize-none"
                data-testid="textarea-response"
              />
              <p className="text-xs text-muted-foreground text-right">
                {(responses[currentQuestion.id] || "").length} caracteres
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex-1"
              data-testid="button-previous"
            >
              Anterior
            </Button>
            {!isLastQuestion ? (
              <Button
                onClick={handleNext}
                disabled={!responses[currentQuestion.id]}
                className="flex-1"
                data-testid="button-next"
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!responses[currentQuestion.id] || submitMutation.isPending}
                className="flex-1"
                data-testid="button-submit-survey"
              >
                {submitMutation.isPending ? "Enviando..." : "Enviar Encuesta"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
