import { useRef, useState } from "react";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const imgUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `/storage/${path}`;
};

export default function AvatarUpload({ size = 96 }) {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [hover, setHover]         = useState(false);
  const inputRef = useRef(null);

  const avatarSrc = imgUrl(user?.avatar);
  const initials  = user?.name?.charAt(0).toUpperCase() || "?";

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const { data } = await authAPI.uploadAvatar(fd);
      updateUser(data);
    } catch { alert("Failed to upload avatar."); }
    finally { setUploading(false); }
  };

  return (
    <div style={{ position: "relative", width: size, height: size, cursor: "pointer" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => inputRef.current?.click()}>

      {/* Avatar circle */}
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg, #C8622A, #e8855a)", display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid white", boxShadow: "0 8px 24px rgba(200,98,42,0.3)", transition: "all 0.3s" }}>
        {avatarSrc ? (
          <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { e.target.style.display = "none"; }} />
        ) : (
          <span style={{ fontSize: size * 0.38, fontWeight: 800, color: "#fff" }}>{initials}</span>
        )}
      </div>

      {/* Hover overlay */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.45)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: hover || uploading ? 1 : 0, transition: "opacity 0.2s" }}>
        {uploading
          ? <i className="ri-loader-4-line text-white animate-spin" style={{ fontSize: 22 }}></i>
          : <><i className="ri-camera-line text-white" style={{ fontSize: 20 }}></i>
             <span style={{ color: "#fff", fontSize: 10, marginTop: 2, fontWeight: 600 }}>Change</span></>
        }
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
