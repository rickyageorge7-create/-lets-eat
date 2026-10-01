(() => {
  "use strict";

  // The Supabase URL and publishable/anon key are public client configuration.
  // Never put a service-role key or admin password in this file.
  const CONFIG = {
    shopName: "Let's Eat oo",
    phoneDisplay: "0775399168",
    phoneDigits: "231775399168",
    customerCarePhoneDisplay: "0555112722",
    customerCarePhoneDigits: "231555112722",
    email: "rickyageorge7@gmail.com",
    address: "Monrovia, Liberia",
    hours: "Daily, 8:00 AM – 10:00 PM",
    lrdPerUsd: 190,
    supabaseUrl: "https://ltrjgjwwypgsglztdggt.supabase.co",
    supabaseAnonKey: "sb_publishable_vAblq0oGkW7YExlFwOM-aA_ug4P3M30",
    mobileMoney: {
      orange: "Add your Orange Money number and payment instructions in app.js.",
      mtn: "Add your MTN MoMo number and payment instructions in app.js.",
    },
    socials: {
      Instagram: "",
      Facebook: "",
      TikTok: "",
    },
  };

  const CATEGORIES = ["All", "Fast Food", "Local Dishes", "Drinks", "Snacks", "Combos & Deals"];
  let zones = [
    { name: "Brewerville", fee: 4, note: "Local delivery" },
    { name: "Monrovia Central", fee: 3, note: "Central Monrovia" },
    { name: "Nearby areas", fee: 5, note: "Greater Monrovia" },
  ];
  const supabaseConfigured = Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey);
  const supabaseClient = supabaseConfigured
    ? window.supabase?.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey)
    : null;
  const INITIAL_MENU = [
    { id: "classic-burger", name: "Classic Burger", category: "Fast Food", price: 7.5, description: "Juicy beef, crisp lettuce, tomato & house sauce.", photo: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=70", badge: "BEST SELLER", available: true },
    { id: "crispy-chicken", name: "Crispy Chicken", category: "Fast Food", price: 8, description: "Golden crunchy chicken with a little kick.", photo: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=700&q=70", badge: "CRUNCHY", available: true },
    { id: "pepperoni-pizza", name: "Pepperoni Pizza", category: "Fast Food", price: 12, description: "Cheesy, saucy, and topped with pepperoni.", photo: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=700&q=70", badge: "", available: true },
    { id: "jollof-rice", name: "Jollof Rice", category: "Local Dishes", price: 8.5, description: "Smoky, rich tomato rice with tasty spices.", photo: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=70", badge: "LOCAL FAVORITE", available: true },
    { id: "pepper-chicken", name: "Pepper Chicken", category: "Local Dishes", price: 10, description: "Tender chicken with a bold pepper sauce.", photo: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=700&q=70", badge: "SPICY", available: true },
    { id: "fried-plantain", name: "Fried Plantain", category: "Local Dishes", price: 4, description: "Sweet plantain, golden at the edges.", photo: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=70", badge: "", available: true },
    { id: "chilled-soda", name: "Chilled Soda", category: "Drinks", price: 2, description: "An ice-cold fizzy favorite.", photo: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=700&q=70", badge: "ICE COLD", available: true },
    { id: "fresh-lemonade", name: "Fresh Lemonade", category: "Drinks", price: 3, description: "Bright, fresh and made to cool you down.", photo: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=700&q=70", badge: "", available: true },
    { id: "crispy-fries", name: "Crispy Fries", category: "Snacks", price: 3.5, description: "Hot, golden fries with a pinch of salt.", photo: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=70", badge: "A CLASSIC", available: true },
    { id: "chicken-wings", name: "Chicken Wings", category: "Snacks", price: 6, description: "Saucy wings made for sharing (or not).", photo: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=700&q=70", badge: "", available: true },
    { id: "burger-combo", name: "Burger Combo", category: "Combos & Deals", price: 11, description: "Classic burger, crispy fries & a chilled soda.", photo: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=70", badge: "GREAT VALUE", available: true },
    { id: "jollof-combo", name: "Jollof Chicken Combo", category: "Combos & Deals", price: 13, description: "Jollof rice, pepper chicken & sweet plantain.", photo: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=70", badge: "HOUSE PICK", available: true },
  ];

  const STORAGE = { menu: "letseat-menu-v1", cart: "letseat-cart-v1", orders: "letseat-orders-v1", currency: "letseat-currency-v1" };
  const safeRead = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value === null ? fallback : value;
    } catch (error) {
      console.error(`Unable to read ${key} from local storage.`, error);
      return fallback;
    }
  };
  const save = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Unable to save ${key} to local storage.`, error);
      alert("Your browser could not save this change. Check available storage and try again.");
    }
  };
  const setBackendNotice = (message, isError = false) => {
    const notice = document.querySelector("#backend-notice");
    notice.textContent = message;
    notice.hidden = !message;
    notice.classList.toggle("backend-error", isError);
  };
  const backendError = (error, context) => {
    console.error(`${context}:`, error);
    return error?.message || "Please try again later.";
  };
  const isRemoteOrderMode = () => Boolean(supabaseClient);
  const phoneDigits = (value) => String(value ?? "").replace(/\D/g, "");
  const fromDbMenu = (row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    description: row.description,
    photo: row.photo,
    badge: row.badge || "",
    available: row.available,
  });
  const toDbMenu = (item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    description: item.description,
    photo: item.photo,
    badge: item.badge || "",
    available: item.available,
  });

  async function loadSharedMenu() {
    const { data, error } = await supabaseClient.from("menu_items")
      .select("id,name,category,price,description,photo,badge,available")
      .order("category").order("name");
    if (error) throw error;
    menu = data.map(fromDbMenu);
    renderMenu();
  }

  async function loadDeliveryZones() {
    const { data, error } = await supabaseClient.from("delivery_zones")
      .select("name,fee,note").eq("active", true).order("sort_order");
    if (error) throw error;
    if (data.length) {
      zones = data.map((zone) => ({ ...zone, fee: Number(zone.fee) }));
      renderAreas();
    }
  }

  async function loadCustomerReviews() {
    const { data, error } = await supabaseClient.rpc("list_approved_reviews");
    if (error) throw error;
    customerReviews = data || [];
    renderCustomerReviews();
  }

  async function requireAdmin() {
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session) return false;
    const { data: allowed, error } = await supabaseClient.rpc("is_admin");
    if (error) throw error;
    if (!allowed) {
      await supabaseClient.auth.signOut();
      throw new Error(`This Supabase account is not authorized as a ${CONFIG.shopName} administrator.`);
    }
    adminUser = sessionData.session.user;
    return true;
  }
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const formatUsd = (value) => `$${Number(value).toFixed(2)}`;
  let menu = safeRead(STORAGE.menu, null);
  if (!Array.isArray(menu)) {
    menu = INITIAL_MENU;
    save(STORAGE.menu, menu);
  }
  let cart = safeRead(STORAGE.cart, {});
  let orders = safeRead(STORAGE.orders, []);
  let customerReviews = [];
  let adminReviews = [];
  let currency = safeRead(STORAGE.currency, "USD") === "LRD" ? "LRD" : "USD";
  let category = "All";
  let promoApplied = false;
  let checkoutType = "Delivery";
  let checkoutDraft = {};
  let adminTab = "menu";
  let adminEditId = "";
  let adminUser = null;

  function moneyFor(value, unit) {
    return unit === "LRD"
      ? `L$${Math.round(Number(value) * CONFIG.lrdPerUsd).toLocaleString("en-US")}`
      : formatUsd(value);
  }

  function money(value) {
    return moneyFor(value, currency);
  }

  function getCartLines() {
    return Object.entries(cart)
      .map(([id, quantity]) => ({ item: menu.find((entry) => entry.id === id), quantity: Number(quantity) }))
      .filter((line) => line.item && line.item.available && line.quantity > 0);
  }

  function cartSubtotal() {
    return getCartLines().reduce((sum, line) => sum + line.item.price * line.quantity, 0);
  }

  function cartCount() {
    return getCartLines().reduce((sum, line) => sum + line.quantity, 0);
  }

  function deliveryFee(zoneName) {
    if (checkoutType === "Pickup") return 0;
    return zones.find((zone) => zone.name === zoneName)?.fee ?? zones[0].fee;
  }

  function discountAmount() {
    return promoApplied ? cartSubtotal() * 0.1 : 0;
  }

  function updateCartIndicators() {
    const count = cartCount();
    document.querySelector("#cart-count").textContent = count;
    document.querySelector("#mobile-cart-count").textContent = count;
    document.querySelector("#mobile-cart-total").textContent = money(cartSubtotal());
    document.querySelector("#mobile-cart-bar").hidden = count === 0;
  }

  function renderMenu() {
    const query = document.querySelector("#menu-search").value.trim().toLowerCase();
    const visible = menu.filter((item) =>
      (category === "All" || item.category === category)
      && (!query || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query)),
    );
    document.querySelector("#category-list").innerHTML = CATEGORIES.map((name) =>
      `<button class="category-chip" type="button" data-category="${escapeHtml(name)}" aria-pressed="${category === name}">${escapeHtml(name)}</button>`,
    ).join("");
    document.querySelector("#menu-empty").hidden = visible.length > 0;
    document.querySelector("#menu-grid").innerHTML = visible.map((item) => `
      <article class="food-card">
        <div class="food-photo"><img src="${escapeHtml(item.photo)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" />${item.badge ? `<span class="food-badge">${escapeHtml(item.badge)}</span>` : ""}${item.available ? "" : '<span class="sold-out">SOLD OUT</span>'}</div>
        <div class="food-details"><p class="food-meta">${escapeHtml(item.category)}</p><h3 class="food-title">${escapeHtml(item.name)}</h3><p class="food-description">${escapeHtml(item.description)}</p><div class="food-bottom"><span class="food-price">${money(item.price)}</span><button class="add-button" type="button" data-add="${escapeHtml(item.id)}" aria-label="Add ${escapeHtml(item.name)} to cart" ${item.available ? "" : "disabled"}>+</button></div></div>
      </article>`,
    ).join("");
    document.querySelector("#currency-toggle").innerHTML = currency === "USD" ? "USD <span>/</span> LRD" : "LRD <span>/</span> USD";
  }

  function renderAreas() {
    const symbols = ["⌂", "⌖", "✦"];
    document.querySelector("#area-grid").innerHTML = zones.map((zone, index) => `
      <article class="area-card"><div class="area-icon">${symbols[index]}</div><div><b>${escapeHtml(zone.name)}</b><span>${escapeHtml(zone.note)} · from ${money(zone.fee)}</span></div></article>`,
    ).join("");
  }

  function renderCart() {
    const lines = getCartLines();
    const content = document.querySelector("#cart-content");
    if (!lines.length) {
      content.innerHTML = `<div class="cart-empty"><p>Your bag is still hungry.</p><button class="button button-orange" type="button" data-close-dialog>Explore the menu</button></div>`;
      return;
    }
    content.innerHTML = `
      <div>${lines.map(({ item, quantity }) => `
        <div class="cart-line"><div><h3>${escapeHtml(item.name)}</h3><small>${money(item.price)} each</small><div class="quantity-control"><button type="button" data-quantity="${escapeHtml(item.id)}" data-change="-1" aria-label="Remove one ${escapeHtml(item.name)}">−</button><span>${quantity}</span><button type="button" data-quantity="${escapeHtml(item.id)}" data-change="1" aria-label="Add one ${escapeHtml(item.name)}">+</button></div></div><span class="cart-line-total">${money(item.price * quantity)}</span></div>`,
      ).join("")}</div>
      <div class="cart-summary"><div class="summary-row"><span>Subtotal</span><b>${money(cartSubtotal())}</b></div><div class="summary-row"><span>Delivery</span><span>Set at checkout</span></div><div class="summary-row total"><span>Subtotal</span><span>${money(cartSubtotal())}</span></div></div>
      <div class="cart-actions"><button class="button button-light" type="button" data-close-dialog>Keep browsing</button><button class="button button-dark" type="button" id="go-checkout">Checkout →</button></div>`;
  }

  function paymentInstructions(method) {
    if (method === "Orange Money") return CONFIG.mobileMoney.orange;
    if (method === "MTN MoMo") return CONFIG.mobileMoney.mtn;
    return "Please have cash ready when your order arrives.";
  }

  function renderCheckout() {
    if (!cartCount()) {
      document.querySelector("#checkout-content").innerHTML = '<p class="cart-empty">Your bag is empty. Add a favorite from the menu first.</p>';
      return;
    }
    document.querySelector("#checkout-content").innerHTML = `
      <form id="checkout-form" class="checkout-form">
        <div class="field"><span class="field-label">How would you like it?</span><div class="choice-row">
          <button class="choice ${checkoutType === "Delivery" ? "active" : ""}" type="button" data-order-type="Delivery"><b>🚗 Delivery</b><span>To your door</span></button>
          <button class="choice ${checkoutType === "Pickup" ? "active" : ""}" type="button" data-order-type="Pickup"><b>🛍 Pickup</b><span>Collect your order</span></button>
        </div></div>
        <div class="form-grid">
          <label class="field"><span class="field-label">Your name</span><input name="name" autocomplete="name" required maxlength="80" placeholder="Name for the order" value="${escapeHtml(checkoutDraft.name ?? "")}" /></label>
          <label class="field"><span class="field-label">Phone number</span><input name="phone" type="tel" autocomplete="tel" required maxlength="24" placeholder="+231 ..." value="${escapeHtml(checkoutDraft.phone ?? "")}" /></label>
        </div>
        ${checkoutType === "Delivery" ? `<div class="form-grid"><label class="field"><span class="field-label">Delivery area</span><select name="zone">${zones.map((zone) => `<option value="${escapeHtml(zone.name)}" ${checkoutDraft.zone === zone.name ? "selected" : ""}>${escapeHtml(zone.name)} — ${money(zone.fee)}</option>`).join("")}</select></label><label class="field"><span class="field-label">Delivery address</span><input name="address" autocomplete="street-address" required maxlength="180" placeholder="Street, landmark, neighborhood" value="${escapeHtml(checkoutDraft.address ?? "")}" /></label></div>` : `<div class="field"><span class="field-label">Pickup location</span><input value="${escapeHtml(CONFIG.address)}" disabled /></div>`}
        <label class="field"><span class="field-label">Payment method</span><select name="payment"><option ${!checkoutDraft.payment || checkoutDraft.payment === "Cash on Delivery" ? "selected" : ""}>Cash on Delivery</option><option ${checkoutDraft.payment === "Orange Money" ? "selected" : ""}>Orange Money</option><option ${checkoutDraft.payment === "MTN MoMo" ? "selected" : ""}>MTN MoMo</option></select></label>
        <div id="payment-instructions" class="payment-note">${escapeHtml(paymentInstructions(checkoutDraft.payment || "Cash on Delivery"))}</div>
        <div class="field"><label class="field-label" for="order-notes">Order notes (optional)</label><textarea id="order-notes" name="notes" maxlength="250" placeholder="Allergies, directions, or a little extra sauce?">${escapeHtml(checkoutDraft.notes ?? "")}</textarea></div>
        <div class="field"><span class="field-label">Promo code</span><div class="promo-row"><input name="promo" placeholder="Try LETSEAT10" autocomplete="off" value="${escapeHtml(checkoutDraft.promo ?? "")}" /><button type="button" id="apply-promo">${promoApplied ? "Applied ✓" : "Apply code"}</button></div><div id="promo-message" class="${promoApplied ? "track-success" : ""}" role="status">${promoApplied ? "LETSEAT10 applied — 10% off your food." : ""}</div></div>
        <div id="checkout-total" class="checkout-total">${checkoutTotals()}</div>
        <p class="form-error" id="checkout-error" role="alert"></p>
        <button class="button button-orange" type="submit">Place order · ${money(checkoutTotalValue())}</button>
      </form>`;
  }

  function checkoutTotals() {
    const zone = document.querySelector('#checkout-form [name="zone"]')?.value ?? zones[0].name;
    const fee = deliveryFee(zone);
    const discount = discountAmount();
    return `<div class="summary-row"><span>Food</span><span>${money(cartSubtotal())}</span></div>${discount ? `<div class="summary-row"><span>Promo discount</span><span>−${money(discount)}</span></div>` : ""}<div class="summary-row"><span>${checkoutType === "Pickup" ? "Pickup" : "Delivery"}</span><span>${fee ? money(fee) : "Free"}</span></div><div class="summary-row total"><span>Total</span><span>${money(Math.max(0, cartSubtotal() - discount + fee))}</span></div>`;
  }

  function checkoutTotalValue(zoneName) {
    return Math.max(0, cartSubtotal() - discountAmount() + deliveryFee(zoneName ?? zones[0].name));
  }

  function showOrder(order) {
    const lines = order.items.map((line) => `<p>${line.quantity} × ${escapeHtml(line.name)} <span style="float:right">${moneyFor(line.price * line.quantity, order.currency)}</span></p>`).join("");
    const message = [
      `Hi ${CONFIG.shopName}! I'd like to confirm order ${order.id}.`,
      ...order.items.map((line) => `${line.quantity} x ${line.name} — ${moneyFor(line.price * line.quantity, order.currency)}`),
      `Subtotal: ${moneyFor(order.subtotal, order.currency)}`,
      `Discount: ${moneyFor(order.discount, order.currency)}`,
      `${order.type} fee: ${moneyFor(order.deliveryFee, order.currency)}`,
      `Total: ${moneyFor(order.total, order.currency)}`,
      `Name: ${order.name}`,
      `Phone: ${order.phone}`,
      order.address ? `Address: ${order.address} (${order.zone})` : `Pickup: ${CONFIG.address}`,
      `Payment: ${order.payment}`,
      order.notes ? `Notes: ${order.notes}` : "",
    ].filter(Boolean).join("\n");
    const waTarget = CONFIG.phoneDigits ? `https://wa.me/${encodeURIComponent(CONFIG.phoneDigits)}` : "https://wa.me/";
    const waUrl = `${waTarget}?text=${encodeURIComponent(message)}`;
    document.querySelector("#confirmation-content").innerHTML = `
      <div class="confirmation"><div class="confirmation-mark">✓</div><p class="eyebrow">THANKS FOR YOUR ORDER</p><h2 id="confirmation-title">You're all set, ${escapeHtml(order.name)}!</h2><p>We’ve saved your order. Send the details to ${escapeHtml(CONFIG.shopName)} on WhatsApp so we can confirm it.</p><div class="order-number">${escapeHtml(order.id)}</div><div class="confirmation-summary">${lines}<p>Order status: <b>${escapeHtml(order.status)}</b></p><p>Total: <b>${moneyFor(order.total, order.currency)}</b></p></div><a class="button button-orange" href="${waUrl}" target="_blank" rel="noreferrer">Send order on WhatsApp ↗</a><p style="margin-top:1rem"><a class="text-link" href="#track" id="confirmation-track">Track this order →</a></p><p class="admin-warning">${CONFIG.phoneDigits ? "" : "Set CONFIG.phoneDigits in app.js to send directly to your shop WhatsApp. Until then WhatsApp opens with the order message ready; choose the shop contact."}</p></div>`;
    document.querySelector("#confirmation-dialog").showModal();
    document.querySelector("#confirmation-track").addEventListener("click", () => {
      document.querySelector("#confirmation-dialog").close();
      document.querySelector("#track-number").value = order.id;
      document.querySelector("#track-phone").value = order.phone;
      showTrackResult(order);
      document.querySelector("#track").scrollIntoView({ behavior: "smooth" });
    });
    document.querySelector("#contact-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const message = [
        `Hello ${CONFIG.shopName}, my name is ${String(data.get("name")).trim()}.`,
        `Please reply to me at: ${String(data.get("replyTo")).trim()}`,
        String(data.get("message")).trim(),
      ].join("\n");
      const target = CONFIG.phoneDigits ? `https://wa.me/${encodeURIComponent(CONFIG.phoneDigits)}` : "https://wa.me/";
      window.open(`${target}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      document.querySelector("#contact-form-note").textContent = CONFIG.phoneDigits
        ? "Your message is ready to send on WhatsApp."
        : "WhatsApp opened with your message. Add the shop number in app.js to send directly.";
    });
  }

  function showTrackResult(order) {
    const statuses = ["Received", "Preparing", "On the way", "Delivered"];
    const activeIndex = statuses.indexOf(order.status);
    document.querySelector("#track-result").innerHTML = `<div class="track-success"><b>${escapeHtml(order.id)}</b> · ${escapeHtml(order.status)}<br /><small>${activeIndex < 3 ? `Next: ${statuses[activeIndex + 1]}` : "Enjoy your meal!"}</small></div>`;
  }

  function renderCustomerReviews() {
    const grid = document.querySelector("#review-grid");
    if (!customerReviews.length) {
      grid.innerHTML = '<p class="review-empty">No approved customer reviews yet. Be the first to share your experience.</p>';
      return;
    }
    grid.innerHTML = customerReviews.map((review) => {
      const name = String(review.customer_name || "Customer");
      const location = String(review.location || "");
      const rating = Number(review.rating);
      const stars = `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`;
      return `<article class="review-card"><div class="stars" role="img" aria-label="${rating} out of 5 stars">${stars}</div><p>${escapeHtml(review.comment)}</p><div class="review-person"><span class="review-avatar">${escapeHtml(name.charAt(0).toUpperCase())}</span><span><b>${escapeHtml(name)}</b><small>${escapeHtml(location || "Customer review")}</small></span></div></article>`;
    }).join("");
  }

  async function renderTrack(orderNumber, customerPhone) {
    const result = document.querySelector("#track-result");
    if (isRemoteOrderMode()) {
      result.textContent = "Checking order…";
        const { data, error } = await supabaseClient.rpc("track_order", {
          p_order_number: orderNumber.trim().toUpperCase(),
          p_phone: phoneDigits(customerPhone),
      });
      if (error) {
        result.innerHTML = `<span class="track-error">${escapeHtml(backendError(error, "Unable to track order"))}</span>`;
        return;
      }
      if (!data?.status) {
        result.innerHTML = '<span class="track-error">We couldn’t find a matching order and phone number. Check both details and try again.</span>';
        return;
      }
      showTrackResult({ id: data.orderNumber, status: data.status });
      return;
    }
    const order = orders.find((entry) => entry.id.toLowerCase() === orderNumber.trim().toLowerCase());
    if (!order) {
      result.innerHTML = '<span class="track-error">Demo orders can only be tracked in the browser where they were placed. Configure Supabase to share orders.</span>';
      return;
    }
    showTrackResult(order);
  }

  async function openAdmin() {
    document.querySelector("#admin-dialog").showModal();
    try {
      if (!supabaseClient) {
        renderAdmin();
        return;
      }
      if (await requireAdmin()) {
        await loadSharedMenu();
        await loadDeliveryZones();
        await loadAdminReviews();
        if (adminTab === "orders") await loadAdminOrders();
      }
      renderAdmin();
    } catch (error) {
      const message = backendError(error, "Unable to open admin");
      document.querySelector("#admin-content").innerHTML = `<p class="form-error" role="alert">${escapeHtml(message)}</p><button class="button button-light" type="button" data-admin-logout>Return to login</button>`;
    }
  }

  async function loadAdminOrders() {
    const { data, error } = await supabaseClient.from("orders")
      .select("id,order_number,name,phone,order_type,zone,address,payment_method,notes,subtotal,discount,delivery_fee,total,status,currency,created_at,order_items(name,unit_price,quantity)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    orders = data.map((row) => ({
      id: row.order_number,
      name: row.name,
      phone: row.phone,
      type: row.order_type,
      zone: row.zone || "",
      address: row.address || "",
      payment: row.payment_method,
      notes: row.notes || "",
      subtotal: Number(row.subtotal),
      discount: Number(row.discount),
      deliveryFee: Number(row.delivery_fee),
      total: Number(row.total),
      currency: row.currency,
      status: row.status,
      items: row.order_items.map((line) => ({
        name: line.name,
        price: Number(line.unit_price),
        quantity: line.quantity,
      })),
    }));
  }

  async function loadAdminReviews() {
    const { data, error } = await supabaseClient.from("customer_reviews")
      .select("id,customer_name,location,rating,comment,status,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    adminReviews = data;
  }

  function renderAdmin() {
    const content = document.querySelector("#admin-content");
    if (!supabaseClient) {
      content.innerHTML = '<p class="admin-warning">Admin access is disabled until Supabase is configured. There is no password in this public site. Follow the Supabase setup steps in README.md.</p>';
      return;
    }
    if (!adminUser) {
      content.innerHTML = `<p class="admin-warning">Sign in with the administrator account you created in Supabase. Access is checked by database row-level security.</p><form class="admin-login" id="admin-login"><label class="field"><span class="field-label">Admin email</span><input type="email" name="email" required autocomplete="username" /></label><label class="field"><span class="field-label">Password</span><input type="password" name="password" required autocomplete="current-password" /></label><p class="form-error" id="admin-error" role="alert"></p><button class="button button-dark" type="submit">Sign in securely</button></form>`;
      return;
    }
    const pendingReviews = adminReviews.filter((review) => review.status === "pending").length;
    content.innerHTML = `<p class="admin-warning">Signed in as ${escapeHtml(adminUser.email || "administrator")} <button class="button button-light" type="button" data-admin-logout>Sign out</button></p><div class="admin-tabs"><button type="button" data-admin-tab="menu" class="${adminTab === "menu" ? "active" : ""}">Menu (${menu.length})</button><button type="button" data-admin-tab="orders" class="${adminTab === "orders" ? "active" : ""}">Orders (${orders.length})</button><button type="button" data-admin-tab="reviews" class="${adminTab === "reviews" ? "active" : ""}">Reviews (${pendingReviews})</button></div>${adminTab === "menu" ? renderAdminMenu() : adminTab === "orders" ? renderAdminOrders() : renderAdminReviews()}`;
  }

  function renderAdminMenu() {
    const editing = menu.find((item) => item.id === adminEditId);
    return `<div class="admin-list">${menu.map((item) => `<div class="admin-item"><div><b>${escapeHtml(item.name)}</b><small>${money(item.price)} · ${item.available ? "Available" : "Sold out"}</small></div><div class="admin-item-actions"><button type="button" data-edit-menu="${escapeHtml(item.id)}">Edit</button><button type="button" data-toggle-sold="${escapeHtml(item.id)}">${item.available ? "Sold out" : "Available"}</button><button type="button" data-delete-menu="${escapeHtml(item.id)}">Delete</button></div></div>`).join("")}</div>
      <form id="admin-menu-form" class="admin-form">
        <label class="wide">Item name<input name="name" required maxlength="70" value="${escapeHtml(editing?.name ?? "")}" /></label>
        <label>Category<select name="category">${CATEGORIES.filter((name) => name !== "All").map((name) => `<option ${editing?.category === name ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select></label>
        <label>Price (USD)<input name="price" type="number" min="0.01" step="0.01" required value="${editing ? escapeHtml(editing.price) : ""}" /></label>
        <label class="wide">Description<input name="description" required maxlength="140" value="${escapeHtml(editing?.description ?? "")}" /></label>
        <label class="wide">Photo URL<input name="photo" type="url" required value="${escapeHtml(editing?.photo ?? "")}" placeholder="https://..." /></label>
        <label>Badge (optional)<input name="badge" maxlength="22" value="${escapeHtml(editing?.badge ?? "")}" /></label>
        <button class="button button-orange" type="submit">${editing ? "Save changes" : "Add menu item"}</button>
        ${editing ? '<button class="button button-light" type="button" id="cancel-edit">Cancel edit</button>' : ""}
      </form>`;
  }

  function renderAdminOrders() {
    if (!orders.length) return '<p class="cart-empty">No orders have been placed yet.</p>';
    const statuses = ["Received", "Preparing", "On the way", "Delivered"];
    return `<div>${orders.map((order) => `<article class="admin-order"><div class="admin-order-head"><span>${escapeHtml(order.id)} · ${escapeHtml(order.name)}</span><span>${moneyFor(order.total, order.currency)}</span></div><p>${order.items.map((line) => `${line.quantity} × ${escapeHtml(line.name)}`).join(", ")}<br />${escapeHtml(order.phone)} · ${escapeHtml(order.type)}${order.zone ? ` · ${escapeHtml(order.zone)}` : ""}</p><p>${escapeHtml(order.address || "Pickup")} · ${escapeHtml(order.payment)}${order.notes ? `<br />Notes: ${escapeHtml(order.notes)}` : ""}</p><label class="field-label">Status <select class="status-select" data-order-status="${escapeHtml(order.id)}">${statuses.map((status) => `<option ${order.status === status ? "selected" : ""}>${status}</option>`).join("")}</select></label></article>`).join("")}</div>`;
  }

  function renderAdminReviews() {
    if (!adminReviews.length) return '<p class="cart-empty">No customer reviews have been submitted yet.</p>';
    return `<div class="admin-list">${adminReviews.map((review) => `<article class="admin-review"><div class="admin-review-head"><b>${escapeHtml(review.customer_name)}</b><span>${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span></div><p>${escapeHtml(review.comment)}</p><small>${escapeHtml(review.location || "No neighborhood provided")} · ${new Date(review.created_at).toLocaleDateString()}</small><label class="field-label">Publication status <select class="status-select" data-review-status="${escapeHtml(review.id)}"><option value="pending" ${review.status === "pending" ? "selected" : ""}>Pending approval</option><option value="approved" ${review.status === "approved" ? "selected" : ""}>Approved — public</option><option value="rejected" ${review.status === "rejected" ? "selected" : ""}>Rejected</option></select></label></article>`).join("")}</div>`;
  }

  function whatsappContact() {
    const text = encodeURIComponent(`Hi ${CONFIG.shopName}! I'd like to ask about your menu.`);
    window.open(`${CONFIG.phoneDigits ? `https://wa.me/${encodeURIComponent(CONFIG.phoneDigits)}` : "https://wa.me/"}?text=${text}`, "_blank", "noopener,noreferrer");
  }

  document.querySelector("#year").textContent = new Date().getFullYear();
  document.querySelector("#contact-phone").textContent = `Customer care: ${CONFIG.customerCarePhoneDisplay}`;
  if (CONFIG.customerCarePhoneDigits) document.querySelector("#contact-phone").href = `tel:+${CONFIG.customerCarePhoneDigits}`;
  const contactWhatsapp = document.querySelector("#contact-whatsapp");
  contactWhatsapp.textContent = `WhatsApp orders: ${CONFIG.phoneDisplay}`;
  if (CONFIG.phoneDigits) contactWhatsapp.href = `https://wa.me/${encodeURIComponent(CONFIG.phoneDigits)}`;
  document.querySelector("#contact-email").textContent = `Email: ${CONFIG.email}`;
  if (CONFIG.email && !CONFIG.email.startsWith("[")) document.querySelector("#contact-email").href = `mailto:${CONFIG.email}`;
  document.querySelector("#shop-hours").textContent = `Hours: ${CONFIG.hours}`;
  document.querySelector("#shop-address").textContent = `Pickup: ${CONFIG.address}`;
  document.querySelector("#map-link").href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.address)}`;
  document.querySelector("#social-links").innerHTML = Object.entries(CONFIG.socials)
    .filter(([, url]) => /^https:\/\/\S+/i.test(url))
    .map(([name, url]) => `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(name)}</a>`)
    .join("");
  renderMenu();
  renderAreas();
  updateCartIndicators();
  if (supabaseClient) {
    loadCustomerReviews().catch((error) => {
      console.error("Unable to load customer reviews.", error);
      document.querySelector("#review-grid").innerHTML = '<p class="review-empty">Customer reviews are temporarily unavailable. Please try again later.</p>';
      document.querySelector("#review-note").textContent = "Reviews could not be loaded.";
    });
  } else {
    renderCustomerReviews();
  }
  if (!supabaseConfigured) {
    setBackendNotice("Demo mode: orders stay in this browser and admin is disabled until Supabase is configured.");
  } else if (!supabaseClient) {
    setBackendNotice("Supabase could not load. Check the connection and Supabase setup.", true);
  } else {
    setBackendNotice(`Connecting to the shared ${CONFIG.shopName} menu and ordering service…`);
    Promise.all([loadSharedMenu(), loadDeliveryZones()])
      .then(() => setBackendNotice(""))
      .catch((error) => setBackendNotice(backendError(error, "Unable to load Supabase data"), true));
  }

  document.addEventListener("error", (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.fallback) return;
    image.dataset.fallback = "true";
    image.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23fff5e9'/%3E%3Ctext x='50%25' y='48%25' text-anchor='middle' dominant-baseline='middle' font-family='Arial,sans-serif' font-size='74' font-weight='700' fill='%23f3492d'%3ELet%27s Eat oo%3C/text%3E%3Ctext x='50%25' y='63%25' text-anchor='middle' dominant-baseline='middle' font-family='Arial,sans-serif' font-size='24' fill='%23797b76'%3EFresh food, good mood%3C/text%3E%3C/svg%3E";
  }, true);

  document.addEventListener("click", async (event) => {
    const target = event.target.closest("button, a");
    if (!target) return;
    if (target.matches("[data-category]")) {
      category = target.dataset.category;
      renderMenu();
    } else if (target.matches("[data-add]")) {
      const item = menu.find((entry) => entry.id === target.dataset.add);
      if (item?.available) {
        cart[item.id] = (cart[item.id] || 0) + 1;
        save(STORAGE.cart, cart);
        updateCartIndicators();
        target.textContent = "✓";
        setTimeout(() => { if (target.isConnected) target.textContent = "+"; }, 650);
      }
    } else if (target.matches("[data-open-cart]")) {
      renderCart();
      document.querySelector("#cart-dialog").showModal();
    } else if (target.matches("[data-close-dialog]")) {
      document.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close());
    } else if (target.matches("[data-quantity]")) {
      const id = target.dataset.quantity;
      cart[id] = (cart[id] || 0) + Number(target.dataset.change);
      if (cart[id] <= 0) delete cart[id];
      save(STORAGE.cart, cart);
      updateCartIndicators();
      renderCart();
    } else if (target.id === "go-checkout") {
      document.querySelector("#cart-dialog").close();
      promoApplied = false;
      renderCheckout();
      document.querySelector("#checkout-dialog").showModal();
    } else if (target.matches("[data-order-type]")) {
      checkoutType = target.dataset.orderType;
      renderCheckout();
    } else if (target.id === "apply-promo") {
      const input = document.querySelector('#checkout-form [name="promo"]');
      const message = document.querySelector("#promo-message");
      if (input.value.trim().toUpperCase() === "LETSEAT10") {
        promoApplied = true;
        message.className = "track-success";
        message.textContent = "LETSEAT10 applied — 10% off your food.";
      } else {
        promoApplied = false;
        message.className = "track-error";
        message.textContent = "That code didn’t work. Try LETSEAT10.";
      }
      const selectedZone = document.querySelector('#checkout-form [name="zone"]')?.value;
      document.querySelector("#checkout-total").innerHTML = checkoutTotals();
      document.querySelector('#checkout-form [type="submit"]').textContent = `Place order · ${money(checkoutTotalValue(selectedZone))}`;
    } else if (target.id === "whatsapp-link") {
      whatsappContact();
    } else if (target.id === "admin-open") {
      await openAdmin();
    } else if (target.matches("[data-admin-logout]")) {
      try {
        if (supabaseClient) {
          const { error } = await supabaseClient.auth.signOut();
          if (error) throw error;
        }
        adminUser = null;
        orders = [];
        adminReviews = [];
        renderAdmin();
      } catch (error) {
        alert(backendError(error, "Unable to sign out"));
      }
    } else if (target.matches("[data-admin-tab]")) {
      adminTab = target.dataset.adminTab;
      try {
        if (adminTab === "orders" && isRemoteOrderMode()) await loadAdminOrders();
        if (adminTab === "reviews" && isRemoteOrderMode()) await loadAdminReviews();
        renderAdmin();
      } catch (error) {
        alert(backendError(error, "Unable to load admin data"));
      }
    } else if (target.matches("[data-edit-menu]")) {
      adminEditId = target.dataset.editMenu;
      renderAdmin();
    } else if (target.matches("[data-toggle-sold]")) {
      const item = menu.find((entry) => entry.id === target.dataset.toggleSold);
      if (!item) return;
      try {
        const { error } = await supabaseClient.from("menu_items")
          .update({ available: !item.available }).eq("id", item.id);
        if (error) throw error;
        await loadSharedMenu();
        renderAdmin();
      } catch (error) {
        alert(backendError(error, "Unable to update item"));
      }
    } else if (target.matches("[data-delete-menu]")) {
      const item = menu.find((entry) => entry.id === target.dataset.deleteMenu);
      if (item && window.confirm(`Remove ${item.name} from the menu?`)) {
        try {
          const { error } = await supabaseClient.from("menu_items").delete().eq("id", item.id);
          if (error) throw error;
          menu = menu.filter((entry) => entry.id !== item.id);
          delete cart[item.id];
          save(STORAGE.cart, cart);
          renderMenu();
          updateCartIndicators();
          renderAdmin();
        } catch (error) {
          alert(backendError(error, "Unable to delete item"));
        }
      }
    } else if (target.id === "cancel-edit") {
      adminEditId = "";
      renderAdmin();
    }
  });

  document.querySelector("#menu-search").addEventListener("input", renderMenu);
  document.querySelector("#currency-toggle").addEventListener("click", () => {
    currency = currency === "USD" ? "LRD" : "USD";
    save(STORAGE.currency, currency);
    renderMenu();
    renderAreas();
    updateCartIndicators();
  });
  document.querySelector("#track-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    await renderTrack(
      document.querySelector("#track-number").value,
      document.querySelector("#track-phone").value,
    );
  });
  document.querySelector("#review-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const status = document.querySelector("#review-form-status");
    const button = form.querySelector('[type="submit"]');
    if (!supabaseClient) {
      status.className = "review-form-status form-error";
      status.textContent = "The review service is unavailable right now. Please try again later.";
      return;
    }
    const data = new FormData(form);
    button.disabled = true;
    button.textContent = "Sending review…";
    status.className = "review-form-status";
    status.textContent = "";
    try {
      const { error } = await supabaseClient.rpc("submit_customer_review", {
        p_name: String(data.get("name")).trim(),
        p_location: String(data.get("location") || "").trim(),
        p_rating: Number(data.get("rating")),
        p_comment: String(data.get("comment")).trim(),
      });
      if (error) throw error;
      form.reset();
      status.textContent = "Thanks for sharing! Your review is awaiting approval before it appears on the site.";
    } catch (error) {
      status.className = "review-form-status form-error";
      status.textContent = backendError(error, "Unable to submit review");
    } finally {
      button.disabled = false;
      button.textContent = "Send for approval";
    }
  });
  document.querySelector("#checkout-content").addEventListener("change", (event) => {
    if (event.target.name) checkoutDraft[event.target.name] = event.target.value;
    if (event.target.name === "payment") document.querySelector("#payment-instructions").textContent = paymentInstructions(event.target.value);
    if (event.target.name === "zone") {
      document.querySelector("#checkout-total").innerHTML = checkoutTotals();
      document.querySelector('#checkout-form [type="submit"]').textContent = `Place order · ${money(checkoutTotalValue(event.target.value))}`;
    }
  });
  document.querySelector("#checkout-content").addEventListener("input", (event) => {
    if (event.target.name && event.target.name !== "promo") checkoutDraft[event.target.name] = event.target.value;
    if (event.target.name !== "promo" || !promoApplied) return;
    promoApplied = false;
    document.querySelector("#promo-message").textContent = "";
    document.querySelector("#promo-message").className = "";
    document.querySelector("#apply-promo").textContent = "Apply code";
    document.querySelector("#checkout-total").innerHTML = checkoutTotals();
    const selectedZone = document.querySelector('#checkout-form [name="zone"]')?.value;
    document.querySelector('#checkout-form [type="submit"]').textContent = `Place order · ${money(checkoutTotalValue(selectedZone))}`;
  });
  document.querySelector("#checkout-content").addEventListener("submit", async (event) => {
    if (event.target.id !== "checkout-form") return;
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const zone = checkoutType === "Delivery" ? String(data.get("zone")) : "";
    const fee = checkoutType === "Delivery" ? deliveryFee(zone) : 0;
    const subtotal = cartSubtotal();
    const discount = discountAmount();
    let order;
    const submitButton = form.querySelector('[type="submit"]');
    const errorBox = document.querySelector("#checkout-error");
    errorBox.textContent = "";
    submitButton.disabled = true;
    submitButton.textContent = "Sending order…";
    try {
      if (isRemoteOrderMode()) {
        const { data: remoteOrder, error } = await supabaseClient.rpc("place_order", {
          p_name: String(data.get("name")).trim(),
          p_phone: phoneDigits(data.get("phone")),
          p_order_type: checkoutType,
          p_zone: checkoutType === "Delivery" ? zone : null,
          p_address: checkoutType === "Delivery" ? String(data.get("address")).trim() : null,
          p_payment_method: String(data.get("payment")),
          p_notes: String(data.get("notes") || "").trim(),
          p_promo_code: promoApplied ? "LETSEAT10" : "",
          p_items: getCartLines().map(({ item, quantity }) => ({ id: item.id, quantity })),
        });
        if (error) throw error;
        order = {
          id: remoteOrder.orderNumber,
          name: remoteOrder.name,
          phone: remoteOrder.phone,
          type: remoteOrder.orderType,
          zone: remoteOrder.zone || "",
          address: remoteOrder.address || "",
          payment: remoteOrder.paymentMethod,
          notes: remoteOrder.notes || "",
          items: remoteOrder.items.map((item) => ({ id: item.id, name: item.name, price: Number(item.price), quantity: item.quantity })),
          subtotal: Number(remoteOrder.subtotal),
          discount: Number(remoteOrder.discount),
          deliveryFee: Number(remoteOrder.deliveryFee),
          total: Number(remoteOrder.total),
          currency,
          status: remoteOrder.status,
        };
      } else {
        order = {
      id: `LE-${String(Date.now()).slice(-6)}`,
      createdAt: new Date().toISOString(),
      name: String(data.get("name")).trim(),
      phone: String(data.get("phone")).trim(),
      type: checkoutType,
      zone,
      address: checkoutType === "Delivery" ? String(data.get("address")).trim() : "",
      payment: String(data.get("payment")),
      notes: String(data.get("notes") || "").trim(),
      items: getCartLines().map(({ item, quantity }) => ({ id: item.id, name: item.name, price: item.price, quantity })),
      subtotal,
      discount,
      deliveryFee: fee,
      total: Math.max(0, subtotal - discount + fee),
      currency,
      status: "Received",
        };
        orders.push(order);
        save(STORAGE.orders, orders);
      }
    } catch (error) {
      errorBox.textContent = backendError(error, "Unable to place order");
      submitButton.disabled = false;
      submitButton.textContent = `Place order · ${money(checkoutTotalValue(zone))}`;
      return;
    }
    cart = {};
    promoApplied = false;
    checkoutDraft = {};
    save(STORAGE.cart, cart);
    updateCartIndicators();
    document.querySelector("#checkout-dialog").close();
    showOrder(order);
  });
  document.querySelector("#admin-content").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (event.target.id === "admin-login") {
      const form = event.target;
      const data = new FormData(form);
      const button = form.querySelector('[type="submit"]');
      const errorNode = document.querySelector("#admin-error");
      errorNode.textContent = "";
      button.disabled = true;
      try {
        const { error } = await supabaseClient.auth.signInWithPassword({
          email: String(data.get("email")).trim(),
          password: String(data.get("password")),
        });
        if (error) throw error;
        if (!(await requireAdmin())) throw new Error("Unable to verify administrator access.");
        await loadSharedMenu();
        await loadDeliveryZones();
        await loadAdminReviews();
        renderAdmin();
      } catch (error) {
        errorNode.textContent = backendError(error, "Admin sign-in failed");
        button.disabled = false;
      }
    } else if (event.target.id === "admin-menu-form") {
      const data = new FormData(event.target);
      const previous = menu.find((item) => item.id === adminEditId);
      const name = String(data.get("name")).trim();
      const id = previous?.id || `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;
      const photo = String(data.get("photo")).trim();
      if (!/^https:\/\/.+/i.test(photo)) {
        alert("Please use an HTTPS photo URL.");
        return;
      }
      const item = { id, name, category: String(data.get("category")), price: Number(data.get("price")), description: String(data.get("description")).trim(), photo, badge: String(data.get("badge")).trim(), available: previous?.available ?? true };
      if (!Number.isFinite(item.price) || item.price <= 0) {
        alert("Enter a price greater than zero.");
        return;
      }
      try {
        const { error } = await supabaseClient.from("menu_items").upsert(toDbMenu(item));
        if (error) throw error;
        adminEditId = "";
        await loadSharedMenu();
        renderAdmin();
      } catch (error) {
        alert(backendError(error, "Unable to save menu item"));
      }
    }
  });
  document.querySelector("#admin-content").addEventListener("change", async (event) => {
    if (event.target.matches("[data-order-status]")) {
      try {
        const { error } = await supabaseClient.from("orders")
          .update({ status: event.target.value }).eq("order_number", event.target.dataset.orderStatus);
        if (error) throw error;
        await loadAdminOrders();
        renderAdmin();
      } catch (error) {
        alert(backendError(error, "Unable to update order status"));
      }
    } else if (event.target.matches("[data-review-status]")) {
      try {
        const { error } = await supabaseClient.from("customer_reviews")
          .update({ status: event.target.value }).eq("id", event.target.dataset.reviewStatus);
        if (error) throw error;
        await loadAdminReviews();
        renderAdmin();
      } catch (error) {
        alert(backendError(error, "Unable to update review status"));
      }
    }
  });
})();
