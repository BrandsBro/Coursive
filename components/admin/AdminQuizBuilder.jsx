"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, GripVertical, Save, Check, Loader, Eye, EyeOff, Upload, Copy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const BLOCK_TYPES = [
  { type: "question_choice",    icon: "❓", label: "Choice Question",  desc: "Single choice with options",    color: "#6366f1", bg: "#EEF2FF" },
  { type: "question_challenge", icon: "🏆", label: "Challenge Choice", desc: "Bold title + image cards",      color: "#7c3aed", bg: "#F5F3FF" },
  { type: "question_icon",      icon: "🎯", label: "Icon Choice",      desc: "Options with emoji on left",    color: "#8b5cf6", bg: "#F5F3FF" },
  { type: "image_section",      icon: "🖼️", label: "Image Section",    desc: "Image with text & bullets",    color: "#059669", bg: "#ECFDF5" },
  { type: "loading",            icon: "⏳", label: "Loading Screen",   desc: "Analysis loading with reviews", color: "#0369a1", bg: "#F0F9FF" },
  { type: "summary",            icon: "📊", label: "Personal Summary", desc: "AI skills meter & insights",   color: "#d97706", bg: "#FFFBEB" },
  { type: "comparison",         icon: "⚖️", label: "Comparison",       desc: "With vs without 1Course",      color: "#dc2626", bg: "#FEF2F2" },
  { type: "signup",             icon: "👤", label: "Name + Email",     desc: "Capture user details",         color: "#15803d", bg: "#F0FDF4" },
  { type: "sales",              icon: "💰", label: "Sales Page",       desc: "Plan selection & payment",     color: "#b45309", bg: "#FFFBEB" },
];

// ─── Input Style Helper ────────────────────────────────────────────────────────
function inputStyle(extra = {}) {
  return {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 9,
    border: "1.5px solid #E2E8F0",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    background: "#fff",
    color: "#0f172a",
    display: "block",
    ...extra,
  };
}

// ─── Color Picker Helpers ──────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, "0")).join("");
}

function hsvToRgb(h, s, v) {
  const f = (n) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return { r: Math.round(f(5) * 255), g: Math.round(f(3) * 255), b: Math.round(f(1) * 255) };
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

// ─── Color Picker Component ────────────────────────────────────────────────────
function ColorPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [pos, setPos] = useState({ x: 0.7, y: 0.2 });
  const [hex, setHex] = useState(value || "#5B4EFF");
  const canvasRef = useRef();
  const hueRef = useRef();
  const pickerRef = useRef();
  const dragging = useRef(false);
  const draggingHue = useRef(false);

  // Sync when value prop changes from outside
  useEffect(() => {
    const color = value || "#5B4EFF";
    setHex(color);
    const rgb = hexToRgb(color);
    if (rgb) {
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setHue(hsv.h);
      setPos({ x: hsv.s, y: 1 - hsv.v });
    }
  }, [value]);

  // Close picker on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const getColorFromHSV = (h, x, y) => {
    const s = Math.max(0, Math.min(1, x));
    const v = Math.max(0, Math.min(1, 1 - y));
    const rgb = hsvToRgb(h, s, v);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  };

  const updateFromCanvas = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setPos({ x, y });
    const color = getColorFromHSV(hue, x, y);
    setHex(color);
    onChange(color);
  };

  const updateFromHue = (e) => {
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newHue = x * 360;
    setHue(newHue);
    const color = getColorFromHSV(newHue, pos.x, pos.y);
    setHex(color);
    onChange(color);
  };

  // Global mouse move/up for drag support
  useEffect(() => {
    const onMove = (e) => {
      if (dragging.current) updateFromCanvas(e);
      if (draggingHue.current) updateFromHue(e);
    };
    const onUp = () => { dragging.current = false; draggingHue.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [hue, pos]);

  const handleHexInput = (v) => {
    setHex(v);
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
      const rgb = hexToRgb(v);
      if (rgb) {
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        setHue(hsv.h);
        setPos({ x: hsv.s, y: 1 - hsv.v });
        onChange(v);
      }
    }
  };

  const hueColor = `hsl(${hue},100%,50%)`;

  return (
    <div ref={pickerRef} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", cursor: "pointer", userSelect: "none" }}
      >
        <div style={{ width: 28, height: 28, borderRadius: 6, background: hex, border: "1.5px solid rgba(0,0,0,0.1)", flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "monospace" }}>{hex}</span>
        <span style={{ fontSize: 11, color: "#94A3B8", marginLeft: "auto" }}>▾</span>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 9999, background: "#fff", borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", border: "1px solid #E2E8F0", padding: 16, width: 264 }}>
          {/* Saturation/Value canvas */}
          <div
            ref={canvasRef}
            onMouseDown={(e) => { dragging.current = true; updateFromCanvas(e); }}
            style={{ position: "relative", width: "100%", height: 164, borderRadius: 10, marginBottom: 12, cursor: "crosshair", background: hueColor, backgroundImage: "linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)", flexShrink: 0 }}
          >
            <div style={{ position: "absolute", left: `${pos.x * 100}%`, top: `${pos.y * 100}%`, width: 16, height: 16, borderRadius: "50%", border: "2.5px solid #fff", boxShadow: "0 0 0 1.5px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.3)", transform: "translate(-50%,-50%)", pointerEvents: "none", background: hex }} />
          </div>
          {/* Hue slider */}
          <div
            ref={hueRef}
            onMouseDown={(e) => { draggingHue.current = true; updateFromHue(e); }}
            style={{ position: "relative", width: "100%", height: 14, borderRadius: 999, marginBottom: 14, cursor: "pointer", background: "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" }}
          >
            <div style={{ position: "absolute", left: `${(hue / 360) * 100}%`, top: "50%", width: 18, height: 18, borderRadius: "50%", border: "2.5px solid #fff", boxShadow: "0 0 0 1.5px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.2)", transform: "translate(-50%,-50%)", pointerEvents: "none", background: hueColor }} />
          </div>
          {/* Hex input */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: hex, border: "1.5px solid #E2E8F0", flexShrink: 0 }} />
            <input
              value={hex}
              onChange={e => handleHexInput(e.target.value)}
              style={{ ...inputStyle({ fontFamily: "monospace", fontSize: 13 }) }}
              placeholder="#5B4EFF"
              spellCheck={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}{" "}
        {hint && <span style={{ color: "#94A3B8", fontWeight: 400, textTransform: "none" }}>· {hint}</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Insert Line ───────────────────────────────────────────────────────────────
function InsertLine({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: "flex", alignItems: "center", gap: 8, height: 24, opacity: hover ? 1 : 0.35, transition: "opacity 0.15s", cursor: "pointer" }}
      onClick={onClick}
    >
      <div style={{ flex: 1, height: 1, background: hover ? "#a78bfa" : "#E2E8F0" }} />
      <div style={{ width: 24, height: 24, borderRadius: "50%", border: `1.5px solid ${hover ? "#7c3aed" : "#CBD5E1"}`, background: hover ? "#7c3aed" : "#fff", color: hover ? "#fff" : "#94A3B8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Plus size={13} />
      </div>
      <div style={{ flex: 1, height: 1, background: hover ? "#a78bfa" : "#E2E8F0" }} />
    </div>
  );
}

// ─── Block Editor ──────────────────────────────────────────────────────────────
function BlockEditor({ type, content, onChange }) {
  const u = (k, v) => onChange({ ...content, [k]: v });
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  // imgMode is per-editor instance — stable because BlockEditor only mounts when isActive
  const [imgMode, setImgMode] = useState("url");

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const path = `quiz/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error } = await supabase.storage.from("lesson-media").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("lesson-media").getPublicUrl(path);
      u("imageUrl", data.publicUrl);
    } catch (e) {
      alert("Upload failed: " + e.message);
    }
    setUploading(false);
  };

  const handleOptionImageUpload = async (file, idx) => {
    if (!file) return;
    setUploading(true);
    try {
      const path = `quiz/opt-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error } = await supabase.storage.from("lesson-media").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("lesson-media").getPublicUrl(path);
      const imgs = [...(content.optionImages || [])];
      imgs[idx] = data.publicUrl;
      u("optionImages", imgs);
    } catch (e) {
      alert("Upload failed: " + e.message);
    }
    setUploading(false);
  };

  const triggerOptionImagePicker = (idx) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => handleOptionImageUpload(e.target.files[0], idx);
    input.click();
  };

  // ── Shared option-with-image editor (used by challenge + choice) ────────────
  const OptionWithImageEditor = ({ options, optionImages, setOpt, setOptImg, accentColor, accentBg, accentText }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {options.map((opt, i) => (
        <div key={i} style={{ background: "#F8FAFC", borderRadius: 12, padding: 12, border: "1.5px solid #E2E8F0" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: accentBg || "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: accentText || "#6366f1", flexShrink: 0 }}>{i + 1}</div>
            <input
              value={opt}
              onChange={e => setOpt(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              style={inputStyle({ flex: 1 })}
            />
            {options.length > 2 && (
              <button
                onClick={() => { const a = [...options]; a.splice(i, 1); u("options", a); }}
                style={{ width: 28, height: 28, borderRadius: 7, border: "1.5px solid #FEE2E2", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", flexShrink: 0 }}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", margin: "0 0 6px", textTransform: "uppercase" }}>Option image · optional</p>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => triggerOptionImagePicker(i)}
                disabled={uploading}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#fff", fontSize: 11, fontWeight: 600, color: "#374151", cursor: "pointer" }}
              >
                <Upload size={12} /> Upload
              </button>
              <input
                value={(optionImages || [])[i] || ""}
                onChange={e => setOptImg(i, e.target.value)}
                placeholder="or paste image URL..."
                style={inputStyle({ flex: 1, fontSize: 11 })}
              />
            </div>
            {(optionImages || [])[i] && (
              <div style={{ marginTop: 6, borderRadius: 8, overflow: "hidden", height: 60 }}>
                <img src={(optionImages || [])[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 10%", display: "block" }} />
              </div>
            )}
          </div>
        </div>
      ))}
      <button
        onClick={() => u("options", [...options, ""])}
        style={{ padding: "8px", borderRadius: 9, border: "1.5px dashed #E2E8F0", background: "#F8FAFC", color: "#94A3B8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
      >
        + Add option
      </button>
    </div>
  );

  // ── question_challenge ───────────────────────────────────────────────────────
  if (type === "question_challenge") {
    const options = content.options || ["", ""];
    const optionImages = content.optionImages || [];
    const setOpt = (i, v) => { const a = [...options]; a[i] = v; u("options", a); };
    const setOptImg = (i, v) => { const a = [...optionImages]; a[i] = v; u("optionImages", a); };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
     <Field label="Pre-title text" hint="shows below main title">
  <input
    value={content.preTitle || ""}
    onChange={e => u("preTitle", e.target.value)}
    placeholder="Master the AI Tools Companies Actually Use"
    style={inputStyle()}
  />
</Field>

<Field label="Pre-title line 2" hint="optional">
  <input
    value={content.preTitleLine2 || ""}
    onChange={e => u("preTitleLine2", e.target.value)}
    placeholder="18+ AI Tools • 180+ Lessons • 7+ Challenges"
    style={inputStyle()}
  />
</Field>

<Field label="Pre-title font size" hint="px">
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <input
      type="range" min={10} max={48}
      value={content.preTitleSize || 14}
      onChange={e => u("preTitleSize", parseInt(e.target.value))}
      style={{ flex: 1 }}
    />
    <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", minWidth: 32 }}>
      {content.preTitleSize || 14}px
    </span>
  </div>
</Field>
        <Field label="Question">
          <input value={content.question || ""} onChange={e => u("question", e.target.value)} placeholder="How would you describe yourself?" style={inputStyle()} />
        </Field>
        <Field label="Label bar color">
          <ColorPicker value={content.labelColor || "#5B4EFF"} onChange={v => u("labelColor", v)} />
        </Field>
        <Field label="This splits the path?">
          <select value={content.isSplit || "no"} onChange={e => u("isSplit", e.target.value)} style={inputStyle()}>
            <option value="no">No — show to all users</option>
            <option value="yes">Yes — 1st option = company, 2nd = myself</option>
          </select>
        </Field>
        <Field label="Options">
          <OptionWithImageEditor
            options={options}
            optionImages={optionImages}
            setOpt={setOpt}
            setOptImg={setOptImg}
            accentBg={content.labelColor ? `${content.labelColor}20` : "#EEF2FF"}
            accentText={content.labelColor || "#5B4EFF"}
          />
        </Field>
      </div>
    );
  }

  // ── question_choice ──────────────────────────────────────────────────────────
  if (type === "question_choice") {
    const options = content.options || ["", ""];
    const optionImages = content.optionImages || [];
    const setOpt = (i, v) => { const a = [...options]; a[i] = v; u("options", a); };
    const setOptImg = (i, v) => { const a = [...optionImages]; a[i] = v; u("optionImages", a); };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Question">
          <input value={content.question || ""} onChange={e => u("question", e.target.value)} placeholder="How would you describe yourself?" style={inputStyle()} />
        </Field>
        <Field label="Subtitle" hint="optional">
          <input value={content.subtitle || ""} onChange={e => u("subtitle", e.target.value)} placeholder="We will personalize your path" style={inputStyle()} />
        </Field>
        <Field label="This splits the path?">
          <select value={content.isSplit || "no"} onChange={e => u("isSplit", e.target.value)} style={inputStyle()}>
            <option value="no">No — show to all users</option>
            <option value="yes">Yes — 1st option = company, 2nd = myself</option>
          </select>
        </Field>
        <Field label="Label bar color">
          <ColorPicker value={content.labelColor || "#5B4EFF"} onChange={v => u("labelColor", v)} />
        </Field>
        <Field label="Label text color">
          <ColorPicker value={content.textColor || "#ffffff"} onChange={v => u("textColor", v)} />
        </Field>
        <Field label="Options">
          <OptionWithImageEditor
            options={options}
            optionImages={optionImages}
            setOpt={setOpt}
            setOptImg={setOptImg}
            accentBg="#EEF2FF"
            accentText="#6366f1"
          />
        </Field>
      </div>
    );
  }

  // ── image_section ────────────────────────────────────────────────────────────
  if (type === "image_section") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Heading">
          <input value={content.heading || ""} onChange={e => u("heading", e.target.value)} placeholder="AI is Easier Than You Think" style={inputStyle()} />
        </Field>
        <Field label="Subtext" hint="optional">
          <textarea value={content.subtext || ""} onChange={e => u("subtext", e.target.value)} style={inputStyle({ minHeight: 70, resize: "vertical" })} />
        </Field>
        <Field label="Image">
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <button
              onClick={() => setImgMode("upload")}
              style={{ flex: 1, padding: "7px", borderRadius: 8, border: `1.5px solid ${imgMode === "upload" ? "#6366f1" : "#E2E8F0"}`, background: imgMode === "upload" ? "#EEF2FF" : "#fff", fontSize: 12, fontWeight: 600, color: imgMode === "upload" ? "#6366f1" : "#64748B", cursor: "pointer" }}
            >
              📤 Upload
            </button>
            <button
              onClick={() => setImgMode("url")}
              style={{ flex: 1, padding: "7px", borderRadius: 8, border: `1.5px solid ${imgMode === "url" ? "#6366f1" : "#E2E8F0"}`, background: imgMode === "url" ? "#EEF2FF" : "#fff", fontSize: 12, fontWeight: 600, color: imgMode === "url" ? "#6366f1" : "#64748B", cursor: "pointer" }}
            >
              🔗 URL
            </button>
          </div>
          {imgMode === "upload" ? (
            <>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImageUpload(e.target.files[0])} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "2px dashed #6366f1", background: "#EEF2FF", color: "#6366f1", fontSize: 13, fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer" }}
              >
                {uploading ? "Uploading..." : content.imageUrl ? "Change image" : "Click to upload"}
              </button>
            </>
          ) : (
            <input value={content.imageUrl || ""} onChange={e => u("imageUrl", e.target.value)} placeholder="https://..." style={inputStyle()} />
          )}
          {content.imageUrl && (
            <div style={{ marginTop: 8, borderRadius: 12, overflow: "hidden", height: 100 }}>
              <img src={content.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          )}
        </Field>
        <Field label="Bullet points" hint="one per line">
          <textarea
            value={(content.bullets || []).join("\n")}
            onChange={e => u("bullets", e.target.value.split("\n"))}
            placeholder={"No prior AI knowledge required\nWork at your own pace"}
            style={inputStyle({ minHeight: 80, resize: "vertical" })}
          />
        </Field>
        <Field label="Layout">
          <select value={content.layout || "image-right"} onChange={e => u("layout", e.target.value)} style={inputStyle()}>
            <option value="image-right">Text left, Image right</option>
            <option value="image-left">Image left, Text right</option>
            <option value="image-top">Image top, Text below</option>
            <option value="fullwidth">Full width</option>
          </select>
        </Field>
      </div>
    );
  }

  // ── loading ──────────────────────────────────────────────────────────────────
  if (type === "loading") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Loading text">
          <input value={content.text || ""} onChange={e => u("text", e.target.value)} placeholder="Analyzing answers..." style={inputStyle()} />
        </Field>
        <Field label="Duration (seconds)">
          <input type="number" min={1} max={30} value={content.duration || 3} onChange={e => u("duration", parseInt(e.target.value) || 3)} style={inputStyle()} />
        </Field>
        <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>Reviews show automatically from built-in list.</p>
      </div>
    );
  }

  // ── summary ──────────────────────────────────────────────────────────────────
  if (type === "summary") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Title">
          <input value={content.title || ""} onChange={e => u("title", e.target.value)} placeholder="Your Personal Summary" style={inputStyle()} />
        </Field>
        <Field label="Subtitle">
          <input value={content.subtitle || ""} onChange={e => u("subtitle", e.target.value)} placeholder="The quiz indicates..." style={inputStyle()} />
        </Field>
        <Field label="Skill label">
          <input value={content.statLabel || ""} onChange={e => u("statLabel", e.target.value)} placeholder="A.I. Skills" style={inputStyle()} />
        </Field>
        <Field label="Insight items" hint="label|value, one per line">
          <textarea
            value={(content.items || []).join("\n")}
            onChange={e => u("items", e.target.value.split("\n"))}
            placeholder={"Your focus|Future-proofing your role\nYour pace|20 min a day"}
            style={inputStyle({ minHeight: 100, resize: "vertical" })}
          />
        </Field>
      </div>
    );
  }

  // ── comparison ───────────────────────────────────────────────────────────────
  if (type === "comparison") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Title">
          <input value={content.title || ""} onChange={e => u("title", e.target.value)} placeholder="Your Personalized A.I. Certificate Program" style={inputStyle()} />
        </Field>
        <Field label="Without 1Course" hint="one per line">
          <textarea
            value={(content.without || []).join("\n")}
            onChange={e => u("without", e.target.value.split("\n"))}
            placeholder={"No time to get started\nNo recognized credential"}
            style={inputStyle({ minHeight: 80, resize: "vertical" })}
          />
        </Field>
        <Field label="With 1Course" hint="one per line">
          <textarea
            value={(content.with || []).join("\n")}
            onChange={e => u("with", e.target.value.split("\n"))}
            placeholder={"Clear, step-by-step path\nShareable AI credential"}
            style={inputStyle({ minHeight: 80, resize: "vertical" })}
          />
        </Field>
      </div>
    );
  }

  // ── signup ───────────────────────────────────────────────────────────────────
  if (type === "signup") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Heading">
          <input value={content.heading || ""} onChange={e => u("heading", e.target.value)} placeholder="Your A.I. Program is Ready!" style={inputStyle()} />
        </Field>
        <Field label="Subtext">
          <input value={content.subtext || ""} onChange={e => u("subtext", e.target.value)} placeholder="Enter your details to continue" style={inputStyle()} />
        </Field>
      </div>
    );
  }

  // ── sales ────────────────────────────────────────────────────────────────────
  if (type === "sales") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Heading">
          <input value={content.heading || ""} onChange={e => u("heading", e.target.value)} placeholder="Your Personalized A.I. Certificate Program is Ready!" style={inputStyle()} />
        </Field>
        <Field label="Plans" hint="name|price|originalPrice, one per line">
          <textarea
            value={(content.plans || []).join("\n")}
            onChange={e => u("plans", e.target.value.split("\n"))}
            placeholder={"1-Week Plan|6.93|13.86\n4-Week Plan|19.99|39.99\n12-Week Plan|39.99|79.99"}
            style={inputStyle({ minHeight: 80, resize: "vertical" })}
          />
        </Field>
        <Field label="Legal text" hint="use {price}, {plan}">
          <textarea
            value={content.legalText || ""}
            onChange={e => u("legalText", e.target.value)}
            placeholder="By clicking Get My Plan, I agree to pay {price} for my {plan}..."
            style={inputStyle({ minHeight: 100, resize: "vertical" })}
          />
        </Field>
      </div>
    );
  }

  // ── question_icon ────────────────────────────────────────────────────────────
  if (type === "question_icon") {
    const options = content.options || [{ label: "", emoji: "" }, { label: "", emoji: "" }];
    const setOpt = (i, k, v) => { const a = [...options]; a[i] = { ...a[i], [k]: v }; u("options", a); };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Question">
          <input value={content.question || ""} onChange={e => u("question", e.target.value)} placeholder="What do you want AI to help you with?" style={inputStyle()} />
        </Field>
        <Field label="Subtitle" hint="optional">
          <input value={content.subtitle || ""} onChange={e => u("subtitle", e.target.value)} placeholder="Choose your main use case" style={inputStyle()} />
        </Field>
        <Field label="Options">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {options.map((opt, i) => (
              <div key={i} style={{ background: "#F8FAFC", borderRadius: 12, padding: 12, border: "1.5px solid #E2E8F0" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#8b5cf6", flexShrink: 0 }}>{i + 1}</div>
                  <input
                    value={opt.emoji || ""}
                    onChange={e => setOpt(i, "emoji", e.target.value)}
                    placeholder="✍️"
                    style={inputStyle({ width: 60, textAlign: "center", fontSize: 20 })}
                  />
                  <input
                    value={opt.label || ""}
                    onChange={e => setOpt(i, "label", e.target.value)}
                    placeholder="Option text"
                    style={inputStyle({ flex: 1 })}
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => { const a = [...options]; a.splice(i, 1); u("options", a); }}
                      style={{ width: 28, height: 28, borderRadius: 7, border: "1.5px solid #FEE2E2", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", flexShrink: 0 }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              onClick={() => u("options", [...options, { label: "", emoji: "" }])}
              style={{ padding: "8px", borderRadius: 9, border: "1.5px dashed #E2E8F0", background: "#F8FAFC", color: "#94A3B8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              + Add option
            </button>
          </div>
        </Field>
      </div>
    );
  }

  return null;
}

// ─── Block Preview ─────────────────────────────────────────────────────────────
function BlockPreview({ block, idx, isActive, onClick }) {
  const def = BLOCK_TYPES.find(b => b.type === block.type) || { icon: "❓", label: "Unknown", color: "#64748B", bg: "#F8FAFC" };
  const c = block.content || {};

  const renderPreview = () => {
    switch (block.type) {

  case "question_challenge": {
  const opts = (c.options || []).filter(Boolean);
  const imgs = c.optionImages || [];
  const hasImgs = imgs.some(Boolean);
  const labelColor = c.labelColor || "#5B4EFF";
  return (
    <div>
      {c.challengeTitle && (
        <h3 style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", margin: "0 0 6px", letterSpacing: "0.3px" }}>{c.challengeTitle}</h3>
      )}
      {(c.preTitle || c.preTitleLine2) && (
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          {c.preTitle && (
            <p style={{ fontSize: c.preTitleSize || 14, color: "#374151", margin: "0 0 2px", lineHeight: 1.4, fontWeight: 700 }}>
              {c.preTitle}
            </p>
          )}
          {c.preTitleLine2 && (
            <p style={{ fontSize: (c.preTitleSize || 14) - 2, color: "#64748B", margin: 0, lineHeight: 1.4 }}>
              {c.preTitleLine2}
            </p>
          )}
        </div>
      )}
      <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 10px" }}>{c.question || "Question"}</p>
  
            <div style={{ display: "grid", gridTemplateColumns: hasImgs && opts.length === 2 ? "1fr 1fr" : "1fr", gap: 10 }}>
              {opts.map((opt, i) => (
  <div key={i} style={{ borderRadius: 12, border: "1.5px solid #E2E8F0", overflow: "hidden", background: "#F1F5F9", display: "flex", flexDirection: "column" }}>
    {imgs[i] && (
      <div style={{ height: 90, overflow: "hidden", flexShrink: 0 }}>
        <img src={imgs[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 10%", display: "block" }} />
      </div>
    )}
    <div style={{ padding: "8px 10px", background: labelColor, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {typeof opt === "object" ? opt.label || "" : opt}
      </span>
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ color: "#fff", fontSize: 10 }}>›</span>
      </div>
    </div>
  </div>
))}
            </div>
          </div>
        );
      }

      case "question_choice": {
        const opts = (c.options || []).filter(Boolean);
        const imgs = c.optionImages || [];
        const hasImgs = imgs.some(Boolean);
        const labelColor = c.labelColor || "#5B4EFF";
        const textColor = c.textColor || "#ffffff";
        return (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{c.question || "Question"}</h3>
            {c.subtitle && <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 12px" }}>{c.subtitle}</p>}
            <div style={{ display: "grid", gridTemplateColumns: hasImgs && opts.length === 2 ? "1fr 1fr" : "1fr", gap: 10 }}>
              {opts.map((opt, i) => (
                <div key={i} style={{ borderRadius: 12, border: "1.5px solid #E2E8F0", overflow: "hidden", background: "#F1F5F9", display: "flex", flexDirection: "column" }}>
                  {imgs[i] && (
                    <div style={{ height: 90, overflow: "hidden", flexShrink: 0 }}>
                      <img src={imgs[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 10%", display: "block" }} />
                    </div>
                  )}
                  <div style={{ padding: "8px 10px", background: labelColor, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: textColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{opt}</span>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: textColor, fontSize: 10 }}>›</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "question_icon": {
        const opts = c.options || [];
        return (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{c.question || "Icon Choice Question"}</h3>
            {c.subtitle && <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 10px" }}>{c.subtitle}</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {opts.slice(0, 3).map((opt, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#F8FAFC", borderRadius: 12, border: "1.5px solid #E2E8F0" }}>
                  <span style={{ fontSize: 24, width: 40, textAlign: "center" }}>{opt.emoji || "•"}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{opt.label || `Option ${i + 1}`}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "image_section":
        return (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>{c.heading || "Image Section"}</h3>
            {c.subtext && <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 10px" }}>{c.subtext}</p>}
            {c.imageUrl && <img src={c.imageUrl} alt="" style={{ width: "100%", borderRadius: 10, display: "block", marginBottom: 8 }} />}
            {(c.bullets || []).filter(Boolean).map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid #F1F5F9" }}>
                <span style={{ color: "#5B4EFF", fontSize: 12 }}>✓</span>
                <span style={{ fontSize: 12, color: "#374151" }}>{b}</span>
              </div>
            ))}
          </div>
        );

      case "loading":
        return (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", border: "4px solid #EEF2FF", borderTopColor: "#5B4EFF", margin: "0 auto 12px", animation: "bspin 0.7s linear infinite" }} />
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>{c.text || "Analyzing..."}</p>
            <p style={{ fontSize: 11, color: "#94A3B8", margin: "4px 0 0" }}>Duration: {c.duration || 3}s</p>
          </div>
        );

      case "summary":
        return (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{c.title || "Personal Summary"}</h3>
            {c.subtitle && <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 10px" }}>{c.subtitle}</p>}
            <div style={{ background: "#F8FAFC", borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", margin: "0 0 4px" }}>{c.statLabel || "AI Skills"}</p>
              <div style={{ height: 8, borderRadius: 999, background: "linear-gradient(to right,#ef4444,#f59e0b,#22c55e)" }} />
            </div>
            {(c.items || []).filter(Boolean).map((item, i) => {
              const [label, val] = item.split("|");
              return (
                <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid #F1F5F9" }}>
                  <span style={{ fontSize: 11, color: "#94A3B8", flex: 1 }}>{label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>{val}</span>
                </div>
              );
            })}
          </div>
        );

      case "comparison":
        return (
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", margin: "0 0 10px" }}>{c.title || "Comparison"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ borderRadius: 10, border: "1.5px solid #FEE2E2", overflow: "hidden" }}>
                <div style={{ padding: "6px 10px", background: "#FEF2F2" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#991B1B", margin: 0 }}>Without 1Course</p>
                </div>
                <div style={{ padding: 8 }}>
                  {(c.without || []).filter(Boolean).slice(0, 3).map((item, i) => (
                    <p key={i} style={{ fontSize: 10, color: "#374151", margin: "0 0 4px" }}>• {item}</p>
                  ))}
                </div>
              </div>
              <div style={{ borderRadius: 10, border: "1.5px solid #BBF7D0", overflow: "hidden" }}>
                <div style={{ padding: "6px 10px", background: "#F0FDF4" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#166534", margin: 0 }}>With 1Course</p>
                </div>
                <div style={{ padding: 8 }}>
                  {(c.with || []).filter(Boolean).slice(0, 3).map((item, i) => (
                    <p key={i} style={{ fontSize: 10, color: "#374151", margin: "0 0 4px" }}>✓ {item}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "signup":
        return (
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{c.heading || "Name + Email"}</h3>
            {c.subtext && <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 10px" }}>{c.subtext}</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ padding: "10px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#F8FAFC", fontSize: 12, color: "#94A3B8" }}>Full Name</div>
              <div style={{ padding: "10px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#F8FAFC", fontSize: 12, color: "#94A3B8" }}>Email Address</div>
            </div>
          </div>
        );

      case "sales": {
        const plans = (c.plans || []).filter(Boolean).map(p => {
          const parts = p.split("|");
          return { name: parts[0], price: parts[1], originalPrice: parts[2] };
        });
        return (
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", margin: "0 0 10px" }}>{c.heading || "Sales Page"}</h3>
            {plans.map((plan, i) => (
              <div key={i} style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${i === 1 ? "#5B4EFF" : "#E2E8F0"}`, background: i === 1 ? "#EEF2FF" : "#F8FAFC", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{plan.name}</span>
                  <span style={{ background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 999 }}>50% OFF</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {plan.originalPrice && <span style={{ fontSize: 11, color: "#94A3B8", textDecoration: "line-through" }}>${plan.originalPrice}</span>}
                  <span style={{ fontSize: 13, fontWeight: 900, color: "#5B4EFF" }}>${plan.price}</span>
                </div>
              </div>
            ))}
            <div style={{ padding: "10px", borderRadius: 10, background: "linear-gradient(135deg,#5B4EFF,#8B5CF6)", textAlign: "center", marginTop: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>GET MY PLAN →</span>
            </div>
          </div>
        );
      }

      default:
        return <p style={{ fontSize: 12, color: "#94A3B8" }}>No preview available</p>;
    }
  };

  return (
    <div
      onClick={onClick}
      style={{ background: "#fff", borderRadius: 16, border: `1.5px solid ${isActive ? "#6366f1" : "#F1F5F9"}`, padding: 16, cursor: "pointer", transition: "all 0.15s", boxShadow: isActive ? "0 4px 16px rgba(99,102,241,0.15)" : "none" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 14 }}>{def.icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: def.color }}>{idx + 1}. {def.label}</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#94A3B8", background: "#F8FAFC", padding: "2px 8px", borderRadius: 999 }}>
          {block.path === "all" ? "All" : block.path === "company" ? "Company" : "Myself"}
        </span>
      </div>
      {renderPreview()}
    </div>
  );
}

// ─── Sortable Block ────────────────────────────────────────────────────────────
function SortableBlock({ block, idx, isActive, onToggle, onChange, onPathChange, onDelete, onDuplicate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const def = BLOCK_TYPES.find(b => b.type === block.type) || { icon: "❓", label: "Unknown", color: "#64748B", bg: "#F8FAFC" };
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: "#fff", borderRadius: 16, border: `1.5px solid ${isActive ? def.color + "60" : "#E2E8F0"}`, overflow: "hidden", marginBottom: 2, boxShadow: isActive ? `0 4px 20px ${def.color}15` : "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", background: isActive ? def.bg : "#fff" }}>
        <button {...attributes} {...listeners} style={{ cursor: "grab", border: "none", background: "none", padding: 2, display: "flex", touchAction: "none" }}>
          <GripVertical size={16} color="#CBD5E1" />
        </button>
        <span style={{ fontSize: 18 }}>{def.icon}</span>
        <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={onToggle}>
          <p style={{ fontSize: 13, fontWeight: 700, color: def.color, margin: 0 }}>{idx + 1}. {def.label}</p>
          <p style={{ fontSize: 11, color: "#94A3B8", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {block.content?.challengeTitle || block.content?.question || block.content?.title || block.content?.heading || block.content?.text || "Click to edit"}
          </p>
        </div>
        <select
          value={block.path || "all"}
          onChange={e => onPathChange(e.target.value)}
          onClick={e => e.stopPropagation()}
          style={{ padding: "4px 8px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 11, fontWeight: 600, color: "#64748B", background: "#fff" }}
        >
          <option value="all">All users</option>
          <option value="company">Company only</option>
          <option value="myself">Myself only</option>
        </select>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={onDuplicate}
            style={{ width: 26, height: 26, borderRadius: 7, border: "1.5px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}
          >
            <Copy size={12} />
          </button>
          <button
            onClick={onDelete}
            style={{ width: 26, height: 26, borderRadius: 7, border: "1.5px solid #FEE2E2", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {isActive && (
        <div style={{ padding: "4px 14px 16px", borderTop: `1px solid ${def.color}20` }}>
          <BlockEditor type={block.type} content={block.content} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

// ─── Default Content ───────────────────────────────────────────────────────────
function getDefaultContent(type) {
  switch (type) {
    case "question_choice":
      return { question: "", subtitle: "", options: ["Option 1", "Option 2"], optionImages: [], isSplit: "no", labelColor: "#5B4EFF", textColor: "#ffffff" };
    case "question_challenge":
      return {preTitle: "", preTitleSize: 14,    challengeTitle: "28-DAY AI CHALLENGE", preTitleLine2: "",question: "How would you describe yourself?", options: ["Option 1", "Option 2"], optionImages: [], isSplit: "yes", labelColor: "#5B4EFF" };
    case "question_icon":
      return { question: "", subtitle: "", options: [{ label: "Option 1", emoji: "✍️" }, { label: "Option 2", emoji: "📊" }] };
    case "image_section":
      return { heading: "", subtext: "", imageUrl: "", bullets: [], layout: "image-right" };
    case "loading":
      return { text: "Analyzing answers to personalize your A.I. Certificate Program...", duration: 3 };
    case "summary":
      return { title: "Your Personal Summary", subtitle: "The quiz indicates that what held you back is time, not capability", statLabel: "A.I. Skills", items: ["Your focus|Future-proofing your role", "Your readiness|Ready to learn online", "Your pace|20 min a day", "Learning experience|Self-taught so far"] };
    case "comparison":
      return { title: "Your Personalized A.I. Certificate Program", without: ["No time to get started", "No recognized credential", "A.I. feels hard to use", "Invisible to employers"], with: ["Clear, step-by-step path", "Shareable A.I. credential", "Reliable results from A.I.", "Stand out from other workers"] };
    case "signup":
      return { heading: "Your A.I. Program is Ready!", subtext: "Enter your details to continue" };
    case "sales":
      return { heading: "Your Personalized A.I. Certificate Program is Ready!", plans: ["1-Week Plan|6.93|13.86", "4-Week Plan|19.99|39.99", "12-Week Plan|39.99|79.99"], legalText: "" };
    default:
      return {};
  }
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminQuizBuilder() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [insertIdx, setInsertIdx] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("quiz_blocks").select("*").order("order_index");
    setBlocks((data || []).map(b => ({ ...b, content: b.content || {} })));
    setLoading(false);
  };

  const addBlock = (type) => {
    const block = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      content: getDefaultContent(type),
      order_index: insertIdx !== null ? insertIdx : blocks.length,
      path: "all",
      isNew: true,
    };
    if (insertIdx !== null) {
      const next = [...blocks];
      next.splice(insertIdx, 0, block);
      setBlocks(next);
    } else {
      setBlocks(prev => [...prev, block]);
    }
    setActiveId(block.id);
    setShowPicker(false);
    setInsertIdx(null);
  };

  const updateBlock = (id, content) =>
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));

  const updatePath = (id, path) =>
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, path } : b));

  const deleteBlock = async (id) => {
    if (!id.startsWith("new-")) await supabase.from("quiz_blocks").delete().eq("id", id);
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const duplicateBlock = (id) => {
    const idx = blocks.findIndex(b => b.id === id);
    const orig = blocks[idx];
    const copy = {
      ...orig,
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      content: JSON.parse(JSON.stringify(orig.content)),
      isNew: true,
    };
    const next = [...blocks];
    next.splice(idx + 1, 0, copy);
    setBlocks(next);
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex(b => b.id === active.id);
    const newIdx = blocks.findIndex(b => b.id === over.id);
    setBlocks(arrayMove(blocks, oldIdx, newIdx));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const row = { type: b.type, content: b.content, order_index: i, path: b.path || "all" };
        if (b.isNew || b.id.startsWith("new-")) {
          const { data } = await supabase.from("quiz_blocks").insert(row).select().single();
          if (data) setBlocks(prev => prev.map(x => x.id === b.id ? { ...data, content: data.content || {} } : x));
        } else {
          await supabase.from("quiz_blocks").update(row).eq("id", b.id);
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await load();
    } catch (e) {
      alert("Save error: " + e.message);
    }
    setSaving(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F9", display: "flex", flexDirection: "column" }}>
      {/* ── Top bar ── */}
      <div style={{ background: "#0f172a", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => window.history.back()}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            ← Back
          </button>
          <div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 1px" }}>QUIZ BUILDER</p>
            <h1 style={{ color: "#fff", fontSize: 15, fontWeight: 800, margin: 0 }}>Quiz Flow</h1>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{blocks.length} block{blocks.length !== 1 ? "s" : ""}</span>
          <a
            href="/quiz"
            target="_blank"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
          >
            <Eye size={14} /> Live Quiz
          </a>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: previewMode ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.06)", color: previewMode ? "#a78bfa" : "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            {previewMode ? <EyeOff size={14} /> : <Eye size={14} />}
            {previewMode ? "Editing" : "Full Preview"}
          </button>
          <button
            onClick={saveAll}
            disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 10, border: "none", background: saved ? "#22c55e" : "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}
          >
            {saving ? (
              <><Loader size={14} style={{ animation: "bspin 0.7s linear infinite" }} /> Saving...</>
            ) : saved ? (
              <><Check size={14} /> Saved!</>
            ) : (
              <><Save size={14} /> Save</>
            )}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: editor panel */}
        {!previewMode && (
          <div style={{ flex: 1, overflow: "auto", padding: "24px 28px", borderRight: "1px solid #E2E8F0" }}>
            <div style={{ maxWidth: 580, margin: "0 auto" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                  <Loader size={28} color="#94A3B8" style={{ animation: "bspin 0.7s linear infinite" }} />
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <InsertLine onClick={() => { setInsertIdx(0); setShowPicker(true); }} />
                  <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    {blocks.map((block, idx) => (
                      <div key={block.id}>
                        <SortableBlock
                          block={block}
                          idx={idx}
                          isActive={activeId === block.id}
                          onToggle={() => setActiveId(activeId === block.id ? null : block.id)}
                          onChange={c => updateBlock(block.id, c)}
                          onPathChange={p => updatePath(block.id, p)}
                          onDelete={() => deleteBlock(block.id)}
                          onDuplicate={() => duplicateBlock(block.id)}
                        />
                        <InsertLine onClick={() => { setInsertIdx(idx + 1); setShowPicker(true); }} />
                      </div>
                    ))}
                  </SortableContext>
                  {blocks.length === 0 && (
                    <div style={{ textAlign: "center", padding: "48px 20px", background: "#fff", borderRadius: 20, border: "2px dashed #CBD5E1", marginTop: 8 }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>🧩</div>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Build your quiz flow</h3>
                      <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 20px" }}>Add questions, image sections, loading screens, summary, comparison, signup and sales</p>
                      <button
                        onClick={() => { setInsertIdx(0); setShowPicker(true); }}
                        style={{ padding: "11px 26px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                      >
                        + Add First Block
                      </button>
                    </div>
                  )}
                </DndContext>
              )}
            </div>
          </div>
        )}

        {/* Right: preview panel */}
        <div style={{ flex: previewMode ? 1 : "0 0 42%", overflow: "auto", padding: "24px 28px", background: previewMode ? "#fff" : "#FAFBFC" }}>
          <div style={{ maxWidth: previewMode ? 640 : 420, margin: "0 auto" }}>
            {!previewMode && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, padding: "8px 14px", background: "#EEF2FF", borderRadius: 10 }}>
                <Eye size={13} color="#6366f1" />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#6366f1" }}>Live Preview</span>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {blocks.map((block, idx) => (
                <BlockPreview
                  key={block.id}
                  block={block}
                  idx={idx}
                  isActive={activeId === block.id}
                  onClick={() => setActiveId(block.id)}
                />
              ))}
              {blocks.length === 0 && (
                <p style={{ textAlign: "center", color: "#CBD5E1", padding: 40, fontSize: 14 }}>Your quiz preview appears here</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Block type picker modal ── */}
      {showPicker && (
        <div
          onClick={() => setShowPicker(false)}
          style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 24, padding: 24, width: "100%", maxWidth: 620, boxShadow: "0 32px 80px rgba(0,0,0,0.3)" }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Add a block</h3>
            <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 20px" }}>Choose what to add to your quiz flow</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {BLOCK_TYPES.map(def => (
                <button
                  key={def.type}
                  onClick={() => addBlock(def.type)}
                  style={{ padding: "16px 12px", borderRadius: 14, border: `1.5px solid ${def.color}25`, background: def.bg, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = def.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = `${def.color}25`; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <span style={{ fontSize: 26 }}>{def.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: def.color }}>{def.label}</span>
                  <span style={{ fontSize: 10, color: "#94A3B8", textAlign: "center", lineHeight: 1.3 }}>{def.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes bspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
