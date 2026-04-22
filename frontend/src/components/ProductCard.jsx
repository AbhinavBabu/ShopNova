import { useState } from "react";
import { useCart } from "../context/CartContext";

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= Math.round(rating) ? "text-accent-amber" : "text-gray-600"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const categoryColors = {
  Electronics: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Furniture: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Lifestyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Accessories: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);

  const colorClass =
    categoryColors[product.category] || "bg-primary-500/10 text-primary-400 border-primary-500/20";

  return (
    <div className="card group flex flex-col">
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-dark-600">
        <img
          src={imgError ? `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=400&background=1a1a24&color=5c7cfa` : product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setImgError(true)}
        />
        {/* Stock badge */}
        {product.stock <= 10 && (
          <div className="absolute top-3 left-3">
            <span className="badge bg-red-500/90 text-white text-xs px-2.5 py-1">
              Only {product.stock} left!
            </span>
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <span className={`badge border text-xs px-2.5 py-1 ${colorClass}`}>
            {product.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-100 text-sm leading-snug group-hover:text-primary-400 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </div>

        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center gap-2">
          <StarRating rating={product.rating} />
          <span className="text-xs text-gray-500">{product.rating.toFixed(1)}</span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-dark-500">
          <span className="text-xl font-bold text-white">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="btn-primary py-2 px-4 text-xs"
            aria-label={`Add ${product.name} to cart`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
