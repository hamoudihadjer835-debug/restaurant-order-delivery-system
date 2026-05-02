import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Auto-attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── AUTH ──────────────────────────────────────────────────
export const authAPI = {
  login:         (data) => api.post("/auth/login", data),
  register:      (data) => api.post("/auth/register", data),
  logout:        ()     => api.post("/auth/logout"),
  me:            ()     => api.get("/auth/me"),
  updateProfile: (data)   => api.patch("/auth/profile", data),
  uploadAvatar:  (formData) => api.post("/auth/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  getStats:      ()         => api.get("/auth/stats"),
  googleLogin:   ()     => { window.location.href = "/api/auth/google"; },
};

// ── MENU (public) ─────────────────────────────────────────
export const menuAPI = {
  getCategories: ()       => api.get("/menu/categories"),
  getItems:      (params) => api.get("/menu/items", { params }),
  getItem:       (id)     => api.get(`/menu/items/${id}`),
};

// ── CUSTOMER ORDERS ───────────────────────────────────────
export const orderAPI = {
  placeOrder:   (data)  => api.post("/orders", data),
  myOrders:     ()      => api.get("/orders/my"),
  getOrder:     (id)    => api.get(`/orders/${id}`),
  cancelOrder:  (id)    => api.post(`/orders/${id}/cancel`),
  rateOrder:    (id, d) => api.post(`/orders/${id}/rate`, d),
  checkCoupon:  (code)  => api.post("/coupons/check", { code }),
};

// ── DELIVERY ──────────────────────────────────────────────
export const deliveryAPI = {
  dashboard:      ()      => api.get("/delivery/dashboard"),
  available:      ()      => api.get("/delivery/orders/available"),
  myOrders:       ()      => api.get("/delivery/orders/my"),
  accept:         (id)    => api.post(`/delivery/orders/${id}/accept`),
  markPicked:     (id)    => api.post(`/delivery/orders/${id}/picked`),
  markDelivered:  (id)    => api.post(`/delivery/orders/${id}/delivered`),
  updateLocation: (data)  => api.patch("/delivery/location", data),
};

// ── ADMIN ─────────────────────────────────────────────────
export const adminAPI = {
  // Dashboard
  dashboard: () => api.get("/admin/dashboard"),

  // Orders
  getOrders:      (params) => api.get("/admin/orders", { params }),
  updateStatus:   (id, s)  => api.put(`/admin/orders/${id}/status`, { status: s }),

  // Users
  getUsers:    (params) => api.get("/admin/users", { params }),
  createUser:  (data)   => api.post("/admin/users", data),
  updateUser:  (id, d)  => api.put(`/admin/users/${id}`, d),
  deleteUser:  (id)     => api.delete(`/admin/users/${id}`),

  // Categories
  getCategories:    ()      => api.get("/admin/menu/categories"),
  createCategory:   (data)  => api.post("/admin/menu/categories", data),
  updateCategory:   (id, d) => api.put(`/admin/menu/categories/${id}`, d),
  deleteCategory:   (id)    => api.delete(`/admin/menu/categories/${id}`),

  // Menu Items
  getItems:    (params) => api.get("/admin/menu/items", { params }),
  createItem:  (data)   => api.post("/admin/menu/items", data, { headers: { "Content-Type": "multipart/form-data" } }),
  updateItem:  (id, d)  => api.post(`/admin/menu/items/${id}?_method=PUT`, d, { headers: { "Content-Type": "multipart/form-data" } }),
  deleteItem:  (id)     => api.delete(`/admin/menu/items/${id}`),
};

export default api;

// ── NOTIFICATIONS ─────────────────────────────────────
export const notificationAPI = {
  poll: (since) => api.get("/notifications", { params: { since } }),
  all:  ()      => api.get("/notifications/all"),
};

// ── REVIEWS ──────────────────────────────────────────
export const reviewAPI = {
  public:      ()       => api.get("/reviews/public"),
  adminList:   (params) => api.get("/admin/reviews", { params }),
  adminStats:  ()       => api.get("/admin/reviews/stats"),
  adminDelete: (id)     => api.delete(`/admin/reviews/${id}`),
};
