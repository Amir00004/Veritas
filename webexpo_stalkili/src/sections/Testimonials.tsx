"use client";
import React from "react";
import { motion } from "framer-motion";
import { TestimonialsColumn, Testimonial } from "@/components/ui/testimonials-columns-1";

const testimonials: Testimonial[] = [
  {
    text: "I used Scopeout to research potential PhD supervisors before reaching out. Within minutes I had compatibility scores and personalised openers. I got three positive replies in one week.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    name: "Amara Osei",
    role: "PhD Applicant, UCL",
  },
  {
    text: "Before every interview I run the recruiter through Scopeout. Knowing their priorities and talking points before walking in the room is an unfair advantage — in the best way.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    name: "James Whitfield",
    role: "Senior Software Engineer",
  },
  {
    text: "Cold outreach used to feel like shouting into a void. Scopeout gives me a structured brief on every prospect so the first email actually lands. Response rates are up 40%.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    name: "Lena Hoffmann",
    role: "Account Executive, B2B SaaS",
  },
  {
    text: "The match scoring is eerily accurate. I shortlisted 12 supervisors and Scopeout's top 3 recommendations were the exact ones my advisor would have suggested.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    name: "Rajan Patel",
    role: "MSc Student, Imperial College",
  },
  {
    text: "I spend about two hours prepping for every interview. Scopeout cut that to fifteen minutes and the output is better — actual insight, not just a LinkedIn scroll.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    name: "Priya Mehta",
    role: "Product Manager",
  },
  {
    text: "Running a recruiting firm means I need quick, deep intel on candidates and clients alike. Scopeout replaced two separate tools and saved us hours of manual research every day.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    name: "Marcus Chen",
    role: "Founder, Talent Agency",
  },
  {
    text: "The AI summaries are remarkably concise. I got a full picture of a prospect's research trajectory, recent publications, and likely pain points in under two minutes.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face",
    name: "Sophie Laurent",
    role: "Research Lead, Paris-Saclay",
  },
  {
    text: "As someone applying to competitive academic programmes, knowing a professor's exact research priorities before the interview was a genuine differentiator. I got in.",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face",
    name: "Yusuf Abdi",
    role: "PhD Student, MIT",
  },
  {
    text: "Scopeout surfaced a shared publication thread between my target supervisor and my thesis topic that I would never have found manually. That connection got me the meeting.",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face",
    name: "Naomi Tanaka",
    role: "Research Assistant, Kyoto University",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export default function Testimonials() {
  return (
    <section className="bg-transparent py-20 md:py-28 relative overflow-hidden">
      {/* Subtle glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-100 opacity-20"
        style={{
          background: "radial-gradient(ellipse at center, rgba(249,115,22,0.3) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center max-w-xl mx-auto mb-14"
        >
          <span className="border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            What our users say
          </h2>
          <p className="text-gray-400 mt-4 leading-relaxed">
            From PhD applicants to sales professionals — here's what Scopeout users say about walking in prepared.
          </p>
        </motion.div>

        {/* Columns */}
        <div className="flex justify-center gap-6 mask-[linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] max-h-170 overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={16} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={20} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={18} />
        </div>
      </div>
    </section>
  );
}
