"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  BookOpen,
  Mail,
  Globe,
  GitBranch,
  MessageCircle,
  Briefcase,
  ExternalLink,
  GraduationCap,
  FlaskConical,
  Users,
  BarChart3,
  Star,
  CalendarDays,
  Building2,
  Quote,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Researcher {
  id: string;
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

interface ProfileData extends Researcher {
  email?: string;
  website?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  department?: string;
  bio?: string;
  hIndex?: number;
  citations?: number;
  acceptingStudents?: boolean;
  projects?: Project[];
  recentPublications?: Publication[];
  collaborators?: Collaborator[];
}

interface Project {
  title: string;
  description: string;
  status: "active" | "completed" | "upcoming";
  year: string;
  funding?: string;
}

interface Publication {
  title: string;
  journal: string;
  year: string;
  citations: number;
  url?: string;
}

interface Collaborator {
  name: string;
  university: string;
  image: string;
}

// ─── Mock enrichment (replace with real API call) ─────────────────────────────

function enrichProfile(base: Researcher): ProfileData {
  const enrichments: Record<string, Partial<ProfileData>> = {
    "sarah-chen": {
      email: "s.chen@mit.edu",
      website: "https://sarahchen.mit.edu",
      github: "sarahchen-ml",
      twitter: "sarahchen_ai",
      linkedin: "sarah-chen-mit",
      department: "Department of Computer Science & Artificial Intelligence",
      bio: "I lead the Adaptive Machine Intelligence Lab at MIT, where we investigate how AI systems can learn robustly under distribution shift. My work sits at the intersection of theoretical ML, neuroscience, and real-world deployment — with applications in healthcare diagnostics and climate modelling. Before MIT I was a postdoc at DeepMind and completed my PhD at Stanford.",
      hIndex: 34,
      citations: 12400,
      acceptingStudents: true,
      projects: [
        {
          title: "Robust Generalisation Under Covariate Shift",
          description: "Developing theoretical foundations and practical algorithms for ML models that maintain performance when deployed data differs from training distributions.",
          status: "active",
          year: "2023–2026",
          funding: "NSF Grant #2201234 · $1.2M",
        },
        {
          title: "Neural Scaling Laws for Medical Imaging",
          description: "Investigating how model scale interacts with data quality in medical image classification tasks across diverse hospital datasets.",
          status: "active",
          year: "2024–2027",
          funding: "NIH R01 · $890K",
        },
        {
          title: "Causal Representation Learning",
          description: "Building models that learn causal structure rather than statistical correlations, enabling more reliable predictions in novel environments.",
          status: "upcoming",
          year: "2025–2028",
        },
      ],
      recentPublications: [
        { title: "Invariant Risk Minimization via Causal Mechanisms", journal: "NeurIPS 2024", year: "2024", citations: 312 },
        { title: "Distribution-Free Uncertainty Quantification at Scale", journal: "ICML 2024", year: "2024", citations: 189 },
        { title: "Adaptive Test-Time Compute for Robust Inference", journal: "ICLR 2024", year: "2024", citations: 204 },
      ],
      collaborators: [
        { name: "James Okafor", university: "Stanford", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
        { name: "Priya Nair", university: "Cambridge", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face" },
      ],
    },
  };

  // ← use base.id directly — no more fragile slug derivation from name
  const extra = enrichments[base.id] ?? {
    email: `${base.name.split(" ")[0].toLowerCase()}@university.edu`,
    department: "Department of Research",
    bio: base.summary,
    hIndex: Math.floor(base.matchScore / 3),
    citations: base.publications * 42,
    acceptingStudents: true,
    projects: [
      { title: "AI-Driven Research Initiative", description: "Exploring cutting-edge applications in the field.", status: "active" as const, year: "2024–2026" },
    ],
    recentPublications: [
      { title: "Recent Advances in the Field", journal: "Nature 2024", year: "2024", citations: 87 },
    ],
    collaborators: [],
  };

  return { ...base, ...extra };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatPill({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-white/8 bg-white/4 px-6 py-4">
      <Icon className="h-4 w-4 text-orange-400 mb-0.5" />
      <span className="text-xl font-bold text-white tracking-tight">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">{children}</span>
      <div className="flex-1 h-px bg-white/8" />
    </div>
  );
}

function StatusDot({ status }: { status: "active" | "completed" | "upcoming" }) {
  const map = {
    active: "bg-emerald-400",
    completed: "bg-gray-500",
    upcoming: "bg-orange-400",
  };
  return <span className={`inline-block h-2 w-2 rounded-full ${map[status]} mr-2`} />;
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ← params.id is the dynamic segment from /profile/[id]/page.tsx
    const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
    if (!id) return;

    // Try to get from sessionStorage (written by ResearcherCard on click)
    const stored = sessionStorage.getItem(`researcher_${id}`);
    if (stored) {
      try {
        const base: Researcher = JSON.parse(stored);
        setProfile(enrichProfile(base));
      } catch {
        // JSON parse failed — fall through to fallback below
      }
      setLoading(false);
      return;
    }

    // Fallback mock — in prod, fetch from your API here using `id`
    const fallback: Researcher = {
      id,
      name: "Sarah Chen",
      title: "Associate Professor",
      university: "Massachusetts Institute of Technology",
      location: "Cambridge, MA",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
      topics: ["Machine Learning", "Computer Vision", "Robotics", "NLP"],
      matchScore: 92,
      publications: 47,
      summary: "Pioneering research in adaptive AI systems with real-world deployment focus.",
    };
    setProfile(enrichProfile(fallback));
    setLoading(false);
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Profile not found.
      </div>
    );
  }

  const matchColor =
    profile.matchScore >= 80 ? "text-emerald-400" : profile.matchScore >= 50 ? "text-orange-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-orange-500/6 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-orange-500/4 blur-3xl" />
      </div>

      {/* ── Header bar ── */}
      <header className="sticky top-0 z-50 border-b border-white/8 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <span className="text-xs font-medium text-gray-600 tracking-wider uppercase">Supervisor Profile</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10 relative z-10">

        {/* ── Hero card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8 rounded-2xl border border-white/10 bg-white/4 p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={profile.image}
                alt={profile.name}
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover ring-2 ring-white/10"
              />
              {profile.acceptingStudents && (
                <div className="absolute -bottom-2 -right-2 rounded-full border border-emerald-400/30 bg-black px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  Open
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{profile.name}</h1>
                <span className={`text-sm font-semibold ${matchColor}`}>
                  {profile.matchScore}% match
                </span>
              </div>
              <p className="text-orange-400 font-medium mb-1">{profile.title}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {profile.university}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location}
                </span>
                {profile.department && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {profile.department}
                  </span>
                )}
              </div>

              {/* Topics */}
              <div className="flex flex-wrap gap-2">
                {profile.topics.map((t) => (
                  <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contact links */}
          <div className="mt-6 pt-5 border-t border-white/8 flex flex-wrap gap-3">
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-gray-300 transition-all hover:border-orange-500/40 hover:text-orange-300">
                <Mail className="h-3.5 w-3.5" />
                {profile.email}
              </a>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-gray-300 transition-all hover:border-orange-500/40 hover:text-orange-300">
                <Globe className="h-3.5 w-3.5" />
                Website
              </a>
            )}
            {profile.github && (
              <a href={`https://github.com/${profile.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-gray-300 transition-all hover:border-orange-500/40 hover:text-orange-300">
                <GitBranch className="h-3.5 w-3.5" />
                GitHub
              </a>
            )}
            {profile.linkedin && (
              <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-gray-300 transition-all hover:border-orange-500/40 hover:text-orange-300">
                <Briefcase className="h-3.5 w-3.5" />
                LinkedIn
              </a>
            )}
            {profile.twitter && (
              <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-gray-300 transition-all hover:border-orange-500/40 hover:text-orange-300">
                <MessageCircle className="h-3.5 w-3.5" />
                @{profile.twitter}
              </a>
            )}
          </div>
        </motion.div>

        {/* ── Stats row ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <StatPill icon={BookOpen} label="Publications" value={profile.publications} />
          <StatPill icon={BarChart3} label="Citations" value={profile.citations?.toLocaleString() ?? "—"} />
          <StatPill icon={Star} label="h-index" value={profile.hIndex ?? "—"} />
          <StatPill icon={Users} label="Accepting" value={profile.acceptingStudents ? "Yes" : "No"} />
        </motion.div>

        {/* ── Two column grid on large screens ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left column — 3/5 */}
          <div className="lg:col-span-3 space-y-8">

            {/* Bio */}
            {profile.bio && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                <SectionLabel>About</SectionLabel>
                <div className="relative pl-5">
                  <Quote className="absolute -top-1 left-0 h-3.5 w-3.5 text-orange-500/50" />
                  <p className="text-sm text-gray-300 leading-relaxed">{profile.bio}</p>
                </div>
              </motion.section>
            )}

            {/* Projects */}
            {profile.projects && profile.projects.length > 0 && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <SectionLabel>Research Projects</SectionLabel>
                <div className="space-y-3">
                  {profile.projects.map((project, i) => (
                    <div key={i} className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-orange-500/20">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-sm font-semibold text-white leading-snug">{project.title}</h3>
                        <span className="shrink-0 flex items-center text-xs text-gray-500">
                          <StatusDot status={project.status} />
                          <span className="capitalize">{project.status}</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mb-3">{project.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {project.year && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {project.year}
                          </span>
                        )}
                        {project.funding && (
                          <span className="flex items-center gap-1">
                            <FlaskConical className="h-3 w-3" />
                            {project.funding}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/* Right column — 2/5 */}
          <div className="lg:col-span-2 space-y-8">

            {/* Recent publications */}
            {profile.recentPublications && profile.recentPublications.length > 0 && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                <SectionLabel>Selected Papers</SectionLabel>
                <div className="space-y-3">
                  {profile.recentPublications.map((pub, i) => (
                    <div key={i} className="group rounded-xl border border-white/8 bg-white/4 p-4 transition-colors hover:border-orange-500/20">
                      <p className="text-xs font-medium text-white leading-snug mb-1.5 group-hover:text-orange-100 transition-colors">
                        {pub.title}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{pub.journal}</span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {pub.citations}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <a
                  href={profile.website ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  View all publications
                </a>
              </motion.section>
            )}

            {/* Collaborators */}
            {profile.collaborators && profile.collaborators.length > 0 && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <SectionLabel>Collaborators</SectionLabel>
                <div className="space-y-2.5">
                  {profile.collaborators.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3">
                      <img src={c.image} alt={c.name} className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10" />
                      <div>
                        <p className="text-xs font-medium text-white">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.university}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Contact CTA */}
            {profile.acceptingStudents && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="rounded-2xl border border-orange-500/20 bg-orange-500/6 p-5"
              >
                <p className="text-sm font-semibold text-white mb-1">Accepting PhD students</p>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  {profile.name.split(" ")[0]} is currently looking for motivated doctoral students.
                </p>
                <a
                  href={`mailto:${profile.email ?? ""}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-black transition-all hover:bg-orange-400 active:scale-95"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Send an email
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}