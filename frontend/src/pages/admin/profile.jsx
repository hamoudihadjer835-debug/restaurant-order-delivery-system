import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import AvatarUpload from "../../components/AvatarUpload";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminProfile() {
  const { user, updateUser } = useAuth();
  const [stats, setStats]   = useState(null);
  const [form, setForm]     = useState({ name: user?.name||"", phone: user?.phone||"" });
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

  const statCards = stats ? [
    { icon: "ri-file-list-3-line",        color: "bg-primary/10 text-primary",      label: "Total Orders",    value: stats.total_orders },
    { icon: "ri-money-dollar-circle-line", color: "bg-green-100 text-green-700",     label: "Total Revenue",   value: `${stats.total_revenue} دج` },
    { icon: "ri-user-line",               color: "bg-blue-100 text-blue-700",        label: "Customers",       value: stats.total_users },
    { icon: "ri-truck-line",              color: "bg-indigo-100 text-indigo-700",    label: "Delivery Staff",  value: stats.total_delivery },
    { icon: "ri-time-line",              color: "bg-yellow-100 text-yellow-700",    label: "Pending Orders",  value: stats.pending_orders },
    { icon: "ri-calendar-check-line",    color: "bg-teal-100 text-teal-700",        label: "Today's Orders",  value: stats.today_orders },
  ] : [];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Admin Profile</h1>

      {/* Hero card */}
      <div className="card overflow-hidden mb-5">
        <div style={{ height: 100, background: "linear-gradient(135deg, #1d1d1d 0%, #3d3d3d 50%, #C8622A 100%)", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 50%, rgba(200,98,42,0.3) 0%, transparent 60%)" }} />
        </div>
        <div className="px-6 pb-6">
          <div style={{ marginTop: -48, marginBottom: 16, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <AvatarUpload size={96} />
            <span className="badge bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 flex items-center gap-1.5">
              <i className="ri-shield-star-line"></i> Administrator
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
          <p className="text-gray-400 text-sm mt-0.5">{user?.email}</p>
          {stats?.member_since && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <i className="ri-calendar-line"></i>
              Admin since {new Date(stats.member_since).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          {statCards.map((s) => (
            <div key={s.label} className="card p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <i className={`${s.icon} text-lg`}></i>
              </div>
              <p className="text-xl md:text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[["info","ri-user-line","Edit Profile"],["actions","ri-flash-line","Quick Actions"]].map(([t,icon,label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab===t ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-beige"
            }`}>
            <i className={icon}></i> {label}
          </button>
        ))}
      </div>

      {/* Tab: Edit */}
      {tab === "info" && (
        <div className="card p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <i className="ri-user-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input type="text" value={form.name} onChange={e => setForm({...form,name:e.target.value})}
                className="input-field pl-9" placeholder="Admin name" />
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
          <div className="bg-beige rounded-xl p-4">
            <p className="text-xs text-gray-500 flex items-center gap-2">
              <i className="ri-information-line text-primary"></i>
              To change your email or password, contact the system developer.
            </p>
          </div>
          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <i className="ri-check-line"></i> Profile updated!
            </div>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
            {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-line"></i>}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Tab: Quick Actions */}
      {tab === "actions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon:"ri-file-list-3-line",  label:"Manage Orders",  desc:"View and update all orders",   link:"/admin/orders",    color:"bg-primary/10 text-primary" },
            { icon:"ri-team-line",          label:"Manage Users",   desc:"Add, edit or remove users",    link:"/admin/users",     color:"bg-blue-100 text-blue-700" },
            { icon:"ri-restaurant-line",    label:"Menu Editor",    desc:"Update menu items and prices", link:"/admin/menu",      color:"bg-green-100 text-green-700" },
            { icon:"ri-star-line",          label:"Reviews",        desc:"Monitor customer feedback",    link:"/admin/reviews",   color:"bg-yellow-100 text-yellow-700" },
            { icon:"ri-dashboard-line",     label:"Dashboard",      desc:"Overview and analytics",       link:"/admin/dashboard", color:"bg-purple-100 text-purple-700" },
          ].map((a) => (
            <a key={a.label} href={a.link}
              className="card p-4 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer no-underline">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${a.color}`}>
                <i className={`${a.icon} text-xl`}></i>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{a.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
              </div>
              <i className="ri-arrow-right-line text-gray-300 ml-auto mt-0.5"></i>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
