import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Package, Truck, MapPin, ArrowRight, BookOpen } from 'lucide-react';
import api from '../lib/api';

export default function OrderConfirmationPage() {
  const { id } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="h-96 flex items-center justify-center text-sm text-gray-500">Loading order receipt...</div>;
  }

  if (!order) {
    return <div className="text-center py-20 text-gray-500">Order not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4 sm:p-6">
      {/* Success Hero */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-3">
        <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">Thank You For Your Order!</h1>
        <p className="text-xs sm:text-sm text-emerald-800">
          We’ve received your order and are preparing your books for express dispatch.
        </p>
        <div className="inline-block px-3 py-1 bg-white border border-emerald-200 rounded-full text-xs font-mono font-bold text-emerald-900 mt-2">
          Order ID: {order.orderNumber}
        </div>
      </div>

      {/* Snapshot Items Preserved */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 space-y-6">
        <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-600" />
          <span>Items Ordered ({order.items?.length || 0})</span>
        </h3>

        <div className="divide-y divide-gray-100">
          {order.items?.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={item.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80'}
                  alt={item.productTitle}
                  className="w-12 h-16 object-cover rounded-lg bg-gray-100"
                />
                <div>
                  <h4 className="font-bold text-gray-900 line-clamp-1">{item.productTitle}</h4>
                  <p className="text-gray-500">Qty: {item.quantity} × ₹{item.unitPrice}</p>
                </div>
              </div>
              <span className="font-bold text-gray-900">₹{item.subtotal}</span>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Books Subtotal:</span>
            <span>₹{order.orderTotal}</span>
          </div>
          {order.giftPointsUsed > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Gift Points Redeemed:</span>
              <span>-₹{order.giftPointsUsed} ({order.giftPointsUsed} pts)</span>
            </div>
          )}
          <div className="flex justify-between text-emerald-600">
            <span>Shipping:</span>
            <span>FREE</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-100 pt-2">
            <span>Final Paid Total:</span>
            <span className="text-indigo-600 font-extrabold">₹{order.finalAmount}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-2 text-xs">
        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span>Delivery Address</span>
        </h4>
        <p className="font-semibold text-gray-800">{order.address?.recipientName}</p>
        <p className="text-gray-600">{order.address?.street}, {order.address?.city}, {order.address?.state} - {order.address?.postalCode}</p>
        <p className="text-gray-500">Contact: {order.address?.phoneNumber}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <Link
          to="/orders"
          className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
        >
          View in Order History <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/catalogue"
          className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition text-center"
        >
          Back to Bookstore
        </Link>
      </div>
    </div>
  );
}
