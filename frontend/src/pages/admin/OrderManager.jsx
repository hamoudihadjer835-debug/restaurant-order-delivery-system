import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { adminAPI } from "../../services/api";

const STATUSES = ["pending","confirmed","preparing","ready","out_for_delivery","delivered","cancelled"];
const STATUS_COLORS = {
  pending:"status-pending", confirmed:"status-confirmed", preparing:"status-preparing",
  ready:"status-ready", out_for_delivery:"status-out_for_delivery",
  delivered:"status-delivered", cancelled:"status-cancelled",
};

export default function OrderManager() {
  const [orders, setOrders]     = useState([]);
  const [meta, setMeta]         = useState({});
  const [filter, setFilter]     = useState("");
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    adminAPI.getOrders({ status: filter || undefined, search: search || undefined, page })
      .then(({ data }) => { setOrders(data.data || []); setMeta(data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter, search, page]);

  const handleStatus = async (orderId, status) => {
    await adminAPI.updateStatus(orderId, status);
    load();
    setSelected(null);
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Order Manager</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">Monitor and manage all incoming orders</p>
        </div>
        <button onClick={load} className="btn-secondary text-xs md:text-sm">
          <i className="ri-refresh-line"></i>
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        {[
          { label: "Completed today", key: "delivered",  color: "text-green-600", icon: "ri-check-double-line" },
          { label: "In progress",     key: "preparing",  color: "text-orange-600", icon: "ri-fire-line" },
          { label: "Avg prep time",   value: "18 min",   color: "text-primary",    icon: "ri-timer-line" },
        ].map((s) => (
          <div key={s.label} className="card p-3 md:p-4 flex items-center gap-2 md:gap-4">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl bg-beige flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <i className={`${s.icon} text-base md:text-xl`}></i>
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold text-gray-800">
                {s.value || orders.filter((o) => o.status === s.key).length}
              </p>
              <p className="text-xs text-gray-500 hidden sm:block">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-4 md:mb-5">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input type="text" placeholder="Search orders or customers..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9 text-sm w-full" />
        </div>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="input-field text-sm sm:w-40">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>

      {/* Mobile cards view */}
      <div className="md:hidden space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <i className="ri-file-list-3-line text-4xl block mb-2"></i>No orders found
          </div>
        ) : orders.map((order) => (
          <div key={order.id} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-mono text-xs text-gray-400">{order.order_number}</p>
                <p className="font-semibold text-sm text-gray-800 mt-0.5">{order.user?.name}</p>
              </div>
              <span className={`badge ${STATUS_COLORS[order.status]} text-xs`}>
                {order.status?.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-bold text-primary">{order.total} دج</p>
              <button onClick={() => setSelected(order)} className="btn-secondary text-xs px-3 py-1.5">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige border-b border-gray-100">
              <tr>
                {["Order","Customer","Items","Status","Total","Date","Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-beige rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <i className="ri-file-list-3-line text-4xl block mb-2"></i>No orders found
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-beige/50 transition-colors">
                  <td className="px-4 py-3"><p className="font-mono text-xs text-gray-500">{order.order_number}</p></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {order.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{order.user?.name}</p>
                        <p className="text-xs text-gray-400">{order.user?.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><p className="text-sm text-gray-600">{order.items?.length} item(s)</p></td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[order.status]}`}>{order.status?.replace("_"," ")}</span>
                  </td>
                  <td className="px-4 py-3"><p className="font-bold text-primary">{order.total} دج</p></td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(order)} className="btn-secondary text-xs px-3 py-1.5">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Showing {meta.from}–{meta.to} of {meta.total}</p>
            <div className="flex gap-1">
              {[...Array(meta.last_page)].map((_, i) => (
                <button key={i} onClick={() => setPage(i+1)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${page===i+1?"bg-primary text-white":"hover:bg-beige text-gray-600"}`}>
                  {i+1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order ${selected?.order_number}`} size="lg">
        {selected && (
          <div className="space-y-4 md:space-y-5">
            <div className="bg-beige rounded-xl p-3 md:p-4 flex items-center gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                {selected.user?.name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm md:text-base">{selected.user?.name}</p>
                <p className="text-xs md:text-sm text-gray-500">{selected.user?.phone} · {selected.user?.email}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2 md:mb-3">Order Items</h3>
              <div className="space-y-2">
                {selected.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.quantity}x {item.name}</span>
                    <span className="font-medium">{item.subtotal} دج</span>
                  </div>
                ))}
                <div className="border-t border-dashed pt-2 flex justify-between font-bold text-primary">
                  <span>Total</span><span>{selected.total} دج</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Delivery Address</h3>
              <p className="text-sm text-gray-600 flex items-start gap-1.5">
                <i className="ri-map-pin-line text-primary mt-0.5"></i>
                {selected.delivery_address}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2 md:mb-3">Update Status</h3>
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.map((s) => (
                  <button key={s} onClick={() => handleStatus(selected.id, s)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all capitalize ${
                      selected.status===s ? "bg-primary text-white border-primary" : "bg-white border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                    }`}>
                    {s.replace("_"," ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
