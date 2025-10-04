import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react'

export default function RUplaceLanding() {
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn("discord");
    console.log('Form submitted');
  };

  return (
    <div className="flex h-screen w-full bg-black">
      {/* Left Side - Description with Canvas */}
      <div className="relative w-1/2 flex flex-col justify-center items-center p-16 overflow-hidden">

        <div className="relative z-10 max-w-xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-8xl font-black tracking-tighter text-white" style={{ fontFamily: 'monospace' }}>
              RU<span className="text-red-600">place</span>
            </h1>
            <div className="h-1 w-32 bg-red-600"></div>
          </div>

          <p className="text-2xl text-gray-300 leading-relaxed font-light">
            A collaborative pixel canvas for the Rutgers community. Create, collaborate, and leave your mark in real-time.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="space-y-2">
              <div className="text-red-500 text-4xl font-bold">∞</div>
              <h3 className="text-white font-semibold text-lg">Infinite Canvas</h3>
              <p className="text-gray-400 text-sm">Place pixels anywhere on campus</p>
            </div>
            <div className="space-y-2">
              <div className="text-red-500 text-4xl font-bold">⚡</div>
              <h3 className="text-white font-semibold text-lg">Live Updates</h3>
              <p className="text-gray-400 text-sm">See changes in real-time</p>
            </div>
            <div className="space-y-2">
              <div className="text-red-500 text-4xl font-bold">🎨</div>
              <h3 className="text-white font-semibold text-lg">Full Palette</h3>
              <p className="text-gray-400 text-sm">Express yourself with colors</p>
            </div>
            <div className="space-y-2">
              <div className="text-red-500 text-4xl font-bold">👥</div>
              <h3 className="text-white font-semibold text-lg">Community</h3>
              <p className="text-gray-400 text-sm">Build together</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-1/2 bg-white flex flex-col justify-center items-center p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Toggle Tabs */}
          <div className="flex space-x-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all text-sm tracking-wide ${isLogin
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all text-sm tracking-wide ${!isLogin
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              SIGN UP
            </button>
          </div>

          {/* Login Form */}
          {isLogin ? (
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-gray-500 mb-3 tracking-wider uppercase">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition font-medium"
                  placeholder="netid@rutgers.edu"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-gray-500 mb-3 tracking-wider uppercase">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition font-medium"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">Remember me</span>
                </label>
                <button className="text-sm text-red-600 hover:text-red-700 font-bold">
                  Forgot?
                </button>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full bg-red-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 text-sm tracking-wide mt-8"
              >
                ENTER RUPLACE →
              </button>
            </div>
          ) : (
            /* Sign Up Form */
            <div className="space-y-6">
              <div>
                <label htmlFor="signup-name" className="block text-xs font-bold text-gray-500 mb-3 tracking-wider uppercase">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition font-medium"
                  placeholder="Scarlet Knight"
                />
              </div>
              <div>
                <label htmlFor="signup-email" className="block text-xs font-bold text-gray-500 mb-3 tracking-wider uppercase">
                  Rutgers Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition font-medium"
                  placeholder="netid@rutgers.edu"
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-xs font-bold text-gray-500 mb-3 tracking-wider uppercase">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition font-medium"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="signup-confirm" className="block text-xs font-bold text-gray-500 mb-3 tracking-wider uppercase">
                  Confirm Password
                </label>
                <input
                  id="signup-confirm"
                  type="password"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition font-medium"
                  placeholder="••••••••"
                />
              </div>
              <label className="flex items-start cursor-pointer pt-2">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500 mt-0.5"
                />
                <span className="ml-3 text-sm text-gray-600 font-medium">
                  I agree to the community guidelines
                </span>
              </label>
              <button
                onClick={handleSubmit}
                className="w-full bg-red-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 text-sm tracking-wide mt-8"
              >
                CREATE ACCOUNT →
              </button>
            </div>
          )}

          <div className="text-center pt-6">
            <p className="text-xs text-gray-400 font-medium">
              By continuing, you agree to our terms and policies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}