import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'customer1@bookstore.com',
      password: 'Password123!'
    }
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 text-xs">
      <div className="bg-[#16171a] p-8 rounded-2xl border border-[#23252a] space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-gray-400 rounded-sm grid grid-cols-2 gap-0.5 p-0.5 mx-auto">
            <div className="bg-gray-400"></div>
            <div className="bg-gray-400"></div>
            <div className="bg-gray-400"></div>
            <div className="bg-gray-400"></div>
          </div>
          <h1 className="text-base font-extrabold text-gray-100">Sign In to Book Worm</h1>
          <p className="text-[11px] text-gray-400">Access your basket, orders, and 500 Gift Points</p>
        </div>

        {serverError && (
          <div className="p-3 bg-rose-950/70 border border-rose-800 rounded text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Email Address</label>
            <input
              type="email"
              {...register('email')}
              className="w-full bg-[#202126] border border-[#2d2f36] rounded px-3 py-2 text-xs text-gray-200 outline-none"
              placeholder="customer1@bookstore.com"
            />
            {errors.email && <p className="text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Password</label>
            <input
              type="password"
              {...register('password')}
              className="w-full bg-[#202126] border border-[#2d2f36] rounded px-3 py-2 text-xs text-gray-200 outline-none"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-rose-400 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-bold text-xs transition"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="bg-[#1f2026] p-3 rounded text-[11px] text-gray-400 space-y-1">
          <p className="font-bold text-gray-300">Demo Account:</p>
          <p>• customer1@bookstore.com / Password123! (500 Gift Pts)</p>
        </div>

        <div className="text-center text-[11px] text-gray-400 pt-2 border-t border-[#23252a]">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:underline font-bold">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
