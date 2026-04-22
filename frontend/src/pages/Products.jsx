import { useEffect, useState } from "react";
import { getProducts } from "../api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = ["All", "Electronics", "Furniture", "Lifestyle", "Accessories"];
const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "Products — ShopNova";
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (category !== "All") params.category = category;
    if (sort) params.sort = sort;

    getProducts(params)
      .then((res) => setProducts(res.data))
      .catch(() => setError("Failed to load products. Make sure the backend is running."))
      .finally(() => setLoading(false));
  }, [category, sort]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-primary-400 text-sm font-medium uppercase tracking-wider mb-2">Our Collection</p>
          <h1 className="section-title mb-2">All Products</h1>
          <p className="text-gray-500">
            {loading ? "Loading..." : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} available`}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              aria-label="Search products"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-field w-full lg:w-52 cursor-pointer"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                category === cat
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-900/30"
                  : "bg-dark-700 border border-dark-500 text-gray-400 hover:border-primary-500/40 hover:text-white"
              }`}
              aria-pressed={category === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400 mb-8">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card h-80 animate-pulse-soft" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl font-semibold text-gray-400">No products found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
