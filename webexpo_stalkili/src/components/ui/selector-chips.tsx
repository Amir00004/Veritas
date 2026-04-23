"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type SelectorChipsProps = {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

const SelectorChips: React.FC<SelectorChipsProps> = ({ options, selected, onChange }) => {
  const toggleChip = (option: string) => {
    const updated = selected.includes(option)
      ? selected.filter((o) => o !== option)
      : [...selected, option];
    onChange(updated);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <motion.button
            key={option}
            type="button"
            onClick={() => toggleChip(option)}
            initial={false}
            animate={{
              backgroundColor: isSelected ? "#F97316" : "rgba(255,255,255,0.06)",
              borderColor: isSelected ? "#F97316" : "rgba(255,255,255,0.12)",
              color: isSelected ? "#fff" : "#9ca3af",
            }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer"
          >
            <span>{option}</span>
            <AnimatePresence>
              {isSelected && (
                <motion.span
                  key="tick"
                  initial={{ scale: 0, opacity: 0, width: 0 }}
                  animate={{ scale: 1, opacity: 1, width: 14 }}
                  exit={{ scale: 0, opacity: 0, width: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="overflow-hidden flex items-center"
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <motion.path
                      d="M5 10.5L9 14.5L15 7.5"
                      stroke="#fff"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </svg>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
};

export { SelectorChips };
