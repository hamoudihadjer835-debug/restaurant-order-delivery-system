import { useState } from "react";

const STATUS_CONFIG = {
  pending:          { label: "Pending",          color: "status-pending",          icon: "ri-time-line" },
  confirmed:        { label: "Confirmed",         color: "status-confirmed",        icon: "ri-checkbox-circle-line" },
  preparing:        { label: "Preparing",         color: "status-preparing",        icon: "ri-fire-line" },
  ready:            { label: "Ready",             color: "status-ready",            icon: "ri-checkbox-circle-fill" },
  out_for_delivery: { label: "Out for Delivery",  color: "status-out_for_delivery", icon: "ri-truck-line" },
  delivered:        { label: "Delivered",         color: "status-delivered",        icon: "ri-check-double-line" },
  cancelled:        { label: "Cancelled",         color: "status-cancelled",        icon: "ri-close-circle-line" },
};

export default function OrderCard({ order, onCancel, onRate, showDetails = false }) {
  const [expanded, setExpanded] = useState(showDetails);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400 font-mono">{order.order_number}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(order.created_at).toLocaleDateString("en-GB", {
              day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </p>
        </div>
        <span className={`badge ${cfg.color} flex items-center gap-1`}>
          <i className={`${cfg.icon} text-xs`}></i>
          {cfg.label}
        </span>
      </div>

      {/* Items preview */}
      <div className="flex items-center gap-2 mb-3">
        {order.items?.slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center gap-1.5 bg-beige rounded-lg px-2 py-1">
            {item.image && (
              <img src={item.image ? (item.image.startsWith("http") ? item.image : `http://localhost:8000/storage/${item.image}`) : "/images/food/placeholder.jpg"} alt="" className="w-5 h-5 rounded object-cover" />
            )}
            <span className="text-xs text-gray-600">{item.quantity}x {item.name}</span>
          </div>
        ))}
        {order.items?.length > 3 && (
          <span className="text-xs text-gray-400">+{order.items.length - 3} more</span>
        )}
      </div>

      {/* Total + actions */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-primary">{order.total} دج</span>
          <span className="text-xs text-gray-400 ml-2">{order.payment_method}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
          >
            {expanded ? "Less" : "Details"}
            <i className={`ri-arrow-${expanded ? "up" : "down"}-s-line`}></i>
          </button>
          {order.status === "pending" && onCancel && (
            <button
              onClick={() => onCancel(order.id)}
              className="text-xs text-red-500 font-semibold hover:underline"
            >
              Cancel
            </button>
          )}
          {order.status === "delivered" && !order.rating && onRate && (
            <button
              onClick={() => onRate(order)}
              className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
            >
              <i className="ri-star-line"></i> Rate
            </button>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.quantity}x {item.name}</span>
              <span className="font-medium">{item.subtotal} دج</span>
            </div>
          ))}
          <div className="pt-2 border-t border-dashed border-gray-200 space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtotal</span><span>{order.subtotal} دج</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>Discount</span><span>-{order.discount} دج</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-500">
              <span>Delivery fee</span><span>{order.delivery_fee} دج</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-primary">
              <span>Total</span><span>{order.total} دج</span>
            </div>
          </div>
          {order.delivery_address && (
            <p className="text-xs text-gray-500 flex items-start gap-1 pt-1">
              <i className="ri-map-pin-line mt-0.5 text-primary"></i>
              {order.delivery_address}
            </p>
          )}
          {order.delivery && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <i className="ri-truck-line text-primary"></i>
              Delivery: {order.delivery.worker_name || "Assigned"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
