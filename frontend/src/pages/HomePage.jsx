import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronDown, Check } from 'lucide-react';
import api from '../lib/api';
import BookHorizontalCard from '../components/product/BookHorizontalCard';
import { useAuth } from '../features/auth/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('All');
  const [format, setFormat] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('Relevance');

  // Categories matching left sidebar
  const categoriesList = [
    'All',
    'Romance',
    'Mystery',
    'Science Fiction',
    'Fantasy',
    'Historical',
    'Biography',
    'Self-help',
    'Memoir',
    'Travel',
    'Cooking',
    "Children's",
    'Young Adult',
    'Comics & Graphic Novels',
    'Poetry',
    'Drama',
    'Science',
    'Philosophy',
    'Religion',
    'Language Learning'
  ];

  // Fetch all products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['home-products', { selectedCategory, searchTerm, language, format, priceRange, sortBy }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') {
        const slug = selectedCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        params.append('categorySlug', slug);
      }
      if (searchTerm) params.append('search', searchTerm);
      if (language !== 'All') params.append('language', language);
      if (format !== 'All') params.append('format', format);
      if (priceRange === 'Under ₹200') params.append('maxPrice', '200');
      if (priceRange === '₹200 - ₹500') {
        params.append('minPrice', '200');
        params.append('maxPrice', '500');
      }
      if (priceRange === 'Above ₹500') params.append('minPrice', '500');
      if (sortBy === 'Price: Low to High') {
        params.append('sortBy', 'price');
        params.append('order', 'asc');
      } else if (sortBy === 'Price: High to Low') {
        params.append('sortBy', 'price');
        params.append('order', 'desc');
      }

      params.append('limit', '50');
      const res = await api.get(`/products?${params.toString()}`);
      return res.data?.products || [];
    }
  });

  const products = productsData || [];

  // Group books into sections
  const recommended = products.slice(0, 3);
  const bestsellers = products.slice(3, 6);
  const newLaunches = products.slice(6, 9);
  const remaining = products.slice(9);

  return (
    <div className="flex min-h-[calc(100vh-53px)] bg-[#111215]">
      {/* Left Sidebar Category Menu */}
      <aside className="w-56 flex-shrink-0 bg-[#16171a] border-r border-[#23252a] py-3 text-xs overflow-y-auto">
        <ul className="space-y-0.5">
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <li key={cat}>
                <button
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-5 py-1.5 transition text-[12px] font-medium ${
                    isSelected
                      ? 'bg-[#22242a] text-blue-400 font-semibold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1b1f]'
                  }`}
                >
                  {cat}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-x-hidden space-y-7">
        {/* Top Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="bg-[#1a1b20] border border-[#2b2d35] rounded-lg px-3 py-2 flex items-center justify-between">
            <div className="w-full">
              <label className="text-[10px] text-gray-500 block leading-none mb-1">Search you want to read here</label>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-xs text-gray-200 outline-none w-full placeholder-gray-500"
              />
            </div>
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-2" />
          </div>

          {/* Language Dropdown */}
          <div className="bg-[#1a1b20] border border-[#2b2d35] rounded-lg px-3 py-2 relative">
            <label className="text-[10px] text-gray-500 block leading-none mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs text-gray-200 outline-none w-full appearance-none cursor-pointer"
            >
              <option value="All" className="bg-[#1a1b20] text-gray-200">All</option>
              <option value="English" className="bg-[#1a1b20] text-gray-200">English</option>
              <option value="Hindi" className="bg-[#1a1b20] text-gray-200">Hindi</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-3 bottom-3 pointer-events-none" />
          </div>

          {/* Format Dropdown */}
          <div className="bg-[#1a1b20] border border-[#2b2d35] rounded-lg px-3 py-2 relative">
            <label className="text-[10px] text-gray-500 block leading-none mb-1">Format (Paperback, ebook etc)</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="bg-transparent text-xs text-gray-200 outline-none w-full appearance-none cursor-pointer"
            >
              <option value="All" className="bg-[#1a1b20] text-gray-200">All</option>
              <option value="Paperback" className="bg-[#1a1b20] text-gray-200">Paperback</option>
              <option value="Hard Cover" className="bg-[#1a1b20] text-gray-200">Hard Cover</option>
              <option value="eBook" className="bg-[#1a1b20] text-gray-200">eBook</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-3 bottom-3 pointer-events-none" />
          </div>

          {/* Price Range Dropdown */}
          <div className="bg-[#1a1b20] border border-[#2b2d35] rounded-lg px-3 py-2 relative">
            <label className="text-[10px] text-gray-500 block leading-none mb-1">Price Range</label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="bg-transparent text-xs text-gray-200 outline-none w-full appearance-none cursor-pointer"
            >
              <option value="All" className="bg-[#1a1b20] text-gray-200">All</option>
              <option value="Under ₹200" className="bg-[#1a1b20] text-gray-200">Under ₹200</option>
              <option value="₹200 - ₹500" className="bg-[#1a1b20] text-gray-200">₹200 - ₹500</option>
              <option value="Above ₹500" className="bg-[#1a1b20] text-gray-200">Above ₹500</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-3 bottom-3 pointer-events-none" />
          </div>

          {/* Sort By Dropdown */}
          <div className="bg-[#1a1b20] border border-[#2b2d35] rounded-lg px-3 py-2 relative">
            <label className="text-[10px] text-gray-500 block leading-none mb-1">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-gray-200 outline-none w-full appearance-none cursor-pointer"
            >
              <option value="Relevance" className="bg-[#1a1b20] text-gray-200">Relevance</option>
              <option value="Price: Low to High" className="bg-[#1a1b20] text-gray-200">Price: Low to High</option>
              <option value="Price: High to Low" className="bg-[#1a1b20] text-gray-200">Price: High to Low</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-3 bottom-3 pointer-events-none" />
          </div>
        </div>

        {/* Content Sections */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-500 animate-pulse">Loading catalogue...</div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-xs text-gray-500">No books found matching criteria.</div>
        ) : (
          <div className="space-y-8">
            {/* 1. Recommended for You */}
            {recommended.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-bold text-gray-200 tracking-wide">Recommended for You</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  {recommended.map((b) => (
                    <BookHorizontalCard key={b.id} product={b} />
                  ))}
                </div>
              </section>
            )}

            {/* 2. Bestsellers this Month */}
            {bestsellers.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-bold text-gray-200 tracking-wide">Bestsellers this Month</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  {bestsellers.map((b) => (
                    <BookHorizontalCard key={b.id} product={b} />
                  ))}
                </div>
              </section>
            )}

            {/* 3. New Launches */}
            {newLaunches.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-bold text-gray-200 tracking-wide">New Launches</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  {newLaunches.map((b) => (
                    <BookHorizontalCard key={b.id} product={b} />
                  ))}
                </div>
              </section>
            )}

            {/* 4. More from Catalogue */}
            {remaining.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-bold text-gray-200 tracking-wide">Explore More Reads</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  {remaining.map((b) => (
                    <BookHorizontalCard key={b.id} product={b} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
