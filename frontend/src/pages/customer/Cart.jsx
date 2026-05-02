import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { orderAPI } from "../../services/api";

export default function Cart() {
  const { items, removeItem, updateQty, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    delivery_address: user?.address || "",
    payment_method: "cash",
    coupon_code: "",
    notes: "",
  });
  const [coupon, setCoupon]         = useState(null);
  const [couponErr, setCouponErr]   = useState("");
  const [loading, setLoading]       = useState(false);
  const [checking, setChecking]     = useState(false);
  const [success, setSuccess]       = useState(false);

  const DELIVERY_FEE = 200;
  const discount     = coupon ? Math.round(total * coupon.discount_percent / 100) : 0;
  const grandTotal   = total - discount + DELIVERY_FEE;

  const checkCoupon = async () => {
    if (!form.coupon_code) return;
    setCouponErr(""); setCoupon(null); setChecking(true);
    try {
      const { data } = await orderAPI.checkCoupon(form.coupon_code);
      setCoupon(data);
    } catch (err) {
      setCouponErr(err.response?.data?.message || "Invalid coupon");
    } finally { setChecking(false); }
  };

  const handleOrder = async () => {
    if (!form.delivery_address) { alert("Please enter delivery address."); return; }
    setLoading(true);
    try {
      await orderAPI.placeOrder({
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        delivery_address: form.delivery_address,
        payment_method: form.payment_method,
        coupon_code: form.coupon_code || undefined,
        notes: form.notes,
      });
      clearCart();
      setSuccess(true);
      setTimeout(() => navigate("/customer/orders"), 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Order failed.");
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-double-line text-green-600 text-4xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Order Placed!</h2>
          <p className="text-gray-500 mt-2 text-sm">Redirecting to your orders...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center">
          <i className="ri-shopping-cart-line text-5xl md:text-6xl text-gray-300"></i>
          <h2 className="text-lg md:text-xl font-bold text-gray-700 mt-4">Your cart is empty</h2>
          <p className="text-gray-400 mt-2 text-sm">Go to menu and add some items</p>
          <button onClick={() => navigate("/customer/menu")} className="btn-primary mt-6">
            <i className="ri-restaurant-line"></i> Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 md:mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white transition-colors">
          <i className="ri-arrow-left-line text-gray-600"></i>
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Your Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        {/* Items */}
        <div className="lg:col-span-3 space-y-3">
          <h2 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Items ({items.length})</h2>
          {items.map((item) => (
            <div key={item.id} className="card p-3 md:p-4 flex items-center gap-3 md:gap-4">
              <img
                src={item.image || "/images/food/placeholder.jpg"}
                alt={item.name}
                className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover flex-shrink-0"
                onError={(e) => { e.target.src = "/images/food/placeholder.jpg"; }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs md:text-sm text-gray-800 truncate">{item.name}</p>
                <p className="text-primary font-bold text-sm mt-0.5">{item.price} دج</p>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <button onClick={() => updateQty(item.id, item.quantity - 1)}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-beige flex items-center justify-center">
                  <i className="ri-subtract-line text-xs md:text-sm"></i>
                </button>
                <span className="w-5 text-center font-semibold text-sm">{item.quantity}</span>
                <button onClick={() => updateQty(item.id, item.quantity + 1)}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <i className="ri-add-line text-primary text-xs md:text-sm"></i>
                </button>
                <button onClick={() => removeItem(item.id)}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-lg hover:bg-red-50 flex items-center justify-center ml-1">
                  <i className="ri-delete-bin-line text-red-400 text-xs md:text-sm"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {/* Address */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
              <i className="ri-map-pin-line text-primary"></i> Delivery Address
            </h3>
            <textarea
              value={form.delivery_address}
              onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
              className="input-field resize-none text-sm" rows={3}
              placeholder="Enter your full delivery address..."
            />
          </div>

          {/* Payment */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
              <i className="ri-bank-card-line text-primary"></i> Payment
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[["cash","ri-money-dollar-circle-line","Cash"],["online","ri-bank-card-line","Online"]].map(([v,icon,label]) => (
                <button key={v} onClick={() => setForm({ ...form, payment_method: v })}
                  className={`py-2 rounded-xl text-xs md:text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                    form.payment_method === v ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200"
                  }`}>
                  <i className={icon}></i> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Coupon */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
              <i className="ri-coupon-line text-primary"></i> Coupon
            </h3>
            <div className="flex gap-2">
              <input type="text" placeholder="Enter code"
                value={form.coupon_code}
                onChange={(e) => { setForm({ ...form, coupon_code: e.target.value }); setCoupon(null); setCouponErr(""); }}
                className="input-field text-sm flex-1 min-w-0" />
              <button onClick={checkCoupon} disabled={checking} className="btn-secondary px-3 text-sm flex-shrink-0">
                {checking ? <i className="ri-loader-4-line animate-spin"></i> : "Apply"}
              </button>
            </div>
            {coupon    && <p className="text-green-600 text-xs mt-2 flex items-center gap-1"><i className="ri-check-line"></i> -{coupon.discount_percent}% applied!</p>}
            {couponErr && <p className="text-red-500 text-xs mt-2">{couponErr}</p>}
          </div>

          {/* Notes */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
              <i className="ri-sticky-note-line text-primary"></i> Notes
            </h3>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field resize-none text-sm" rows={2} placeholder="Special instructions..." />
          </div>

          {/* Total */}
          <div className="card p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span><span>{total} دج</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span><span>-{discount} دج</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-500">
              <span>Delivery fee</span><span>{DELIVERY_FEE} دج</span>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between font-bold text-primary text-base md:text-lg">
              <span>Total</span><span>{grandTotal} دج</span>
            </div>
          </div>

          <button onClick={handleOrder} disabled={loading} className="btn-primary w-full py-3">
            {loading ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-check-line"></i>}
            {loading ? "Placing order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
