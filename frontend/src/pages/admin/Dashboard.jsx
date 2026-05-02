import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { adminAPI } from "../../services/api";

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.dashboard().then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4 animate-pulse">
        <div className="h-8 bg-beige-dark rounded w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="card h-24 md:h-28" />)}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Today's Orders",   value: data?.today_orders || 0,        icon: "ri-file-list-3-line",          color: "bg-primary/10 text-primary" },
    { label: "Today's Revenue",  value: `${data?.today_revenue || 0} دج`, icon: "ri-money-dollar-circle-line", color: "bg-green-100 text-green-700" },
    { label: "Pending",          value: data?.pending_orders || 0,       icon: "ri-time-line",                 color: "bg-yellow-100 text-yellow-700" },
    { label: "Active Orders",    value: data?.active_orders || 0,        icon: "ri-truck-line",                color: "bg-blue-100 text-blue-700" },
    { label: "Customers",        value: data?.total_users || 0,          icon: "ri-user-line",                 color: "bg-purple-100 text-purple-700" },
    { label: "Delivery Workers", value: data?.total_deliveries || 0,     icon: "ri-truck-fill",                color: "bg-indigo-100 text-indigo-700" },
    { label: "Completed Today",  value: data?.completed_today || 0,      icon: "ri-check-double-line",         color: "bg-teal-100 text-teal-700" },
    { label: "Avg Prep Time",    value: `${data?.avg_prep_time || 0} min`, icon: "ri-timer-line",              color: "bg-orange-100 text-orange-700" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-xs md:text-sm mt-0.5">Restaurant overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-3 md:p-4">
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center mb-2 md:mb-3 ${s.color}`}>
              <i className={`${s.icon} text-base md:text-lg`}></i>
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Weekly revenue chart */}
        <div className="card p-4 md:p-5">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-sm md:text-base">
            <i className="ri-bar-chart-line text-primary"></i> Weekly Revenue
          </h2>
          {data?.weekly_revenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.weekly_revenue}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }}
                  tickFormatter={(d) => new Date(d).toLocaleDateString("en", { weekday: "short" })} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${v} دج`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#C8622A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Recent orders */}
        <div className="card p-4 md:p-5">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-sm md:text-base">
            <i className="ri-history-line text-primary"></i> Recent Orders
          </h2>
          <div className="space-y-2 md:space-y-3">
            {!data?.recent_orders?.length ? (
              <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
            ) : data.recent_orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-xs md:text-sm font-semibold text-gray-700">{order.order_number}</p>
                  <p className="text-xs text-gray-400">{order.user?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs md:text-sm font-bold text-primary">{order.total} دج</p>
                  <span className={`badge status-${order.status} text-xs`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
