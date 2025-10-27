import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ThankYou() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<string>("Verificando pagamento...");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const MAX_ATTEMPTS = 12; // 12 tentativas = 1 minuto (5s cada)
    let interval: NodeJS.Timeout;

    const checkPaymentStatus = async () => {
      try {
        console.log(`ThankYou: Tentativa ${attempts + 1}/${MAX_ATTEMPTS} de verificar pagamento`);
        
        // 1. Tentar pegar leadId válido da URL, localStorage ou via transaction
        const isValidUUID = (v?: string | null) => !!v && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(v);

        const rawLeadFromUrl = searchParams.get('leadId') || searchParams.get('sck');
        const looksLikePlaceholder = rawLeadFromUrl === '{sck}' || rawLeadFromUrl === '{leadId}' || rawLeadFromUrl === '{transaction}';

        const leadIdFromStorage = localStorage.getItem('pendingLeadId') || localStorage.getItem('currentLeadId');
        const transactionFromUrl = searchParams.get('transaction');

        let leadId: string | null = null;

        if (isValidUUID(rawLeadFromUrl) && !looksLikePlaceholder) {
          leadId = rawLeadFromUrl!;
          console.log("ThankYou: Resolved leadId from URL:", leadId);
        } else if (isValidUUID(leadIdFromStorage)) {
          leadId = leadIdFromStorage!;
          console.log("ThankYou: Resolved leadId from localStorage:", leadId);
        } else if (transactionFromUrl) {
          setStatus("Buscando seus dados...");
          console.log("ThankYou: Attempting to resolve leadId via payment_id (transaction):", transactionFromUrl);
          const { data } = await supabase
            .from('leads')
            .select('id, payment_confirmed')
            .eq('payment_id', transactionFromUrl)
            .maybeSingle();
          if (data) {
            leadId = data.id;
            localStorage.setItem('currentLeadId', leadId);
            console.log("ThankYou: Resolved leadId from leads table via payment_id:", leadId);
          } else {
            console.log("ThankYou: No lead found for transaction:", transactionFromUrl);
          }
        }
        
        console.log('ThankYou: Final resolved leadId:', leadId);
        
        if (leadId) {
          // 3. Verificar se o pagamento foi confirmado
          setStatus("Confirmando pagamento...");
          const { data: lead } = await supabase
            .from('leads')
            .select('payment_confirmed')
            .eq('id', leadId)
            .maybeSingle();
          
          console.log('ThankYou: Status do pagamento para leadId', leadId, ':', lead);
          
          if (lead && lead.payment_confirmed) {
            console.log('ThankYou: Pagamento confirmado! Redirecionando...');
            setStatus("Pagamento confirmado! Redirecionando...");
            localStorage.removeItem('pendingLeadId');
            clearInterval(interval);
            setTimeout(() => {
              navigate(`/resultado?leadId=${leadId}`, { replace: true });
            }, 1000);
            return;
          }
        }
        
        // 4. Se chegou no máximo de tentativas, redireciona mesmo assim
        if (attempts >= MAX_ATTEMPTS - 1) {
          console.log('ThankYou: Máximo de tentativas atingido');
          if (leadId) {
            console.log('ThankYou: Redirecionando com leadId:', leadId);
            setStatus("Redirecionando para seus resultados...");
            navigate(`/resultado?leadId=${leadId}`, { replace: true });
          } else {
            console.log('ThankYou: Nenhum leadId encontrado, redirecionando para home');
            setStatus("Redirecionando...");
            navigate("/", { replace: true });
          }
          clearInterval(interval);
          return;
        }
        
        setAttempts(prev => prev + 1);
      } catch (error) {
        console.error('ThankYou: Error checking payment:', error);
        setAttempts(prev => prev + 1);
      }
    };

    // Primeira verificação imediata
    checkPaymentStatus();
    
    // Depois verifica a cada 5 segundos
    interval = setInterval(checkPaymentStatus, 5000);

    return () => clearInterval(interval);
  }, [navigate, searchParams, attempts]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            {attempts < 12 ? (
              <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
            ) : (
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            )}
          </div>
          <h1 className="text-2xl font-bold">Pagamento Confirmado!</h1>
          <p className="text-muted-foreground">{status}</p>
          {attempts < 12 && (
            <p className="text-sm text-muted-foreground">
              Tentativa {attempts + 1} de 12...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}