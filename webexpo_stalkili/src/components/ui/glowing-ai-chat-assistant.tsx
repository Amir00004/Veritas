'use client';

import { usePathname, useRouter } from 'next/navigation';
import { SiriOrb } from './siri-orb';

const FloatingAiAssistant = () => {
  const pathname = usePathname();
  const router   = useRouter();

  if (pathname !== '/') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => router.push('/chat')}
        aria-label="Open AI assistant"
        className="relative cursor-pointer transition-transform duration-300 hover:scale-110 focus:outline-none group"
      >
        {/* Glow halo — pushed behind with negative z */}
        <span className="absolute inset-0 -z-10 rounded-full blur-xl bg-orange-500/30 group-hover:bg-orange-500/50 transition-all duration-300" />

        <SiriOrb
          size={46}
          animationDuration={16}
          colors={{
            c1: "oklch(65% 0.16 35)",
            c2: "oklch(45% 0.03 0)",
            c3: "oklch(35% 0.02 0)",
          }}
        />
      </button>
    </div>
  );
};

export { FloatingAiAssistant };
