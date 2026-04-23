"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  FileText,
  Globe,
  BarChart2,
} from "lucide-react";

const tasks = [
  {
    title: "AI Profile Scraping",
    subtitle: "Public sources aggregated instantly",
    icon: <Search className="w-4 h-4 text-orange-400" />,
  },
  {
    title: "Match Scoring",
    subtitle: "Ranked by research compatibility",
    icon: <Star className="w-4 h-4 text-orange-400" />,
  },
  {
    title: "Smart Briefings",
    subtitle: "Plain-English summaries per profile",
    icon: <FileText className="w-4 h-4 text-orange-400" />,
  },
  {
    title: "Source Intelligence",
    subtitle: "Scholar · LinkedIn · ResearchGate",
    icon: <Globe className="w-4 h-4 text-orange-400" />,
  },
  {
    title: "Compatibility Reports",
    subtitle: "Weekly insights & trend analysis",
    icon: <BarChart2 className="w-4 h-4 text-orange-400" />,
  },
];

export default function FeatureSection() {
  return (
    <section className="relative w-full py-20 px-4 bg-transparent text-white overflow-hidden">
      {/* Right-side orange glow */}
      <div
        className="pointer-events-none absolute -right-40 top-1/2 -translate-y-1/2 w-125 h-125"
        style={{
          background:
            "radial-gradient(ellipse at right center, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.05) 50%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        {/* LEFT — animated task loop */}
        <div className="relative w-full max-w-sm mx-auto md:mx-0">
          <Card className="overflow-hidden bg-white/5 border-white/10 backdrop-blur-md shadow-2xl rounded-2xl">
            <CardContent className="relative h-80 p-0 overflow-hidden">
              <div className="relative h-full overflow-hidden">
                <motion.div
                  className="flex flex-col gap-0 absolute w-full"
                  animate={{ y: ["0%", "-50%"] }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 12,
                    ease: "linear",
                  }}
                >
                  {[...tasks, ...tasks].map((task, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5"
                    >
                      <div className="flex items-center justify-between flex-1">
                        <div className="flex items-center gap-3">
                          {/* Icon box */}
                          <div className="bg-orange-500/10 border border-orange-500/20 w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                            {task.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{task.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{task.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* Fade edges */}
                <div className="absolute top-0 left-0 w-full h-12 bg-linear-to-b from-black to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full h-12 bg-linear-to-t from-black to-transparent pointer-events-none" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — copy */}
        <div className="space-y-6">
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            Research Intelligence
          </Badge>

          <h3 className="text-2xl md:text-3xl font-bold text-white leading-snug">
            Surface insights on anyone —{" "}
            <span className="text-gray-400 font-normal text-lg md:text-xl leading-relaxed">
              Scopeout scrapes public sources, scores compatibility, and returns
              structured briefs so you walk into every high-stakes interaction
              already knowing the room.
            </span>
          </h3>

          <div className="flex gap-3 flex-wrap">
            <Badge className="px-4 py-2 text-sm">AI Profiling</Badge>
            <Badge className="px-4 py-2 text-sm">10+ Sources</Badge>
            <Badge className="px-4 py-2 text-sm">Research Ready</Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
