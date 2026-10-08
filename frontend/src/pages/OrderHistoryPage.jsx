import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, RotateCcw, Ban, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../features/auth/AuthContext';

export default function OrderHistoryPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [actionMessage, setActionMessage] = React.useState(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => (await api.get('/orders')).data
  });

  const cancelMutation = useMutation({
    mutationFn: async (orderId) => (await api.post(`/orders/${orderId}/cancel`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      setActionMessage({ type: 'success', text: 'Order cancelled successfully within 48h window.' });
      setTimeout(() => setActionMessage(null), 4000);
    },
    onError: (err) => {
      setActionMessage({ type: 'error', text: err.message || 'Failed to cancel order.' });
      setTimeout(() => setActionMessage(null), 4000);
    }
  });

  const buyAgainMutation = useMutation({
    mutationFn: async (orderId) => (await api.post(`/orders/${orderId}/buy-again`)).data,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['cart']);
      setActionMessage({ type: 'success', text: data.message || 'Items added to shopping basket!' });
      setTimeout(() => setActionMessage(null), 4000);
    }
  });

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-100">My Orders</h1>
          <p className="text-xs text-gray-400">Track shipments, buy again, and manage 48-hour order cancellations</p>
        </div>
        <Link to="/" className="text-xs text-blue-400 hover:underline">
          Back to Bookstore
        </Link>
      </div>

      {actionMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950 border border-emerald-800 text-emerald-200'
              : 'bg-rose-950 border border-rose-800 text-rose-200'
          }`}
        >
          {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-xs text-gray-500">Loading order history...</div>
      ) : orders?.length === 0 ? (
        <div className="bg-[#16171a] p-12 text-center rounded-xl border border-[#23252a] space-y-3">
          <Package className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="font-bold text-gray-200 text-xs">No orders placed yet</h3>
          <Link to="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold">
            Start Reading Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => (
            <div key={order.id} className="bg-[#16171a] p-5 rounded-xl border border-[#23252a] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#23252a] text-xs gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-100">{order.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      order.status === 'CONFIRMED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : order.status === 'CANCELLED'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-blue-950 text-blue-400 border border-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-gray-400 block">Total</span>
                  <span className="text-sm font-extrabold text-white">₹{order.finalAmount}</span>
                </div>
              </div>

              {/* Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-3 bg-[#1f2026] p-3 rounded-lg border border-[#2c2d36] text-xs">
                    <div className="w-12 h-16 bg-[#16171a] border border-[#2d2f36] rounded flex items-center justify-center font-bold text-[9px] text-gray-400 flex-shrink-0 text-center p-1">
                      {item.productTitle}
                    </div>
                    <div className="flex flex-col justify-between">
                      <h4 className="font-bold text-gray-200 line-clamp-1">{item.productTitle}</h4>
                      <p className="text-[11px] text-gray-400">Qty: {item.quantity} × ₹{item.unitPrice}</p>
                      <p className="text-xs font-bold text-blue-400">₹{item.subtotal}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 text-xs">
                <div>
                  {order.isCancellable && (
                    <button
                      onClick={() => cancelMutation.mutate(order.id)}
                      disabled={cancelMutation.isPending}
                      className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded font-bold text-xs flex items-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" /> Cancel Order ({order.hoursRemainingForCancellation}h left)
                    </button>
                  )}
                </div>

                <button
                  onClick={() => buyAgainMutation.mutate(order.id)}
                  disabled={buyAgainMutation.isPending}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Buy Again (Current Prices)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
