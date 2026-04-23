"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Star, Zap } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);
  return matches;
}

function Switch({ checked, onCheckedChange, switchRef }: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  switchRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={switchRef}
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors outline-none",
        checked ? "bg-orange-500" : "bg-white/15"
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

const plans = [
  {
    name: "FREE",
    price: "0",
    yearlyPrice: "0",
    period: "forever",
    features: [
      "5 searches per month",
      "Basic researcher profiles",
      "Match scoring",
      "Google Scholar source",
      "Community support",
    ],
    description: "Perfect for occasional use or just testing the waters",
    buttonText: "Get Started Free",
    href: "/chat",
    isPopular: false,
  },
  {
    name: "PROFESSIONAL",
    price: "19",
    yearlyPrice: "15",
    period: "per month",
    features: [
      "200 searches per month",
      "Full AI research briefs",
      "Multi-source intel (Scholar + LinkedIn + ResearchGate)",
      "Personalised email openers",
      "PDF export",
      "Priority support",
      "API access",
    ],
    description: "For PhD applicants, job seekers, and active sales professionals",
    buttonText: "Start Free Trial",
    href: "/chat",
    isPopular: true,
  },
  {
    name: "ENTERPRISE",
    price: "79",
    yearlyPrice: "59",
    period: "per month",
    features: [
      "Unlimited searches",
      "Team workspace & collaboration",
      "Custom AI model tuning",
      "Dedicated account manager",
      "White-label reports",
      "Advanced API + webhooks",
      "Custom SLA agreement",
    ],
    description: "For recruiting firms, newsrooms, and sales teams",
    buttonText: "Contact Sales",
    href: "/chat",
    isPopular: false,
  },
];

export default function Pricing() {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ["#f97316", "#fb923c", "#fdba74", "#ffffff"],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 28,
        shapes: ["circle"],
      });
    }
  };

  return (
    <section className="bg-transparent py-20 md:py-28 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-400 mt-4 max-w-lg mx-auto leading-relaxed">
            Start free. Upgrade when you need more power. Every plan includes AI-powered researcher briefs.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center items-center gap-3 mb-12">
          <span className={cn("text-sm font-semibold", !isMonthly ? "text-gray-500" : "text-white")}>Monthly</span>
          <Switch switchRef={switchRef} checked={!isMonthly} onCheckedChange={handleToggle} />
          <span className={cn("text-sm font-semibold", isMonthly ? "text-gray-500" : "text-white")}>
            Annual <span className="text-orange-400">(Save 20%)</span>
          </span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ y: 40, opacity: 0 }}
              whileInView={
                isDesktop
                  ? {
                      y: plan.isPopular ? -16 : 0,
                      opacity: 1,
                      x: index === 2 ? -20 : index === 0 ? 20 : 0,
                      scale: plan.isPopular ? 1.0 : 0.95,
                    }
                  : { y: 0, opacity: 1 }
              }
              viewport={{ once: true }}
              transition={{ duration: 1.4, type: "spring", stiffness: 80, damping: 25, delay: index * 0.1 }}
              className={cn(
                "relative rounded-2xl border p-6 flex flex-col",
                plan.isPopular
                  ? "border-orange-500 bg-orange-500/5 shadow-xl shadow-orange-500/10"
                  : "border-white/10 bg-white/5",
                !plan.isPopular && index !== 1 && "mt-5"
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-px right-5 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-b-lg flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Popular
                </div>
              )}

              {/* Plan name */}
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{plan.name}</p>

              {/* Price */}
              <div className="mt-5 flex items-end gap-1.5">
                <span className="text-5xl font-bold text-white tabular-nums">
                  {plan.name === "FREE" ? (
                    "$0"
                  ) : (
                    <NumberFlow
                      value={isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)}
                      format={{ style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }}
                      transformTiming={{ duration: 450, easing: "ease-out" }}
                      willChange
                    />
                  )}
                </span>
                {plan.name !== "FREE" && (
                  <span className="text-sm text-gray-500 mb-1.5">/ {plan.period}</span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {plan.name === "FREE" ? "No credit card required" : isMonthly ? "billed monthly" : "billed annually"}
              </p>

              {/* Features */}
              <ul className="mt-6 flex flex-col gap-2.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <hr className="border-white/8 my-5" />

              <Link
                href={plan.href}
                className={cn(
                  "flex items-center justify-center gap-2 w-full h-10 rounded-xl text-sm font-semibold transition-all duration-200",
                  plan.isPopular
                    ? "bg-orange-500 text-white hover:bg-orange-400"
                    : "bg-white/8 text-gray-300 border border-white/10 hover:bg-white/12 hover:text-white"
                )}
              >
                {plan.isPopular && <Zap className="w-3.5 h-3.5" />}
                {plan.buttonText}
              </Link>

              <p className="text-xs text-gray-600 text-center mt-4 leading-relaxed">{plan.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
