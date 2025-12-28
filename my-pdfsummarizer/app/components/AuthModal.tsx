'use client';

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onAuthSuccess: (token: string, userData: any) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AuthModal({ isOpen, onClose, mode, onAuthSuccess }: AuthModalProps) {
  const [isSignIn, setIsSignIn] = useState(mode === 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isSignIn ? '/auth/signin' : '/auth/signup';
      const data = isSignIn
        ? { email, password }
        : { email, password, name };

      const response = await axios.post(`${API_URL}${endpoint}`, data);
      
      onAuthSuccess(response.data.access_token, response.data.user);
      toast.success(isSignIn ? 'Signed in successfully!' : 'Account created successfully!');
      
      // Reset form
      setEmail('');
      setPassword('');
      setName('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isSignIn ? "Sign In" : "Sign Up"}
        </h2>
        <p className="text-gray-600 mb-6">
          {isSignIn
            ? "Welcome back! Please sign in to your account."
            : "Create a new account to get started."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSignIn && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isSignIn}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
                placeholder="Enter your name"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isSignIn ? "Signing in..." : "Creating account..."}
              </>
            ) : isSignIn ? (
              "Sign In"
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignIn(!isSignIn)}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            {isSignIn
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}