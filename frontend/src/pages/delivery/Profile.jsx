import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import AvatarUpload from "../../components/AvatarUpload";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Stars = ({ rating, size = 14 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1,2,3,4,5].map(n => (
      <i key={n} className={`ri-star-${n <= Math.round(rating) ? "fill" : "line"}`}
        style={{ fontSize: size, color: n <= Math.round(rating) ? "#f59e0b" : "#d1d5db" }}></i>
    ))}
  </div>
);

export default function DeliveryProfile() {
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

  const performanceLevel = !stats ? null
    : stats.avg_rating >= 4.5 ? { label: "Excellent", color: "#15803d", bg: "#dcfce7", icon: "ri-award-fill" }
    : stats.avg_rating >= 3.5 ? { label: "Good",      color: "#0369a1", bg: "#dbeafe", icon: "ri-thumb-up-line" }
    :                           { label: "Improving",  color: "#92400e", bg: "#fef3c7", icon: "ri-arrow-up-line" };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      {/* Hero card */}
      <div className="card overflow-hidden mb-5">
        <div style={{ height: 100, background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #60a5fa 100%)", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)" }} />
        </div>
        <div className="px-6 pb-6">
          <div style={{ marginTop: -48, marginBottom: 16, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <AvatarUpload size={96} />
            {performanceLevel && (
              <span style={{ background: performanceLevel.bg, color: performanceLevel.color, padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                <i className={performanceLevel.icon}></i> {performanceLevel.label}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
          <p className="text-gray-400 text-sm mt-0.5">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge bg-blue-100 text-blue-700 text-xs flex items-center gap-1">
              <i className="ri-truck-line"></i> Delivery Worker
            </span>
            {stats?.avg_rating > 0 && (
              <div className="flex items-center gap-1">
                <Stars rating={stats.avg_rating} />
                <span className="text-xs text-gray-500">{stats.avg_rating}/5</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: "ri-truck-line",           color: "bg-primary/10 text-primary",  label: "Total",     value: stats.total_deliveries },
            { icon: "ri-check-double-line",    color: "bg-green-100 text-green-700", label: "Completed", value: stats.completed },
            { icon: "ri-calendar-check-line",  color: "bg-blue-100 text-blue-700",   label: "Today",     value: stats.today },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${s.color}`}>
                <i className={`${s.icon} text-lg`}></i>
              </div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[["info","ri-user-line","Edit Profile"],["stats","ri-bar-chart-line","Performance"],["reviews","ri-star-line","My Reviews"]].map(([t,icon,label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
              tab===t ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-beige"
            }`}>
            <i className={icon}></i> {label}
          </button>
        ))}
      </div>

      {/* Tab: Edit */}
      {tab === "info" && (
        <div className="card p-5 space-y-4">
          {[
            ["Full Name","name","ri-user-line","text","Your full name"],
            ["Phone","phone","ri-phone-line","tel","0555 000 000"],
          ].map(([label,key,icon,type,ph]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <div className="relative">
                <i className={`${icon} absolute left-3 top-1/2 -translate-y-1/2 text-gray-400`}></i>
                <input type={type} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})}
                  className="input-field pl-9" placeholder={ph} />
              </div>
            </div>
          ))}
          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <i className="ri-check-line"></i> Saved!
            </div>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
            {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-line"></i>}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Tab: Performance */}
      {tab === "stats" && stats && (
        <div className="space-y-4">
          {/* Rating gauge */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <i className="ri-star-fill text-yellow-500"></i> Customer Rating
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-black text-gray-800">{stats.avg_rating || "—"}</div>
              <div>
                <Stars rating={stats.avg_rating} size={20} />
                <p className="text-xs text-gray-400 mt-1">Based on customer feedback</p>
              </div>
            </div>
          </div>

          {/* Weekly chart */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <i className="ri-bar-chart-line text-primary"></i> Weekly Deliveries
            </h3>
            {stats.weekly_stats?.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={stats.weekly_stats}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }}
                    tickFormatter={d => new Date(d).toLocaleDateString("en", { weekday: "short" })} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#C8622A" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-300 text-sm">No data yet</div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Reviews */}
      {tab === "reviews" && (
        <div className="space-y-3">
          {!stats?.reviews?.length ? (
            <div className="card p-10 text-center">
              <i className="ri-star-line text-4xl text-gray-300 block mb-3"></i>
              <p className="text-gray-400">No reviews yet from customers.</p>
            </div>
          ) : stats.reviews.map((r, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-bold text-primary text-sm">
                  {r.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm text-gray-800">{r.user?.name}</p>
                    <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <Stars rating={r.delivery_rating} />
                  {r.comment && (
                    <p className="text-sm text-gray-600 italic mt-2 bg-beige rounded-lg px-3 py-2">"{r.comment}"</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
