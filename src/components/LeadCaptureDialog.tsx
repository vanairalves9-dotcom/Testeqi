import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

const leadSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().min(1, "Telefone é obrigatório").max(20),
});

interface LeadCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadCaptureDialog({ open, onOpenChange }: LeadCaptureDialogProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true); // Inicia o carregamento aqui

    try {
      // Validate
      const validatedData = leadSchema.parse({ name, email, phone });
      console.log("LeadCaptureDialog: Dados validados para inserção:", validatedData); 
      
      // 1. Verificar se o lead com este email já existe
      const { data: existingLead, error: fetchError } = await supabase
        .from("leads")
        .select("id")
        .eq("email", validatedData.email)
        .maybeSingle();

      if (fetchError) {
        console.error("LeadCaptureDialog: Erro ao buscar lead existente:", fetchError);
        throw fetchError;
      }

      if (existingLead) {
        console.log("LeadCaptureDialog: Lead existente encontrado para o email:", validatedData.email, "ID:", existingLead.id);
        toast({
          title: "Email já cadastrado",
          description: "Parece que você já iniciou um teste com este email. Redirecionando para o seu teste.",
        });
        onOpenChange(false);
        navigate(`/teste?leadId=${existingLead.id}`);
        return; // Interrompe a execução, pois já lidamos com o lead existente
      }

      // Se não existe, prosseguir com a inserção de um novo lead
      const { data: insertedData, error: insertError } = await supabase
        .from("leads")
        .insert([{
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
        }])
        .select(); // Adiciona .select() para retornar os dados inseridos

      // Adicionando logs detalhados aqui
      console.log("Supabase insert response - data:", insertedData);
      console.log("Supabase insert response - error:", insertError);

      if (insertError) {
        console.error("LeadCaptureDialog: Erro ao inserir lead no Supabase:", insertError); 
        throw insertError;
      }
      
      // Verifica se algum dado foi realmente retornado
      if (!insertedData || insertedData.length === 0) {
        console.error("LeadCaptureDialog: Inserção falhou silenciosamente, nenhum dado retornado.");
        toast({
          title: "Erro ao salvar dados",
          description: "Não foi possível salvar seu lead. Por favor, tente novamente mais tarde.", 
          variant: "destructive",
        });
        return;
      }

      const leadId = insertedData[0].id; // Pega o ID gerado pelo banco de dados
      console.log("LeadCaptureDialog: Lead inserido com sucesso! ID:", leadId); 
      
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      onOpenChange(false);
      
      // Redirect to IQ test with lead ID
      navigate(`/teste?leadId=${leadId}`);
      
    } catch (error) {
      console.error("LeadCaptureDialog: Erro ao enviar dados:", error);
      console.trace("LeadCaptureDialog: Stack trace do erro:");

      let errorMessage = "Não foi possível salvar seu lead. Por favor, tente novamente mais tarde.";
      let errorTitle = "Erro ao enviar dados";

      if (error instanceof z.ZodError) {
        errorTitle = "Erro de validação";
        errorMessage = error.errors[0].message;
        console.error("LeadCaptureDialog: Erro de validação Zod:", error.errors);
      } else if (error && typeof error === 'object' && 'message' in error) {
        // Tenta obter uma mensagem mais específica do objeto de erro
        const err = error as Error;
        errorMessage = err.message;
        if (err.name === "TypeError" && (errorMessage.includes("NetworkError") || errorMessage.includes("Failed to fetch"))) {
          errorMessage = "Problema de conexão com o servidor. Verifique sua internet ou tente novamente.";
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false); // Garante que o estado de carregamento seja sempre resetado
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Iniciar Teste de QI</DialogTitle>
          <DialogDescription>
            Preencha seus dados para começar o teste científico
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              required
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              required
              maxLength={20}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Concluir e Iniciar Teste"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}