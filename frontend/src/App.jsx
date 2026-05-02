import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";

import Landing  from "./pages/Landing";
import Login    from "./pages/Login";
import Register from "./pages/Register";
import Menu     from "./pages/customer/Menu";
import Cart     from "./pages/customer/Cart";
import MyOrders from "./pages/customer/MyOrders";
import Profile  from "./pages/customer/Profile";
import DeliveryDashboard from "./pages/delivery/Dashboard";
import DeliveryOrders    from "./pages/delivery/MyOrders";
import OrderMap          from "./pages/delivery/OrderMap";
import DeliveryProfile   from "./pages/delivery/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import OrderManager   from "./pages/admin/OrderManager";
import UserDirectory  from "./pages/admin/UserDirectory";
import MenuEditor     from "./pages/admin/MenuEditor";
import AdminProfile   from "./pages/admin/Profile";
import Reviews        from "./pages/admin/Reviews";

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <i className="ri-loader-4-line animate-spin text-3xl text-primary"></i>
    </div>
  );
}

function GoogleCallback() {
  const navigate       = useNavigate();
  const { updateUser } = useAuth();
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) { navigate("/login"); return; }
    localStorage.setItem("token", token);
    import("./services/api").then(({ authAPI }) => {
      authAPI.me().then(({ data }) => {
        localStorage.setItem("user", JSON.stringify(data));
        updateUser(data);
        navigate(data.role === "admin" ? "/admin/dashboard" : data.role === "delivery" ? "/delivery/dashboard" : "/customer/menu");
      }).catch(() => navigate("/login"));
    });
  }, []);
  return <Spinner />;
}

function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/landing" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : user.role === "delivery" ? "/delivery/dashboard" : "/customer/menu"} replace />;
  }
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/landing" replace />;
  return <Navigate to={user.role === "admin" ? "/admin/dashboard" : user.role === "delivery" ? "/delivery/dashboard" : "/customer/menu"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<RootRedirect />} />
        <Route path="/landing"       element={<Landing />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/auth/callback" element={<GoogleCallback />} />

        <Route path="/customer" element={<RequireAuth role="customer"><Layout /></RequireAuth>}>
          <Route path="menu"    element={<Menu />} />
          <Route path="cart"    element={<Cart />} />
          <Route path="orders"  element={<MyOrders />} />
          <Route path="profile" element={<Profile />} />
          <Route index          element={<Navigate to="menu" replace />} />
        </Route>

        <Route path="/delivery" element={<RequireAuth role="delivery"><Layout /></RequireAuth>}>
          <Route path="dashboard" element={<DeliveryDashboard />} />
          <Route path="orders"    element={<DeliveryOrders />} />
          <Route path="profile"   element={<DeliveryProfile />} />
          <Route index            element={<Navigate to="dashboard" replace />} />
        </Route>
        <Route path="/delivery/map/:id" element={<RequireAuth role="delivery"><OrderMap /></RequireAuth>} />

        <Route path="/admin" element={<RequireAuth role="admin"><Layout /></RequireAuth>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders"    element={<OrderManager />} />
          <Route path="users"     element={<UserDirectory />} />
          <Route path="menu"      element={<MenuEditor />} />
          <Route path="reviews"   element={<Reviews />} />
          <Route path="profile"   element={<AdminProfile />} />
          <Route index            element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
