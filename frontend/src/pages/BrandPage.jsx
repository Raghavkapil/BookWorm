import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2 } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/product/ProductCard';

export default function BrandPage() {
  const { slug } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['brand-products', slug],
    queryFn: async () => {
      const res = await api.get(`/brands/${slug}/products`);
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="h-96 flex items-center justify-center text-sm text-gray-500">Loading publisher titles...</div>;
  }

  if (error || !data) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Publisher Not Found</h2>
        <Link to="/catalogue" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const { brand, products } = data;

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <Link to="/catalogue" className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1 w-fit">
        <ArrowLeft className="w-3.5 h-3.5" /> All Publishers
      </Link>

      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold">{brand.name}</h1>
        </div>
        <p className="text-sm text-gray-300 max-w-xl">{brand.description}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Published Editions ({products.length})</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
