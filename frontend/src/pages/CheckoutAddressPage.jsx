import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../lib/api';

export default function CheckoutAddressPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);
  const [formData, setFormData] = useState({
    recipientName: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  });

  // Fetch addresses
  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get('/addresses');
      return res.data;
    },
    onSuccess: (data) => {
      if (data && data.length > 0 && !selectedAddressId) {
        const defaultAddr = data.find((a) => a.isDefault) || data[0];
        setSelectedAddressId(defaultAddr.id);
      }
    }
  });

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: async (newAddr) => {
      const res = await api.post('/addresses', newAddr);
      return res.data;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries(['addresses']);
      setSelectedAddressId(created.id);
      setShowNewAddressModal(false);
      setFormData({
        recipientName: '',
        phoneNumber: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false
      });
    }
  });

  const handleCreateAddress = (e) => {
    e.preventDefault();
    createAddressMutation.mutate(formData);
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      alert('Please select or add a delivery address');
      return;
    }
    sessionStorage.setItem('checkout_address_id', selectedAddressId);
    navigate('/checkout/payment');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Checkout Steps Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 text-xs font-semibold">
        <div className="flex items-center gap-2 text-indigo-600">
          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
          <span>Delivery Address</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-200" />
        <div className="flex items-center gap-2 text-gray-400">
          <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px]">2</span>
          <span>Payment & Points</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-200" />
        <div className="flex items-center gap-2 text-gray-400">
          <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px]">3</span>
          <span>Confirmation</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Select Delivery Address</h1>
          <p className="text-xs text-gray-500 mt-0.5">Where should we deliver your books?</p>
        </div>
        <button
          onClick={() => setShowNewAddressModal(true)}
          className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      {isLoading ? (
        <div className="h-48 bg-gray-100 animate-pulse rounded-2xl" />
      ) : addresses?.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-3">
          <MapPin className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="font-bold text-gray-800 text-sm">No Saved Addresses Found</h3>
          <p className="text-xs text-gray-500">Please add an address to proceed with your order.</p>
          <button
            onClick={() => setShowNewAddressModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Add Address Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses?.map((addr) => {
            const isSelected = selectedAddressId === addr.id;
            return (
              <div
                key={addr.id}
                onClick={() => setSelectedAddressId(addr.id)}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-sm">{addr.recipientName}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <p className="text-xs text-gray-600">{addr.street}</p>
                  <p className="text-xs text-gray-600">
                    {addr.city}, {addr.state} — {addr.postalCode}
                  </p>
                  <p className="text-xs text-gray-500 pt-1">Phone: {addr.phoneNumber}</p>
                </div>

                {addr.isDefault && (
                  <span className="mt-3 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-200 text-gray-700 w-fit">
                    Default Address
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleContinue}
          disabled={!selectedAddressId}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
        >
          Continue to Payment <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Add New Address Modal */}
      {showNewAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg">Add New Delivery Address</h3>
            <form onSubmit={handleCreateAddress} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Recipient Name</label>
                <input
                  required
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Alice Sharma"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Phone Number</label>
                <input
                  required
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Street Address</label>
                <input
                  required
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Flat No, Building, Street"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">City</label>
                  <input
                    required
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">State</label>
                  <input
                    required
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="State"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Postal Code (PIN)</label>
                <input
                  required
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 560001"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="defaultAddress"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="defaultAddress" className="text-gray-700 font-medium">Set as default delivery address</label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewAddressModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAddressMutation.isPending}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
