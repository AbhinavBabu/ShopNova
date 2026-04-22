import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api";
import ProductCard from "../components/ProductCard";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: "Free Shipping",
    desc: "On orders over $50",
    color: "from-blue-500/20 to-blue-600/10",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Secure Payment",
    desc: "256-bit SSL encryption",
    color: "from-emerald-500/20 to-emerald-600/10",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: "Easy Returns",
    desc: "30-day return policy",
    color: "from-violet-500/20 to-violet-600/10",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "24/7 Support",
    desc: "Always here to help",
    color: "from-pink-500/20 to-pink-600/10",
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "ShopNova — Premium E-Commerce";
    getProducts({ sort: "rating" })
      .then((res) => setFeatured(res.data.slice(0, 4)))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-700/20 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-violet/15 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-900/10 blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary-500/20 text-primary-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse-soft" />
            New arrivals every week
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            Shop the Future,{" "}
            <span className="gradient-text">Today</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Discover curated premium products designed to elevate your everyday experience.
            Fast delivery, secure checkout, and 24/7 support.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/products" className="btn-primary text-base px-8 py-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Shop Now
            </Link>
            <Link to="/register" className="btn-secondary text-base px-8 py-4">
              Create Account →
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto">
            {[
              { value: "10k+", label: "Happy Customers" },
              { value: "500+", label: "Products" },
              { value: "4.9★", label: "Avg Rating" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold gradient-text">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-primary-400 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className={`relative p-6 rounded-2xl bg-gradient-to-br ${f.color} border border-dark-500 flex flex-col items-center text-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/30`}
            >
              <div className="text-primary-400">{f.icon}</div>
              <div>
                <p className="font-semibold text-white text-sm">{f.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary-400 text-sm font-medium uppercase tracking-wider mb-2">Curated for you</p>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link to="/products" className="btn-ghost hidden sm:inline-flex">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card h-72 animate-pulse-soft bg-dark-700" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/products" className="btn-primary px-10 py-4">
              Browse All Products
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-700/40 via-dark-700 to-accent-violet/30 border border-primary-500/20 p-12 text-center">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary-500/10 blur-[60px]" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-accent-violet/10 blur-[60px]" />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to start shopping?
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Join thousands of happy customers. Register today and get access to exclusive deals.
              </p>
              <Link to="/register" className="btn-primary text-base px-10 py-4">
                Get Started — It's Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-600 py-8 px-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} ShopNova. Built with React & Node.js microservices.
      </footer>
    </div>
  );
}
