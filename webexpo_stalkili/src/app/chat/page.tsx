'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, X, Check, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { SelectorChips } from '@/components/ui/selector-chips';
import { ResearcherResults } from '@/components/ui/researcher-card';
import { SiriOrb } from '@/components/ui/siri-orb';

type Message = { role: 'user' | 'ai'; text: string; query?: string };

const BROAD_FIELDS = ['Technology', 'Medicine & Health', 'Engineering', 'Natural Sciences', 'Social Sciences', 'Business', 'Arts & Humanities', 'Law & Policy'];
const SPECIFIC_FIELDS: Record<string, string[]> = {
  'Technology': ['AI / Machine Learning', 'Software Engineering', 'Quantum Computing', 'Cybersecurity', 'Data Science', 'Robotics', 'Blockchain', 'Computer Vision'],
  'Medicine & Health': ['Med Tech', 'Neuroscience', 'Genomics', 'Public Health', 'Oncology', 'Biomedical Engineering', 'Psychiatry'],
  'Engineering': ['Aerospace', 'Mechanical', 'Electrical', 'Civil', 'Chemical', 'Nuclear', 'Materials Science'],
  'Natural Sciences': ['Physics', 'Climate Science', 'Astrophysics', 'Biology', 'Chemistry', 'Ecology', 'Mathematics'],
  'Social Sciences': ['Psychology', 'Economics', 'Sociology', 'Political Science', 'Anthropology', 'Education'],
  'Business': ['Finance', 'Entrepreneurship', 'Marketing', 'Supply Chain', 'Organisational Behaviour'],
  'Arts & Humanities': ['Philosophy', 'Linguistics', 'History', 'Literature', 'Architecture', 'Film Studies'],
  'Law & Policy': ['International Law', 'Tech Policy', 'Environmental Law', 'Human Rights', 'IP Law'],
};

const SOURCES = [
  { id: 'linkedin', label: 'LinkedIn', icon: '🔗' },
  { id: 'scholar', label: 'Google Scholar', icon: '🎓' },
  { id: 'researchgate', label: 'ResearchGate', icon: '📄' },
  { id: 'all', label: 'All Web', icon: '🌐' },
];

// Field picker popover component
function FieldPicker({
  broadSelected, setBroadSelected,
  specificSelected, setSpecificSelected,
  onClose,
}: {
  broadSelected: string[]; setBroadSelected: (v: string[]) => void;
  specificSelected: string[]; setSpecificSelected: (v: string[]) => void;
  onClose: () => void;
}) {
  const available = broadSelected.flatMap((f) => SPECIFIC_FIELDS[f] ?? []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute bottom-full mb-3 left-0 right-0 z-50 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-2xl shadow-2xl p-5 flex flex-col gap-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-semibold text-sm">Filter by Field</p>
          <p className="text-gray-500 text-xs mt-0.5">Select broad then narrow down</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
          <X size={16} />
        </button>
      </div>

      {/* Broad fields */}
      <div>
        <p className="text-xs text-gray-600 uppercase tracking-widest mb-3">Broad Field</p>
        <div className="flex flex-wrap gap-2">
          {BROAD_FIELDS.map((f) => {
            const sel = broadSelected.includes(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => {
                  const next = sel ? broadSelected.filter((x) => x !== f) : [...broadSelected, f];
                  setBroadSelected(next);
                  setSpecificSelected([]);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                  sel
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                }`}
              >
                {sel && <Check size={11} />}
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Specific fields */}
      <AnimatePresence>
        {available.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 pt-4">
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-3">Specialisation</p>
              <SelectorChips options={available} selected={specificSelected} onChange={setSpecificSelected} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active summary */}
      {(broadSelected.length > 0 || specificSelected.length > 0) && (
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <p className="text-xs text-gray-500">
            {[...broadSelected, ...specificSelected].length} field{[...broadSelected, ...specificSelected].length !== 1 ? 's' : ''} selected
          </p>
          <button
            type="button"
            onClick={() => { setBroadSelected([]); setSpecificSelected([]); }}
            className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </motion.div>
  );
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitializing } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [broadSelected, setBroadSelected] = useState<string[]>([]);
  const [specificSelected, setSpecificSelected] = useState<string[]>([]);
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [activeSources, setActiveSources] = useState<string[]>(['all']);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialSent = useRef(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isInitializing, router]);

  useEffect(() => {
    const q = searchParams?.get('q');
    if (q && !initialSent.current) {
      initialSent.current = true;
      handleSend(q);
    }
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowFieldPicker(false);
        setShowSourcePicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleSource = (id: string) => {
    if (id === 'all') {
      setActiveSources(['all']);
      return;
    }
    setActiveSources((prev) => {
      const without = prev.filter((s) => s !== 'all');
      const next = without.includes(id) ? without.filter((s) => s !== id) : [...without, id];
      return next.length === 0 ? ['all'] : next;
    });
  };

  function handleSend(message: string) {
    if (!message.trim()) return;
    setShowFieldPicker(false);
    const tags = [...broadSelected, ...specificSelected];
    const sources = activeSources.includes('all') ? [] : activeSources.map((s) => SOURCES.find((x) => x.id === s)?.label ?? s);
    const parts = [message.trim(), ...(tags.length ? [`Fields: ${tags.join(', ')}`] : []), ...(sources.length ? [`Sources: ${sources.join(', ')}`] : [])];
    const full = parts.join(' | ');
    setMessages((prev) => [...prev, { role: 'user', text: full }]);
    setLoading(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'ai', text: '', query: message.trim() }]);
      setLoading(false);
    }, 1200);
  }

  const isEmpty = messages.length === 0;
  const allTags = [...broadSelected, ...specificSelected];

  if (isInitializing || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-sm text-gray-400">
        Loading authenticated chat...
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      {/* Mobile gradient — wider spread, sits lower */}
      <div
        className="absolute inset-0 sm:hidden"
        style={{ background: 'radial-gradient(170% 120% at 50% 115%, rgba(245,87,2,1) 0%, rgba(245,87,2,0.8) 8%, rgba(120,40,0,0.6) 18%, rgba(30,10,0,0.9) 32%, rgba(0,0,0,1) 55%)' }}
      />
      {/* Desktop gradient */}
      <div
        className="absolute inset-0 hidden sm:block"
        style={{ background: 'radial-gradient(125% 125% at 50% 101%, rgba(245,87,2,1) 0%, rgba(245,87,2,0.8) 8%, rgba(120,40,0,0.6) 18%, rgba(30,10,0,0.9) 32%, rgba(0,0,0,1) 55%)' }}
      />
      {/* Top bar */}
      <div className="relative z-20 shrink-0 flex items-center justify-center px-5 py-3 border-b border-white/5 bg-black/30 backdrop-blur-xl">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <SiriOrb
            size={28}
            animationDuration={16}
            colors={{ c1: 'oklch(72% 0.22 35)', c2: 'oklch(62% 0.16 45)', c3: 'oklch(48% 0.04 0)' }}
          />
          <span className="text-white font-semibold tracking-wide text-sm">Veritas</span>
        </button>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto pt-6 pb-4">
        <div className="max-w-3xl w-full mx-auto px-4">
          {isEmpty ? null : (
            <div className="flex flex-col gap-6 py-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'user' ? (
                    <div className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed bg-white text-black">
                      {m.text}
                    </div>
                  ) : (
                    <div className="w-full max-w-full">
                      <ResearcherResults query={m.query ?? ''} />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                    {[0, 1, 2].map((i) => <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input area — pinned to bottom */}
      <div className="relative z-10 shrink-0 max-w-3xl w-full mx-auto px-4 pb-5">

        {/* Field picker popover anchor */}
        <div ref={pickerRef} className="relative">
          <AnimatePresence>
            {showFieldPicker && (
              <FieldPicker
                broadSelected={broadSelected} setBroadSelected={setBroadSelected}
                specificSelected={specificSelected} setSpecificSelected={setSpecificSelected}
                onClose={() => setShowFieldPicker(false)}
              />
            )}
          </AnimatePresence>

          {/* Active field tags row */}
          <AnimatePresence>
            {allTags.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="flex flex-wrap gap-1.5 mb-2">
                {allTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs px-2.5 py-1 rounded-full">
                    {tag}
                    <button type="button" onClick={() => {
                      setBroadSelected((p) => p.filter((t) => t !== tag));
                      setSpecificSelected((p) => p.filter((t) => t !== tag));
                    }} className="hover:text-white"><X size={10} /></button>
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prompt box with field + source buttons */}
          <div className="relative">
            <PromptInputBox
              onSend={handleSend}
              isLoading={loading}
              placeholder={allTags.length > 0 ? `In: ${allTags.join(', ')}…` : 'Search a supervisor, recruiter, or topic…'}
            />
            {/* Bottom-left button row — Fields + Sources */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setShowFieldPicker((p) => !p); setShowSourcePicker(false); }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                  showFieldPicker || allTags.length > 0
                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                    : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/20'
                }`}
              >
                <Layers size={12} />
                Fields
                {allTags.length > 0 && <span className="bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{allTags.length}</span>}
              </button>

              <button
                type="button"
                onClick={() => { setShowSourcePicker((p) => !p); setShowFieldPicker(false); }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                  showSourcePicker || !activeSources.includes('all')
                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                    : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/20'
                }`}
              >
                <Database size={12} />
                Sources
                {!activeSources.includes('all') && <span className="bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{activeSources.length}</span>}
              </button>
            </div>
          </div>

          {/* Source picker popup */}
          <AnimatePresence>
            {showSourcePicker && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute bottom-full mb-3 left-0 right-0 z-50 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-2xl shadow-2xl p-5 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">Sources</p>
                    <p className="text-gray-500 text-xs mt-0.5">Where to search</p>
                  </div>
                  <button onClick={() => setShowSourcePicker(false)} className="text-gray-500 hover:text-white transition-colors p-1">
                    <X size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SOURCES.map((src) => {
                    const active = activeSources.includes(src.id);
                    return (
                      <button
                        key={src.id}
                        type="button"
                        onClick={() => toggleSource(src.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                          active
                            ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {active && <Check size={11} />}
                        {src.label}
                      </button>
                    );
                  })}
                </div>
                {!activeSources.includes('all') && (
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <p className="text-xs text-gray-500">{activeSources.length} source{activeSources.length !== 1 ? 's' : ''} selected</p>
                    <button type="button" onClick={() => setActiveSources(['all'])} className="text-xs text-orange-400 hover:text-orange-300 transition-colors">Clear</button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-black mt-3">
          Scopeout uses AI to surface public information. Always verify before acting.
        </p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <React.Suspense>
      <ChatContent />
    </React.Suspense>
  );
}
