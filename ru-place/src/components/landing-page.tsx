import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react'

export default function RUplaceLanding() {

  const handleDiscordLogin = () => {
    signIn("discord", { callbackUrl: '/draw' })
  };

  return (
    <div className="flex h-screen w-full bg-black">
      {/* Left Side - Description with Canvas */}
      <div className="relative w-1/2 flex flex-col justify-center items-center p-16 overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-10">
          {/* Blocky Title */}
          <div className="space-y-6">
            <h1
              className="text-8xl font-extrabold uppercase tracking-tight text-white leading-none"
              style={{ fontFamily: "'Press Start 2P', monospace" }} // retro/blocky font
            >
              RU<span className="text-red-600">PLACE</span>
            </h1>

          </div>

          {/* Punchier Subtitle */}
          <p className="text-2xl text-gray-300 leading-snug font-medium tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            A collaborative digital canvas.<br></br>
            Claim space on the Rutgers map.<br></br>
            Make art in real time.
          </p>
        </div>
      </div>


      {/* Right Side - Discord Login */}
      <div className="w-1/2 bg-white flex flex-col justify-center items-center p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-gray-900" style={{ fontFamily: "'Press Start 2P', monospace" }}>WELCOME!</h2>
            <p className="text-gray-600 text-lg" style={{ fontFamily: "'Press Start 2P', monospace" }}>Sign in with Discord to start creating!</p>
          </div>

          <div className="space-y-6 pt-8">
            <button
              onClick={handleDiscordLogin}
              className="w-full bg-[#5865F2] text-white py-5 px-6 rounded-xl font-bold hover:bg-[#4752C4] transition-all shadow-lg shadow-[#5865F2]/30 hover:shadow-xl hover:shadow-[#5865F2]/40 text-base tracking-wide flex items-center justify-center gap-3" style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              CONTINUE WITH DISCORD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}