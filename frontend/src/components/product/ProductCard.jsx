import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Truck, Check } from 'lucide-react';
import { useCart } from '../../features/cart/CartContext';
import { useAuth } from '../../features/auth/AuthContext';

export default function ProductCard({ product }) {
  const { addItem, isAdding } = useCart();
  const { user } = useAuth();
  const [added, setAdded] = React.useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      await addItem({ productId: product.id, quantity: 1 });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(err.message || 'Failed to add item');
    }
  };

  const discountedPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition flex flex-col group h-full">
      {/* Book Cover Image */}
      <Link to={`/products/${product.id}`} className="relative block aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={product.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
            {product.discount}% OFF
          </span>
        )}
        {product.stockQuantity < 5 && product.stockQuantity > 0 && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            Only {product.stockQuantity} left
          </span>
        )}
      </Link>

      {/* Book Details */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span className="font-medium text-indigo-600 truncate max-w-[120px]">
            {product.category?.name || 'General'}
          </span>
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating}</span>
          </div>
        </div>

        <Link to={`/products/${product.id}`}>
          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 hover:text-indigo-600 transition title-font mb-1" title={product.title}>
            {product.title}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 mb-3 truncate">by {product.author}</p>

        {/* Pricing & Delivery */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-base font-bold text-gray-900">₹{discountedPrice}</span>
            {product.discount > 0 && (
              <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-emerald-600 mb-3">
            <Truck className="w-3.5 h-3.5" />
            <span>Free delivery in {product.deliveryDays || 2} days</span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0 || isAdding}
            className={`w-full py-2 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition ${
              product.stockQuantity === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white'
            }`}
          >
            {product.stockQuantity === 0 ? (
              'Out of Stock'
            ) : added ? (
              <>
                <Check className="w-4 h-4" /> Added to Basket
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add to Basket
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
