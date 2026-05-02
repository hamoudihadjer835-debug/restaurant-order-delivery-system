import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const menus = {
  customer: [
    { to: "/customer/menu",      icon: "ri-restaurant-line",    label: "Menu" },
    { to: "/customer/cart",      icon: "ri-shopping-cart-line", label: "Cart" },
    { to: "/customer/orders",    icon: "ri-file-list-3-line",   label: "My Orders" },
    { to: "/customer/profile",   icon: "ri-user-line",          label: "Profile" },
  ],
  delivery: [
    { to: "/delivery/dashboard", icon: "ri-dashboard-line",     label: "Dashboard" },
    { to: "/delivery/orders",    icon: "ri-truck-line",         label: "Orders" },
    { to: "/delivery/profile",   icon: "ri-user-line",          label: "Profile" },
  ],
  admin: [
    { to: "/admin/dashboard",    icon: "ri-dashboard-line",     label: "Dashboard" },
    { to: "/admin/orders",       icon: "ri-file-list-3-line",   label: "Orders" },
    { to: "/admin/menu",         icon: "ri-restaurant-line",    label: "Menu Editor" },
    { to: "/admin/users",        icon: "ri-team-line",          label: "Users" },
    { to: "/admin/reviews",      icon: "ri-star-line",          label: "Reviews" },
    { to: "/admin/profile",      icon: "ri-user-line",          label: "Profile" },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = menus[user?.role] || [];
  const [open, setOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="ri-restaurant-2-line text-white text-xl"></i>
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">Brayin Food</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
          onClick={() => setOpen(false)}>
          <i className="ri-close-line text-gray-500 text-lg"></i>
        </button>
      </div>

      {/* User + Notification */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <NotificationBell />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <i className={`${l.icon} text-lg`}></i>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <i className="ri-logout-box-line text-lg"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="ri-restaurant-2-line text-white text-sm"></i>
          </div>
          <span className="font-bold text-gray-800 text-sm">Brayin Food</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button onClick={() => setOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-beige transition-colors">
            <i className="ri-menu-line text-gray-700 text-xl"></i>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      {/* Mobile drawer */}
      <aside className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 flex-shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}
