import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const notification = await req.json();
    console.log('Received Mercado Pago notification:', notification);

    // Mercado Pago envia notificações de diferentes tipos
    // Estamos interessados apenas em notificações de pagamento
    if (notification.type === 'payment') {
      const paymentId = notification.data.id;
      
      // Buscar detalhes do pagamento no Mercado Pago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${mercadoPagoToken}`,
          },
        }
      );

      if (!paymentResponse.ok) {
        console.error('Error fetching payment details:', await paymentResponse.text());
        return new Response(
          JSON.stringify({ error: 'Failed to fetch payment details' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const payment = await paymentResponse.json();
      console.log('Payment details:', payment);

      // Atualizar o lead com base no external_reference
      const externalReference = payment.external_reference;
      
      if (externalReference) {
        const { data: lead, error: fetchError } = await supabase
          .from('leads')
          .select('*')
          .eq('id', externalReference)
          .single();

        if (fetchError) {
          console.error('Error fetching lead:', fetchError);
          return new Response(
            JSON.stringify({ error: 'Lead not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Atualizar status do pagamento
        const { error: updateError } = await supabase
          .from('leads')
          .update({
            payment_status: payment.status,
            payment_id: paymentId.toString(),
            payment_confirmed: payment.status === 'approved',
          })
          .eq('id', externalReference);

        if (updateError) {
          console.error('Error updating lead:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update lead' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Lead ${externalReference} updated with payment status: ${payment.status}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
