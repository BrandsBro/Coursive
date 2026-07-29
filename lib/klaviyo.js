const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const BASE_URL = "https://a.klaviyo.com/api";

export async function addToKlaviyoList(listId, profile) {
  try {
    // Create/update profile
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
    } else {
      const body = await profileRes.text();
      console.error("Klaviyo profile error:", profileRes.status, body.slice(0,300));
      return false;
    }

    if (!profileId) {
      console.error("Klaviyo: No profile ID");
      return false;
    }

    // Subscribe profile to email marketing
    await fetch(`${BASE_URL}/profile-subscription-bulk-create-jobs/`, {
      method: "POST",
      headers: {
        "Authorization": `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        "Content-Type": "application/json",
        "revision": "2023-12-15",
      },
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            profiles: {
              data: [{
                type: "profile",
                id: profileId,
                attributes: {
                  email: profile.email,
                  subscriptions: {
                    email: { marketing: { consent: "SUBSCRIBED" } }
                  }
                }
              }]
            }
          },
          relationships: {
            list: { data: { type: "list", id: listId } }
          }
        }
      }),
    });

    // Add to list
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

    console.log("Klaviyo list add status:", listRes.status);
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
    console.log("Klaviyo event status:", res.status);
    return res.status === 202;
  } catch(e) {
    console.error("Klaviyo event error:", e.message);
    return false;
  }
}
