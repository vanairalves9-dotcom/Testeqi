import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Brain, Clock, CheckCircle2 } from "lucide-react";

export default function Index() {
  const stats = [
    { value: "16", label: "Questões" },
    { value: "5min", label: "Tempo Médio" },
    { value: "100%", label: "Precisão" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl mx-auto space-y-8 text-center">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-primary-foreground leading-tight">
            Teste de QI <span className="text-primary-glow">Online</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra seu potencial cognitivo com nosso teste de QI rápido e preciso.
            Receba uma análise detalhada das suas habilidades.
          </p>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link to="/teste">Iniciar Teste Agora</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
            <Link to="/sobre">Saiba Mais</Link>
          </Button>
        </div>

        {/* Features/Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-xl">Análise Detalhada</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Receba um relatório completo sobre suas habilidades cognitivas.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-xl">Rápido e Eficiente</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Conclua o teste em poucos minutos e obtenha resultados imediatos.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-xl">Baseado em Ciência</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Desenvolvido com base em princípios de psicometria.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Key Stats */}
        <div className="flex justify-center gap-8 pt-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary-glow">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}