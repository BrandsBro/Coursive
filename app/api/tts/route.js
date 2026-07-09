import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function cleanText(text) {
  return text
    .replace(/\bAI\b/g, "A.I.")
    .replace(/\bUI\b/g, "U.I.")
    .replace(/\bAPI\b/g, "A.P.I.")
    .replace(/\bURL\b/g, "U.R.L.")
    .replace(/\bHTML\b/g, "H.T.M.L.")
    .replace(/\bCSS\b/g, "C.S.S.")
    .replace(/\bCRM\b/g, "C.R.M.")
    .replace(/\bSEO\b/g, "S.E.O.")
    .replace(/\bCTA\b/g, "C.T.A.")
    .replace(/\bGPT\b/g, "G.P.T.")
    .replace(/\bLLM\b/g, "L.L.M.")
    .replace(/\bSaaS\b/g, "sass")
    .replace(/\bCanva\b/g, "Can-va")
    .replace(/\bMidjourney\b/g, "Mid-journey");
}

function getCacheKey(text) {
  // Simple hash of text for cache key
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `tts-cache/${Math.abs(hash)}.mp3`;
}

export async function POST(req) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "No text" }, { status: 400 });
    
    const cleaned = cleanText(text.slice(0, 5000));
    const cacheKey = getCacheKey(cleaned);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Check cache first
    const { data: cachedFile } = await supabase.storage
      .from("lesson-media")
      .download(cacheKey);

    if (cachedFile) {
      // Return cached audio
      const buffer = await cachedFile.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400",
          "X-Cache": "HIT",
        },
      });
    }

    // Generate new audio from ElevenLabs
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb", {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: cleaned,
        model_id: "eleven_multilingual_v2",
        output_format: "mp3_44100_128",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("ElevenLabs error:", err);
      return NextResponse.json({ error: err.detail?.message || "TTS failed" }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();

    // Save to cache in background
    supabase.storage
      .from("lesson-media")
      .upload(cacheKey, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      })
      .then(() => console.log("TTS cached:", cacheKey))
      .catch(e => console.error("TTS cache error:", e));

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
        "X-Cache": "MISS",
      },
    });
  } catch (e) {
    console.error("TTS error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
