'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, MapPin } from 'lucide-react';

export interface Researcher {
  id: string; // ← added required id field
  name: string;
  title: string;
  university: string;
  location: string;
  image: string;
  topics: string[];
  matchScore: number;
  publications: number;
  summary: string;
}

export const MOCK_RESEARCHERS: Researcher[] = [
  {
    id: 'sarah-chen', // ← added id
    name: 'Dr. Sarah Chen',
    title: 'Associate Professor of Machine Learning',
    university: 'MIT',
    location: 'Cambridge, MA',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop',
    topics: ['Deep Learning', 'Computer Vision', 'Neural Architecture'],
    matchScore: 97,
    publications: 84,
    summary: 'Pioneering work in efficient neural architectures with 12 NeurIPS papers. Strong industry collaboration track record.',
  },
  {
    id: 'james-okafor', // ← added id
    name: 'Prof. James Okafor',
    title: 'Chair of AI Ethics & Policy',
    university: 'Stanford University',
    location: 'Stanford, CA',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&h=200&auto=format&fit=crop',
    topics: ['AI Safety', 'Fairness in ML', 'Tech Policy'],
    matchScore: 65,
    publications: 61,
    summary: 'Leading voice on responsible AI deployment. Advises EU and UN bodies on algorithmic accountability frameworks.',
  },
  {
    id: 'priya-nair', // ← added id
    name: 'Dr. Priya Nair',
    title: 'Research Scientist, NLP Group',
    university: 'University of Cambridge',
    location: 'Cambridge, UK',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=200&h=200&auto=format&fit=crop',
    topics: ['Natural Language Processing', 'LLMs', 'Multilingual AI'],
    matchScore: 35,
    publications: 47,
    summary: 'Specialises in low-resource language models. Highly collaborative supervisor with 6 active PhD students.',
  },
];

interface ResearcherCardProps {
  researcher: Researcher;
  index: number;
}

const matchLabel = (score: number): { label: string; color: string } => {
  if (score >= 80) return { label: 'High', color: 'text-emerald-400' };
  if (score >= 50) return { label: 'Average', color: 'text-orange-400' };
  return { label: 'Low', color: 'text-red-400' };
};

function ResearcherCard({ researcher, index }: ResearcherCardProps) {
  const match = matchLabel(researcher.matchScore);
  const router = useRouter(); // ← moved inside component so hook rules are satisfied

  // ← writes researcher data to sessionStorage then navigates
  const handleView = () => {
    sessionStorage.setItem(`researcher_${researcher.id}`, JSON.stringify(researcher));
    router.push(`/profile/${researcher.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="w-52 shrink-0 bg-white/5 rounded-2xl border border-white/8 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer p-4 flex flex-col gap-3"
      onClick={handleView} // ← whole card is clickable too
    >
      {/* Avatar row */}
      <div className="flex items-center gap-3">
        <img
          src={researcher.image}
          alt={researcher.name}
          className="w-11 h-11 rounded-full object-cover object-top shrink-0 border-2 border-white/10"
        />
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-xs leading-tight truncate">{researcher.name}</h3>
          <p className="text-gray-500 text-[10px] mt-0.5 leading-snug line-clamp-2">{researcher.title}</p>
        </div>
      </div>

      {/* Summary */}
      <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-3 border-b border-white/5 pb-3">
        "{researcher.summary}"
      </p>

      {/* Meta */}
      <div className="flex flex-col gap-1.5 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><MapPin size={10} className="shrink-0" />{researcher.university} · {researcher.location}</span>
        <span className="flex items-center gap-1"><BookOpen size={10} className="shrink-0" />{researcher.publications} publications</span>
      </div>

      {/* Topics */}
      <div className="flex flex-wrap gap-1">
        {researcher.topics.slice(0, 2).map((topic) => (
          <span key={topic} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
            {topic}
          </span>
        ))}
        {researcher.topics.length > 2 && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-500">
            +{researcher.topics.length - 2}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <span className={`text-[10px] font-bold ${match.color}`}>{match.label} match</span>
        <button
          onClick={(e) => { e.stopPropagation(); handleView(); }} // ← stopPropagation avoids double-fire from card onClick
          className="text-[10px] text-gray-500 hover:text-orange-400 font-medium transition-colors"
        >
          View →
        </button>
      </div>
    </motion.div>
  );
}

interface ResearcherResultsProps {
  query: string;
}

export function ResearcherResults({ query }: ResearcherResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-3"
    >
      <p className="text-gray-300 text-sm leading-relaxed">
        Here is a list of researchers matching{' '}
        <span className="text-orange-400 font-medium">"{query}"</span> — ranked by compatibility:
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {MOCK_RESEARCHERS.map((r, i) => (
          <ResearcherCard key={r.id} researcher={r} index={i} /> // ← key uses stable id
        ))}
      </div>
    </motion.div>
  );
}