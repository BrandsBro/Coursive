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
  window.fbq("track", eventName, Object.keys(pixelData).length ? pixelData : data, { eventID: eventId });
};

export const fireCAPI = async (eventName, data = {}, eventId) => {
  try {
    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return match ? match[2] : undefined;
    };

    let fbc = getCookie("_fbc");
    if (!fbc) {
      const urlParams = new URLSearchParams(window.location.search);
      const fbclid = urlParams.get("fbclid");
      if (fbclid) {
        const ts = Math.floor(Date.now() / 1000);
        fbc = `fb.1.${ts}.${fbclid}`;
      }
    }

    let externalId, email, name;
    try {
      externalId = localStorage.getItem("user_id") || undefined;
      email = localStorage.getItem("user_email") || undefined;
      name = localStorage.getItem("user_name") || undefined;
    } catch(e) {}

    console.log("[Meta Server CAPI]", eventName, "eventId:", eventId);

    await fetch("/api/meta/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventId,
        fbp: getCookie("_fbp"),
        fbc,
        externalId,
        email: data.email || email,
        name: data.name || name,
        clientUserAgent: navigator.userAgent,
        ...data,
      }),
    });
  } catch(e) { console.error("CAPI error:", e); }
};

export const trackEvent = async (eventName, data = {}) => {
  const eventId = genEventId();
  firePixelEvent(eventName, data, eventId);
  // Small delay to ensure fbp cookie is set by pixel before CAPI fires
  setTimeout(() => fireCAPI(eventName, data, eventId), 300);
};
