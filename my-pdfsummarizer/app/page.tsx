'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Sparkles, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import AuthModal from './components/AuthModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [user, setUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = () => {
      // Check if we're in the browser
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('token');
      if (token) {
        axios.get(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => setUser(res.data))
          .catch(() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
            }
          });
      }
    };

    checkAuth();
  }, []);
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setFile(selectedFile);
    setSummary(null);

    // Dynamically import pdfjs-dist only on client side
    const pdfjsLib = await import('pdfjs-dist');

    // Configure PDF.js worker - use the worker from the installed package
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
    
    // Preview PDF with smaller scale to prevent huge images
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    // Reduce scale from 1.5 to 1.0 or even 0.8 for smaller preview
    const viewport = page.getViewport({ scale: 1.0 });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ 
      canvasContext: context, 
      viewport,
      canvas: canvas 
    }).promise;
    setPreview(canvas.toDataURL());
  };

  // ... rest of the file remains the same ...
  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthModalOpen(true);
      setAuthMode('signin');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/pdf/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSummary(response.data.summary);
      toast.success('PDF summarized successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to summarize PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster position="top-right" />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onAuthSuccess={(token, userData) => {
          localStorage.setItem('token', token);
          setUser(userData);
          setIsAuthModalOpen(false);
          toast.success('Authentication successful!');
        }}
      />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">PDF Summarizer</h1>
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user.name || user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAuthMode('signin');
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Summarize Your PDFs 
          </h2>
          <p className="text-xl text-gray-600">
            Upload a PDF file and get an intelligent summary in seconds
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Upload className="w-6 h-6 text-purple-600" />
              Upload PDF
            </h3>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 transition-colors"
            >
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Click to select or drag and drop
              </p>
              <p className="text-sm text-gray-400">
                PDF files only (Max 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {file && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Selected:</strong> {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            {preview && (
              <div className="mt-4 max-h-64 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                <img
                  src={preview}
                  alt="PDF Preview"
                  className="max-w-full max-h-64 object-contain rounded-lg"
                />
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Summarize PDF
                </>
              )}
            </button>
          </div>

          {/* Summary Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Summary
            </h3>

            {summary ? (
              <div className="prose max-w-none">
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {summary}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Your summary will appear here</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}