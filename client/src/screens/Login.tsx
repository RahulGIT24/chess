import { useNavigate } from "react-router-dom";
import GoogleAuth from "../components/GoogleAuth";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import { motion } from "motion/react";
import { Microscope, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: <Zap className="h-4 w-4 text-gold-400" />,
    text: "Real-time gameplay",
  },
  {
    icon: <Shield className="h-4 w-4 text-gold-400" />,
    text: "Fair play guaranteed",
  },
  {
    icon: <Microscope className="h-4 w-4 text-gold-400" />,
    text: "Engine-powered analysis",
  },
];

const Login = () => {
  const navigate = useNavigate();
  const [isAuthenticated] = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/game");
    }
  }, [isAuthenticated]);

  return (
    <div className="board-grid-bg relative flex h-screen w-full items-center justify-center overflow-hidden bg-ink-950">
      {/* Ambient light */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-[50rem] -translate-x-1/2 rounded-full bg-gold-500/[0.1] blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-gold-600/[0.08] blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(11,10,8,0.9)_100%)]" />
      </div>

      {/* Watermark pieces */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-16 top-1/2 -translate-y-1/2 select-none font-display text-[24rem] leading-none text-gold-400/[0.05]"
      >
        ♛
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 top-1/2 -translate-y-1/2 select-none font-display text-[24rem] leading-none text-gold-400/[0.05]"
      >
        ♚
      </span>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="panel relative overflow-hidden p-10">
            {/* Top glow line */}
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

            {/* Brand */}
            <div className="mb-10 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-2xl text-gold-400">
                ♞
              </span>
              <span className="font-display text-2xl tracking-wide text-cream">
                Chess Arena
              </span>
            </div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-cream/60">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
              Players online now
            </div>

            <h1 className="heading-display mb-2 text-4xl md:text-[2.75rem]">
              Welcome back,
              <br />
              <span className="gold-text italic">grandmaster.</span>
            </h1>
            <p className="mb-10 text-sm font-light text-cream/55">
              Sign in to find your next opponent.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-center"
            >
              <GoogleAuth />
            </motion.div>

            <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <ul className="space-y-3">
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3 text-sm text-cream/70"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                    {feature.icon}
                  </span>
                  {feature.text}
                </motion.li>
              ))}
            </ul>
          </div>

          <p className="mt-6 text-center text-xs font-light text-cream/30">
            Free to play · No downloads · Rated games from move one
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
