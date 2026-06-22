import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

const NETGSM_USERCODE = Deno.env.get("NETGSM_USERCODE");
const NETGSM_PASSWORD = Deno.env.get("NETGSM_PASSWORD");
const NETGSM_MSGHEADER = Deno.env.get("NETGSM_MSGHEADER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, message, provider } = await req.json();

    if (!to || !message) {
      throw new Error("Recipient ('to') and 'message' are required");
    }

    // Determine provider based on configuration or explicit request
    const selectedProvider = provider || (NETGSM_USERCODE ? "netgsm" : "twilio");

    if (selectedProvider === "netgsm") {
      if (!NETGSM_USERCODE || !NETGSM_PASSWORD || !NETGSM_MSGHEADER) {
        throw new Error("Netgsm credentials are not configured");
      }

      // Netgsm HTTP GET API
      const params = new URLSearchParams({
        usercode: NETGSM_USERCODE,
        password: NETGSM_PASSWORD,
        gsmno: to.replace(/\s+/g, "").replace("+", ""), // numeric, e.g., 905321112233
        message: message,
        msgheader: NETGSM_MSGHEADER,
        dil: "TR",
      });

      const res = await fetch(`https://api.netgsm.com.tr/sms/send/get/?${params.toString()}`);
      const text = await res.text();

      if (!res.ok || text.startsWith("00") || text.includes("hata")) {
        throw new Error(`Netgsm SMS failure: ${text}`);
      }

      return new Response(JSON.stringify({ success: true, ref: text }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // Default to Twilio
      if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
        throw new Error("Twilio credentials are not configured");
      }

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

      const formData = new URLSearchParams();
      formData.append("To", to);
      formData.append("From", TWILIO_PHONE_NUMBER);
      formData.append("Body", message);

      const basicAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

      const res = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
        },
        body: formData.toString(),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(JSON.stringify(data));
      }

      return new Response(JSON.stringify({ success: true, sid: data.sid }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
