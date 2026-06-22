import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@11.16.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, currency = "TRY", appointmentId, customerId } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    // If Stripe is configured, create a real Payment Intent
    if (stripeKey) {
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2022-11-15",
        httpClient: Stripe.createFetchHttpClient(),
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          appointmentId,
          customerId,
        },
      });

      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          id: paymentIntent.id,
          mode: "live",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Otherwise, simulate a payment intent for testing
    console.log("Stripe is not configured. Simulating mock payment intent.");
    return new Response(
      JSON.stringify({
        clientSecret: `mock_secret_${Math.random().toString(36).substr(2, 9)}`,
        id: `mock_pi_${Math.random().toString(36).substr(2, 9)}`,
        mode: "mock",
        message: "Demo Mode: Supabase environment variable STRIPE_SECRET_KEY is not defined. Using simulated payment intent.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
