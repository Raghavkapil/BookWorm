import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import { useWishlist } from '../features/wishlist/WishlistContext';
import { useCart } from '../features/cart/CartContext';
import { useAuth } from '../features/auth/AuthContext';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async (product) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      await addItem({ productId: product.id, quantity: 1 });
    } catch (err) {
      alert(err.message || 'Failed to add item to basket');
    }
  };

  const renderCover = (product) => {
    if (product.coverImage) {
      return (
        <img
          src={product.coverImage}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      );
    }

    const bg = product.coverBgColor || '#1e293b';
    const isLight = bg === '#f8fafc' || bg === '#facc15' || bg === '#ffffff';
    const textColor = isLight ? '#0f172a' : '#ffffff';
    const subColor = isLight ? '#475569' : '#cbd5e1';

    return (
      <div
        className="w-full h-full p-2 flex flex-col justify-between text-center select-none"
        style={{ backgroundColor: bg, color: textColor }}
      >
        <div className="pt-1.5">
          <div className="text-[10px] font-black uppercase tracking-wider leading-tight">
            {product.title}
          </div>
        </div>
        <div className="my-auto flex items-center justify-center">
          <div
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: subColor }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subColor }}></div>
          </div>
        </div>
        <div className="pb-1">
          <div className="text-[8px] font-bold uppercase tracking-widest truncate" style={{ color: subColor }}>
            {product.author}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#20222a]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Wishlist
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Books you've saved for future reading and collecting
          </p>
        </div>

        {wishlist.length > 0 && (
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition font-medium self-start sm:self-auto"
          >
            <span>Browse more books</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {wishlist.length === 0 ? (
        /* Empty State */
        <div className="bg-[#16171a] p-6 sm:p-12 text-center rounded-2xl border border-[#262830] space-y-4 max-w-lg mx-auto my-6 sm:my-12">
          <div className="w-16 h-16 rounded-full bg-[#202126] border border-[#2c2e38] flex items-center justify-center mx-auto text-gray-500">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Your wishlist is empty</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Explore our vast catalogue of curated books, find authors you love, and bookmark books to purchase anytime.
          </p>
          <div className="pt-2">
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition shadow-lg shadow-blue-600/20"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Catalogue</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Wishlist Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {wishlist.map((book) => (
            <div
              key={book.id}
              className="bg-[#16171a] border border-[#262830] rounded-xl p-3.5 flex flex-col justify-between hover:border-[#383a45] transition group relative"
            >
              <div className="flex gap-3.5">
                {/* Book Cover */}
                <Link
                  to={`/products/${book.id}`}
                  className="w-[85px] h-[120px] flex-shrink-0 rounded-sm overflow-hidden shadow-md border border-[#2b2d34] group-hover:scale-[1.02] transition"
                >
                  {renderCover(book)}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link
                      to={`/products/${book.id}`}
                      className="text-sm font-bold text-gray-100 hover:text-blue-400 transition truncate block leading-snug"
                    >
                      {book.title}
                    </Link>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      by <span className="text-gray-300 font-medium">{book.author}</span>
                    </p>
                    <p className="text-[10px] text-indigo-400 font-medium mt-1">
                      {book.tagText || book.category?.name || 'Curated Selection'}
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="text-sm font-extrabold text-white">₹{book.price}</span>
                    <p className="text-[10px] text-gray-400">
                      {book.deliveryDateText || 'Delivery in 2-3 business days'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#20222a]">
                <button
                  onClick={() => handleAddToCart(book)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Basket</span>
                </button>
                <button
                  onClick={() => removeFromWishlist(book.id)}
                  title="Remove from wishlist"
                  className="p-1.5 rounded-lg bg-[#202126] hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-[#2c2e38] transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
