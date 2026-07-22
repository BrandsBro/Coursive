export const genEventId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

export const firePixelEvent = (eventName, data = {}, eventId) => {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", eventName, data, { eventID: eventId });
};

export const fireCAPI = async (eventName, data = {}, eventId) => {
  try {
    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return match ? match[2] : undefined;
    };

    // Get fbc from cookie or URL param
    let fbc = getCookie("_fbc");
    if (!fbc) {
      const urlParams = new URLSearchParams(window.location.search);
      const fbclid = urlParams.get("fbclid");
      if (fbclid) {
        const ts = Math.floor(Date.now() / 1000);
        fbc = `fb.1.${ts}.${fbclid}`;
      }
    }

    // Get external_id from localStorage if user is logged in
    let externalId;
    try { externalId = localStorage.getItem("user_id") || undefined; } catch(e) {}

    await fetch("/api/meta/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventId,
        fbp: getCookie("_fbp"),
        fbc,
        externalId,
        clientUserAgent: navigator.userAgent,
        ...data,
      }),
    });
  } catch(e) { console.error("CAPI error:", e); }
};

export const trackEvent = async (eventName, data = {}) => {
  const eventId = genEventId();
  firePixelEvent(eventName, data, eventId);
  await fireCAPI(eventName, data, eventId);
};
