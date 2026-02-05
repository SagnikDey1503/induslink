"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const statVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: "easeOut" } }
};

export default function Hero() {
  const glowARef = useRef(null);
  const glowBRef = useRef(null);
  const glowCRef = useRef(null);

  useEffect(() => {
    const animations = [];

    if (glowARef.current) {
      animations.push(
        gsap.to(glowARef.current, {
          x: 40,
          y: 18,
          duration: 8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        })
      );
    }

    if (glowBRef.current) {
      animations.push(
        gsap.to(glowBRef.current, {
          x: -26,
          y: -22,
          duration: 9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        })
      );
    }

    if (glowCRef.current) {
      animations.push(
        gsap.to(glowCRef.current, {
          x: 18,
          y: -28,
          duration: 10,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        })
      );
    }

    return () => {
      animations.forEach((anim) => anim?.kill());
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-ink-950 text-white">
      {/* Background layers */}
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(circle at 18% 22%, rgba(243,140,58,0.28), transparent 55%), radial-gradient(circle at 78% 18%, rgba(53,179,127,0.18), transparent 50%), radial-gradient(circle at 60% 82%, rgba(95,120,152,0.22), transparent 55%)"
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-steel-grid opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(13,15,20,0.65)_65%,rgba(13,15,20,0.98)_100%)]" />

      {/* Moving glows */}
      <div
        ref={glowARef}
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-copper-500/25 blur-3xl"
      />
      <div
        ref={glowBRef}
        className="pointer-events-none absolute right-[-140px] top-20 h-80 w-80 rounded-full bg-jade-500/20 blur-3xl"
      />
      <div
        ref={glowCRef}
        className="pointer-events-none absolute right-24 bottom-[-160px] h-96 w-96 rounded-full bg-steel-500/20 blur-3xl"
      />

      {/* Schematic network */}
      <svg
        className="pointer-events-none absolute -right-24 top-1/2 hidden h-[520px] w-[640px] -translate-y-1/2 opacity-25 md:block"
        viewBox="0 0 640 520"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M80 120C160 90 220 140 290 170C360 205 430 205 520 150C585 110 610 150 610 220C610 300 545 320 490 340C410 370 360 430 290 420C220 410 170 360 110 330C50 300 30 240 60 190C70 165 55 140 80 120Z"
          stroke="rgba(221,229,239,0.55)"
          strokeWidth="2.5"
        />
        {[
          [112, 190],
          [160, 150],
          [240, 190],
          [310, 220],
          [410, 230],
          [520, 170],
          [560, 240],
          [470, 320],
          [360, 370],
          [260, 380],
          [150, 320],
          [92, 260]
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="6" fill="rgba(243,140,58,0.9)" />
            <circle cx={x} cy={y} r="14" stroke="rgba(243,140,58,0.25)" strokeWidth="2" />
          </g>
        ))}
        <path
          d="M112 190L160 150L240 190L310 220L410 230L520 170L560 240L470 320L360 370L260 380L150 320L92 260L112 190Z"
          stroke="rgba(53,179,127,0.35)"
          strokeWidth="2"
          strokeDasharray="7 10"
        />
      </svg>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center px-6 py-16">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-2xl">
          <motion.p
            variants={itemVariants}
            className="text-xs font-semibold uppercase tracking-[0.3em] text-copper-500"
          >
            Who we are
          </motion.p>
          <motion.h1
            variants={itemVariants}
            className="mt-4 font-heading text-4xl leading-tight md:text-5xl"
          >
            The MSME machine intelligence layer for India.
          </motion.h1>
          <motion.p variants={itemVariants} className="mt-5 text-base text-steel-200">
            IndusLink connects MSMEs with verified machine suppliers. Compare equipment, evaluate fit, and source from trusted suppliers across India.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/register/buyer"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink-950"
            >
              Register as MSME
            </Link>
            <Link
              href="/register/supplier"
              className="rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white"
            >
              Become a Supplier
            </Link>
          </motion.div>
          <motion.div
            variants={statVariants}
            className="mt-8 grid grid-cols-3 gap-4 text-sm text-steel-200"
          >
            <div>
              <p className="font-heading text-xl text-white">120+</p>
              <p>Machine categories</p>
            </div>
            <div>
              <p className="font-heading text-xl text-white">9k+</p>
              <p>MSME buyers reached</p>
            </div>
            <div>
              <p className="font-heading text-xl text-white">45%</p>
              <p>Faster discovery</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
