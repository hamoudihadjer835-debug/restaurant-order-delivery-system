import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import AvatarUpload from "../../components/AvatarUpload";

const BADGES = {
  "VIP Customer": { color: "#7c3aed", bg: "#ede9fe", icon: "ri-vip-crown-fill" },
  "Regular":      { color: "#0369a1", bg: "#e0f2fe", icon: "ri-medal-line" },
  "Loyal":        { color: "#15803d", bg: "#dcfce7", icon: "ri-heart-line" },
  "New Customer": { color: "#92400e", bg: "#fef3c7", icon: "ri-star-line" },
};

const Stars = ({ rating }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1,2,3,4,5].map(n => (
      <i key={n} className={`ri-star-${n <= rating ? "fill" : "line"}`}
        style={{ fontSize: 13, color: n <= rating ? "#f59e0b" : "#d1d5db" }}></i>
    ))}
  </div>
);

export default function CustomerProfile() {
  const { user, updateUser } = useAuth();
  const [stats, setStats]   = useState(null);
  const [form, setForm]     = useState({ name: user?.name||"", phone: user?.phone||"", address: user?.address||"" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [tab, setTab]       = useState("info");

  useEffect(() => {
    authAPI.getStats().then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data); setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { alert("Failed to update."); }
    finally { setSaving(false); }
  };

  const badge = BADGES[stats?.badge] || BADGES["New Customer"];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      {/* Hero card */}
      <div className="card overflow-hidden mb-5">
        {/* Banner */}
        <div style={{ height: 100, background: "linear-gradient(135deg, #C8622A 0%, #e8855a 50%, #f5c49e 100%)", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)" }} />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar overlapping banner */}
          <div style={{ marginTop: -48, marginBottom: 16, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <AvatarUpload size={96} />
            {stats?.badge && (
              <span style={{ background: badge.bg, color: badge.color, padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                <i className={badge.icon}></i> {stats.badge}
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
          <p className="text-gray-400 text-sm mt-0.5">{user?.email}</p>
          {stats?.member_since && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <i className="ri-calendar-line"></i>
              Member since {new Date(stats.member_since).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { icon: "ri-shopping-bag-line",       color: "bg-primary/10 text-primary",    label: "Total Orders",  value: stats.total_orders },
            { icon: "ri-money-dollar-circle-line", color: "bg-green-100 text-green-700",   label: "Total Spent",   value: `${stats.total_spent} دج` },
            { icon: "ri-check-double-line",        color: "bg-blue-100 text-blue-700",     label: "Delivered",     value: stats.delivered },
            { icon: "ri-close-circle-line",        color: "bg-red-100 text-red-600",       label: "Cancelled",     value: stats.cancelled },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${s.color}`}>
                <i className={`${s.icon} text-lg`}></i>
              </div>
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Favorite item */}
      {stats?.favorite_item && (
        <div className="card p-4 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <i className="ri-trophy-line text-yellow-600 text-lg"></i>
          </div>
          <div>
            <p className="text-xs text-gray-400">Favorite Item</p>
            <p className="font-bold text-gray-800">{stats.favorite_item}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[["info","ri-user-line","Edit Profile"],["reviews","ri-star-line","My Reviews"]].map(([t,icon,label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab===t ? "bg-primary text-white shadow-md" : "bg-white text-gray-600 hover:bg-beige"
            }`}>
            <i className={icon}></i> {label}
          </button>
        ))}
      </div>

      {/* Tab: Edit Profile */}
      {tab === "info" && (
        <div className="card p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <i className="ri-user-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input type="text" value={form.name} onChange={e => setForm({...form,name:e.target.value})}
                className="input-field pl-9" placeholder="Your full name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <div className="relative">
              <i className="ri-phone-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input type="tel" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})}
                className="input-field pl-9" placeholder="0555 000 000" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Address</label>
            <div className="relative">
              <i className="ri-map-pin-line absolute left-3 top-3 text-gray-400"></i>
              <textarea value={form.address} onChange={e => setForm({...form,address:e.target.value})}
                className="input-field pl-9 resize-none" rows={3} placeholder="Your delivery address..." />
            </div>
          </div>
          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <i className="ri-check-line"></i> Profile updated successfully!
            </div>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
            {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-line"></i>}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Tab: My Reviews */}
      {tab === "reviews" && (
        <div className="space-y-3">
          {!stats?.reviews?.length ? (
            <div className="card p-10 text-center">
              <i className="ri-star-line text-4xl text-gray-300 block mb-3"></i>
              <p className="text-gray-400">You haven't written any reviews yet.</p>
              <p className="text-xs text-gray-300 mt-1">Rate your delivered orders to see them here.</p>
            </div>
          ) : stats.reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 font-mono">{r.order?.order_number}</p>
                <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-4 mb-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Food</p>
                  <Stars rating={r.food_rating} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Delivery</p>
                  <Stars rating={r.delivery_rating} />
                </div>
              </div>
              {r.comment && (
                <p className="text-sm text-gray-600 italic bg-beige rounded-lg px-3 py-2">"{r.comment}"</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
