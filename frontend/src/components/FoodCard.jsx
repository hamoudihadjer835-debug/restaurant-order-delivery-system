import { useCart } from "../context/CartContext";

const imgUrl = (path) => {
  if (!path) return "/images/food/placeholder.jpg";
  if (path.startsWith("http")) return path;
  return `http://localhost:8000/storage/${path}`;
};

export default function FoodCard({ item }) {
  const { addItem, items } = useCart();
  const inCart = items.find((i) => i.id === item.id);

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      <div className="relative h-36 md:h-44 overflow-hidden bg-beige">
        <img
          src={imgUrl(item.image)}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = "/images/food/placeholder.jpg"; }}
        />
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs md:text-sm font-semibold">Unavailable</span>
          </div>
        )}
        {item.category && (
          <span className="absolute top-2 left-2 bg-white/90 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
            {item.category.name}
          </span>
        )}
      </div>
      <div className="p-3 md:p-4">
        <h3 className="font-semibold text-gray-800 text-xs md:text-sm mb-1 truncate">{item.name}</h3>
        {item.description && (
          <p className="text-xs text-gray-400 mb-2 md:mb-3 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary text-sm md:text-base">{item.price} دج</span>
          <button
            onClick={() => addItem(item)}
            disabled={!item.is_available}
            className={`flex items-center gap-1 text-xs font-semibold px-2 md:px-3 py-1.5 md:py-2 rounded-xl transition-all ${
              inCart
                ? "bg-primary text-white"
                : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <i className={`${inCart ? "ri-check-line" : "ri-add-line"} text-sm`}></i>
            <span className="hidden sm:inline">{inCart ? "Added" : "Add"}</span>
          </button>
        </div>
        {item.prep_time && (
          <p className="text-xs text-gray-400 mt-1.5 md:mt-2 flex items-center gap-1">
            <i className="ri-time-line"></i> {item.prep_time} min
          </p>
        )}
      </div>
    </div>
  );
}
