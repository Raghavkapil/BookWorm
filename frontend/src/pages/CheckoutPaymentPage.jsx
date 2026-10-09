import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CreditCard, QrCode, Building, Wallet, Gift, ShieldCheck, Check, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../features/auth/AuthContext';
import { useCart } from '../features/cart/CartContext';

export default function CheckoutPaymentPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { cart, clearCart } = useCart();

  const addressId = parseInt(sessionStorage.getItem('checkout_address_id'), 10);

  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsApplied, setPointsApplied] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Validate checkout on load
  const { data: validation, isLoading: validating } = useQuery({
    queryKey: ['checkout-validate'],
    queryFn: async () => {
      const res = await api.post('/checkout/validate');
      return res.data;
    }
  });

  // Calculate final total
  const subtotal = validation?.subtotal || cart.subtotal || 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyPoints = async () => {
    setErrorMsg('');
    if (pointsToRedeem < 0) return;
    try {
      const res = await api.post('/checkout/apply-points', { points: Number(pointsToRedeem) });
      if (res.success) {
        setPointsApplied(res.data.pointsApplied);
        setDiscountAmount(res.data.discountAmount);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to apply points');
    }
  };

  const handleRemovePoints = () => {
    setPointsApplied(0);
    setDiscountAmount(0);
    setPointsToRedeem(0);
  };

  const handleCompleteOrder = async () => {
    if (!addressId) {
      navigate('/checkout/address');
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);

    try {
      // 1. Create Pending Order
      const orderRes = await api.post('/checkout/order', {
        addressId,
        pointsUsed: pointsApplied
      });

      const orderId = orderRes.data.orderId;

      // 2. Initialize Payment
      const payRes = await api.post('/payments/create', {
        orderId,
        paymentMethod
      });

      const paymentReference = payRes.data.paymentReference;

      // 3. Confirm Payment (Simulated)
      const confirmRes = await api.post('/payments/confirm', {
        paymentReference,
        simulateFailure
      });

      if (confirmRes.success) {
        await refreshUser();
        sessionStorage.removeItem('checkout_address_id');
        navigate(`/payment/result?status=success&orderId=${orderId}&ref=${paymentReference}`);
      }
    } catch (err) {
      setIsProcessing(false);
      navigate(`/payment/result?status=failed&message=${encodeURIComponent(err.message || 'Payment processing failed')}`);
    }
  };

  if (!addressId) {
    navigate('/checkout/address');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-4 sm:p-6">
      {/* Checkout Steps Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 text-xs font-semibold">
        <div className="flex items-center gap-2 text-emerald-600">
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">✓</span>
          <span>Delivery Address</span>
        </div>
        <div className="w-12 h-0.5 bg-indigo-600" />
        <div className="flex items-center gap-2 text-indigo-600">
          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
          <span>Payment & Points</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-200" />
        <div className="flex items-center gap-2 text-gray-400">
          <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px]">3</span>
          <span>Confirmation</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Gift Points Redemption Box */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Redeem Gift Points</h3>
              <p className="text-xs text-amber-800">
                You have <strong className="font-bold">{user?.giftPointsBalance || 0} Points</strong> available (1 Point = ₹1.00 Discount)
              </p>
            </div>
          </div>
        </div>

        {pointsApplied > 0 ? (
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-amber-300 text-xs">
            <span className="text-emerald-700 font-bold">✓ {pointsApplied} Gift Points applied (-₹{discountAmount})</span>
            <button
              onClick={handleRemovePoints}
              className="text-rose-600 hover:underline font-semibold"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-amber-200">
            <input
              type="number"
              min="0"
              max={user?.giftPointsBalance || 0}
              value={pointsToRedeem}
              onChange={(e) => setPointsToRedeem(Math.min(user?.giftPointsBalance || 0, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-full px-3 py-2 text-xs font-semibold outline-none"
              placeholder="Enter points to redeem"
            />
            <button
              onClick={() => setPointsToRedeem(Math.min(user?.giftPointsBalance || 0, Math.floor(subtotal)))}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-[11px] font-bold text-gray-700 whitespace-nowrap"
            >
              Max
            </button>
            <button
              onClick={handleApplyPoints}
              disabled={pointsToRedeem <= 0}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap"
            >
              Apply Points
            </button>
          </div>
        )}
      </div>

      {/* Select Payment Method */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4">
        <h3 className="font-bold text-gray-900 text-base">Select Payment Method</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, MasterCard, RuPay' },
            { id: 'UPI', label: 'UPI / QR Code', icon: QrCode, desc: 'Google Pay, PhonePe, Paytm' },
            { id: 'NET_BANKING', label: 'Net Banking', icon: Building, desc: 'All Major Indian Banks' },
            { id: 'WALLET', label: 'Wallets', icon: Wallet, desc: 'Amazon Pay, Mobikwik' }
          ].map((m) => {
            const isSelected = paymentMethod === m.id;
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-grow">
                  <span className="font-bold text-gray-900 block">{m.label}</span>
                  <span className="text-[11px] text-gray-500">{m.desc}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
              </div>
            );
          })}
        </div>

        {/* Demo Simulation Options */}
        <div className="pt-4 border-t border-gray-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-gray-600 font-medium bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300">
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <span>[Demo Testing] Simulate Bank Payment Failure Flow</span>
          </label>
        </div>
      </div>

      {/* Bill Summary Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4">
        <h3 className="font-bold text-gray-900 text-base">Payment Summary</h3>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Books Subtotal:</span>
            <span>₹{subtotal}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Gift Points Discount:</span>
              <span>-₹{discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Delivery Charges:</span>
            <span>FREE</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline text-base font-bold text-gray-900">
            <span>Payable Amount:</span>
            <span className="text-xl text-indigo-600 font-extrabold">₹{finalTotal}</span>
          </div>
        </div>

        <button
          onClick={handleCompleteOrder}
          disabled={isProcessing}
          className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2"
        >
          {isProcessing ? 'Processing Payment...' : `Pay ₹${finalTotal} & Confirm Order`}
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Earn 5% Gift Points on this transaction upon completion
        </p>
      </div>
    </div>
  );
}
