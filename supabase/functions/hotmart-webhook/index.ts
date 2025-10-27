// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import type { Database } from "../../src/integrations/supabase/types.ts"; // Import the Database type

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hotmart-hottok',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    // @ts-ignore
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    const payload = await req.json();
    console.log('Hotmart webhook received:', payload);

    // Hotmart envia eventos como: PURCHASE_COMPLETE, PURCHASE_APPROVED, etc.
    const event = payload.event;
    const data = payload.data;

    // Extrair informações do comprador
    const buyerEmail = data.buyer?.email;
    const transaction = data.purchase?.transaction;
    const status = data.purchase?.status;
    // O leadId vem em data.purchase.origin.sck conforme docs da Hotmart
    const leadId = data.purchase?.origin?.sck || data.purchase?.sck || data.purchase?.metadata?.leadId;

    console.log('Processing payment for leadId:', leadId, 'status:', status);

    if (!leadId) {
      console.error('No leadId found in webhook data');
      return new Response(
        JSON.stringify({ error: 'No leadId provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Mapear status da Hotmart para nosso sistema
    let paymentStatus = 'pending';
    let paymentConfirmed = false;

    if (event === 'PURCHASE_COMPLETE' || event === 'PURCHASE_APPROVED' || status === 'approved') {
      paymentStatus = 'approved';
      paymentConfirmed = true;
    } else if (status === 'refunded' || event === 'PURCHASE_REFUNDED') {
      paymentStatus = 'refunded';
      paymentConfirmed = false;
    } else if (status === 'cancelled' || event === 'PURCHASE_CANCELLED') {
      paymentStatus = 'cancelled';
      paymentConfirmed = false;
    }

    // Atualizar status do pagamento na tabela leads
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        payment_status: paymentStatus,
        payment_confirmed: paymentConfirmed,
        payment_id: transaction || data.purchase?.order_id,
      })
      .eq('id', leadId);

    if (updateError) {
      console.error('Error updating lead:', updateError);
      throw updateError;
    }

    console.log('Payment status updated successfully for leadId:', leadId);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});