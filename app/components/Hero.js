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
  const orbRef = useRef(null);
  const imageCardRef = useRef(null);

  useEffect(() => {
    if (orbRef.current) {
      gsap.to(orbRef.current, {
        y: 16,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    if (imageCardRef.current) {
      gsap.to(imageCardRef.current, {
        y: -10,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }, []);

  return (
    <section className="relative overflow-hidden bg-ink-950 text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center">
        <motion.div variants={containerVariants} initial="hidden" animate="show">
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
        <div className="relative">
          <div
            ref={orbRef}
            className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-copper-500/30 blur-2xl"
          />
          <div ref={imageCardRef} className="rounded-3xl bg-ink-800 p-6 shadow-glow">
            <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-ink-900">
              <img
                src="/hero-manufacturing.svg"
                alt="Modern manufacturing floor"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="mt-6 rounded-2xl bg-ink-900/70 p-4">
              <p className="text-sm text-steel-200">Verified suppliers across 5 core industries.</p>
              <p className="mt-2 text-xs text-steel-400">Structured specs, compliance, and ROI insights.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
