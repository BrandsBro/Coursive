const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const BASE_URL = "https://a.klaviyo.com/api";

export async function addToKlaviyoList(listId, profile) {
  try {
    const profileRes = await fetch(`${BASE_URL}/profiles/`, {
      method: "POST",
      headers: {
        "Authorization": `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        "Content-Type": "application/json",
        "revision": "2023-12-15",
      },
      body: JSON.stringify({
        data: {
          type: "profile",
          attributes: {
            email: profile.email,
            first_name: profile.firstName || "",
            last_name: profile.lastName || "",
            properties: profile.properties || {},
            subscriptions: {
              email: {
                marketing: {
                  consent: "SUBSCRIBED",
                }
              }
            }
          }
        }
      }),
    });

    let profileId;
    if (profileRes.status === 201) {
      const profileData = await profileRes.json();
      profileId = profileData.data.id;
    } else if (profileRes.status === 409) {
      const profileData = await profileRes.json();
      profileId = profileData.errors?.[0]?.meta?.duplicate_profile_id;
    }

    if (!profileId) {
      console.error("Klaviyo: Could not get profile ID, status:", profileRes.status, "body:", await profileRes.text());
      return false;
    }

    const listRes = await fetch(`${BASE_URL}/lists/${listId}/relationships/profiles/`, {
      method: "POST",
      headers: {
        "Authorization": `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        "Content-Type": "application/json",
        "revision": "2023-12-15",
      },
      body: JSON.stringify({
        data: [{ type: "profile", id: profileId }]
      }),
    });

    const listResText = await listRes.text();
    console.log("Klaviyo add to list status:", listRes.status, "body:", listResText);
    return listRes.status === 204 || listRes.status === 200;
  } catch(e) {
    console.error("Klaviyo error:", e.message);
    return false;
  }
}

export async function trackKlaviyoEvent(email, eventName, properties = {}) {
  try {
    const res = await fetch(`${BASE_URL}/events/`, {
      method: "POST",
      headers: {
        "Authorization": `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        "Content-Type": "application/json",
        "revision": "2023-12-15",
      },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            profile: { data: { type: "profile", attributes: { email } } },
            metric: { data: { type: "metric", attributes: { name: eventName } } },
            properties,
          }
        }
      }),
    });
    console.log("Klaviyo event:", eventName, "status:", res.status);
    return res.status === 202;
  } catch(e) {
    console.error("Klaviyo event error:", e.message);
    return false;
  }
}
