import { Github, Linkedin, Clock3, Swords, Timer, Microscope, PlaySquare, History, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { ReactNode } from "react";

interface Feature {
  icon: ReactNode;
  label: string;
  description: string;
  span: string;
  accent?: boolean;
}

const features: Feature[] = [
  {
    icon: <Clock3 className="h-6 w-6" />,
    label: "Real-Time Clock Synchronization",
    description:
      "Game clocks stay perfectly synced across devices — and keep ticking server-side even if a player disconnects mid-game.",
    span: "lg:col-span-7",
    accent: true,
  },
  {
    icon: <Swords className="h-6 w-6" />,
    label: "Rating-Based Matchmaking",
    description: "Get paired with opponents at your level and watch your rating move with every result.",
    span: "lg:col-span-5",
  },
  {
    icon: <Timer className="h-6 w-6" />,
    label: "Multiple Time Controls",
    description: "Bullet, blitz, rapid or classical — from 1 to 60 minutes, play the tempo you love.",
    span: "lg:col-span-4",
  },
  {
    icon: <Microscope className="h-6 w-6" />,
    label: "Advanced Game Review",
    description:
      "Every finished game is analyzed by Stockfish: accuracy scores, centipawn loss, and a verdict on every single move — from brilliant to blunder.",
    span: "lg:col-span-8",
    accent: true,
  },
  {
    icon: <PlaySquare className="h-6 w-6" />,
    label: "Interactive Game Replay",
    description: "Step through any past game move by move, at your own speed.",
    span: "lg:col-span-4",
  },
  {
    icon: <History className="h-6 w-6" />,
    label: "Complete Game History",
    description: "Every game you play is stored forever — results, ratings and full move sheets.",
    span: "lg:col-span-4",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    label: "Server-Side Validation",
    description: "Every move is verified on the server. No illegal moves, no tampering — fair play, guaranteed.",
    span: "lg:col-span-4",
  },
];

export default function FeatureSection() {
  return (
    <div id="features" className="relative bg-ink-950">
      {/* Header */}
      <section className="relative overflow-hidden py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(210,165,76,0.08),transparent_55%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="chip mb-8">
              <span className="h-2 w-2 animate-pulse-soft rounded-full bg-gold-400" />
              Built for serious play
            </div>
            <h2 className="heading-display mb-6 text-5xl md:text-7xl">
              Everything you need,
              <br />
              <span className="gold-text italic">nothing you don't.</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-light text-cream/55 md:text-xl">
              Professional-grade infrastructure under a board that gets out of your way.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Bento grid */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
          {features.map((f, index) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
              className={`group relative overflow-hidden rounded-3xl border p-8 transition-colors duration-300 md:col-span-1 ${f.span} ${
                f.accent
                  ? "border-gold-500/20 bg-gradient-to-br from-gold-500/[0.08] to-transparent hover:border-gold-500/40"
                  : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.16]"
              }`}
            >
              {/* Hover glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold-500/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative z-10 flex h-full flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                      f.accent
                        ? "border-gold-500/30 bg-gold-500/15 text-gold-300"
                        : "border-white/10 bg-white/[0.05] text-gold-400"
                    }`}
                  >
                    {f.icon}
                  </span>
                  <span className="font-mono text-xs text-cream/25">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-auto space-y-2.5">
                  <h3 className="text-xl font-semibold leading-snug text-cream">
                    {f.label}
                  </h3>
                  <p className="text-sm font-light leading-relaxed text-cream/55">
                    {f.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden border-t border-white/[0.06] py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(210,165,76,0.06),transparent_60%)]" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 text-center"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-500/30 bg-gold-500/10 text-xl text-gold-400">
              ♞
            </span>
            <span className="font-display text-xl text-cream">Chess Arena</span>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-cream/60">Created by Rahul Gupta</p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="https://github.com/RahulGIT24"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                className="group flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-all hover:-translate-y-0.5 hover:border-gold-500/40 hover:bg-white/[0.08]"
              >
                <Github className="h-5 w-5 text-cream/60 transition-colors group-hover:text-gold-300" />
              </a>
              <a
                href="https://www.linkedin.com/in/rahul-gupta-142a85277/"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                className="group flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-all hover:-translate-y-0.5 hover:border-gold-500/40 hover:bg-white/[0.08]"
              >
                <Linkedin className="h-5 w-5 text-cream/60 transition-colors group-hover:text-gold-300" />
              </a>
            </div>
          </div>

          <p className="text-xs font-light text-cream/30">
            © 2026 Chess Arena. All rights reserved.
          </p>
        </motion.div>
      </footer>
    </div>
  );
}
