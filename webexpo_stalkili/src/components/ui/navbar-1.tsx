"use client"

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import Link from "next/link"

const Navbar1 = () => {
  const [isOpen, setIsOpen] = useState(false)
  const toggleMenu = () => setIsOpen(!isOpen)

  const navItems = ["Features", "How It Works", "Use Cases", "Contact"]

  return (
    <div className="flex justify-center w-full py-6 px-4 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-6 py-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-full shadow-lg w-full max-w-3xl relative">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ rotate: 10 }}
            transition={{ duration: 0.3 }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="url(#scopeout_gradient)" />
              <defs>
                <linearGradient id="scopeout_gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FB923C" />
                  <stop offset="1" stopColor="#F97316" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <span className="text-white font-semibold text-base tracking-tight">veritas</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <Link
                href={item === "Home" ? "/" : `#${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
              >
                {item}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <motion.div
          className="hidden md:flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Link
            href="/auth"
            className="inline-flex items-center justify-center px-5 py-2 text-sm text-gray-300 hover:text-white border border-white/15 rounded-full hover:border-white/30 transition-colors font-medium"
          >
            Sign in
          </Link>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link
              href="/chat"
              className="inline-flex items-center justify-center px-5 py-2 text-sm text-black bg-white rounded-full hover:bg-gray-100 transition-colors font-medium"
            >
              Get Started
            </Link>
          </motion.div>
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button className="md:hidden flex items-center" onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
          <Menu className="h-6 w-6 text-gray-300" />
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black z-50 pt-24 px-6 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.button>
            <div className="flex flex-col space-y-6">
              {navItems.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Link
                    href={item === "Home" ? "/" : `#${item.toLowerCase().replace(/ /g, "-")}`}
                    className="text-lg text-gray-300 hover:text-white font-medium"
                    onClick={toggleMenu}
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-6 flex flex-col gap-3"
              >
                <Link
                  href="/auth"
                  className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-gray-300 border border-white/15 rounded-full hover:border-white/30 transition-colors font-medium"
                  onClick={toggleMenu}
                >
                  Sign in
                </Link>
                <Link
                  href="/chat"
                  className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-black bg-white rounded-full hover:bg-gray-100 transition-colors font-medium"
                  onClick={toggleMenu}
                >
                  Get Started
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { Navbar1 }
