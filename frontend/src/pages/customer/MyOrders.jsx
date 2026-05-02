import { useState, useEffect } from "react";
import OrderCard from "../../components/OrderCard";
import Modal from "../../components/Modal";
import { orderAPI } from "../../services/api";

const STATUSES = ["all","pending","confirmed","preparing","out_for_delivery","delivered","cancelled"];

export default function MyOrders() {
  const [orders, setOrders]       = useState([]);
  const [filter, setFilter]       = useState("all");
  const [loading, setLoading]     = useState(true);
  const [rateOrder, setRateOrder] = useState(null);
  const [rating, setRating]       = useState({ food_rating:5, delivery_rating:5, comment:"" });

  const load = () => {
    setLoading(true);
    orderAPI.myOrders().then(({ data }) => setOrders(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this order?")) return;
    await orderAPI.cancelOrder(id); load();
  };

  const handleRate = async () => {
    await orderAPI.rateOrder(rateOrder.id, rating);
    setRateOrder(null); load();
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const statusCount = (s) => orders.filter((o) => o.status === s).length;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">My Orders</h1>
        <p className="text-gray-500 text-xs md:text-sm mt-0.5">Track all your orders</p>
      </div>

      {/* Status pills — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 md:mb-6 scrollbar-hide">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${
              filter===s ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-beige"
            }`}>
            {s==="all" ? `All (${orders.length})` : `${s.replace("_"," ")} ${statusCount(s)?`(${statusCount(s)})`:""}`}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-3 md:space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card p-4 animate-pulse h-24 md:h-28" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 md:py-20">
          <i className="ri-file-list-3-line text-4xl md:text-5xl text-gray-300"></i>
          <p className="text-gray-400 mt-3 text-sm">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} onCancel={handleCancel} onRate={setRateOrder} />
          ))}
        </div>
      )}

      {/* Rate modal */}
      <Modal open={!!rateOrder} onClose={() => setRateOrder(null)} title="Rate your order">
        <div className="space-y-4 md:space-y-5">
          {[["food_rating","Food quality"],["delivery_rating","Delivery"]].map(([key,label]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-3">{label}</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => setRating({...rating,[key]:n})}
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-xl text-base md:text-lg transition-all ${
                      n<=rating[key]?"bg-primary text-white":"bg-beige text-gray-400"
                    }`}>
                    <i className="ri-star-fill"></i>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment (optional)</label>
            <textarea value={rating.comment} onChange={(e) => setRating({...rating,comment:e.target.value})}
              className="input-field resize-none" rows={3} placeholder="Tell us about your experience..." />
          </div>
          <button onClick={handleRate} className="btn-primary w-full">
            <i className="ri-star-line"></i> Submit Rating
          </button>
        </div>
      </Modal>
    </div>
  );
}
