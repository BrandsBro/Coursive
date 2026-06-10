"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Image as ImageIcon, Film, Music, Trash2, Check, Search, Loader } from "lucide-react";
import { supabase } from "@/lib/supabase";

const FILTERS = [
  { key:"all",   label:"All",    icon:null },
  { key:"image", label:"Images", icon:<ImageIcon size={13}/> },
  { key:"video", label:"Videos", icon:<Film size={13}/> },
  { key:"audio", label:"Audio",  icon:<Music size={13}/> },
];

const ACCEPT = {
  image: "image/*",
  video: "video/*",
  audio: "audio/*",
  all:   "image/*,video/*,audio/*",
};

export default function MediaLibrary({ accept = "all", onSelect, onClose }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filter, setFilter] = useState(accept === "all" ? "all" : accept);
  const [search, setSearch] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef();

  useEffect(() => { loadMedia(); }, []);

  const loadMedia = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("media_library")
      .select("*")
      .order("created_at", { ascending: false });
    setMedia(data || []);
    setLoading(false);
  };

  const detectType = (file) => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    return "image";
  };

  const handleFiles = async (files) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploading(true);

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      setProgress(Math.round(((i) / list.length) * 100));

      const type = detectType(file);
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `uploads/${Date.now()}-${safeName}`;

      // Upload to storage
      const { error: upErr } = await supabase.storage
        .from("lesson-media")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (upErr) { alert(`Upload failed: ${upErr.message}`); continue; }

      const { data: urlData } = supabase.storage.from("lesson-media").getPublicUrl(path);

      // Save to media library
      const { data: row } = await supabase.from("media_library").insert({
        url: urlData.publicUrl,
        filename: file.name,
        file_type: type,
        mime_type: file.type,
        size_bytes: file.size,
      }).select().single();

      if (row) setMedia(prev => [row, ...prev]);
    }

    setProgress(100);
    setTimeout(() => { setUploading(false); setProgress(0); }, 400);
  };

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    if (!confirm(`Delete "${item.filename}"? This can't be undone.`)) return;
    await supabase.from("media_library").delete().eq("id", item.id);
    setMedia(prev => prev.filter(m => m.id !== item.id));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const filtered = media.filter(m => {
    const matchType = filter === "all" || m.file_type === filter;
    const matchSearch = !search || m.filename.toLowerCase().includes(search.toLowerCase());
    // Also respect the accept prop — if accept is specific, only show that type
    const matchAccept = accept === "all" || m.file_type === accept;
    return matchType && matchSearch && matchAccept;
  });

  const fmtSize = (b) => {
    if (!b) return "";
    if (b < 1024) return b + " B";
    if (b < 1048576) return (b/1024).toFixed(0) + " KB";
    return (b/1048576).toFixed(1) + " MB";
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", padding:24, background:"rgba(15,23,42,0.7)", backdropFilter:"blur(6px)" }}>
      <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:920, height:"85vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 40px 100px rgba(0,0,0,0.4)" }}>

        {/* Header */}
        <div style={{ padding:"18px 24px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <h2 style={{ fontSize:18, fontWeight:800, color:"#0f172a", margin:0 }}>Media Library</h2>
            <p style={{ fontSize:12, color:"#94A3B8", margin:"2px 0 0" }}>Upload new files or pick from your library</p>
          </div>
          <button onClick={onClose} style={{ width:36, height:36, borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <X size={18} color="#64748B"/>
          </button>
        </div>

        {/* Toolbar */}
        <div style={{ padding:"14px 24px", borderBottom:"1px solid #F1F5F9", display:"flex", gap:12, alignItems:"center", flexShrink:0 }}>
          {/* Upload button */}
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", flexShrink:0, boxShadow:"0 4px 12px rgba(124,58,237,0.35)" }}>
            {uploading ? <><Loader size={14} className="spin"/> {progress}%</> : <><Upload size={14}/> Upload from device</>}
          </button>
          <input ref={fileRef} type="file" accept={ACCEPT[accept] || ACCEPT.all} multiple onChange={e => handleFiles(e.target.files)} style={{ display:"none" }} />

          {/* Search */}
          <div style={{ position:"relative", flex:1 }}>
            <Search size={14} color="#94A3B8" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." style={{ width:"100%", paddingLeft:36, paddingRight:14, paddingTop:9, paddingBottom:9, borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box" }} />
          </div>

          {/* Type filters — only show when accept is "all" */}
          {accept === "all" && (
            <div style={{ display:"flex", gap:4, background:"#F1F5F9", borderRadius:10, padding:3 }}>
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 12px", borderRadius:8, border:"none", background:filter===f.key?"#fff":"transparent", color:filter===f.key?"#0f172a":"#64748B", fontSize:12, fontWeight:600, cursor:"pointer", boxShadow:filter===f.key?"0 1px 4px rgba(0,0,0,0.1)":"none" }}>
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid / dropzone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
          onDrop={onDrop}
          style={{ flex:1, overflow:"auto", padding:24, position:"relative", background:dragActive?"#F5F3FF":"#FAFBFC" }}>

          {dragActive && (
            <div style={{ position:"absolute", inset:16, border:"3px dashed #7c3aed", borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(124,58,237,0.05)", zIndex:10, pointerEvents:"none" }}>
              <div style={{ textAlign:"center" }}>
                <Upload size={40} color="#7c3aed" style={{ margin:"0 auto 12px" }}/>
                <p style={{ fontSize:16, fontWeight:800, color:"#7c3aed", margin:0 }}>Drop files to upload</p>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign:"center", padding:60, color:"#94A3B8" }}>
              <Loader size={28} className="spin" style={{ margin:"0 auto 12px" }}/>
              <p>Loading your media...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 20px" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📁</div>
              <h3 style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>
                {search ? "No files match your search" : "Your library is empty"}
              </h3>
              <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 20px" }}>
                {search ? "Try a different search term" : "Upload your first file or drag & drop here"}
              </p>
              {!search && (
                <button onClick={() => fileRef.current?.click()} style={{ padding:"10px 22px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                  + Upload File
                </button>
              )}
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:14 }}>
              {filtered.map(item => (
                <div key={item.id} onClick={() => { onSelect(item); onClose(); }} style={{ background:"#fff", borderRadius:14, border:"1.5px solid #E2E8F0", overflow:"hidden", cursor:"pointer", transition:"all 0.15s", position:"relative" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="#7c3aed"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 20px rgba(124,58,237,0.18)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>

                  {/* Preview */}
                  <div style={{ height:110, background:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
                    {item.file_type === "image" ? (
                      <img src={item.url} alt={item.filename} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    ) : item.file_type === "video" ? (
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, color:"#64748B" }}>
                        <Film size={28}/>
                        <span style={{ fontSize:10, fontWeight:600 }}>VIDEO</span>
                      </div>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, color:"#64748B" }}>
                        <Music size={28}/>
                        <span style={{ fontSize:10, fontWeight:600 }}>AUDIO</span>
                      </div>
                    )}
                    {/* Delete */}
                    <button onClick={e => handleDelete(e, item)} style={{ position:"absolute", top:6, right:6, width:26, height:26, borderRadius:7, border:"none", background:"rgba(255,255,255,0.9)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:0.85 }}>
                      <Trash2 size={13} color="#EF4444"/>
                    </button>
                  </div>

                  {/* Info */}
                  <div style={{ padding:"8px 10px" }}>
                    <p style={{ fontSize:11, fontWeight:600, color:"#0f172a", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.filename}</p>
                    <p style={{ fontSize:10, color:"#94A3B8", margin:"2px 0 0" }}>{fmtSize(item.size_bytes)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
