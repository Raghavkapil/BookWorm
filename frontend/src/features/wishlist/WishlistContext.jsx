import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(`bookworm_wishlist_${user?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const key = `bookworm_wishlist_${user?.id || 'guest'}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setWishlist(JSON.parse(saved));
      } else {
        setWishlist([]);
      }
    } catch (e) {
      setWishlist([]);
    }
  }, [user?.id]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      let updated;
      if (exists) {
        updated = prev.filter((p) => p.id !== product.id);
      } else {
        updated = [...prev, product];
      }
      localStorage.setItem(`bookworm_wishlist_${user?.id || 'guest'}`, JSON.stringify(updated));
      return updated;
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((p) => p.id === productId);
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      localStorage.setItem(`bookworm_wishlist_${user?.id || 'guest'}`, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
