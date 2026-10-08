import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ShoppingCart, Truck, ShieldCheck, Heart, Star, Sparkles } from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../features/cart/CartContext';
import { useAuth } from '../features/auth/AuthContext';
import { useWishlist } from '../features/wishlist/WishlistContext';
import BookHorizontalCard from '../components/product/BookHorizontalCard';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => (await api.get(`/products/${id}`)).data
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', id],
    queryFn: async () => (await api.get(`/products/${id}/related`)).data,
    enabled: !!id
  });

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-gray-400">Loading book details...</div>;
  }

  if (!product) {
    return (
      <div className="p-12 text-center space-y-3">
        <h2 className="text-base font-bold text-gray-200">Book Not Found</h2>
        <Link to="/catalogue" className="text-xs text-blue-400 hover:underline">
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      await addItem({ productId: product.id, quantity: 1 });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      alert(err.message || 'Failed to add item');
    }
  };

  const bg = product.coverBgColor || '#facc15';
  const isLight = bg === '#f8fafc' || bg === '#facc15' || bg === '#ffffff';

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto space-y-8 text-xs">
      <Link to="/catalogue" className="text-gray-400 hover:text-white flex items-center gap-1.5 w-fit font-medium">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalogue
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#16171a] p-6 sm:p-8 rounded-2xl border border-[#23252a]">
        {/* Book Cover */}
        <div
          className="w-full max-w-[280px] h-[380px] mx-auto rounded-lg overflow-hidden p-6 flex flex-col justify-between text-center select-none shadow-2xl border border-[#2b2d34]"
          style={{ backgroundColor: bg, color: isLight ? '#0f172a' : '#ffffff' }}
        >
          <div className="text-base font-black uppercase tracking-wider leading-snug pt-4">
            {product.title}
          </div>
          <div className="my-auto flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-current flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-current"></div>
            </div>
          </div>
          <div className="text-xs font-bold uppercase tracking-widest pb-4 opacity-80">
            {product.author}
          </div>
        </div>

        {/* Book Details */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider block">
                {product.tagText || product.category?.name || 'Curated Non-Fiction'}
              </span>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-2 rounded-full border transition flex items-center gap-1.5 text-xs ${
                  isInWishlist(product.id)
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-[#202126] border-[#2c2e38] text-gray-400 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{isInWishlist(product.id) ? 'Wishlisted' : 'Add to Wishlist'}</span>
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-100">{product.title}</h1>
            <p className="text-gray-400">
              By <Link to={`/catalogue?search=${encodeURIComponent(product.author)}`} className="text-blue-400 hover:underline font-semibold">{product.author}</Link>
            </p>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center text-amber-400 gap-1 bg-[#202126] px-2 py-0.5 rounded-md border border-[#2d2f38]">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="font-bold text-white text-xs">{product.rating || '4.8'}</span>
              </div>
              <span className="text-gray-400 text-[11px]">({product.reviewsCount || 42} reader reviews)</span>
            </div>

            <div className="pt-2">
              <span className="text-2xl font-black text-white">₹{product.price}</span>
            </div>

            <p className="text-gray-300 leading-relaxed pt-2 text-xs">{product.description}</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#23252a]">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <Truck className="w-4 h-4" />
              <span>{product.deliveryDateText || 'Delivery by Mon, 21 Jul'}</span>
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
                added ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{added ? 'Added to Basket' : 'Add to Shopping Basket'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Related Books */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-bold text-white">More Books You Might Like</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedProducts.slice(0, 3).map((item) => (
              <BookHorizontalCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
