import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useCart } from '../features/cart/CartContext';
import api from '../lib/api';

const PAYMENT_TABS = [
  { label: 'Credit Card', method: 'CARD' },
  { label: 'Debit card', method: 'CARD' },
  { label: 'UPI', method: 'UPI' },
  { label: 'Wallet', method: 'WALLET' },
  { label: 'Cash on Delivery', method: 'COD' }
];

export default function CartPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { cart, updateItem, removeItem, clearCart } = useCart();

  // Form State
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [addressForm, setAddressForm] = useState({
    firstName: user?.firstName || 'Alice',
    lastName: user?.lastName || 'Sharma',
    address: '42 MG Road, Indiranagar',
    email: user?.email || 'customer1@bookstore.com',
    city: 'Bengaluru',
    pin: '560038',
    phoneNumber: '9876543210',
    state: 'Karnataka',
    country: 'India'
  });

  // Coupons / Gift points
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(100); // Demo discount as in UI screenshot

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState('Credit Card');
  const [upiId, setUpiId] = useState('');
  const [cardForm, setCardForm] = useState({
    cardNumber: '4532-XXXX-XXXX-8921',
    nameOnCard: 'Alice Sharma',
    cvv: '821',
    expiry: '12/28'
  });

  // Confirmation Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const items = cart?.items || [];
  const rawSubtotal = items.reduce((acc, it) => acc + (it.product?.price || 0) * it.quantity, 0) || 508;
  const taxAmount = 62.00;
  const deliveryCharges = 0;
  const finalTotal = Math.max(0, rawSubtotal + taxAmount + deliveryCharges - discountAmount);

  // Payment method helpers
  const isCardTab = selectedPaymentTab === 'Credit Card' || selectedPaymentTab === 'Debit card';
  const isUpiValid = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiId);
  const walletBalance = user?.giftPointsBalance || 0; // 1 gift point = ₹1
  const canPay =
    isCardTab ||
    selectedPaymentTab === 'Cash on Delivery' ||
    (selectedPaymentTab === 'UPI' && isUpiValid) ||
    (selectedPaymentTab === 'Wallet' && walletBalance >= finalTotal);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim()) {
      setDiscountAmount(100);
      alert(`Coupon "${couponCode}" applied successfully! ₹100 discount added.`);
    }
  };

  const handleOpenPayment = (e) => {
    e.preventDefault();
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      // 1. Fetch addresses or create one
      const addrRes = await api.get('/addresses');
      let targetAddrId = addrRes.data?.[0]?.id;

      if (!targetAddrId) {
        const newAddr = await api.post('/addresses', {
          recipientName: `${addressForm.firstName} ${addressForm.lastName}`,
          phoneNumber: addressForm.phoneNumber || '9876543210',
          street: addressForm.address || '42 MG Road',
          city: addressForm.city || 'Bengaluru',
          state: addressForm.state || 'Karnataka',
          postalCode: addressForm.pin || '560038',
          country: addressForm.country || 'India'
        });
        targetAddrId = newAddr.data.id;
      }

      // 2. Create Order
      const orderRes = await api.post('/checkout/order', {
        addressId: targetAddrId,
        pointsUsed: discountAmount > 0 ? 100 : 0
      });

      const orderId = orderRes.data.orderId;

      // 3. Create Payment
      const payRes = await api.post('/payments/create', {
        orderId,
        paymentMethod: PAYMENT_TABS.find((t) => t.label === selectedPaymentTab).method
      });

      // 4. Confirm Payment
      const confirmRes = await api.post('/payments/confirm', {
        paymentReference: payRes.data.paymentReference
      });

      setConfirmedOrder({
        id: orderId,
        items,
        amount: finalTotal
      });

      await refreshUser();
      setShowPaymentModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      alert(err.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Breadcrumb matching UI */}
      <nav className="text-xs text-gray-400 flex items-center gap-1.5">
        <Link to="/" className="text-blue-400 hover:underline">Home</Link>
        <span>/</span>
        <span className="text-blue-400">Non-Fiction</span>
        <span>/</span>
        <span className="text-blue-400">Self Help</span>
        <span>/</span>
        <span className="text-blue-400">Joy of Minimalism</span>
        <span>/</span>
        <span className="text-gray-300">Checkout</span>
        <span>/</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-sm font-bold text-gray-200 tracking-wide">Shopping Cart</h1>
        {items.length > 0 && (
          <button
            onClick={() => clearCart()}
            className="text-xs text-red-400 hover:text-red-300 border border-red-400 hover:border-red-300 px-3 py-1.5 rounded-md transition-colors"
          >
            Empty Cart
          </button>
        )}
      </div>

      {/* Shopping Cart Items Horizontal Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#16171a] p-4 rounded-xl border border-[#23252a]">
        {items.length === 0 ? (
          <div className="md:col-span-2 text-center py-6 text-xs text-gray-400">
            Your shopping basket is empty. Add books from the catalogue!
          </div>
        ) : (
          items.map((item) => {
            const product = item.product;
            const bg = product?.coverBgColor || '#facc15';
            const isLight = bg === '#f8fafc' || bg === '#facc15' || bg === '#ffffff';

            return (
              <div key={item.id} className="flex items-start gap-4">
                {/* Book Cover */}
                <div
                  className="w-[100px] h-[135px] flex-shrink-0 rounded-sm overflow-hidden p-2 flex flex-col justify-between text-center select-none shadow-md border border-[#2b2d34]"
                  style={{ backgroundColor: bg, color: isLight ? '#0f172a' : '#ffffff' }}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider leading-tight pt-1">
                    {product?.title}
                  </div>
                  <div className="my-auto flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                    </div>
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-widest pb-1 opacity-80">
                    {product?.author}
                  </div>
                </div>

                {/* Info & Quantity controls */}
                <div className="flex flex-col flex-1 min-w-0 py-0.5 text-xs gap-1.5">
                  <div>
                    <h3 className="font-bold text-gray-100 text-[13px]">{product?.title}</h3>
                    <p className="text-[11px] text-gray-400">by <span className="text-gray-300">{product?.author}</span></p>
                    <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{product?.description}</p>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-400">{product?.format || 'Paperback'}</p>
                    <p className="text-[10px] text-indigo-400 font-medium">{product?.tagText || 'Non-fiction, Self Help'}</p>
                    <div className="text-[13px] font-extrabold text-white">₹{product?.price}</div>
                    <p className="text-[9px] text-gray-400">
                      {product?.deliveryDays
                        ? `Delivery within ${product.deliveryDays} day${product.deliveryDays === 1 ? '' : 's'}`
                        : 'Delivery within 2–5 days'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">Qty:</span>
                    <div className="flex items-center bg-[#202126] border border-[#2c2e38] rounded-lg overflow-hidden">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) {
                            removeItem(item.id);
                          } else {
                            updateItem({ itemId: item.id, quantity: item.quantity - 1 });
                          }
                        }}
                        className="px-3 py-1.5 text-gray-300 hover:text-red-400 transition font-bold text-sm leading-none"
                      >
                        −
                      </button>
                      <span className="px-3 py-1.5 text-white font-bold text-xs min-w-[2rem] text-center border-x border-[#2c2e38]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItem({ itemId: item.id, quantity: item.quantity + 1 })}
                        className="px-3 py-1.5 text-gray-300 hover:text-white transition font-bold text-sm leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Lower Section: Address and Grand Total Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Address Details (7 cols) */}
        <div className="lg:col-span-7 min-w-0 bg-[#16171a] p-5 rounded-xl border border-[#23252a] space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-200">Address</h2>
          </div>

          <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={useSavedAddress}
              onChange={(e) => setUseSavedAddress(e.target.checked)}
              className="rounded bg-[#202126] border-gray-600 text-blue-600"
            />
            <span>Use Saved Address</span>
          </label>

          <form className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-500 block mb-1">First Name</label>
                <input
                  type="text"
                  placeholder="First Name"
                  value={addressForm.firstName}
                  onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                  className="w-full bg-[#202126] border border-[#2d2f36] rounded-md px-3 py-2 text-xs text-gray-200 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 block mb-1">Last Name</label>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={addressForm.lastName}
                  onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                  className="w-full bg-[#202126] border border-[#2d2f36] rounded-md px-3 py-2 text-xs text-gray-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Address</label>
              <input
                type="text"
                placeholder="Address Line 2"
                value={addressForm.address}
                onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                className="w-full bg-[#202126] border border-[#2d2f36] rounded-md px-3 py-2 text-xs text-gray-200 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-gray-500 block mb-1">e-mail</label>
                <input
                  type="email"
                  placeholder="e-mail"
                  value={addressForm.email}
                  onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                  className="w-full bg-[#202126] border border-[#2d2f36] rounded-md px-3 py-2 text-xs text-gray-200 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 block mb-1">City</label>
                <input
                  type="text"
                  placeholder="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="w-full bg-[#202126] border border-[#2d2f36] rounded-md px-3 py-2 text-xs text-gray-200 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 block mb-1">Pin</label>
                <input
                  type="text"
                  placeholder="000000"
                  value={addressForm.pin}
                  onChange={(e) => setAddressForm({ ...addressForm, pin: e.target.value })}
                  className="w-full bg-[#202126] border border-[#2d2f36] rounded-md px-3 py-2 text-xs text-gray-200 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-gray-500 block mb-1">Phone Number</label>
                <div className="flex gap-1.5">
                  <span className="bg-[#202126] border border-[#2d2f36] rounded-md px-2 py-2 text-xs text-gray-400">+91</span>
                  <input
                    type="tel"
                    placeholder="12345567890"
                    value={addressForm.phoneNumber}
                    onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                    className="w-full bg-[#202126] border border-[#2d2f36] rounded-md px-3 py-2 text-xs text-gray-200 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 block mb-1">State</label>
                <input
                  type="text"
                  placeholder="State"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  className="w-full bg-[#202126] border border-[#2d2f36] rounded-md px-3 py-2 text-xs text-gray-200 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 block mb-1">Country</label>
                <select
                  value={addressForm.country}
                  onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                  className="w-full bg-[#202126] border border-[#2d2f36] rounded-md px-3 py-2 text-xs text-gray-200 outline-none"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Right Section: Grand Total with Illustration (5 cols) */}
        <div className="lg:col-span-5 min-w-0 bg-[#16171a] p-5 rounded-xl border border-[#23252a] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Dark Blue Book Illustration Banner matching screenshot */}
            <div className="w-32 h-44 mx-auto sm:mx-0 rounded-lg bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] p-3 flex flex-col justify-between border border-blue-900 shadow-inner flex-shrink-0 relative overflow-hidden">
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="text-[9px] text-blue-200 font-bold uppercase tracking-wider">Book Worm</div>
              <div className="my-auto space-y-1">
                <div className="w-16 h-3 bg-amber-500/80 rounded-sm"></div>
                <div className="w-20 h-4 bg-orange-400 rounded-sm"></div>
                <div className="w-14 h-3 bg-emerald-400 rounded-sm"></div>
              </div>
              <div className="text-[8px] text-blue-300">Curated Reads</div>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex-1 min-w-0 space-y-2 text-xs text-gray-400">
              <h2 className="text-sm font-bold text-gray-200 mb-3">Grand Total</h2>

              <div className="flex justify-between">
                <span>Price ({items.length || 2} items)</span>
                <span className="text-gray-200">₹{rawSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="text-gray-200">₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-emerald-400">Free</span>
              </div>

              {/* Coupon Box */}
              <div className="pt-2">
                <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Apply Coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 min-w-0 bg-[#202126] border border-[#2d2f36] rounded px-2.5 py-1 text-[11px] text-gray-200 outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-3 py-1 rounded transition"
                  >
                    Apply
                  </button>
                </form>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold pt-1">
                  <span>Discount</span>
                  <span>₹{discountAmount}</span>
                </div>
              )}

              <div className="border-t border-[#2d2f36] pt-2 flex justify-between items-baseline font-bold text-gray-100">
                <span className="text-xs">Total Amount</span>
                <span className="text-sm font-extrabold text-white">₹{Math.round(finalTotal)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenPayment}
            className="w-full mt-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
          >
            <span>Pay Now</span>
            <div className="w-3.5 h-3.5 border border-white/60 rounded-sm grid grid-cols-2 gap-0.5 p-0.5">
              <div className="bg-white"></div>
              <div className="bg-white"></div>
              <div className="bg-white"></div>
              <div className="bg-white"></div>
            </div>
          </button>
        </div>
      </div>

      {/* PAYMENT MODAL (Matching Screenshot 4) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1d22] border border-[#2d2f36] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d2f36]">
              <h3 className="font-bold text-sm text-gray-100">Complete Payment</h3>
              <span className="text-xs font-extrabold text-white">
                Payable Amount: <span className="text-blue-400">₹{Math.round(finalTotal)}</span>
              </span>
            </div>

            {/* Modal Body: Left Vertical Tabs + Right Form */}
            <div className="flex flex-col sm:flex-row min-h-[220px]">
              {/* Payment Methods Tabs */}
              <div className="sm:w-40 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-[#2d2f36] bg-[#16171a] flex flex-row sm:flex-col overflow-x-auto text-xs text-gray-400">
                {PAYMENT_TABS.map(({ label }) => {
                  const isSelected = selectedPaymentTab === label;
                  return (
                    <button
                      key={label}
                      onClick={() => setSelectedPaymentTab(label)}
                      className={`text-left whitespace-nowrap px-4 py-3 font-medium transition ${
                        isSelected
                          ? 'text-white bg-[#1c1d22] border-b-2 sm:border-b-0 sm:border-l-2 border-blue-500 font-bold'
                          : 'hover:text-gray-200 hover:bg-[#1f2025]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Method-specific fields */}
              <div className="flex-1 min-w-0 p-5 space-y-3 text-xs">
                {isCardTab && (
                  <>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardForm.cardNumber}
                        onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                        className="w-full bg-[#26272e] border border-[#35363e] rounded px-3 py-1.5 text-xs text-gray-200 outline-none"
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Name on Card</label>
                      <input
                        type="text"
                        value={cardForm.nameOnCard}
                        onChange={(e) => setCardForm({ ...cardForm, nameOnCard: e.target.value })}
                        className="w-full bg-[#26272e] border border-[#35363e] rounded px-3 py-1.5 text-xs text-gray-200 outline-none"
                        placeholder="Name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength="3"
                          value={cardForm.cvv}
                          onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                          className="w-full bg-[#26272e] border border-[#35363e] rounded px-3 py-1.5 text-xs text-gray-200 outline-none"
                          placeholder="XXX"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-1">Date of Expiry</label>
                        <input
                          type="text"
                          value={cardForm.expiry}
                          onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                          className="w-full bg-[#26272e] border border-[#35363e] rounded px-3 py-1.5 text-xs text-gray-200 outline-none"
                          placeholder="MM/YYYY"
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedPaymentTab === 'UPI' && (
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value.trim())}
                      className="w-full bg-[#26272e] border border-[#35363e] rounded px-3 py-1.5 text-xs text-gray-200 outline-none"
                      placeholder="yourname@bank"
                      autoComplete="off"
                    />
                    {upiId && !isUpiValid ? (
                      <p className="text-[10px] text-red-400 mt-1">Enter a valid UPI ID, e.g. yourname@okbank</p>
                    ) : (
                      <p className="text-[10px] text-gray-500 mt-1">A payment request will be sent to this UPI ID.</p>
                    )}
                  </div>
                )}

                {selectedPaymentTab === 'Wallet' && (
                  <div className="space-y-3">
                    <div className="bg-[#26272e] border border-[#35363e] rounded-lg p-4">
                      <p className="text-[10px] text-gray-500">Available wallet balance</p>
                      <p className="text-xl font-extrabold text-white mt-1">₹{walletBalance}</p>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Amount to pay</span>
                      <span className="text-gray-200">₹{Math.round(finalTotal)}</span>
                    </div>
                    {walletBalance >= finalTotal ? (
                      <p className="text-[11px] text-emerald-400">
                        Balance after payment: ₹{Math.round(walletBalance - finalTotal)}
                      </p>
                    ) : (
                      <p className="text-[11px] text-red-400">
                        Insufficient balance. You need ₹{Math.round(finalTotal - walletBalance)} more, choose another method.
                      </p>
                    )}
                  </div>
                )}

                {selectedPaymentTab === 'Cash on Delivery' && (
                  <div className="space-y-2">
                    <p className="text-gray-400">Pay in cash when your order is delivered.</p>
                    <div className="bg-[#26272e] border border-[#35363e] rounded-lg p-4 space-y-1.5 text-gray-400">
                      <div className="flex justify-between">
                        <span>Price ({items.length || 2} items)</span>
                        <span className="text-gray-200">₹{rawSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span className="text-gray-200">₹{taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Charges</span>
                        <span className={deliveryCharges > 0 ? 'text-gray-200' : 'text-emerald-400'}>
                          {deliveryCharges > 0 ? `₹${deliveryCharges.toFixed(2)}` : 'Free'}
                        </span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Discount</span>
                          <span>-₹{discountAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-[#35363e] pt-2 font-bold text-gray-100">
                        <span>Payable at delivery</span>
                        <span className="text-white">₹{Math.round(finalTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-200 text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConfirmPayment}
                    disabled={isProcessing || !canPay}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <span>{isProcessing ? 'Processing...' : selectedPaymentTab === 'Cash on Delivery' ? 'Place Order' : 'Pay Now'}</span>
                    <div className="w-3 h-3 border border-white/60 rounded-sm grid grid-cols-2 gap-0.5 p-0.5">
                      <div className="bg-white"></div>
                      <div className="bg-white"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL (Matching Screenshot 5) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1d22] border border-[#2d2f36] rounded-2xl max-w-xl w-full p-8 text-center space-y-6 shadow-2xl">
            {/* Green Check Circle */}
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-6 h-6 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h3 className="font-extrabold text-base text-gray-100">
                Your purchase of the following reads is successful
              </h3>
            </div>

            {/* List of Purchased Books Horizontal Row */}
            <div className="grid grid-cols-2 gap-4 text-left">
              {items.slice(0, 2).map((item) => {
                const product = item.product;
                const bg = product?.coverBgColor || '#facc15';
                const isLight = bg === '#f8fafc' || bg === '#facc15' || bg === '#ffffff';

                return (
                  <div key={item.id} className="flex gap-3 bg-[#16171a] p-3 rounded-lg border border-[#272930]">
                    <div
                      className="w-14 h-20 rounded-sm p-1 flex flex-col justify-between text-center flex-shrink-0"
                      style={{ backgroundColor: bg, color: isLight ? '#0f172a' : '#ffffff' }}
                    >
                      <div className="text-[7px] font-black uppercase tracking-tight">{product?.title}</div>
                      <div className="w-3 h-3 rounded-full border border-current mx-auto my-auto"></div>
                      <div className="text-[6px] font-bold uppercase">{product?.author}</div>
                    </div>

                    <div className="flex flex-col justify-between text-[11px]">
                      <div>
                        <h4 className="font-bold text-gray-100 truncate max-w-[130px]">{product?.title}</h4>
                        <p className="text-[10px] text-gray-400">by <span className="text-gray-300">{product?.author}</span></p>
                        <p className="text-[9px] text-gray-500 mt-0.5">{product?.format || 'Paperback'}</p>
                      </div>
                      <div className="text-xs font-bold text-white">₹{product?.price}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/');
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                <span>Continue your Shopping</span>
                <div className="w-3.5 h-3.5 border border-white/60 rounded-sm grid grid-cols-2 gap-0.5 p-0.5">
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
