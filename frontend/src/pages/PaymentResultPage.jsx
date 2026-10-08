import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, ShoppingBag, RotateCcw } from 'lucide-react';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const ref = searchParams.get('ref');
  const message = searchParams.get('message');

  const isSuccess = status === 'success';

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-xl space-y-6">
        {/* Status Icon */}
        <div className="flex justify-center">
          {isSuccess ? (
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {isSuccess
              ? 'Thank you for your purchase. Your order has been placed and confirmed.'
              : message || 'We were unable to process your transaction. No money was deducted.'}
          </p>
        </div>

        {/* Transaction Reference Box */}
        {isSuccess ? (
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs text-left space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-gray-500 font-sans">Order Reference:</span>
              <span className="font-bold text-gray-900">ORD-{orderId?.padStart(6, '0')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-sans">Payment Reference:</span>
              <span className="font-bold text-gray-900">{ref}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-sans">Status:</span>
              <span className="font-bold text-emerald-600">CONFIRMED</span>
            </div>
          </div>
        ) : (
          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-xs text-rose-800 text-left space-y-1">
            <p className="font-semibold">Reason for Failure:</p>
            <p>{message || 'Payment provider declined simulated transaction. Please try another method.'}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {isSuccess ? (
            <>
              <Link
                to={`/orders/${orderId}/confirmation`}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                View Order Confirmation <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/catalogue"
                className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition"
              >
                Continue Browsing
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/checkout/payment"
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Retry Payment
              </Link>
              <Link
                to="/cart"
                className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition"
              >
                Return to Basket
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
