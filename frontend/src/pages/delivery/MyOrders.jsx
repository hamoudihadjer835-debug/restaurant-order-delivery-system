import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deliveryAPI } from "../../services/api";

const STATUS_COLORS = {
  pending:"bg-yellow-100 text-yellow-800", confirmed:"bg-blue-100 text-blue-800",
  preparing:"bg-orange-100 text-orange-800", ready:"bg-purple-100 text-purple-800",
  out_for_delivery:"bg-indigo-100 text-indigo-800", delivered:"bg-green-100 text-green-800",
  cancelled:"bg-red-100 text-red-800",
};

export default function DeliveryMyOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    deliveryAPI.myOrders().then(({ data }) => setOrders(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (action, orderId) => {
    try {
      if (action === "picked")    await deliveryAPI.markPicked(orderId);
      if (action === "delivered") await deliveryAPI.markDelivered(orderId);
      load();
    } catch (err) { alert(err.response?.data?.message || "Action failed."); }
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">My Orders</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">{orders.length} total deliveries</p>
        </div>
        <button onClick={load} className="btn-secondary text-xs md:text-sm">
          <i className="ri-refresh-line"></i><span className="hidden sm:inline ml-1">Refresh</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 md:mb-5 scrollbar-hide">
        {["all","out_for_delivery","delivered","cancelled"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${
              filter===s ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-beige"
            }`}>
            {s==="all" ? `All (${orders.length})` : s.replace("_"," ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 md:space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-28 md:h-32 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 md:py-20">
          <i className="ri-truck-line text-4xl md:text-5xl text-gray-300"></i>
          <p className="text-gray-400 mt-3 text-sm">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filtered.map((order) => {
            const cfg = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            return (
              <div key={order.id} className="card p-4 md:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-xs text-gray-400">{order.order_number}</p>
                    <p className="font-bold text-gray-800 mt-0.5 text-sm md:text-base">{order.total} دج</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}
                    </p>
                  </div>
                  <span className={`badge ${cfg} text-xs`}>{order.status?.replace("_"," ")}</span>
                </div>

                {/* Customer */}
                {order.customer && (
                  <div className="flex items-center gap-2 md:gap-3 bg-beige rounded-xl px-3 py-2 mb-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-xs">{order.customer.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-gray-700">{order.customer.name}</p>
                      {order.customer.phone && (
                        <a href={`tel:${order.customer.phone}`} className="text-xs text-primary flex items-center gap-1">
                          <i className="ri-phone-line"></i> {order.customer.phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Address */}
                <p className="text-xs md:text-sm text-gray-600 flex items-start gap-1.5 mb-3">
                  <i className="ri-map-pin-line text-primary mt-0.5 flex-shrink-0"></i>
                  {order.delivery_address}
                </p>

                {/* Items */}
                <div className="flex flex-wrap gap-1 mb-3 md:mb-4">
                  {order.items?.map((item, idx) => (
                    <span key={idx} className="text-xs bg-beige text-gray-600 px-2 py-0.5 rounded-full">
                      {item.quantity}x {item.name}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                {order.status === "out_for_delivery" && (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => navigate(`/delivery/map/${order.id}`,{state:{order}})}
                      className="btn-secondary flex-1 text-xs py-2">
                      <i className="ri-map-2-line"></i> Navigate
                    </button>
                    {!order.delivery?.picked_at && (
                      <button onClick={() => handleAction("picked",order.id)}
                        className="btn-secondary flex-1 text-xs py-2">
                        <i className="ri-hand-coin-line"></i> Picked Up
                      </button>
                    )}
                    <button onClick={() => handleAction("delivered",order.id)}
                      className="btn-primary flex-1 text-xs py-2">
                      <i className="ri-check-double-line"></i> Delivered
                    </button>
                  </div>
                )}
                {order.status === "delivered" && (
                  <div className="flex items-center gap-2 text-green-600 text-xs md:text-sm font-semibold">
                    <i className="ri-check-double-line"></i> Delivered successfully
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
