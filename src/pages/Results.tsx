import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Brain, CheckCircle2 } from "lucide-react";

export default function Results() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(16);
  const leadIdFromUrl = searchParams.get("leadId");

  useEffect(() => {
    const resolveAndLoad = async () => {
      const isValidUUID = (v?: string | null) => !!v && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(v);

      let resolvedLeadId = leadIdFromUrl || undefined;
      const sck = searchParams.get('sck');
      const transaction = searchParams.get('transaction');

      const looksLikePlaceholder = resolvedLeadId === '{sck}' || resolvedLeadId === '{leadId}' || resolvedLeadId === '{transaction}';

      console.log("Results: Initial leadId from URL:", leadIdFromUrl);
      console.log("Results: sck from URL:", sck);
      console.log("Results: transaction from URL:", transaction);

      if (!isValidUUID(resolvedLeadId) || looksLikePlaceholder) {
        resolvedLeadId = undefined;

        if (isValidUUID(sck)) {
          resolvedLeadId = sck!;
          console.log("Results: Resolved leadId from sck:", resolvedLeadId);
        }

        if (!resolvedLeadId) {
          const stored = localStorage.getItem('currentLeadId') || localStorage.getItem('pendingLeadId');
          if (isValidUUID(stored)) {
            resolvedLeadId = stored!;
            console.log("Results: Resolved leadId from localStorage:", resolvedLeadId);
          }
        }

        if (!resolvedLeadId && transaction) {
          console.log("Results: Attempting to resolve leadId via payment_id (transaction):", transaction);
          const { data } = await supabase
            .from('leads')
            .select('id')
            .eq('payment_id', transaction)
            .maybeSingle();
          if (data) {
            resolvedLeadId = data.id;
            console.log("Results: Resolved leadId from leads table via payment_id:", resolvedLeadId);
          } else {
            console.log("Results: No lead found for transaction:", transaction);
          }
        }
      }

      if (resolvedLeadId && isValidUUID(resolvedLeadId)) {
        localStorage.setItem('currentLeadId', resolvedLeadId);
        if (resolvedLeadId !== leadIdFromUrl) {
          console.log("Results: Correcting URL with resolved leadId:", resolvedLeadId);
          navigate(`/resultado?leadId=${resolvedLeadId}`, { replace: true });
          return; // URL corrected, effect will run again
        }
        await loadResults(resolvedLeadId);
      } else {
        console.warn("Results: No valid leadId resolved. Attempting local storage fallback for display.");
        // Fallback imediato: tentar usar resultados locais sem depender de leadId
        const local = localStorage.getItem('lastTestResults');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            setScore(Number(parsed.score) || 0);
            setTotalQuestions(Number(parsed.total_questions) || 16); // Corrected here
            console.log('Results: Usando resultados do localStorage por leadId inválido/placeholder.');
            setLoading(false);
            return;
          } catch (e) {
            console.warn('Results: Falha ao ler fallback local (sem leadId):', e);
          }
        }
        toast({
          title: 'Erro',
          description: 'ID do lead não encontrado ou inválido.',
          variant: 'destructive',
        });
        navigate('/', { replace: true });
      }
    };

    resolveAndLoad();
  }, [leadIdFromUrl, navigate, searchParams]);

  const loadResults = async (id: string) => {
    try {
      console.log('Results: Buscando resultados para leadId:', id);
      
      const { data, error } = await supabase
        .from("iq_test_results")
        .select("score, total_questions")
        .eq("lead_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('Results: Dados retornados do Supabase:', data);

      if (error) {
        console.error('Results: Erro na query do Supabase:', error);
      }

      if (data && data.score !== undefined) {
        console.log('Results: Score encontrado no Supabase:', data.score);
        setScore(data.score);
        setTotalQuestions(data.total_questions);
      } else {
        console.log('Results: Nenhum resultado encontrado no backend. Tentando fallback local.');
        const local = localStorage.getItem('lastTestResults');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            setScore(Number(parsed.score) || 0);
            setTotalQuestions(Number(parsed.total_questions) || 16);
            console.log('Results: Resultados carregados do localStorage.');
            return;
          } catch (e) {
            console.warn('Results: Falha ao ler fallback local:', e);
          }
        }
        toast({
          title: "Nenhum resultado encontrado",
          description: "Não encontramos resultados de teste para este ID.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Results: Error loading results:", error);
      // Fallback mesmo em caso de erro
      const local = localStorage.getItem('lastTestResults');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setScore(Number(parsed.score) || 0);
          setTotalQuestions(Number(parsed.total_questions) || 16);
          console.log('Results: Resultados carregados do localStorage após erro.');
          return; // evita toast de erro se conseguimos exibir algo
        } catch {}
      }
      toast({
        title: "Erro ao carregar resultados",
        description: "Não foi possível carregar seus resultados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateIQ = (score: number) => {
    const percentCorrect = (score / totalQuestions) * 100;
    return Math.round(70 + (percentCorrect * 0.6));
  };

  const getCognitiveProfile = (percentage: number) => {
    return {
      logicalReasoning: percentage >= 70 ? 85 + (percentage - 70) : 60 + percentage * 0.35,
      patternRecognition: percentage >= 65 ? 80 + (percentage - 65) * 0.5 : 55 + percentage * 0.38,
      workingMemory: percentage >= 60 ? 75 + (percentage - 60) * 0.6 : 50 + percentage * 0.42,
      processingSpeed: percentage >= 75 ? 90 + (percentage - 75) * 0.4 : 65 + percentage * 0.33,
      verbalReasoning: percentage >= 55 ? 70 + (percentage - 55) * 0.65 : 45 + percentage * 0.45,
    };
  };

  const getDetailedInterpretation = (iq: number) => {
    if (iq >= 145) {
      return {
        title: "Genialidade Excepcional",
        description: "Você demonstra capacidades cognitivas extraordinárias, comparáveis aos maiores pensadores da história.",
        characteristics: [
          "Capacidade de resolver problemas extremamente complexos",
          "Pensamento abstrato altamente desenvolvido",
          "Habilidade excepcional de ver conexões não óbvias",
          "Potencial para contribuições científicas ou intelectuais significativas"
        ],
        careers: ["Pesquisa científica avançada", "Matemática teórica", "Física quântica", "Filosofia acadêmica", "Engenharia aeroespacial"]
      };
    } else if (iq >= 130) {
      return {
        title: "Superdotação Intelectual",
        description: "Você possui habilidades cognitivas significativamente acima da média, colocando-o entre os mais inteligentes.",
        characteristics: [
          "Excelente capacidade de aprendizado rápido",
          "Forte raciocínio analítico e abstrato",
          "Habilidade natural para resolver problemas complexos",
          "Facilidade com conceitos técnicos e teóricos avançados"
        ],
        careers: ["Medicina especializada", "Engenharia de software", "Arquitetura", "Direito", "Ciência de dados", "Consultoria estratégica"]
      };
    } else if (iq >= 120) {
      return {
        title: "Inteligência Superior",
        description: "Você demonstra capacidades cognitivas claramente acima da média, com excelente potencial acadêmico e profissional.",
        characteristics: [
          "Boa capacidade de análise crítica",
          "Facilidade para aprender novos conceitos",
          "Pensamento lógico bem desenvolvido",
          "Habilidade para trabalhos que exigem raciocínio complexo"
        ],
        careers: ["Gestão empresarial", "Contabilidade", "Programação", "Ensino superior", "Análise financeira", "Marketing estratégico"]
      };
    } else if (iq >= 110) {
      return {
        title: "Inteligência Acima da Média",
        description: "Suas habilidades cognitivas estão acima da maioria da população, com bom potencial para desenvolvimento.",
        characteristics: [
          "Capacidade sólida de raciocínio",
          "Bom desempenho em tarefas analíticas",
          "Habilidade para aprender com prática",
          "Potencial para posições de liderança"
        ],
        careers: ["Administração", "Vendas técnicas", "Recursos humanos", "Design", "Gestão de projetos", "Empreendedorismo"]
      };
    } else if (iq >= 90) {
      return {
        title: "Inteligência Média",
        description: "Você está na faixa de inteligência da maioria da população, com equilíbrio entre diferentes habilidades.",
        characteristics: [
          "Capacidade funcional de raciocínio",
          "Habilidade para aprender com dedicação",
          "Bom desempenho em tarefas práticas",
          "Potencial para crescimento com treinamento"
        ],
        careers: ["Atendimento ao cliente", "Operações", "Suporte técnico", "Vendas", "Logística", "Assistência administrativa"]
      };
    } else {
      return {
        title: "Potencial em Desenvolvimento",
        description: "Suas habilidades cognitivas têm grande espaço para crescimento através de prática e treinamento focado.",
        characteristics: [
          "Capacidade de aprendizado prático",
          "Habilidade para tarefas estruturadas",
          "Potencial de melhoria com treino cognitivo",
          "Força em habilidades práticas e manuais"
        ],
        careers: ["Trabalhos manuais especializados", "Artesanato", "Serviços operacionais", "Agricultura", "Manutenção"]
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-8">
            <p className="text-center">Carregando seus resultados...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const iqScore = calculateIQ(score);

  const getPerformanceLevel = (iq: number) => {
    if (iq >= 130) return { level: "Excepcional", color: "text-purple-500", description: "Inteligência muito superior à média" };
    if (iq >= 120) return { level: "Superior", color: "text-blue-500", description: "Acima da média populacional" };
    if (iq >= 110) return { level: "Médio Superior", color: "text-green-500", description: "Inteligência acima da média" };
    if (iq >= 90) return { level: "Médio", color: "text-yellow-500", description: "Inteligência na média" };
    return { level: "Médio Inferior", color: "text-orange-500", description: "Há espaço para crescimento" };
  };

  const getStrengths = (iq: number, percentage: number) => {
    const strengths = [];
    if (percentage >= 75) {
      strengths.push("🎯 Excelente raciocínio lógico-matemático");
      strengths.push("🧩 Alta capacidade de resolução de problemas complexos");
      strengths.push("⚡ Processamento rápido de informações");
    } else if (percentage >= 60) {
      strengths.push("✅ Bom raciocínio analítico");
      strengths.push("🔍 Capacidade de identificar padrões");
      strengths.push("📊 Pensamento estruturado");
    } else if (percentage >= 50) {
      strengths.push("💡 Raciocínio lógico funcional");
      strengths.push("🎲 Capacidade básica de análise");
      strengths.push("🔄 Processamento adequado de informações");
    } else {
      strengths.push("🌱 Potencial para desenvolvimento");
      strengths.push("💪 Capacidade de aprendizado");
      strengths.push("🎯 Determinação em completar desafios");
    }
    return strengths;
  };

  const getImprovementAreas = (percentage: number) => {
    const areas = [];
    if (percentage < 75) {
      areas.push({
        area: "Raciocínio Sequencial",
        tip: "Pratique sequências numéricas e padrões lógicos diariamente. Apps como Lumosity podem ajudar."
      });
    }
    if (percentage < 65) {
      areas.push({
        area: "Velocidade de Processamento",
        tip: "Exercícios de atenção focada e jogos de raciocínio rápido fortalecem essa habilidade."
      });
    }
    if (percentage < 80) {
      areas.push({
        area: "Memória de Trabalho",
        tip: "Pratique exercícios de memorização curta e jogos de memória para melhorar essa capacidade."
      });
    }
    return areas;
  };

  const getPopulationComparison = (iq: number) => {
    if (iq >= 145) {
      return "Seu QI é de genialidade excepcional! Você se destaca entre os 0.1% mais brilhantes da população, com um potencial intelectual raríssimo. Suas capacidades cognitivas são extraordinárias, permitindo-lhe resolver problemas de altíssima complexidade e ver conexões que a maioria não percebe. Você tem um potencial imenso para inovações e contribuições significativas em qualquer campo que escolher.";
    } else if (iq >= 130) {
      return "Você possui superdotação intelectual, colocando-o entre os 2% mais inteligentes do mundo. Suas capacidades são notáveis! Você demonstra uma habilidade excepcional para aprender rapidamente, raciocinar de forma analítica e abstrata, e resolver problemas complexos com facilidade. Este é um indicativo de um grande potencial para liderança e sucesso em áreas que exigem pensamento crítico e inovação.";
    } else if (iq >= 120) {
      return "Sua inteligência é superior à média! Você faz parte dos 9% da população com as maiores capacidades cognitivas. Isso significa que você tem uma excelente capacidade de análise crítica, facilidade para aprender novos conceitos e um pensamento lógico bem desenvolvido. Você está bem posicionado para se destacar em ambientes acadêmicos e profissionais que demandam raciocínio complexo.";
    } else if (iq >= 110) {
      return "Você demonstra inteligência acima da média, superando 75% da população. Um excelente potencial para o sucesso! Suas habilidades cognitivas permitem um bom desempenho em tarefas analíticas e uma capacidade sólida de raciocínio. Com dedicação, você pode alcançar posições de destaque e continuar a desenvolver suas capacidades para atingir seus objetivos.";
    } else if (iq >= 90) {
      return "Seu QI está na faixa da média populacional. Com dedicação e estratégias de aprendizado, você pode expandir ainda mais suas habilidades cognitivas. Você possui uma capacidade funcional de raciocínio e bom desempenho em tarefas práticas. O autoconhecimento de suas capacidades é o primeiro passo para um crescimento contínuo e para maximizar seu potencial.";
    } else if (iq >= 70) {
      return "Seu QI indica um potencial em desenvolvimento. Com exercícios cognitivos e foco, você pode fortalecer suas capacidades e alcançar novos patamares. Você tem a capacidade de aprendizado prático e pode se beneficiar muito de treinamentos focados em raciocínio lógico e memória. Pequenas práticas diárias podem gerar grandes avanços em suas habilidades cognitivas.";
    } else {
      return "Seu QI sugere que há um grande espaço para o desenvolvimento cognitivo. A prática regular de desafios mentais pode trazer melhorias significativas. Concentre-se em atividades que estimulem o raciocínio, como quebra-cabeças e leitura, para fortalecer suas habilidades. Lembre-se que a inteligência é maleável e pode ser aprimorada com esforço e as estratégias corretas.";
    }
  };

  const performance = getPerformanceLevel(iqScore);
  const percentage = Math.round((score/totalQuestions) * 100);
  const strengths = getStrengths(iqScore, percentage);
  const improvementAreas = getImprovementAreas(percentage);
  const cognitiveProfile = getCognitiveProfile(percentage);
  const detailedInterpretation = getDetailedInterpretation(iqScore);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="w-full">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl">Análise Completa de QI</CardTitle>
            <CardDescription className="text-lg">
              Relatório detalhado das suas capacidades cognitivas
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Score Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
                <p className="text-sm text-muted-foreground mb-2">Seu QI Estimado</p>
                <p className="text-7xl font-bold text-primary mb-2">{iqScore}</p>
                <p className={`text-xl font-semibold ${performance.color}`}>{performance.level}</p>
                <p className="text-sm text-muted-foreground mt-2">{performance.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-3xl font-bold">{score}/{totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Questões Corretas</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-3xl font-bold">{percentage}%</p>
                  <p className="text-sm text-muted-foreground">Taxa de Acerto</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Interpretation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{detailedInterpretation.title}</CardTitle>
            <CardDescription className="text-base pt-2">
              {detailedInterpretation.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3 text-lg">🧠 Características Principais</h4>
              <div className="space-y-2">
                {detailedInterpretation.characteristics.map((char, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{char}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-lg">💼 Carreiras Recomendadas</h4>
              <div className="flex flex-wrap gap-2">
                {detailedInterpretation.careers.map((career, i) => (
                  <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {career}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cognitive Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Perfil Cognitivo Detalhado
            </CardTitle>
            <CardDescription>
              Análise das suas habilidades específicas em diferentes áreas cognitivas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Raciocínio Lógico", score: Math.round(cognitiveProfile.logicalReasoning), description: "Capacidade de resolver problemas usando lógica estruturada" },
                { name: "Reconhecimento de Padrões", score: Math.round(cognitiveProfile.patternRecognition), description: "Habilidade de identificar sequências e relações" },
                { name: "Memória de Trabalho", score: Math.round(cognitiveProfile.workingMemory), description: "Capacidade de reter e processar informações temporariamente" },
                { name: "Velocidade de Processamento", score: Math.round(cognitiveProfile.processingSpeed), description: "Rapidez em processar e responder a informações" },
                { name: "Raciocínio Verbal", score: Math.round(cognitiveProfile.verbalReasoning), description: "Habilidade de compreender e usar conceitos expressos em palavras" }
              ].map((skill, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-semibold text-sm">{skill.name}</h5>
                      <p className="text-xs text-muted-foreground">{skill.description}</p>
                    </div>
                    <span className="text-lg font-bold text-primary">{skill.score}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary-glow h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${skill.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Comparação com a População
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {getPopulationComparison(iqScore)}
            </p>
            
            <div className="p-4 bg-secondary/30 rounded-lg space-y-3">
              <h4 className="font-semibold text-sm">📊 Distribuição de QI na População:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>QI 145+: Genialidade</span>
                  <span className="font-medium">0.1%</span>
                </div>
                <div className="flex justify-between">
                  <span>QI 130-144: Superdotação</span>
                  <span className="font-medium">2.1%</span>
                </div>
                <div className="flex justify-between">
                  <span>QI 120-129: Superior</span>
                  <span className="font-medium">6.7%</span>
                </div>
                <div className="flex justify-between">
                  <span>QI 110-119: Acima da média</span>
                  <span className="font-medium">16.1%</span>
                </div>
                <div className="flex justify-between">
                  <span>QI 90-109: Média</span>
                  <span className="font-medium">50%</span>
                </div>
                <div className="flex justify-between">
                  <span>QI 80-89: Abaixo da média</span>
                  <span className="font-medium">16.1%</span>
                </div>
                <div className="flex justify-between">
                  <span>QI 70-79: Limítrofe</span>
                  <span className="font-medium">6.7%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strengths Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">✨ Seus Pontos Fortes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strengths.map((strength, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <span className="text-base text-black font-semibold">{strength}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Improvement Areas Card */}
        {improvementAreas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400">🎯 Áreas para Desenvolvimento</CardTitle>
              <CardDescription>
                Oportunidades de crescimento identificadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {improvementAreas.map((item, i) => (
                  <div key={i} className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-2">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">{item.area}</h4>
                    <p className="text-sm text-muted-foreground">{item.tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-600 dark:text-purple-400">💡 Recomendações Personalizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold mb-2">📚 Para Desenvolvimento Cognitivo</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Dedique 15-30 minutos diários para jogos de lógica e quebra-cabeças</li>
                  <li>Aprenda algo novo: um idioma, instrumento musical ou habilidade técnica</li>
                  <li>Pratique mindfulness e meditação para melhorar o foco</li>
                  <li>Leia regularmente livros desafiadores e artigos científicos</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold mb-2">🎓 Aplicações Práticas</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Use seu perfil cognitivo para escolher carreiras alinhadas</li>
                  <li>Desenvolva estratégias de aprendizado personalizadas</li>
                  <li>Identifique ambientes de trabalho que maximizam seu potencial</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold mb-2">⚠️ Importante Lembrar</h4>
                <p className="text-sm text-muted-foreground">
                  O QI é apenas uma medida de certas habilidades cognitivas. Inteligência emocional, 
                  criatividade, perseverança e habilidades sociais são igualmente importantes para o sucesso na vida.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button 
            onClick={() => navigate("/")} 
            className="flex-1"
            size="lg"
            variant="outline"
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
}