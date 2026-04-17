import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  const heroRef = useRef(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const blur = useTransform(
    scrollYProgress,
    [0, 1],
    ["blur(0px)", "blur(20px)"]
  );

  const textY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="w-full">
      <section ref={heroRef} className="relative h-screen overflow-hidden bg-black">
        {/* Hero Image with brightness/contrast adjustment */}
        <motion.img
          src="https://images.unsplash.com/photo-1656820079852-a9d1e484271f?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hlc3MlMjBrbmlnaHR8ZW58MHx8MHx8fDA%3D"
          alt="Chess Hero"
          style={{ scale, filter: blur }}
          className="absolute inset-0 h-full w-full object-cover brightness-[0.35] contrast-[1.1]"
        />

        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-[1]" />
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-600/20 z-[2] pointer-events-none" />
        
        {/* Vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)] z-[3]" />
        
        {/* Noise texture overlay for depth */}
        <div className="absolute inset-0 opacity-[0.02] z-[4] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

        {/* Content */}
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="relative z-[10] flex h-full items-center justify-center px-6"
        >
          <div className="flex flex-col items-center justify-between h-full py-20 max-w-7xl w-full">
            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white/90 text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                <span>Next-Gen Chess Experience</span>
              </motion.div>

              {/* Main heading */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-4"
              >
                <h1 className="text-white text-8xl md:text-9xl lg:text-[11rem] font-bold tracking-tight font-serif leading-none drop-shadow-[0_0_40px_rgba(255,255,255,0.25)]">
                  Chess
                </h1>
                <p className="text-white text-3xl md:text-5xl lg:text-6xl font-light tracking-wide max-w-4xl mx-auto drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
                  Where Strategy Meets the Square
                </p>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-white/90 text-lg md:text-xl max-w-2xl font-light drop-shadow-lg"
              >
                Experience chess like never before with real-time synchronization,
                intelligent matchmaking, and comprehensive game analysis
              </motion.p>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/login")}
                className="group relative px-12 py-5 rounded-2xl text-xl font-semibold overflow-hidden"
              >
                {/* Glassmorphic background */}
                <span className="absolute inset-0 bg-white/20 backdrop-blur-xl border border-white/30" />
                
                {/* Hover gradient */}
                <span className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Shimmer effect */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {/* Text */}
                <span className="relative z-10 flex items-center gap-3 text-white">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Hero;