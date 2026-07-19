import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChartNoAxesCombined, Timer, Zap } from "lucide-react";

const stats = [
  { icon: <Zap className="h-4 w-4" />, value: "Real-time", label: "move sync over WebSockets" },
  { icon: <Timer className="h-4 w-4" />, value: "Persistent", label: "clocks that survive disconnects" },
  { icon: <ChartNoAxesCombined className="h-4 w-4" />, value: "Stockfish", label: "powered game review" },
];

const Hero = () => {
  const heroRef = useRef(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const glyphY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section
      ref={heroRef}
      className="board-grid-bg relative flex min-h-screen flex-col overflow-hidden bg-ink-950"
    >
      {/* Ambient light */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[34rem] w-[60rem] -translate-x-1/2 rounded-full bg-gold-500/[0.12] blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-gold-600/[0.07] blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(11,10,8,0.9)_100%)]" />
      </div>

      {/* Giant knight watermark */}
      <motion.span
        style={{ y: glyphY }}
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2 select-none font-display text-[38rem] leading-none text-gold-400/[0.06]"
      >
        ♞
      </motion.span>

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-2xl text-gold-400">
            ♞
          </span>
          <span className="font-display text-2xl tracking-wide text-cream">
            Chess Arena
          </span>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-cream/90 backdrop-blur-xl transition-all hover:border-gold-500/40 hover:bg-white/[0.08] hover:text-gold-300"
        >
          Sign in
        </button>
      </motion.nav>

      {/* Content */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 flex flex-1 items-center justify-center px-6 pb-24"
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="chip mb-8"
          >
            <span className="h-2 w-2 animate-pulse-soft rounded-full bg-gold-400" />
            Live · Rated · Engine-analyzed
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="heading-display text-6xl leading-[1.02] md:text-8xl lg:text-[7.5rem]"
          >
            Master the board.
            <br />
            <span className="gold-text italic">Own every tempo.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-cream/60 md:text-xl"
          >
            Real-time chess with rated matchmaking, clocks that never drift, and
            Stockfish-grade analysis of every move you play.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
          >
            <button
              onClick={() => navigate("/login")}
              className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-b from-gold-400 to-gold-600 px-10 py-4 text-lg font-semibold text-ink-950 shadow-glow transition-all hover:from-gold-300 hover:to-gold-500 active:scale-[0.98]"
            >
              Play now
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#features"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-10 py-4 text-lg font-medium text-cream/80 backdrop-blur-xl transition-all hover:border-white/25 hover:text-cream"
            >
              Explore features
            </a>
          </motion.div>

          {/* Stat strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="mt-20 grid w-full max-w-3xl grid-cols-1 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-xl sm:grid-cols-3 sm:divide-x sm:divide-y-0"
          >
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1 px-6 py-5">
                <span className="flex items-center gap-2 font-mono text-base font-semibold text-gold-400">
                  {s.icon}
                  {s.value}
                </span>
                <span className="text-xs text-cream/50">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom piece row */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 select-none gap-8 text-3xl text-cream/[0.08]"
      >
        {["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"].map((p, i) => (
          <span key={i}>{p}</span>
        ))}
      </div>
    </section>
  );
};

export default Hero;
