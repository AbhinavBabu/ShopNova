import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api";
import toast from "react-hot-toast";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, totalAmount, totalItems } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Cart — ShopNova";
  }, []);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const orderData = {
      items: items.map((item) => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    };

    try {
      await createOrder(orderData, token);
      clearCart();
      toast.success("Order placed successfully! 🎉");
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center animate-fade-in px-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-dark-700 border border-dark-500 flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn-primary px-8 py-3.5">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="section-title">Your Cart</h1>
          <p className="text-gray-500 mt-1">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => (
              <div key={item._id} className="glass rounded-2xl p-5 flex gap-4 animate-fade-in">
                {/* Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-dark-600 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&size=80&background=1a1a24&color=5c7cfa`;
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm truncate">{item.name}</h3>
                  <p className="text-primary-400 font-bold mt-1">${item.price.toFixed(2)}</p>

                  <div className="flex items-center gap-3 mt-3">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-dark-600 rounded-lg px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-dark-500 text-gray-400 hover:text-white transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-white font-medium w-5 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-dark-500 text-gray-400 hover:text-white transition-colors"
                        aria-label="Increase quantity"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-gray-500 hover:text-red-400 transition-colors self-start flex items-center gap-1.5 mt-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-28">
              <h2 className="text-lg font-bold text-white mb-5">Order Summary</h2>

              <div className="flex flex-col gap-3 mb-5">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Shipping</span>
                  <span className="text-emerald-400">Free</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Tax (8%)</span>
                  <span>${(totalAmount * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t border-dark-500 pt-3 flex justify-between font-bold text-white text-lg">
                  <span>Total</span>
                  <span>${(totalAmount * 1.08).toFixed(2)}</span>
                </div>
              </div>

              {/* User info */}
              {user && (
                <div className="mb-4 p-3 rounded-xl bg-dark-600 border border-dark-500 text-sm">
                  <p className="text-gray-400">Ordering as</p>
                  <p className="text-white font-medium truncate">{user.name}</p>
                  <p className="text-gray-500 truncate text-xs">{user.email}</p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                id="checkout-btn"
                className="btn-primary w-full py-4 text-base"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Place Order
              </button>

              <Link to="/products" className="btn-ghost w-full justify-center mt-3 text-sm">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
