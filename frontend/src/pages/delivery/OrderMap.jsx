import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { deliveryAPI, orderAPI } from "../../services/api";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const deliveryIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41],
});

export default function OrderMap() {
  const { id }           = useParams();
  const { state }        = useLocation();
  const navigate         = useNavigate();
  const [order, setOrder]      = useState(state?.order || null);
  const [myPos, setMyPos]      = useState(null);
  const [loading, setLoading]  = useState(!state?.order);
  const watchRef = useRef(null);

  useEffect(() => {
    if (!state?.order) {
      orderAPI.getOrder(id).then(({ data }) => setOrder(data)).finally(() => setLoading(false));
    }

    // Watch GPS position
    if (navigator.geolocation) {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setMyPos([lat, lng]);
          // Update backend with current location
          deliveryAPI.updateLocation({ lat, lng, order_id: parseInt(id) }).catch(() => {});
        },
        (err) => console.warn("GPS error:", err),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    }

    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [id]);

  const handleDelivered = async () => {
    await deliveryAPI.markDelivered(id);
    navigate("/delivery/orders");
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-4xl text-primary"></i>
          <p className="text-gray-500 mt-2">Loading map...</p>
        </div>
      </div>
    );
  }

  const customerPos = order?.delivery_lat && order?.delivery_lng
    ? [parseFloat(order.delivery_lat), parseFloat(order.delivery_lng)]
    : null;

  const center = customerPos || myPos || [36.737232, 3.086472]; // default: Algiers

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-beige transition-colors">
            <i className="ri-arrow-left-line text-gray-600"></i>
          </button>
          <div>
            <p className="font-bold text-gray-800 text-sm">{order?.order_number}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <i className="ri-map-pin-line text-primary"></i>
              {order?.delivery_address?.substring(0, 50)}
            </p>
          </div>
        </div>
        <span className="badge bg-indigo-100 text-indigo-800">Active Navigation</span>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Customer marker */}
          {customerPos && (
            <Marker position={customerPos}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{order?.customer?.name}</p>
                  <p className="text-gray-500">{order?.delivery_address}</p>
                  {order?.customer?.phone && (
                    <a href={`tel:${order.customer.phone}`} className="text-primary font-semibold flex items-center gap-1 mt-1">
                      <i className="ri-phone-line"></i> {order.customer.phone}
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          {/* My position marker */}
          {myPos && (
            <Marker position={myPos} icon={deliveryIcon}>
              <Popup>Your location</Popup>
            </Marker>
          )}

          {/* Line between positions */}
          {myPos && customerPos && (
            <Polyline positions={[myPos, customerPos]} color="#C8622A" weight={3} dashArray="6 8" />
          )}
        </MapContainer>
      </div>

      {/* Bottom action panel */}
      <div className="bg-white border-t border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-beige rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500">Delivery Manifest</p>
            <p className="text-sm font-bold text-gray-800 mt-0.5 font-mono">
              {order?.order_number?.substring(0, 20)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Lng: {myPos?.[1]?.toFixed(5) || "—"} · Lat: {myPos?.[0]?.toFixed(5) || "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Order total</p>
            <p className="text-lg font-bold text-primary">{order?.total} دج</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {order?.customer?.phone && (
            <a href={`tel:${order.customer.phone}`} className="btn-secondary text-sm">
              <i className="ri-phone-line"></i> Call Customer
            </a>
          )}
          <button onClick={handleDelivered} className="btn-primary text-sm">
            <i className="ri-check-double-line"></i> Mark as Delivered
          </button>
        </div>
      </div>
    </div>
  );
}
