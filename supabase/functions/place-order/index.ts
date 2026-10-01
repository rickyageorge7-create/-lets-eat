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

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const projectUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const publicKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!projectUrl || !serviceKey || !publicKey) {
    console.error("Supabase function secrets are missing.");
    return json({ error: "Ordering is temporarily unavailable." }, 503);
  }
  if (request.headers.get("apikey") !== publicKey) return json({ error: "Unauthorized." }, 401);

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "A valid order request is required." }, 400);
  }

  const name = clean(payload.name, 80);
  const phone = clean(payload.phone, 15).replace(/\D/g, "");
  const orderType = payload.orderType;
  const zone = orderType === "Delivery" ? clean(payload.zone, 100) : null;
  const address = orderType === "Delivery" ? clean(payload.address, 180) : null;
  const paymentMethod = payload.paymentMethod;
  const notes = clean(payload.notes, 250);
  const promoCode = clean(payload.promoCode, 40).toUpperCase();
  const items = Array.isArray(payload.items) ? payload.items : [];

  if (name.length < 1 || phone.length < 8 || phone.length > 15) {
    return json({ error: "Enter your name and a valid phone number." }, 400);
  }
  if (orderType !== "Delivery" && orderType !== "Pickup") {
    return json({ error: "Choose delivery or pickup." }, 400);
  }
  if (orderType === "Delivery" && (!zone || !address)) {
    return json({ error: "Choose a delivery area and enter your address." }, 400);
  }
  if (!["Cash on Delivery", "Orange Money", "MTN MoMo"].includes(String(paymentMethod))) {
    return json({ error: "Choose a supported payment method." }, 400);
  }
  if (items.length < 1 || items.length > 30) return json({ error: "Your cart is empty or too large." }, 400);
  if (!items.every((item) =>
    item && typeof item.id === "string" && item.id.length <= 100
    && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 50
  )) {
    return json({ error: "One or more cart items are invalid." }, 400);
  }
  if (promoCode && promoCode !== "LETSEAT10") return json({ error: "That promo code is invalid." }, 400);

  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomBytes = crypto.getRandomValues(new Uint8Array(10));
  const orderNumber = `LE-${Array.from(randomBytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
  const rpcArguments = {
    p_order_number: orderNumber,
    p_name: name,
    p_phone: phone,
    p_order_type: orderType,
    p_zone: zone,
    p_address: address,
    p_payment_method: paymentMethod,
    p_notes: notes,
    p_promo_code: promoCode,
    p_items: items,
  };

  try {
    const response = await fetch(`${projectUrl.replace(/\/+$/, "")}/rest/v1/rpc/place_order`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rpcArguments),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("Order RPC failed:", response.status, detail);
      return json({ error: "We couldn’t place that order. Check your details and try again." }, 400);
    }
    return json(await response.json());
  } catch (error) {
    console.error("Order request failed:", error);
    return json({ error: "Ordering is temporarily unavailable. Please try again." }, 503);
  }
});
