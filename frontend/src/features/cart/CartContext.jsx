import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuth } from '../auth/AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      const res = await api.get('/cart');
      return res.data;
    },
    enabled: !!token,
    staleTime: 1000 * 30
  });

  const addItemMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }) => {
      const res = await api.post('/cart/items', { productId, quantity });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', user?.id], data);
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      const res = await api.patch(`/cart/items/${itemId}`, { quantity });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', user?.id], data);
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId) => {
      const res = await api.delete(`/cart/items/${itemId}`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', user?.id], data);
    }
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete('/cart');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', user?.id], data);
    }
  });

  const cart = cartData || { items: [], itemCount: 0, subtotal: 0 };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addItem: addItemMutation.mutateAsync,
        updateItem: updateItemMutation.mutateAsync,
        removeItem: removeItemMutation.mutateAsync,
        clearCart: clearCartMutation.mutateAsync,
        isAdding: addItemMutation.isPending
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
