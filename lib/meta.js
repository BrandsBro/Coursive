export const genEventId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

export const firePixelEvent = (eventName, data = {}, eventId) => {
  if (typeof window === "undefined" || !window.fbq) return;
  const pixelData = {
    ...(data.contentName && { content_name: data.contentName }),
    ...(data.contentType && { content_type: data.contentType }),
    ...(data.value && { value: data.value }),
    ...(data.currency && { currency: data.currency }),
    ...(data.orderId && { order_id: data.orderId }),
  };
  window.fbq("track", eventName, Object.keys(pixelData).length ? pixelData : {}, { eventID: eventId });
};

export const fireCAPI = async (eventName, data = {}, eventId) => {
  try {
    const getCookie = (n) => {
      const m = document.cookie.match(new RegExp("(^| )" + n + "=([^;]+)"));
      return m ? m[2] : undefined;
    };

    let fbc = getCookie("_fbc");
    if (!fbc) {
      const fbclid = new URLSearchParams(window.location.search).get("fbclid");
      if (fbclid) fbc = `fb.1.${Math.floor(Date.now()/1000)}.${fbclid}`;
    }

    let externalId, email, name;
    try {
      externalId = localStorage.getItem("user_id") || undefined;
      email = data.email || localStorage.getItem("user_email") || undefined;
      name = data.name || localStorage.getItem("user_name") || undefined;
    } catch(e) {}

    await fetch("/api/meta/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventId,
        email,
        name,
        externalId,
        fbp: getCookie("_fbp"),
        fbc,
        clientUserAgent: navigator.userAgent,
        value: data.value,
        currency: data.currency,
        contentName: data.contentName,
        contentType: data.contentType,
        orderId: data.orderId,
      }),
    });
  } catch(e) { console.error("CAPI error:", e); }
};

export const trackEvent = async (eventName, data = {}) => {
  const eventId = data.eventId || genEventId();
  console.log("[Meta TRACK]", eventName, "eventId:", eventId, "provided:", !!data.eventId);
  firePixelEvent(eventName, data, eventId);
  await fireCAPI(eventName, data, eventId);
};
