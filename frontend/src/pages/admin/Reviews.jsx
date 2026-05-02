import { useState, useEffect } from "react";
import { reviewAPI } from "../../services/api";

const Stars = ({ rating, size = "text-sm" }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(n => (
      <i key={n} className={`ri-star-${n <= rating ? "fill" : "line"} ${size} ${n <= rating ? "text-yellow-400" : "text-gray-200"}`}></i>
    ))}
  </div>
);

export default function Reviews() {
  const [stats, setStats]       = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [meta, setMeta]         = useState({});
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);

  const loadStats   = () => reviewAPI.adminStats().then(({ data }) => setStats(data)).catch(() => {});
  const loadReviews = () => {
    setLoading(true);
    reviewAPI.adminList({ page }).then(({ data }) => {
      setReviews(data.data || []);
      setMeta(data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadReviews(); }, [page]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this review?")) return;
    await reviewAPI.adminDelete(id);
    loadReviews(); loadStats();
  };

  const timeAgo = (date) => new Date(date).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Reviews & Ratings</h1>
        <p className="text-gray-500 text-xs md:text-sm mt-0.5">Monitor customer feedback and ratings</p>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="card p-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center mb-3">
              <i className="ri-star-fill text-yellow-500 text-lg"></i>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.avg_food || "—"}</p>
            <p className="text-xs text-gray-500 mt-0.5">Avg Food Rating</p>
          </div>
          <div className="card p-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
              <i className="ri-truck-line text-blue-600 text-lg"></i>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.avg_delivery || "—"}</p>
            <p className="text-xs text-gray-500 mt-0.5">Avg Delivery Rating</p>
          </div>
          <div className="card p-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <i className="ri-chat-quote-line text-primary text-lg"></i>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.total || 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Reviews</p>
          </div>
          <div className="card p-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
              <i className="ri-thumb-up-line text-green-600 text-lg"></i>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {stats.total > 0 ? Math.round((stats.distribution?.[4] + stats.distribution?.[5]) / stats.total * 100) : 0}%
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Positive Reviews</p>
          </div>
        </div>
      )}

      {/* Rating distribution */}
      {stats?.distribution && (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-sm md:text-base">
            <i className="ri-bar-chart-line text-primary"></i> Rating Distribution
          </h2>
          <div className="space-y-2">
            {[5,4,3,2,1].map(star => {
              const count = stats.distribution[star] || 0;
              const pct   = stats.total > 0 ? Math.round(count / stats.total * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600">{star}</span>
                    <i className="ri-star-fill text-yellow-400 text-xs"></i>
                  </div>
                  <div className="flex-1 h-2.5 bg-beige rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right flex-shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="card overflow-hidden">
        <div className="px-4 md:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700 text-sm md:text-base flex items-center gap-2">
            <i className="ri-chat-3-line text-primary"></i> All Reviews
          </h2>
          <button onClick={loadReviews} className="btn-secondary text-xs">
            <i className="ri-refresh-line"></i>
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-beige rounded-xl animate-pulse" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="ri-star-line text-4xl block mb-3"></i>
            <p className="text-sm">No reviews yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 md:p-5 hover:bg-beige/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-bold text-primary text-sm">
                      {review.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-sm text-gray-800">{review.user?.name}</p>
                        <span className="text-xs text-gray-400">{timeAgo(review.created_at)}</span>
                      </div>
                      {/* Ratings row */}
                      <div className="flex flex-wrap gap-3 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500">Food:</span>
                          <Stars rating={review.food_rating} />
                          <span className="text-xs font-semibold text-gray-700">{review.food_rating}/5</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500">Delivery:</span>
                          <Stars rating={review.delivery_rating} />
                          <span className="text-xs font-semibold text-gray-700">{review.delivery_rating}/5</span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600 bg-beige rounded-xl px-3 py-2 italic">
                          "{review.comment}"
                        </p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(review.id)}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors flex-shrink-0">
                    <i className="ri-delete-bin-line text-red-400 text-sm"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
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
    </div>
  );
}
