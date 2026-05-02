import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FoodCard from "../../components/FoodCard";
import { menuAPI } from "../../services/api";
import { useCart } from "../../context/CartContext";

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { count, total } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    menuAPI.getCategories()
      .then(({ data }) => setCategories(data))
      .finally(() => setLoading(false));
  }, []);

  const allItems = categories.flatMap((c) => c.items || []);
  const filtered = (
    activeCategory === "all"
      ? allItems
      : categories.find((c) => c.id === activeCategory)?.items || []
  ).filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Our Menu</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">Fresh food, delivered fast</p>
        </div>
        {count > 0 && (
          <button
            onClick={() => navigate("/customer/cart")}
            className="btn-primary text-xs md:text-sm px-3 md:px-5"
          >
            <i className="ri-shopping-cart-line"></i>
            <span className="hidden sm:inline">Cart ({count}) — {total.toFixed(0)} دج</span>
            <span className="sm:hidden">{count}</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4 md:mb-6">
        <i className="ri-search-line absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base md:text-lg"></i>
        <input
          type="text"
          placeholder="Search dishes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9 md:pl-11 text-sm md:text-base"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 md:mb-6 scrollbar-hide">
        <button
          onClick={() => setActiveCategory("all")}
          className={`flex-shrink-0 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeCategory === "all" ? "bg-primary text-white" : "bg-white text-gray-600"
          }`}
        >
          All ({allItems.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
              activeCategory === cat.id ? "bg-primary text-white" : "bg-white text-gray-600"
            }`}
          >
            {cat.name} ({cat.items?.length || 0})
          </button>
        ))}
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="h-36 md:h-44 bg-beige-dark" />
              <div className="p-3 md:p-4 space-y-2">
                <div className="h-3 bg-beige-dark rounded w-3/4" />
                <div className="h-3 bg-beige-dark rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 md:py-20">
          <i className="ri-restaurant-line text-4xl md:text-5xl text-gray-300"></i>
          <p className="text-gray-400 mt-3 text-sm">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((item) => <FoodCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}
