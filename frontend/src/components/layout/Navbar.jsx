import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { useCart } from '../../features/cart/CartContext';
import { useWishlist } from '../../features/wishlist/WishlistContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-[#16171a] border-b border-[#23252a] px-4 py-2.5">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Left: Brand with square grid icon */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 text-gray-200 hover:text-white transition group">
            <div className="w-6 h-6 border-2 border-gray-400 rounded-sm grid grid-cols-2 gap-0.5 p-0.5 group-hover:border-white">
              <div className="bg-gray-400 group-hover:bg-white rounded-[1px]"></div>
              <div className="bg-gray-400 group-hover:bg-white rounded-[1px]"></div>
              <div className="bg-gray-400 group-hover:bg-white rounded-[1px]"></div>
              <div className="bg-gray-400 group-hover:bg-white rounded-[1px]"></div>
            </div>
            <span className="font-semibold text-sm tracking-wide text-gray-200">Book Worm</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-gray-400 font-medium">
            <Link
              to="/orders"
              className={`hover:text-gray-200 transition ${location.pathname === '/orders' ? 'text-white font-semibold' : ''}`}
            >
              My Orders
            </Link>
            <Link
              to="/wishlist"
              className={`hover:text-gray-200 transition relative flex items-center gap-1.5 ${location.pathname === '/wishlist' ? 'text-white font-semibold' : ''}`}
            >
              <span>My Wishlist</span>
              {wishlist?.length > 0 && (
                <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link
              to="/writers"
              className={`hover:text-gray-200 transition ${location.pathname === '/writers' ? 'text-white font-semibold' : ''}`}
            >
              My Writers
            </Link>
          </nav>
        </div>

        {/* Right: Cart (with badge) & User Profile */}
        <div className="flex items-center gap-4">
          <Link
            to="/cart"
            className="relative p-1.5 text-gray-400 hover:text-gray-200 transition"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cart?.itemCount || 0}
            </span>
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="w-7 h-7 rounded-full border border-gray-600 flex items-center justify-center text-gray-300 hover:text-white hover:border-gray-400 transition"
                title={`${user.firstName} (${user.giftPointsBalance} Gift Pts)`}
              >
                <User className="w-4 h-4" />
              </Link>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-rose-400 text-xs transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="w-7 h-7 rounded-full border border-gray-600 flex items-center justify-center text-gray-300 hover:text-white hover:border-gray-400 transition"
              title="Sign In"
            >
              <User className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
