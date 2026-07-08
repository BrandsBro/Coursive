"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Trash2, Search, Image as ImageIcon, Film, Music, HardDrive, Loader } from "lucide-react";
import { supabase } from "@/lib/supabase";

const TYPE_ICONS = { image:<ImageIcon size={16}/>, video:<Film size={16}/>, audio:<Music size={16}/> };
const TYPE_COLORS = { image:"#059669", video:"#dc2626", audio:"#0891b2" };

export default function AdminMedia() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleting, setDeleting] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { load(); }, []);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "audio";
      const path = `uploads/${Date.now()}-${file.name}`;
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, type, filename: file.name, size: file.size, mime: file.type })
      });
      // Upload directly to storage
      const { error } = await supabase.storage.from("lesson-media").upload(path, file, { upsert: true });
      if (!error) {
        const { data: urlData } = supabase.storage.from("lesson-media").getPublicUrl(path);
        await supabase.from("media_library").insert({
          filename: file.name,
          url: urlData.publicUrl,
          file_type: type,
          mime_type: file.type,
          size_bytes: file.size,
        });
      }
    }
    setUploading(false);
    load();
  };

  const copyUrl = (url) => {
    navigator.clipboard?.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("media_library").select("*").order("created_at", { ascending:false });
    setMedia(data||[]);
    setLoading(false);
  };

  const handleDelete = async (item) => {
    setDeleting(item.id);
    try {
      const path = item.url.split("/lesson-media/")[1];
      if (path) await supabase.storage.from("lesson-media").remove([path]);
      await supabase.from("media_library").delete().eq("id", item.id);
      setMedia(prev => prev.filter(m => m.id!==item.id));
    } catch(e) { alert(e.message); }
    setDeleting(null);
  };

  const fmt = (b) => {
    if (!b) return "—";
    if (b<1024) return b+"B";
    if (b<1048576) return (b/1024).toFixed(0)+"KB";
    return (b/1048576).toFixed(1)+"MB";
  };

  const totalSize = media.reduce((s,m)=>s+(m.size_bytes||0),0);

  const filtered = media.filter(m => {
    const matchSearch = !search || m.filename.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="all" || m.file_type===filter;
    return matchSearch && matchFilter;
  });

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Media Library</h1>
            <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>{media.length} files · {fmt(totalSize)} used</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, background:"#EEF2FF", borderRadius:12, padding:"8px 14px" }}>
              <HardDrive size={16} color="#6366f1"/>
              <span style={{ fontSize:13, fontWeight:700, color:"#6366f1" }}>{fmt(totalSize)}</span>
            </div>
            <label style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 20px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
              {uploading ? <><Loader size={14} style={{ animation:"spin 0.7s linear infinite" }}/> Uploading...</> : "⬆ Upload"}
              <input type="file" multiple accept="image/*,video/*,audio/*" style={{ display:"none" }} onChange={e => handleUpload(e.target.files)} disabled={uploading}/>
            </label>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:12 }}>
          <div style={{ position:"relative", flex:1 }}>
            <Search size={14} color="#94A3B8" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search files..." style={{ width:"100%", paddingLeft:36, paddingRight:14, paddingTop:10, paddingBottom:10, borderRadius:12, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
          </div>
          <div style={{ display:"flex", gap:4, background:"#F1F5F9", borderRadius:12, padding:3 }}>
            {[["all","All"],["image","Images"],["video","Videos"],["audio","Audio"]].map(([val,label]) => (
              <button key={val} onClick={()=>setFilter(val)} style={{ padding:"7px 12px", borderRadius:9, border:"none", background:filter===val?"#fff":"transparent", color:filter===val?"#0f172a":"#64748B", fontSize:12, fontWeight:600, cursor:"pointer", boxShadow:filter===val?"0 1px 4px rgba(0,0,0,0.08)":"none" }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Drag Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
          style={{ border:`2px dashed ${dragOver?"#5B4EFF":"#E2E8F0"}`, borderRadius:16, padding:"20px", textAlign:"center", background:dragOver?"#EEF2FF":"#F8FAFC", transition:"all 0.2s", cursor:"pointer" }}
          onClick={() => document.getElementById("media-upload-input").click()}>
          <input id="media-upload-input" type="file" multiple accept="image/*,video/*,audio/*" style={{ display:"none" }} onChange={e => handleUpload(e.target.files)}/>
          {uploading ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, color:"#5B4EFF" }}>
              <Loader size={18} style={{ animation:"spin 0.7s linear infinite" }}/> 
              <span style={{ fontSize:13, fontWeight:700 }}>Uploading...</span>
            </div>
          ) : (
            <div>
              <div style={{ fontSize:28, marginBottom:6 }}>📂</div>
              <p style={{ fontSize:13, fontWeight:700, color:dragOver?"#5B4EFF":"#64748B", margin:0 }}>
                {dragOver ? "Drop to upload!" : "Drag & drop files here or click to browse"}
              </p>
              <p style={{ fontSize:11, color:"#94A3B8", margin:"4px 0 0" }}>Images, Videos, Audio</p>
            </div>
          )}
        </div>
        {/* Grid */}
        {loading ? (
          <div style={{ padding:60, textAlign:"center" }}><Loader size={24} color="#94A3B8" className="bspin"/></div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:14 }}>
            {filtered.map(item => (
              <div key={item.id} style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", overflow:"hidden", transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=TYPE_COLORS[item.file_type]||"#6366f1";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#F1F5F9";e.currentTarget.style.boxShadow="none";}}>
                {/* Preview */}
                <div style={{ height:110, background:"#F8FAFC", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
                  {item.file_type==="image" ? (
                    <img src={item.url} alt={item.filename} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"}/>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, color:TYPE_COLORS[item.file_type] }}>
                      {TYPE_ICONS[item.file_type]}
                      <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase" }}>{item.file_type}</span>
                    </div>
                  )}
                  <button onClick={()=>handleDelete(item)} disabled={deleting===item.id} style={{ position:"absolute", top:6, right:6, width:26, height:26, borderRadius:7, border:"none", background:"rgba(255,255,255,0.9)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {deleting===item.id ? <Loader size={12} className="bspin"/> : <Trash2 size={12} color="#EF4444"/>}
                  </button>
                </div>
                <div style={{ padding:"8px 10px" }}>
                  <p style={{ fontSize:11, fontWeight:600, color:"#0f172a", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.filename}</p>
                  <p style={{ fontSize:10, color:"#94A3B8", margin:"2px 0 4px" }}>{fmt(item.size_bytes)}</p>
                  <button onClick={() => copyUrl(item.url)}
                    style={{ width:"100%", padding:"5px", borderRadius:7, border:"1.5px solid #C7D2FE", background:copied===item.url?"#22c55e":"#EEF2FF", color:copied===item.url?"#fff":"#5B4EFF", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                    {copied===item.url ? "✓ Copied!" : "Copy URL"}
                  </button>
                </div>
              </div>
            ))}
            {filtered.length===0 && (
              <div style={{ gridColumn:"1/-1", padding:60, textAlign:"center", color:"#94A3B8" }}>
                <HardDrive size={32} style={{ margin:"0 auto 12px" }}/>
                <p style={{ fontSize:14, margin:0 }}>No files found</p>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
