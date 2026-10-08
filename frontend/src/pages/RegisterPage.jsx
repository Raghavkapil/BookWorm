import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Gift } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await registerUser(data);
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
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
          <h1 className="text-base font-extrabold text-gray-100">Create Member Account</h1>
          <p className="text-[11px] text-gray-400">Join Book Worm to read, reorder, and earn gift points</p>
        </div>

        <div className="bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-lg flex items-center gap-2 text-[11px] text-amber-300">
          <Gift className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span><strong>500 Bonus Gift Points</strong> credited on sign up!</span>
        </div>

        {serverError && (
          <div className="p-3 bg-rose-950/70 border border-rose-800 rounded text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">First Name</label>
              <input
                type="text"
                {...register('firstName')}
                className="w-full bg-[#202126] border border-[#2d2f36] rounded px-3 py-2 text-xs text-gray-200 outline-none"
                placeholder="First"
              />
              {errors.firstName && <p className="text-rose-400 mt-0.5">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Last Name</label>
              <input
                type="text"
                {...register('lastName')}
                className="w-full bg-[#202126] border border-[#2d2f36] rounded px-3 py-2 text-xs text-gray-200 outline-none"
                placeholder="Last"
              />
              {errors.lastName && <p className="text-rose-400 mt-0.5">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Email Address</label>
            <input
              type="email"
              {...register('email')}
              className="w-full bg-[#202126] border border-[#2d2f36] rounded px-3 py-2 text-xs text-gray-200 outline-none"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-rose-400 mt-0.5">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Password</label>
            <input
              type="password"
              {...register('password')}
              className="w-full bg-[#202126] border border-[#2d2f36] rounded px-3 py-2 text-xs text-gray-200 outline-none"
              placeholder="Min 6 characters"
            />
            {errors.password && <p className="text-rose-400 mt-0.5">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-bold text-xs transition mt-2"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-[11px] text-gray-400 pt-2 border-t border-[#23252a]">
          Already registered?{' '}
          <Link to="/login" className="text-blue-400 hover:underline font-bold">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
