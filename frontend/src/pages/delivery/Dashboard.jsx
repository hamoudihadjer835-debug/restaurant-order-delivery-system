import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { deliveryAPI } from "../../services/api";

export default function DeliveryDashboard() {
  const [data, setData]         = useState(null);
  const [available, setAvailable] = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    Promise.all([deliveryAPI.dashboard(), deliveryAPI.available()])
      .then(([dash, avail]) => { setData(dash.data); setAvailable(avail.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAccept = async (orderId) => {
    try { await deliveryAPI.accept(orderId); load(); navigate("/delivery/orders"); }
    catch (err) { alert(err.response?.data?.message || "Failed to accept order."); }
  };

  if (loading) return (
    <div className="p-4 md:p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-beige-dark rounded w-48" />
      <div className="grid grid-cols-3 gap-3"><div className="card h-24" /><div className="card h-24" /><div className="card h-24" /></div>
    </div>
  );

  const stats = [
    { label: "Total Deliveries", value: data?.total_deliveries||0, icon:"ri-truck-line",         color:"bg-primary/10 text-primary" },
    { label: "Today",            value: data?.today_deliveries||0, icon:"ri-calendar-check-line", color:"bg-green-100 text-green-700" },
    { label: "Active Order",     value: data?.active_order?1:0,    icon:"ri-map-pin-line",        color:"bg-blue-100 text-blue-700" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">Welcome back, ready to deliver?</p>
        </div>
        <button onClick={load} className="btn-secondary text-xs md:text-sm">
          <i className="ri-refresh-line"></i><span className="hidden sm:inline ml-1">Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-3 md:p-5">
            <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center mb-2 md:mb-3 ${s.color}`}>
              <i className={`${s.icon} text-base md:text-xl`}></i>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Active order banner */}
      {data?.active_order && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary flex items-center gap-2">
                <i className="ri-truck-line animate-bounce"></i> Active Delivery
              </p>
              <p className="font-bold text-gray-800 mt-1 text-sm md:text-base truncate">{data.active_order.order_number}</p>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                <i className="ri-map-pin-line text-primary flex-shrink-0"></i>
                {data.active_order.delivery_address}
              </p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button onClick={() => navigate("/delivery/orders")} className="btn-primary text-xs px-3 py-2">
                <i className="ri-map-2-line"></i><span className="hidden sm:inline ml-1">Navigate</span>
              </button>
              <button onClick={async () => { await deliveryAPI.markDelivered(data.active_order.id); load(); }}
                className="btn-secondary text-xs px-3 py-2">
                <i className="ri-check-double-line"></i><span className="hidden sm:inline ml-1">Delivered</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Chart */}
        <div className="card p-4 md:p-5">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-sm md:text-base">
            <i className="ri-bar-chart-line text-primary"></i> Weekly Deliveries
          </h2>
          {data?.weekly_stats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={data.weekly_stats}>
                <XAxis dataKey="date" tick={{fontSize:10}} tickFormatter={(d)=>new Date(d).toLocaleDateString("en",{weekday:"short"})}/>
                <YAxis tick={{fontSize:10}}/>
                <Tooltip/>
                <Bar dataKey="count" fill="#C8622A" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Available orders */}
        <div className="card p-4 md:p-5">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-sm md:text-base">
            <i className="ri-inbox-line text-primary"></i> Available Orders ({available.length})
          </h2>
          <div className="space-y-2 md:space-y-3 max-h-52 overflow-y-auto">
            {available.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No available orders</div>
            ) : available.map((order) => (
              <div key={order.id} className="flex items-center justify-between bg-beige rounded-xl px-3 md:px-4 py-2 md:py-3">
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-semibold text-gray-700">{order.order_number}</p>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                    <i className="ri-map-pin-line text-primary flex-shrink-0"></i>
                    {order.delivery_address?.substring(0,30)}...
                  </p>
                  <p className="text-xs font-bold text-primary mt-0.5">{order.total} دج</p>
                </div>
                <button onClick={() => handleAccept(order.id)} className="btn-primary text-xs px-2 md:px-3 py-1.5 flex-shrink-0 ml-2">
                  <i className="ri-check-line"></i><span className="hidden sm:inline ml-1">Accept</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card p-4 md:p-5">
        <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-sm md:text-base">
          <i className="ri-history-line text-primary"></i> Recent Orders
        </h2>
        <div className="space-y-2">
          {!data?.recent_orders?.length ? (
            <p className="text-gray-400 text-sm text-center py-6">No deliveries yet</p>
          ) : data.recent_orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  order.status==="delivered"?"bg-green-100 text-green-700":"bg-yellow-100 text-yellow-700"}`}>
                  <i className="ri-truck-line"></i>
                </div>
                <div>
                  <p className="text-xs md:text-sm font-semibold text-gray-700">{order.order_number}</p>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <span className="font-bold text-primary text-sm">{order.total} دج</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
