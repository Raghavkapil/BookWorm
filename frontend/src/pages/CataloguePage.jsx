import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, Search, ArrowUpDown, BookX, Heart, ShoppingBag } from 'lucide-react';
import api from '../lib/api';
import BookHorizontalCard from '../components/product/BookHorizontalCard';
import { useWishlist } from '../features/wishlist/WishlistContext';

export default function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const brandId = searchParams.get('brandId') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Fetch filter metadata
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => (await api.get('/brands')).data
  });

  // Fetch Products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { search, categoryId, brandId, sortBy, order, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryId) params.append('categoryId', categoryId);
      if (brandId) params.append('brandId', brandId);
      if (sortBy) params.append('sortBy', sortBy);
      if (order) params.append('order', order);
      params.append('page', page);
      params.append('limit', 12);

      const res = await api.get(`/products?${params.toString()}`);
      return res.data;
    }
  });

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#20222a]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Book Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Explore our curated library of titles, timeless classics, and modern bestsellers
          </p>
        </div>
        <div className="text-xs text-gray-400 bg-[#16171a] px-3.5 py-1.5 rounded-full border border-[#262830] self-start sm:self-auto">
          Showing <span className="font-semibold text-white">{productsData?.pagination?.total || 0}</span> titles
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar Filters */}
        <aside className="space-y-5 bg-[#16171a] p-5 rounded-xl border border-[#262830] h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-[#20222a]">
            <div className="flex items-center gap-2 font-bold text-gray-100 text-sm">
              <Filter className="w-4 h-4 text-blue-500" />
              <span>Filters</span>
            </div>
            {(search || categoryId || brandId) && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Search within catalogue */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Search Title or Author</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-[#202126] border border-[#2d2f38] text-gray-100 placeholder-gray-500 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Genre / Category</label>
            <select
              value={categoryId}
              onChange={(e) => updateFilter('categoryId', e.target.value)}
              className="w-full py-2 px-3 text-xs bg-[#202126] border border-[#2d2f38] text-gray-100 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Categories ({categories?.length || 0})</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c._count?.products || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Publishers / Brands */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Publisher</label>
            <select
              value={brandId}
              onChange={(e) => updateFilter('brandId', e.target.value)}
              className="w-full py-2 px-3 text-xs bg-[#202126] border border-[#2d2f38] text-gray-100 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Publishers ({brands?.length || 0})</option>
              {brands?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b._count?.products || 0})
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Product Grid & Controls */}
        <div className="lg:col-span-3 space-y-5">
          {/* Sort bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#16171a] p-3.5 px-4 rounded-xl border border-[#262830] gap-3">
            <span className="text-xs text-gray-400 font-medium">
              Page {productsData?.pagination?.page || 1} of {productsData?.pagination?.totalPages || 1}
            </span>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <label className="text-xs font-medium text-gray-300">Sort By:</label>
              <select
                value={`${sortBy}:${order}`}
                onChange={(e) => {
                  const [s, o] = e.target.value.split(':');
                  const next = new URLSearchParams(searchParams);
                  next.set('sortBy', s);
                  next.set('order', o);
                  setSearchParams(next);
                }}
                className="py-1.5 px-3 text-xs bg-[#202126] border border-[#2d2f38] text-gray-200 rounded-lg outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="createdAt:desc">Newest Arrivals</option>
                <option value="rating:desc">Highest Rated</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="title:asc">Title: A to Z</option>
              </select>
            </div>
          </div>

          {/* Product Items */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-[#16171a] animate-pulse rounded-xl border border-[#262830]" />
              ))}
            </div>
          ) : productsData?.products?.length === 0 ? (
            <div className="bg-[#16171a] p-12 text-center rounded-xl border border-[#262830] space-y-4">
              <BookX className="w-12 h-12 text-gray-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No books found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                We couldn't find any books matching your current filters. Try searching for other terms or reset your filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productsData?.products?.map((product) => (
                <div key={product.id} className="relative group/wrapper">
                  <BookHorizontalCard product={product} />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                    title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-[#202126]/80 hover:bg-[#282932] text-gray-400 hover:text-red-400 border border-[#2b2d35] transition z-10"
                  >
                    <Heart
                      className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {productsData?.pagination?.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => updateFilter('page', (page - 1).toString())}
                className="px-3 py-1.5 text-xs bg-[#16171a] border border-[#262830] rounded-lg font-medium text-gray-300 disabled:opacity-40 hover:bg-[#202126] transition"
              >
                Previous
              </button>
              {[...Array(productsData.pagination.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateFilter('page', (i + 1).toString())}
                  className={`w-8 h-8 text-xs font-semibold rounded-lg transition ${
                    page === i + 1
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-[#16171a] border border-[#262830] text-gray-300 hover:bg-[#202126]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page >= productsData.pagination.totalPages}
                onClick={() => updateFilter('page', (page + 1).toString())}
                className="px-3 py-1.5 text-xs bg-[#16171a] border border-[#262830] rounded-lg font-medium text-gray-300 disabled:opacity-40 hover:bg-[#202126] transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
