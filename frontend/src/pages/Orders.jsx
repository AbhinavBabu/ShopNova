import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../api";
import { useAuth } from "../context/AuthContext";

const STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  shipped: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_ICONS = {
  pending: "⏳",
  processing: "⚙️",
  shipped: "🚚",
  delivered: "✅",
  cancelled: "❌",
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    document.title = "My Orders — ShopNova";
    getMyOrders(token)
      .then((res) => setOrders(res.data))
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center animate-fade-in px-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-dark-700 border border-dark-500 flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">No orders yet</h1>
          <p className="text-gray-500 mb-8">Your order history will appear here once you make a purchase.</p>
          <Link to="/products" className="btn-primary px-8 py-3.5">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title">My Orders</h1>
          <p className="text-gray-500 mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
        </div>

        {/* Orders list */}
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const isOpen = expanded === order._id;
            return (
              <div
                key={order._id}
                className="glass rounded-2xl overflow-hidden border border-dark-500/50 transition-all duration-300 hover:border-primary-500/20"
              >
                {/* Order header */}
                <button
                  className="w-full text-left p-6 flex flex-col sm:flex-row sm:items-center gap-4"
                  onClick={() => setExpanded(isOpen ? null : order._id)}
                  aria-expanded={isOpen}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-gray-500 font-mono">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className={`badge border text-xs px-2.5 py-0.5 ${STATUS_STYLES[order.status]}`}>
                        {STATUS_ICONS[order.status]} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-white">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Order items (collapsible) */}
                {isOpen && (
                  <div className="border-t border-dark-500 px-6 pb-6 pt-4 animate-slide-up">
                    <div className="flex flex-col gap-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-dark-600 flex-shrink-0">
                            <img
                              src={item.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&size=48&background=1a1a24&color=5c7cfa`}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&size=48&background=1a1a24&color=5c7cfa`;
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}

                      <div className="border-t border-dark-500 pt-3 mt-1 flex justify-between text-sm">
                        <span className="text-gray-400">Total</span>
                        <span className="font-bold text-white">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
