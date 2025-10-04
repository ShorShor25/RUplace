import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react'

export default function RUplaceLanding() {

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

      {/* Right Side - Discord Login */}
      <div className="w-1/2 bg-white flex flex-col justify-center items-center p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-gray-900">Welcome</h2>
            <p className="text-gray-600 text-lg">Sign in with Discord to start creating</p>
          </div>

          <div className="space-y-6 pt-8">
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
        </div>
      </div >
    </div >
  );
}