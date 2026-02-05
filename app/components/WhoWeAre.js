"use client";

import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function WhoWeAre() {
  return (
    <section className="section-padding bg-white">
      <div className="mx-auto w-full max-w-6xl px-6">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.p variants={item} className="text-xs font-semibold uppercase tracking-[0.3em] text-copper-600">
            Who we are
          </motion.p>
          <motion.h2 variants={item} className="mt-3 font-heading text-3xl text-ink-950 md:text-4xl">
            A structured bridge between MSME needs and industrial machinery.
          </motion.h2>
          <motion.p variants={item} className="mt-4 max-w-3xl text-base text-ink-700">
            We are building India&apos;s manufacturing discovery layer — a builder-style platform that makes machine
            information reliable, comparable, and actionable. From food processing to metal fabrication, every
            listing is mapped to real production workflows.
          </motion.p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Mission",
                copy: "Empower MSMEs to discover and adopt the right machines with confidence and speed."
              },
              {
                title: "Method",
                copy: "Structured data, verified suppliers, and industry-first categorization."
              },
              {
                title: "Impact",
                copy: "Reduce procurement risk, improve ROI clarity, and accelerate factory growth."
              }
            ].map((card) => (
              <motion.div
                key={card.title}
                variants={item}
                className="rounded-2xl border border-white bg-steel-100 p-6 shadow-soft"
              >
                <h3 className="font-heading text-lg text-ink-950">{card.title}</h3>
                <p className="mt-3 text-sm text-ink-700">{card.copy}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
