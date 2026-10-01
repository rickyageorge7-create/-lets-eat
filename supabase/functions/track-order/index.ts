const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const projectUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const publicKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!projectUrl || !serviceKey || !publicKey) {
    console.error("Supabase function secrets are missing.");
    return json({ error: "Order tracking is temporarily unavailable." }, 503);
  }
  if (request.headers.get("apikey") !== publicKey) return json({ error: "Unauthorized." }, 401);

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "A valid tracking request is required." }, 400);
  }
  const orderNumber = typeof payload.orderNumber === "string" ? payload.orderNumber.trim().toUpperCase() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.replace(/\D/g, "") : "";
  if (!/^LE-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/.test(orderNumber) || !/^[0-9]{8,15}$/.test(phone)) {
    return json({ status: null });
  }

  try {
    const query = new URLSearchParams({
      select: "order_number,status",
      order_number: `eq.${orderNumber}`,
      phone: `eq.${phone}`,
      limit: "1",
    });
    const response = await fetch(`${projectUrl.replace(/\/+$/, "")}/rest/v1/orders?${query}`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    if (!response.ok) {
      console.error("Order tracking query failed:", response.status, await response.text());
      return json({ error: "Order tracking is temporarily unavailable." }, 503);
    }
    const rows = await response.json();
    if (!Array.isArray(rows) || rows.length === 0) return json({ status: null });
    return json({ orderNumber: rows[0].order_number, status: rows[0].status });
  } catch (error) {
    console.error("Order tracking request failed:", error);
    return json({ error: "Order tracking is temporarily unavailable." }, 503);
  }
});
