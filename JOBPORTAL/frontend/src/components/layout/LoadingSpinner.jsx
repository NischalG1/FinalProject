import React from 'react';
import { Sparkles } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full bg-transparent">
      <div className="flex flex-col items-center gap-5">
        {/* Soft Pastel Sage Loading Structure */}
        <div className="relative">
          {/* Subtle Outer Soft Ambient Ring */}
          <div className="w-16 h-16 rounded-xl bg-[#047857]/5 absolute inset-0 blur-md pointer-events-none" />
          
          {/* Outer Base Light Border Ring */}
          <div className="w-16 h-16 rounded-full border-[3px] border-[#E2E8F0] shadow-sm"></div>
          
          {/* Main Dark Sage Animated Ring */}
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-[3px] border-[#047857] border-t-transparent border-r-transparent animate-spin [animation-duration:0.8s]"></div>
          
          {/* Secondary Muted Counter-Spinning Inner Ring */}
          <div className="absolute top-1 left-1 w-14 h-14 rounded-full border border-[#94A3B8]/30 border-b-transparent border-l-transparent animate-spin [animation-direction:reverse] [animation-duration:1.2s]"></div>
          
          {/* Inner Floating Clean Surface Icon Base */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1.5 rounded-full border border-[#E2E8F0] shadow-sm">
            <Sparkles className="w-4 h-4 text-[#047857] animate-pulse" />
          </div>
        </div>

        {/* Deep Slate High-Contrast Typography */}
        <div className="text-center space-y-1">
          <p className="text-[#0F172A] font-semibold tracking-wide text-sm animate-pulse [animation-duration:1.5s]">
            Loading...
          </p>
          <p className="text-[#475569] text-xs font-medium tracking-wider max-w-[200px] mx-auto opacity-90">
            Please wait while we prepare your content
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;