import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 mt-20">
      {/* Value Propositions */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 bg-indigo-900/50 rounded-xl text-indigo-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Fast Delivery</h4>
              <p className="text-xs text-gray-400">2-4 days express delivery across India</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 bg-emerald-900/50 rounded-xl text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Authentic Editions</h4>
              <p className="text-xs text-gray-400">100% genuine publisher books</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 bg-amber-900/50 rounded-xl text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Gift Points Reward</h4>
              <p className="text-xs text-gray-400">Earn 5% points on every order</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 bg-sky-900/50 rounded-xl text-sky-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">48-Hour Cancellation</h4>
              <p className="text-xs text-gray-400">Hassle-free instant refund window</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">ChapterCraft</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Curated book collection covering software architecture, business leadership, science, habits, and literature.
            </p>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-white mb-3">Popular Categories</h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/categories/technology" className="hover:text-white transition">Technology & Code</Link></li>
              <li><Link to="/categories/business" className="hover:text-white transition">Business & Finance</Link></li>
              <li><Link to="/categories/self-help" className="hover:text-white transition">Self-Help & Productivity</Link></li>
              <li><Link to="/categories/science" className="hover:text-white transition">Science & Physics</Link></li>
              <li><Link to="/categories/fiction" className="hover:text-white transition">Classic & Modern Fiction</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-white mb-3">Publishers</h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/brands/penguin-random-house" className="hover:text-white transition">Penguin Random House</Link></li>
              <li><Link to="/brands/oreilly-media" className="hover:text-white transition">O'Reilly Media</Link></li>
              <li><Link to="/brands/harpercollins" className="hover:text-white transition">HarperCollins</Link></li>
              <li><Link to="/brands/oxford-university-press" className="hover:text-white transition">Oxford University Press</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-white mb-3">Demo Credentials</h5>
            <div className="bg-gray-800 p-3 rounded-lg text-xs space-y-1 font-mono text-gray-300">
              <p className="text-indigo-400 font-sans font-medium">Demo Customer 1:</p>
              <p>customer1@bookstore.com</p>
              <p>Password: Password123!</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} ChapterCraft Online Bookstore. AI Specialist Capstone Project.</p>
          <div className="flex gap-4">
            <span className="hover:text-gray-400 transition">Terms of Service</span>
            <span className="hover:text-gray-400 transition">Privacy Policy</span>
            <span className="hover:text-gray-400 transition">Cancellation Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
