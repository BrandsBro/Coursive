"use client";

import { useState, useRef } from "react";
import { Camera, Loader, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AvatarUpload({ user, currentAvatar, initials, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [hover, setHover] = useState(false);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      // Delete old avatar if exists
      if (currentAvatar?.includes("avatars/")) {
        const oldPath = currentAvatar.split("avatars/")[1];
        await supabase.storage.from("avatars").remove([oldPath]);
      }

      // Upload new avatar
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { cacheControl:"3600", upsert:true });

      if (upErr) throw upErr;

      // Get public URL
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      // Update profile
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);

      // Update auth metadata
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

      setPreview(publicUrl);
      onUpdate?.(publicUrl);
    } catch (err) {
      alert("Upload failed: " + err.message);
      setPreview(null);
    }
    setUploading(false);
  };

  const displayUrl = preview || currentAvatar;

  return (
    <div
      style={{ position:"relative", width:96, height:96, flexShrink:0, cursor:"pointer" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => !uploading && fileRef.current?.click()}
    >
      {/* Avatar circle */}
      <div style={{ width:96, height:96, borderRadius:"50%", overflow:"hidden", border:"3px solid #fff", boxShadow:"0 4px 16px rgba(0,0,0,0.12)" }}>
        {displayUrl ? (
          <img src={displayUrl} alt="Avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
        ) : (
          <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, fontWeight:800, color:"#fff" }}>
            {initials}
          </div>
        )}
      </div>

      {/* Hover overlay */}
      <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", opacity:hover||uploading?1:0, transition:"opacity 0.2s", border:"3px solid #fff" }}>
        {uploading
          ? <Loader size={22} color="#fff" className="bspin"/>
          : <Camera size={22} color="#fff"/>
        }
      </div>

      {/* Change label */}
      {hover && !uploading && (
        <div style={{ position:"absolute", bottom:-22, left:"50%", transform:"translateX(-50%)", background:"#0f172a", color:"#fff", fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:6, whiteSpace:"nowrap" }}>
          Change photo
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display:"none" }}/>
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
