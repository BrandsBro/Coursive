export const genEventId = () => crypto.randomUUID();

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
    await fetch("/api/meta/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventId,
        fbp: getCookie("_fbp"),
        fbc: getCookie("_fbc"),
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
