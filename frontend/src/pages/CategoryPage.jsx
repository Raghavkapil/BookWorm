import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/product/ProductCard';

export default function CategoryPage() {
  const { slug } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['category-products', slug],
    queryFn: async () => {
      const res = await api.get(`/categories/${slug}/products`);
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="h-96 flex items-center justify-center text-sm text-gray-500">Loading category books...</div>;
  }

  if (error || !data) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Category Not Found</h2>
        <Link to="/catalogue" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const { category, products } = data;

  return (
    <div className="space-y-8">
      <Link to="/catalogue" className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1 w-fit">
        <ArrowLeft className="w-3.5 h-3.5" /> All Categories
      </Link>

      <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-indigo-300" />
          <h1 className="text-2xl sm:text-3xl font-extrabold">{category.name}</h1>
        </div>
        <p className="text-sm text-indigo-200 max-w-xl">{category.description}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Available Titles ({products.length})</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
