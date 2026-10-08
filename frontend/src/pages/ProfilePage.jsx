import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { User, Gift, MapPin, Trash2, Plus, LogOut } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../features/auth/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [showAddressForm, setShowAddressForm] = useState(false);
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

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => (await api.get('/addresses')).data
  });

  const createAddressMutation = useMutation({
    mutationFn: async (addr) => (await api.post('/addresses', addr)).data,
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      setShowAddressForm(false);
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

  const deleteAddressMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/addresses/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries(['addresses'])
  });

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-6 text-xs text-gray-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-100">My Account</h1>
          <p className="text-gray-400">Manage member profile, loyalty points, and shipping destinations</p>
        </div>
        <button
          onClick={logout}
          className="px-3 py-1.5 bg-[#202126] hover:bg-rose-950/60 border border-[#2d2f36] hover:border-rose-800 text-rose-300 rounded font-semibold flex items-center gap-1.5 transition"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {/* Account Info and Gift Points Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#16171a] p-5 rounded-xl border border-[#23252a] space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-100">{user?.firstName} {user?.lastName}</h2>
              <p className="text-gray-400 text-[11px]">{user?.email}</p>
            </div>
          </div>
          <div className="pt-2 text-[11px] text-gray-400">
            <span>Membership: </span>
            <span className="text-emerald-400 font-semibold">{user?.role || 'CUSTOMER'}</span>
          </div>
        </div>

        <div className="bg-[#16171a] p-5 rounded-xl border border-[#23252a] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Gift className="w-4 h-4" />
              <span>Gift Points Balance</span>
            </div>
            <div className="text-2xl font-black text-white">{user?.giftPointsBalance || 0} pts</div>
            <p className="text-[10px] text-gray-400">Redeemable for ₹{user?.giftPointsBalance || 0} off on checkout</p>
          </div>
        </div>
      </div>

      {/* Saved Addresses */}
      <div className="bg-[#16171a] p-5 rounded-xl border border-[#23252a] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-bold text-gray-100">Saved Delivery Addresses</h2>
          </div>
          <button
            onClick={() => setShowAddressForm(!showAddressForm)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[11px] flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Address
          </button>
        </div>

        {showAddressForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createAddressMutation.mutate(formData);
            }}
            className="p-4 bg-[#1f2026] rounded-lg border border-[#2c2d36] space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                type="text"
                placeholder="Recipient Name"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                className="bg-[#16171a] border border-[#2d2f36] rounded px-3 py-1.5 text-xs text-gray-200 outline-none"
              />
              <input
                required
                type="tel"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="bg-[#16171a] border border-[#2d2f36] rounded px-3 py-1.5 text-xs text-gray-200 outline-none"
              />
            </div>
            <input
              required
              type="text"
              placeholder="Street Address, Building"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full bg-[#16171a] border border-[#2d2f36] rounded px-3 py-1.5 text-xs text-gray-200 outline-none"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                required
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="bg-[#16171a] border border-[#2d2f36] rounded px-3 py-1.5 text-xs text-gray-200 outline-none"
              />
              <input
                required
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="bg-[#16171a] border border-[#2d2f36] rounded px-3 py-1.5 text-xs text-gray-200 outline-none"
              />
              <input
                required
                type="text"
                placeholder="PIN"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="bg-[#16171a] border border-[#2d2f36] rounded px-3 py-1.5 text-xs text-gray-200 outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddressForm(false)}
                className="px-3 py-1 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-blue-600 text-white rounded font-bold"
              >
                Save
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {addresses?.map((addr) => (
            <div key={addr.id} className="bg-[#1f2026] p-4 rounded-lg border border-[#2c2d36] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-bold text-gray-200">
                  <span>{addr.recipientName}</span>
                  <button
                    onClick={() => deleteAddressMutation.mutate(addr.id)}
                    className="text-gray-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-gray-400 mt-1">{addr.street}</p>
                <p className="text-gray-400">{addr.city}, {addr.state} — {addr.postalCode}</p>
                <p className="text-gray-500 text-[11px] mt-1">Phone: {addr.phoneNumber}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
