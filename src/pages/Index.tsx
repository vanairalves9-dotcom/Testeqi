import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Award, Shield, Clock, CheckCircle2, Star, Zap, Settings } from "lucide-react";
import heroBrain from "@/assets/hero-brain.jpg";
import { LeadCaptureDialog } from "@/components/LeadCaptureDialog";

const Index = () => {
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const navigate = useNavigate();
  
  return (
    <main className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={heroBrain} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <Badge className="bg-primary/20 text-primary-glow border-primary-glow mx-auto">
              🧠 Método Científico Validado
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Descubra Seu{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Verdadeiro QI
              </span>
              {" "}em Apenas 5 Minutos
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              O único teste de QI online baseado em metodologia científica reconhecida mundialmente. 
              Mais de 2 milhões de pessoas já descobriram seu potencial cognitivo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                variant="hero" 
                size="xl" 
                className="animate-glow-pulse"
                onClick={() => setShowLeadDialog(true)}
              >
                Iniciar Teste Agora
              </Button>
              <Button variant="outline" size="xl">
                Ver Exemplo de Resultado
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-glow" />
                <span>100% Científico</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-glow" />
                <span>Resultado Imediato</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-glow" />
                <span>Certificado Digital</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { value: "2M+", label: "Testes Realizados" },
              { value: "98%", label: "Satisfação" },
              { value: "15min", label: "Duração Média" },
              { value: "4.9/5", label: "Avaliação" }
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary-glow">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">
                Você Realmente Conhece Seu{" "}
                <span className="text-primary-glow">Potencial Intelectual?</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                A maioria das pessoas vive sem saber suas verdadeiras capacidades cognitivas...
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: Brain,
                  title: "Testes Imprecisos",
                  description: "A maioria dos testes online não possui validação científica e gera resultados imprecisos ou inflados."
                },
                {
                  icon: TrendingUp,
                  title: "Potencial Desperdiçado",
                  description: "Sem conhecer seu QI real, você pode estar subutilizando suas capacidades ou se frustrando com metas irrealistas."
                },
                {
                  icon: Award,
                  title: "Falta de Direcionamento",
                  description: "Não saber seu perfil cognitivo impede escolhas de carreira e aprendizado mais assertivas."
                },
                {
                  icon: Clock,
                  title: "Autoconhecimento Limitado",
                  description: "Milhões de pessoas nunca tiveram acesso a uma avaliação científica de inteligência acessível."
                }
              ].map((item, i) => (
                <Card key={i} className="p-6 bg-card/50 backdrop-blur border-border hover:border-primary-glow/50 transition-all duration-300">
                  <item.icon className="w-12 h-12 text-primary-glow mb-4" />
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 md:py-32 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <Badge className="bg-accent text-accent-foreground">A SOLUÇÃO</Badge>
              <h2 className="text-3xl md:text-5xl font-bold">
                O Primeiro Teste de QI Online com{" "}
                <span className="text-accent">Validação Científica Real</span>
              </h2>
              <p className="text-xl text-primary-foreground/80">
                Desenvolvido em parceria com neurocientistas e psicólogos, nosso teste utiliza 
                metodologia baseada nas Matrizes Progressivas de Raven e nos testes de Wechsler.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-8">
              {[
                {
                  icon: Shield,
                  title: "100% Científico",
                  description: "Baseado em décadas de pesquisa em psicometria"
                },
                {
                  icon: Zap,
                  title: "Resultado Instantâneo",
                  description: "Receba seu QI e análise completa em segundos"
                },
                {
                  icon: Award,
                  title: "Certificado Digital",
                  description: "Documento oficial com seu resultado validado"
                }
              ].map((feature, i) => (
                <Card key={i} className="p-6 bg-background/10 backdrop-blur border-primary-foreground/20">
                  <feature.icon className="w-10 h-10 text-accent mb-4 mx-auto" />
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-primary-foreground/70">{feature.description}</p>
                </Card>
              ))}
            </div>

            <Button variant="accent" size="xl" className="animate-glow-pulse" onClick={() => setShowLeadDialog(true)}>
              Fazer Teste Grátis
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">
                O Que Você Vai <span className="text-primary-glow">Descobrir</span>
              </h2>
            </div>

            <div className="space-y-4">
              {[
                "Seu QI exato em escala padronizada (0-200)",
                "Análise detalhada de suas habilidades cognitivas",
                "Comparação com a população geral e grupos específicos",
                "Pontos fortes e áreas de desenvolvimento",
                "Recomendações personalizadas de carreira",
                "Estratégias para maximizar seu potencial",
                "Certificado digital oficial com validade internacional",
                "Acesso vitalício ao seu resultado e atualizações"
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-card/30 backdrop-blur">
                  <CheckCircle2 className="w-6 h-6 text-primary-glow flex-shrink-0 mt-1" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-32 bg-card/30 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">
                O Que Dizem Quem Já <span className="text-primary-glow">Descobriu</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Ana Carolina",
                  role: "Engenheira",
                  comment: "Descobri que meu QI é 132! Isso me deu confiança para buscar uma promoção que achava impossível. Hoje sou gerente.",
                  rating: 5
                },
                {
                  name: "Pedro Silva",
                  role: "Estudante",
                  comment: "O relatório me ajudou a entender porque tenho facilidade com matemática mas dificuldade com idiomas. Mudou minha forma de estudar!",
                  rating: 5
                },
                {
                  name: "Mariana Costa",
                  role: "Psicóloga",
                  comment: "Como profissional da área, posso afirmar: este é o teste online mais sério que já vi. A metodologia é realmente científica.",
                  rating: 5
                }
              ].map((testimonial, i) => (
                <Card key={i} className="p-6 bg-card border-border">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">{testimonial.comment}</p>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">
                Perguntas <span className="text-primary-glow">Frequentes</span>
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "O teste é realmente científico?",
                  a: "Sim! Nosso teste foi desenvolvido com base nas metodologias de Raven e Wechsler, reconhecidas mundialmente pela comunidade científica de psicometria."
                },
                {
                  q: "Quanto tempo leva?",
                  a: "O teste completo leva em média 15 minutos. Você pode pausar e continuar depois, mas recomendamos fazer de uma vez para maior precisão."
                },
                {
                  q: "O resultado é confiável?",
                  a: "Sim! Nosso teste possui margem de erro de apenas ±3 pontos, similar aos testes presenciais profissionais que custam R$ 800+"
                },
                {
                  q: "Posso fazer mais de uma vez?",
                  a: "Seu pagamento garante acesso vitalício. Você pode refazer após 6 meses para acompanhar sua evolução."
                },
                {
                  q: "O certificado tem validade?",
                  a: "Sim! O certificado digital é válido e pode ser usado em processos seletivos, currículos e perfis profissionais."
                }
              ].map((faq, i) => (
                <Card key={i} className="p-6 bg-card/50 backdrop-blur border-border">
                  <h3 className="text-lg font-bold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">
              Não Deixe Para Depois o Que Pode Transformar Seu Futuro Hoje
            </h2>
            <p className="text-xl text-primary-foreground/80">
              Mais de 2.000 pessoas descobriram seu QI real esta semana. 
              Agora é sua vez de desbloquear seu verdadeiro potencial.
            </p>
            <Button variant="accent" size="xl" className="animate-glow-pulse" onClick={() => setShowLeadDialog(true)}>
              Iniciar Meu Teste Agora
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card/30 backdrop-blur border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">
              QI Test Pro
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 QI Test Pro. Todos os direitos reservados.
            </p>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary-glow transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-primary-glow transition-colors">Privacidade</a>
              <a href="#" className="hover:text-primary-glow transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Admin Access Button */}
      <button
        onClick={() => navigate("/auth")}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-muted/80 hover:bg-muted backdrop-blur-sm border border-border shadow-lg transition-all duration-300 hover:scale-110 group z-50"
        aria-label="Acessar área administrativa"
      >
        <Settings className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:rotate-90 transition-all duration-300" />
      </button>

      <LeadCaptureDialog open={showLeadDialog} onOpenChange={setShowLeadDialog} />
    </main>
  );
};

export default Index;
