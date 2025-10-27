import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Brain, CheckCircle2 } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "Qual número completa a sequência: 2, 4, 8, 16, ?",
    options: ["24", "28", "32", "36"],
    correctAnswer: "32"
  },
  {
    id: 2,
    question: "Quantos segundos há em 2 minutos?",
    options: ["60", "100", "120", "200"],
    correctAnswer: "120"
  },
  {
    id: 3,
    question: "Qual dessas palavras é diferente? Cachorro, Gato, Peixe, Mesa.",
    options: ["Cachorro", "Gato", "Peixe", "Mesa"],
    correctAnswer: "Mesa"
  },
  {
    id: 4,
    question: "Complete a sequência: 1, 1, 2, 3, 5, 8, ?",
    options: ["11", "12", "13", "14"],
    correctAnswer: "13"
  },
  {
    id: 5,
    question: "Qual número é metade de 1/4?",
    options: ["1/2", "1/8", "1/6", "1/3"],
    correctAnswer: "1/8"
  },
  {
    id: 6,
    question: "Qual número completa a sequência: 2, 6, 12, 20, 30, ?",
    options: ["38", "40", "42", "44"],
    correctAnswer: "42"
  },
  {
    id: 7,
    question: "Qual figura completa o padrão? 🔺🔵🔺🔵🔺 ?",
    options: ["🔺", "🔵", "🔶", "⭐"],
    correctAnswer: "🔵"
  },
  {
    id: 8,
    question: "Um trem leva 1h pra ir de A a B. Outro trem sai de B pra A no mesmo horário e a 2x mais rápido. Quando se cruzam, qual trem está mais perto de A?",
    options: ["O trem que saiu de A", "O trem que saiu de B", "Estão à mesma distância", "Não é possível saber"],
    correctAnswer: "Estão à mesma distância"
  },
  {
    id: 9,
    question: "Qual número completa a sequência: 1, 1, 2, 3, 5, 8, 13, ?",
    options: ["18", "19", "20", "21"],
    correctAnswer: "21"
  },
  {
    id: 10,
    question: "Se 3 gatos caçam 3 ratos em 3 minutos, quantos ratos 100 gatos caçam em 100 minutos?",
    options: ["100", "300", "3.333", "10.000"],
    correctAnswer: "10.000"
  },
  {
    id: 11,
    question: "O que vem a seguir? A, C, F, J, O, ?",
    options: ["S", "T", "U", "V"],
    correctAnswer: "U"
  },
  {
    id: 12,
    question: "Um relógio marca 3h10. O ângulo entre o ponteiro das horas e dos minutos é:",
    options: ["25 graus", "30 graus", "35 graus", "40 graus"],
    correctAnswer: "35 graus"
  },
  {
    id: 13,
    question: "Se o oposto de 'mentiroso' é 'honesto', qual seria o oposto de 'modesto'?",
    options: ["Tímido", "Arrogante", "Humilde", "Sincero"],
    correctAnswer: "Arrogante"
  },
  {
    id: 14,
    question: "Se 5 máquinas fazem 5 peças em 5 minutos, quanto tempo 100 máquinas levam pra fazer 100 peças?",
    options: ["5 minutos", "20 minutos", "100 minutos", "500 minutos"],
    correctAnswer: "5 minutos"
  },
  {
    id: 15,
    question: "O dobro de um número somado a 5 é igual a 19. Qual é o número?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "7"
  },
  {
    id: 16,
    question: "Quantos zeros há entre 1 e 1.000 (inclusive)?",
    options: ["111", "192", "200", "300"],
    correctAnswer: "192"
  }
];

export default function IQTest() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const leadId = searchParams.get("leadId");

  useEffect(() => {
    if (!leadId) {
      toast({
        title: "Erro",
        description: "ID do lead não encontrado",
        variant: "destructive",
      });
      navigate("/");
    } else {
      console.log("IQTest: leadId from URL:", leadId);
    }
  }, [leadId, navigate]);

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleNext = () => {
    if (!selectedAnswer) {
      toast({
        title: "Selecione uma resposta",
        description: "Por favor, escolha uma opção antes de continuar",
        variant: "destructive",
      });
      return;
    }

    const newAnswers = { ...answers, [currentQuestion]: selectedAnswer };
    setAnswers(newAnswers);
    setSelectedAnswer("");

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      console.log("IQTest: Test completed. Calculating and submitting results.");
      calculateAndSubmitResults(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || "");
    }
  };

  const calculateAndSubmitResults = async (finalAnswers: Record<number, string>) => {
    setLoading(true);
    
    let correctCount = 0;
    questions.forEach((q, index) => {
      if (finalAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    console.log("IQTest: Calculated score:", correctCount);

    try {
      // Persist locally as fallback for the Results page
      localStorage.setItem('lastTestResults', JSON.stringify({
        score: correctCount,
        total_questions: questions.length,
        lead_id: leadId,
        created_at: Date.now(),
      }));
      console.log("IQTest: Results saved to localStorage.");

      if (leadId) {
        console.log("IQTest: Attempting to save results to Supabase for leadId:", leadId);
        const { error } = await supabase
          .from("iq_test_results")
          .insert([
            {
              lead_id: leadId,
              answers: finalAnswers,
              score: correctCount,
              total_questions: questions.length,
            }
          ]);

        if (error) {
          console.error("IQTest: Error saving test results to Supabase:", error);
          throw error;
        }
        console.log("IQTest: Results successfully saved to Supabase.");
      } else {
        console.warn("IQTest: No leadId available, skipping Supabase insert.");
      }

      setIsCompleted(true);
    } catch (error) {
      console.error("IQTest: Error saving test results:", error);
      toast({
        title: "Erro ao salvar resultados",
        description: "Seus resultados foram calculados, mas houve um erro ao salvá-los.",
        variant: "destructive",
      });
      setIsCompleted(true); // Still mark as completed to allow user to proceed
    } finally {
      setLoading(false);
    }
  };

  const calculateIQ = (score: number) => {
    // Fórmula simples: IQ base 100, cada acerto adiciona ~6.25 pontos
    const percentCorrect = (score / questions.length) * 100;
    return Math.round(70 + (percentCorrect * 0.6));
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl">Parabéns!</CardTitle>
            <CardDescription className="text-lg">
              Teste concluído com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-lg">
                Seu resultado está pronto! Para acessá-lo, clique no botão abaixo.
              </p>
            </div>

            <Button 
              onClick={() => {
                // Salvar leadId no localStorage para recuperar após pagamento
                localStorage.setItem('pendingLeadId', leadId!);
                console.log("IQTest: Redirecting to Hotmart with leadId:", leadId);
                // Redirecionar para Hotmart com leadId como parâmetro
                window.location.href = `https://pay.hotmart.com/Q102383778L?leadId=${leadId}`;
              }}
              className="w-full"
              size="lg"
            >
              Ver Meu Resultado
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <CardTitle>Teste de QI Científico</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">
              Questão {currentQuestion + 1} de {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {questions[currentQuestion].question}
            </h3>
            
            <RadioGroup 
              value={selectedAnswer} 
              onValueChange={handleAnswerSelect}
              className="space-y-3"
            >
              {questions[currentQuestion].options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer text-base"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex gap-3 pt-4">
            {currentQuestion > 0 && (
              <Button
                onClick={handlePrevious}
                variant="outline"
                className="flex-1"
              >
                Anterior
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Salvando..." : currentQuestion === questions.length - 1 ? "Finalizar Teste" : "Próxima"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}