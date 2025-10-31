import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import IQTest from "./pages/IQTest";
import Results from "./pages/Results";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";
// import { supabase } from "@/integrations/supabase/client"; // Importar supabase
// import { Button } from "@/components/ui/button"; // Importar Button
// import { toast } from "@/hooks/use-toast"; // Importar toast

const queryClient = new QueryClient();

const App = () => {
  // Função de teste para inserção direta
  // const handleTestInsert = async () => {
  //   console.log("Attempting direct Supabase insert...");
  //   try {
  //     const { data, error } = await supabase
  //       .from("leads")
  //       .insert([{
  //         name: "Test User",
  //         email: "test@example.com",
  //         phone: "11999999999",
  //       }])
  //       .select();

  //     console.log("Direct Insert Response - Data:", data);
  //     console.log("Direct Insert Response - Error:", error);

  //     if (error) {
  //       toast({
  //         title: "Erro na Inserção Direta",
  //         description: error.message,
  //         variant: "destructive",
  //       });
  //     } else if (data && data.length > 0) {
  //       toast({
  //         title: "Sucesso na Inserção Direta",
  //         description: `Lead de teste inserido com ID: ${data[0].id}`,
  //       });
  //     } else {
  //       toast({
  //         title: "Sucesso (mas sem dados)",
  //         description: "Inserção direta reportou sucesso, mas sem dados retornados.",
  //       });
  //     }
  //   } catch (e: any) {
  //     console.error("Direct Insert Catch Error:", e);
  //     toast({
  //       title: "Erro Inesperado na Inserção Direta",
  //       description: e.message || "Verifique o console para mais detalhes.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Botão de teste temporário */}
          {/* <div className="fixed bottom-20 right-6 z-50">
            <Button onClick={handleTestInsert} className="bg-red-500 hover:bg-red-600 text-white">
              Testar Inserção Direta
            </Button>
          </div> */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/teste" element={<IQTest />} />
            <Route path="/resultado" element={<Results />} />
            <Route path="/obrigado" element={<ThankYou />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;