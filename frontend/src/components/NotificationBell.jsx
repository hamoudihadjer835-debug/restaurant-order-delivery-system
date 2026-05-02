import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { notificationAPI } from "../services/api";

const STATUS_COLORS = {
  pending:          { bg: "#fef9c3", color: "#92400e" },
  confirmed:        { bg: "#dbeafe", color: "#1d4ed8" },
  preparing:        { bg: "#ffedd5", color: "#c2410c" },
  ready:            { bg: "#f3e8ff", color: "#7e22ce" },
  out_for_delivery: { bg: "#e0e7ff", color: "#3730a3" },
  delivered:        { bg: "#dcfce7", color: "#15803d" },
  cancelled:        { bg: "#fee2e2", color: "#b91c1c" },
};

const TYPE_ICON = {
  new_order:       "ri-shopping-bag-line",
  order_status:    "ri-truck-line",
  available_order: "ri-inbox-line",
  order:           "ri-file-list-line",
};

export default function NotificationBell() {
  const [notifs, setNotifs]   = useState([]);
  const [open, setOpen]       = useState(false);
  const [unread, setUnread]   = useState(0);
  const lastTs                = useRef(null);
  const panelRef              = useRef(null);
  const navigate              = useNavigate();

  const poll = async () => {
    try {
      const params = lastTs.current ? { since: lastTs.current } : {};
      const { data } = await notificationAPI.poll(lastTs.current);

      if (data.notifications?.length > 0) {
        setNotifs(prev => {
          // Deduplicate by id
          const ids = new Set(prev.map(n => n.id));
          const fresh = data.notifications.filter(n => !ids.has(n.id));
          if (fresh.length === 0) return prev;
          setUnread(u => u + fresh.length);
          return [...fresh, ...prev].slice(0, 50);
        });
      }
      lastTs.current = data.timestamp;
    } catch {}
  };

  const loadAll = async () => {
    try {
      const { data } = await notificationAPI.all();
      if (Array.isArray(data) && data.length > 0) {
        setNotifs(data);
      }
    } catch {}
  };

  useEffect(() => {
    // Initial load
    poll();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      setUnread(0);
      loadAll();
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = (link) => { setOpen(false); if (link) navigate(link); };

  const timeAgo = (date) => {
    if (!date) return "";
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  return (
    <div style={{ position: "relative" }} ref={panelRef}>
      {/* Bell */}
      <button onClick={() => setOpen(!open)}
        style={{ position: "relative", width: 38, height: 38, borderRadius: 10, background: unread > 0 ? "rgba(200,98,42,0.1)" : "rgba(0,0,0,0.04)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
        <i className={`ri-notification-${unread > 0 ? "4" : "3"}-line`} style={{ fontSize: 18, color: unread > 0 ? "#C8622A" : "#888" }}></i>
        {unread > 0 && (
          <span style={{ position: "absolute", top: 5, right: 5, minWidth: 16, height: 16, background: "#C8622A", borderRadius: 8, fontSize: 9, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", border: "2px solid white" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div style={{ position: "fixed", top: 80, right: 16, width: 360, maxHeight: "70vh", background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: "1px solid rgba(0,0,0,0.07)", zIndex: 9999, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1d", margin: 0 }}>Notifications</h3>
              <p style={{ fontSize: 12, color: "#aaa", margin: 0, marginTop: 2 }}>{notifs.length} notifications</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={loadAll} style={{ background: "none", border: "none", cursor: "pointer", color: "#C8622A", fontSize: 16 }}>
                <i className="ri-refresh-line"></i>
              </button>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: 18 }}>
                <i className="ri-close-line"></i>
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifs.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center" }}>
                <i className="ri-notification-off-line" style={{ fontSize: 44, color: "#e5e7eb", display: "block", marginBottom: 12 }}></i>
                <p style={{ color: "#bbb", fontSize: 13 }}>No notifications yet</p>
              </div>
            ) : notifs.map((n, i) => {
              const sc = STATUS_COLORS[n.status] || { bg: "#f3f4f6", color: "#6b7280" };
              return (
                <div key={n.id || i} onClick={() => handleClick(n.link)}
                  style={{ padding: "14px 18px", borderBottom: "1px solid #f8f8f8", cursor: n.link ? "pointer" : "default", display: "flex", gap: 12, alignItems: "flex-start", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  {/* Icon */}
                  <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(200,98,42,0.1)" }}>
                    <i className={TYPE_ICON[n.type] || "ri-file-list-line"} style={{ fontSize: 17, color: "#C8622A" }}></i>
                  </div>
                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1d", margin: 0, marginBottom: 3 }}>{n.title}</p>
                    <p style={{ fontSize: 12, color: "#777", margin: 0, lineHeight: 1.5 }}>{n.message}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      {n.status && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: sc.bg, color: sc.color }}>
                          {n.status.replace(/_/g, " ")}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: "#ccc" }}>{timeAgo(n.time)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
