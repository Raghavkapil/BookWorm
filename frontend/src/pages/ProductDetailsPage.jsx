import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ShoppingCart, Truck, Heart, Star, Globe, DollarSign } from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../features/cart/CartContext';
import { useAuth } from '../features/auth/AuthContext';
import { useWishlist } from '../features/wishlist/WishlistContext';

// Static author bio map — keyed by author name
const AUTHOR_BIOS = {
  'Daniel Reed':
    'Daniel Reed is a writer, minimalist, and productivity coach based in San Francisco. With a passion for intentional living, Daniel has dedicated his career to helping individuals simplify their lives — one habit, one space, and one thought at a time. He is the author of The Joy of Minimalism, an acclaimed guide to decluttering both physically and mentally. His other works include Less, But Better and The Focus Reset, which have helped thousands rethink consumerism, prioritize what truly matters, and build sustainable systems for personal growth.',
  'James Clear':
    'James Clear is an author and speaker focused on habits, decision making, and continuous improvement. His book Atomic Habits has sold over 15 million copies worldwide. He is a regular speaker at Fortune 500 companies and his work has been featured in the New York Times, Wall Street Journal, and Time magazine.',
  'Arjun Patel':
    'Arjun Patel is a productivity researcher and author known for his practical approach to focus and deep work. He has spent over a decade studying high-performance individuals and distilling their habits into actionable frameworks for everyday people.',
  'Raj Patel':
    'Raj Patel is a learning scientist and educator whose work bridges cognitive psychology and real-world skill acquisition. He coaches executives, athletes, and students on mastering complex disciplines through deliberate practice.',
  'James Wright':
    'James Wright is a life coach and bestselling author who has guided thousands of professionals toward achieving their most ambitious goals. His straightforward, no-nonsense style has made him a sought-after speaker at leadership summits across Asia and Europe.',
  'Carl Sagan':
    'Carl Sagan was an American astronomer, planetary scientist, cosmologist, and author. He is best known for his popular science books and the award-winning television series Cosmos: A Personal Voyage, which he co-wrote and narrated.',
  'George Orwell':
    'George Orwell was an English novelist, essayist, journalist, and critic. His work is marked by lucid prose, social criticism, opposition to totalitarianism, and support for democratic socialism. He wrote 1984 and Animal Farm, both enduring classics.',
  'Robert C. Martin':
    'Robert C. Martin, known as "Uncle Bob", is a software engineer and author renowned for promoting software craftsmanship. He is a co-author of the Agile Manifesto and has written extensively on clean code, design patterns, and professional software development.',
};

function BookCover({ product, size = 'large' }) {
  const bg = product.coverBgColor || '#facc15';
  const isLight = bg === '#f8fafc' || bg === '#facc15' || bg === '#ffffff';
  const sizeClasses =
    size === 'large'
      ? 'w-[160px] h-[215px]'
      : 'w-[90px] h-[120px]';

  return (
    <div
      className={`${sizeClasses} flex-shrink-0 rounded-sm overflow-hidden flex flex-col justify-between text-center select-none shadow-lg border border-[#2b2d34]`}
      style={{ backgroundColor: bg, color: isLight ? '#0f172a' : '#ffffff', padding: size === 'large' ? '12px' : '6px' }}
    >
      <div className={`font-black uppercase tracking-wider leading-tight ${size === 'large' ? 'text-[11px] pt-2' : 'text-[9px]'}`}>
        {product.title}
      </div>
      <div className="my-auto flex items-center justify-center">
        <div
          className={`rounded-full border-2 border-current flex items-center justify-center ${size === 'large' ? 'w-10 h-10' : 'w-5 h-5'}`}
        >
          <div className={`rounded-full bg-current ${size === 'large' ? 'w-3 h-3' : 'w-1.5 h-1.5'}`} />
        </div>
      </div>
      <div
        className={`font-bold uppercase tracking-widest opacity-80 ${size === 'large' ? 'text-[9px] pb-2' : 'text-[7px]'}`}
      >
        {product.author}
      </div>
    </div>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Reset quantity to 1 whenever the user navigates to a different product
  useEffect(() => {
    setQuantity(1);
    setAdded(false);
  }, [id]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => (await api.get(`/products/${id}`)).data
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', id],
    queryFn: async () => (await api.get(`/products/${id}/related`)).data,
    enabled: !!id
  });

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-gray-400">Loading book details...</div>;
  }

  if (!product) {
    return (
      <div className="p-12 text-center space-y-3">
        <h2 className="text-base font-bold text-gray-200">Book Not Found</h2>
        <Link to="/catalogue" className="text-xs text-blue-400 hover:underline">
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      await addItem({ productId: product.id, quantity });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      alert(err.message || 'Failed to add item');
    }
  };

  const authorBio = AUTHOR_BIOS[product.author] || null;
  const wishlisted = isInWishlist(product.id);

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto space-y-6 text-xs">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 flex items-center gap-1.5">
        <Link to="/" className="text-blue-400 hover:underline">Home</Link>
        <span>/</span>
        <span className="text-blue-400">Non-Fiction</span>
        <span>/</span>
        <span className="text-blue-400">{product.tagText?.split(',')[0]?.trim() || 'Self Help'}</span>
      </nav>

      {/* Main 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_280px] gap-6 items-start">

        {/* LEFT: Book Cover + excerpt */}
        <div className="flex flex-col items-start gap-4">
          <BookCover product={product} size="large" />
          {/* Optional decorative excerpt quote */}
          <div className="bg-[#16171a] border border-[#23252a] rounded-xl p-4 text-[11px] text-gray-300 leading-relaxed italic max-w-[220px]">
            "A refreshing path to clarity in a cluttered world."
            <div className="mt-3 text-gray-400 not-italic font-semibold text-[10px]">
              Discover how less can truly be more.
            </div>
            <div className="mt-3 text-gray-400 not-italic text-[10px] leading-loose">
              In <span className="text-gray-200 font-semibold">{product.title}</span>,{' '}
              {product.author} guides you through practical strategies to declutter your mind,
              space, and thought. Whether you're overwhelmed, over-committed, or just over it —
              this book offers a calm, mindful approach to building a simpler, more fulfilling life.
            </div>
          </div>
        </div>

        {/* CENTER: Book details */}
        <div className="space-y-4">
          {/* Tag */}
          <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">
            {product.tagText || product.category?.name || 'Non-fiction, Self Help'}
          </p>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-100 leading-tight">
            {product.title}
          </h1>

          {/* Author */}
          <p className="text-gray-400">
            by{' '}
            <Link
              to={`/catalogue?search=${encodeURIComponent(product.author)}`}
              className="text-blue-400 hover:underline font-semibold"
            >
              {product.author}
            </Link>
          </p>

          {/* Publisher */}
          {product.brand && (
            <p className="text-gray-400 text-[11px]">
              Published by:{' '}
              <Link to={`/brands/${product.brand.slug}`} className="text-blue-400 hover:underline">
                {product.brand.name}
              </Link>
            </p>
          )}

          {/* Format */}
          <p className="text-gray-400">{product.format || 'Paperback'}</p>

          {/* Tag links */}
          <p className="text-[11px] text-indigo-400/90">
            {product.tagText || product.category?.name || 'Non-fiction, Self Help'}
          </p>

          {/* Price */}
          <div className="text-2xl font-black text-white">₹{product.price}</div>

          {/* Delivery */}
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <Truck className="w-4 h-4" />
            <span>
              {product.deliveryDays
                ? `Delivery within ${product.deliveryDays} day${product.deliveryDays === 1 ? '' : 's'}`
                : 'Delivery within 2–5 days'}
            </span>
          </div>

          {/* Quantity stepper */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-gray-400 text-[11px]">Qty:</span>
            <div className="flex items-center border border-[#2c2e38] rounded-lg overflow-hidden bg-[#202126]">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1.5 text-gray-300 hover:text-white hover:bg-[#2a2c35] transition font-bold text-sm"
              >
                −
              </button>
              <span className="px-4 py-1.5 text-white font-bold text-xs min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1.5 text-gray-300 hover:text-white hover:bg-[#2a2c35] transition font-bold text-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
                added ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {added ? 'Added to Basket' : 'Add to Cart'}
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-bold text-xs transition border ${
                wishlisted
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-[#202126] border-[#2c2e38] text-gray-300 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Meta stats row */}
          <div className="flex items-center gap-6 pt-3 border-t border-[#23252a]">
            <div className="flex items-center gap-2 text-gray-400">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">Language</div>
                <div className="text-[11px] text-blue-400">{product.language || 'English'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">Rating</div>
                <div className="flex text-amber-400 gap-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${s <= Math.round(product.rating || 4.5) ? 'fill-amber-400' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">Sells</div>
                <div className="text-[11px] text-gray-300">
                  {((product.id || 1) * 37 + 108).toLocaleString()} copies sold
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Related Reads sidebar */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-200">Related Reads</h2>
          <div className="space-y-4">
            {(relatedProducts || []).slice(0, 4).map((item) => (
              <Link
                key={item.id}
                to={`/products/${item.id}`}
                className="flex items-start gap-3 group hover:bg-[#1a1b1f] p-2 rounded-lg transition"
              >
                <BookCover product={item} size="small" />
                <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5 space-y-1">
                  <h3 className="text-[12px] font-bold text-gray-100 group-hover:text-blue-400 leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    by{' '}
                    <span className="text-blue-400">{item.author}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-[10px] text-gray-400">{item.format || 'Paperback'}</p>
                  <p className="text-[10px] text-indigo-400/90">
                    {item.tagText || item.category?.name || 'Non-fiction, Self Help'}
                  </p>
                  <div className="text-[13px] font-extrabold text-white">₹{item.price}</div>
                  <p className="text-[9px] text-gray-400">
                    {item.deliveryDays
                      ? `Delivery within ${item.deliveryDays} day${item.deliveryDays === 1 ? '' : 's'}`
                      : 'Delivery within 2–5 days'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* About the writer */}
      {authorBio && (
        <div className="bg-[#16171a] border border-[#23252a] rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-gray-200">About the writer</h2>
          <div className="flex items-start gap-4">
            {/* Avatar placeholder */}
            <div className="w-14 h-14 rounded-full bg-[#2a2c33] border border-[#3a3c44] flex-shrink-0 flex items-center justify-center text-lg font-black text-gray-300 select-none">
              {product.author.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="space-y-1 flex-1">
              <div className="text-sm font-bold text-gray-100">{product.author}</div>
              <p className="text-[11px] text-gray-400 leading-relaxed">{authorBio}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="bg-[#16171a] border border-[#23252a] rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-200">Reviews</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Leave a review */}
          <div className="space-y-3">
            <p className="text-[11px] text-gray-400">Leave Your Review</p>
            <textarea
              maxLength={100}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Placeholder text"
              className="w-full bg-[#202126] border border-[#2d2f36] rounded-md px-3 py-2 text-xs text-gray-200 outline-none resize-none h-24"
            />
            <div className="text-right text-[10px] text-gray-500">{reviewText.length}/100</div>

            {/* Star rating picker */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setReviewRating(s)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-4 h-4 transition ${
                      s <= (hoverRating || reviewRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>

            <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition">
              Submit →
            </button>
          </div>

          {/* Sample review */}
          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-gray-200">John Smith</div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              The accordion component delivers large amounts of content in a small space through
              progressive disclosure. The user gets key details about the underlying content and
              can choose to expand that content within the constraints of the accordion.
            </p>
            <div className="flex gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
