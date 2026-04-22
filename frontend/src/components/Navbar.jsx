import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    ...(isLoggedIn ? [{ to: "/orders", label: "My Orders" }] : []),
  ];

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-2xl shadow-black/30 py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <span className="text-lg font-bold gradient-text">ShopNova</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(link.to)
                  ? "bg-primary-500/20 text-primary-400"
                  : "text-gray-400 hover:text-white hover:bg-dark-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-dark-600 transition-all duration-200"
            aria-label="Cart"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center animate-pulse-soft">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-gray-400">
                Hi, <span className="text-primary-400 font-medium">{user?.name?.split(" ")[0]}</span>
              </span>
              <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-dark-500/50 mt-1 px-4 py-4 flex flex-col gap-2 animate-slide-up">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "bg-primary-500/20 text-primary-400"
                  : "text-gray-300 hover:text-white hover:bg-dark-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-dark-500 pt-3 mt-1 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                <p className="text-sm text-gray-400 px-4">Signed in as <span className="text-primary-400">{user?.name}</span></p>
                <button onClick={handleLogout} className="btn-secondary w-full">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary w-full text-center">Login</Link>
                <Link to="/register" className="btn-primary w-full text-center">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
