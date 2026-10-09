import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UserCheck, UserPlus, Search, BookOpen, Star, Sparkles, Feather } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../features/auth/AuthContext';

const DEFAULT_AUTHORS = [
  {
    name: 'Robert C. Martin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    genre: 'Software Engineering & Clean Architecture',
    bio: 'Renowned software engineer, author of Clean Code and Clean Architecture. Champion of software craftsmanship.',
    followers: '128.4K',
    booksCount: 2
  },
  {
    name: 'Robin Sharma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    genre: 'Personal Mastery & Leadership',
    bio: 'Globally celebrated leadership guru, author of The 5 AM Club and The Monk Who Sold His Ferrari.',
    followers: '254.1K',
    booksCount: 3
  },
  {
    name: 'Robert Greene',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    genre: 'Strategy, Power & Human Nature',
    bio: 'New York Times bestselling author of The 48 Laws of Power, Mastery, and The Laws of Human Nature.',
    followers: '412.8K',
    booksCount: 2
  },
  {
    name: 'Michael Pollan',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    genre: 'Science, Nature & Food Culture',
    bio: 'Author of The Omnivore’s Dilemma and How to Change Your Mind. Knight Professor of Science Journalism.',
    followers: '98.5K',
    booksCount: 1
  },
  {
    name: 'Arthur Conan Doyle',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    genre: 'Classic Detective Fiction & Mystery',
    bio: 'British writer and physician who created the legendary detective character Sherlock Holmes.',
    followers: '560.2K',
    booksCount: 4
  },
  {
    name: 'Leo Tolstoy',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    genre: 'Literary Realism & Philosophy',
    bio: 'Master of realistic fiction, author of War and Peace and Anna Karenina. Giant of Russian literature.',
    followers: '380.9K',
    booksCount: 2
  }
];

export default function WritersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [followedWriters, setFollowedWriters] = useState(() => {
    try {
      const saved = localStorage.getItem(`bookworm_followed_writers_${user?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : ['Robert C. Martin', 'Robin Sharma'];
    } catch {
      return ['Robert C. Martin', 'Robin Sharma'];
    }
  });

  // Query catalogue products to link authors to real books in store
  const { data: productsData } = useQuery({
    queryKey: ['catalogue_books_all'],
    queryFn: async () => (await api.get('/products?limit=50')).data
  });

  const toggleFollow = (authorName) => {
    setFollowedWriters((prev) => {
      const updated = prev.includes(authorName)
        ? prev.filter((a) => a !== authorName)
        : [...prev, authorName];
      localStorage.setItem(
        `bookworm_followed_writers_${user?.id || 'guest'}`,
        JSON.stringify(updated)
      );
      return updated;
    });
  };

  const filteredAuthors = DEFAULT_AUTHORS.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const followedList = DEFAULT_AUTHORS.filter((a) => followedWriters.includes(a.name));

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#20222a]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Feather className="w-7 h-7 text-blue-500" />
              <span>My Writers</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">
              {followedWriters.length} Following
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Follow your favorite authors to get alerts for new releases, special editions, and curated recommendations
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Find an author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-[#16171a] border border-[#262830] text-gray-100 placeholder-gray-500 rounded-xl outline-none focus:border-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Authors You Follow */}
      {followedList.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Authors You Follow</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {followedList.map((author) => {
              const authorBooks = productsData?.products?.filter((p) =>
                p.author.toLowerCase().includes(author.name.toLowerCase())
              );

              return (
                <div
                  key={author.name}
                  className="bg-[#16171a] border border-[#262830] hover:border-blue-500/40 rounded-xl p-4 flex flex-col justify-between transition group"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#2b2d35]"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition truncate">
                        {author.name}
                      </h3>
                      <p className="text-[11px] text-blue-400/90 font-medium truncate">
                        {author.genre}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {author.bio}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Books link */}
                  <div className="mt-4 pt-3 border-t border-[#20222a] flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-400 font-medium">
                      {author.followers} readers
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/catalogue?search=${encodeURIComponent(author.name)}`}
                        className="px-2.5 py-1 text-[11px] bg-[#202126] hover:bg-[#282a33] text-gray-300 rounded-lg border border-[#2d2f38] transition font-medium"
                      >
                        View Books
                      </Link>
                      <button
                        onClick={() => toggleFollow(author.name)}
                        className="px-2.5 py-1 text-[11px] bg-blue-600/20 hover:bg-red-500/20 text-blue-400 hover:text-red-400 border border-blue-500/30 hover:border-red-500/30 rounded-lg transition font-medium flex items-center gap-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Following</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured / Discover Authors */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>Discover Acclaimed Writers</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredAuthors.map((author) => {
            const isFollowed = followedWriters.includes(author.name);

            return (
              <div
                key={author.name}
                className="bg-[#16171a] border border-[#262830] hover:border-[#383a45] rounded-xl p-4 flex flex-col justify-between transition group"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#2b2d35]"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition truncate">
                      {author.name}
                    </h3>
                    <p className="text-[11px] text-indigo-400/90 font-medium truncate">
                      {author.genre}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {author.bio}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-[#20222a] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-400 font-medium">
                    {author.followers} readers
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/catalogue?search=${encodeURIComponent(author.name)}`}
                      className="px-2.5 py-1 text-[11px] bg-[#202126] hover:bg-[#282a33] text-gray-300 rounded-lg border border-[#2d2f38] transition font-medium"
                    >
                      View Books
                    </Link>
                    <button
                      onClick={() => toggleFollow(author.name)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg transition font-medium flex items-center gap-1 ${
                        isFollowed
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {isFollowed ? (
                        <>
                          <UserCheck className="w-3 h-3" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
