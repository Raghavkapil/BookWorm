import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../features/cart/CartContext';
import { useAuth } from '../../features/auth/AuthContext';

export default function BookHorizontalCard({ product }) {
  const { addItem } = useCart();
  const { user } = useAuth();

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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

  // Generate a distinct stylized cover if coverImage is not present
  const renderCover = () => {
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
        className="w-full h-full p-2.5 flex flex-col justify-between text-center select-none"
        style={{ backgroundColor: bg, color: textColor }}
      >
        <div className="pt-2">
          <div className="text-[11px] font-black uppercase tracking-wider leading-tight">
            {product.title}
          </div>
        </div>

        {/* Minimalist illustration element */}
        <div className="my-auto flex items-center justify-center">
          <div
            className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: subColor }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subColor }}></div>
          </div>
        </div>

        <div className="pb-1">
          <div className="text-[9px] font-bold uppercase tracking-widest truncate" style={{ color: subColor }}>
            {product.author}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="flex items-start gap-3.5 group cursor-pointer hover:bg-[#1a1b1f] p-2 rounded-xl transition"
    >
      {/* Book Cover (Ratio ~ 1:1.45) */}
      <div className="w-[100px] h-[135px] flex-shrink-0 rounded-sm overflow-hidden shadow-lg border border-[#2b2d34] group-hover:scale-[1.02] transition">
        {renderCover()}
      </div>

      {/* Book Metadata */}
      <div className="flex flex-col justify-between gap-2 min-h-[135px] min-w-0 flex-1 py-0.5">
        <div>
          <h3
            className="text-[13px] font-bold text-gray-100 group-hover:text-blue-400 transition leading-snug truncate"
            title={product.title}
          >
            {product.title}
          </h3>
          <p className="text-[11px] text-gray-400 truncate mt-0.5">
            by <span className="text-gray-300 font-medium">{product.author}</span>
          </p>
          <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
            <span>{product.format || 'Paperback'}</span>
          </div>

          <div className="text-[10px] text-indigo-400/90 truncate font-medium">
            {product.tagText || product.category?.name || 'Self Help'}
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-[13px] font-extrabold text-white">
              ₹{product.price}
            </span>
          </div>

          <p className="text-[9px] text-gray-400">
            {product.deliveryDateText || 'Delivery by Mon, 21 Jul'}
          </p>
        </div>
      </div>
    </Link>
  );
}
