import { Github, Linkedin } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useMemo, useRef } from "react";

const ITEM_WIDTH = 420;
const GAP = 32;

export default function FeatureSection() {
  const items = useMemo(() => {
    return [
      {
        id: 1,
        label: "Real-Time Clock Synchronization",
        description: "Perfectly synced game clocks across all devices",
        image: "../../src/assets/f1.png",
        gradient: "from-violet-500 to-purple-600",
      },
      {
        id: 2,
        label: "Rating-Based Matchmaking",
        description: "Find opponents at your skill level instantly",
        image: "../../src/assets/f2.png",
        gradient: "from-purple-500 to-pink-600",
      },
      {
        id: 3,
        label: "Multiple Time Controls",
        description: "Blitz, rapid, classical - play your way",
        image: "../../src/assets/f3.png",
        gradient: "from-pink-500 to-rose-600",
      },
      {
        id: 4,
        label: "Advanced Game Review",
        description: "Deep analysis powered by AI insights",
        image: "../../src/assets/f4.png",
        gradient: "from-rose-500 to-orange-600",
      },
      {
        id: 5,
        label: "Interactive Game Replay",
        description: "Review every move with detailed annotations",
        image: "../../src/assets/f5.png",
        gradient: "from-orange-500 to-amber-600",
      },
      {
        id: 6,
        label: "Complete Game History",
        description: "Track your progress over time",
        image: "../../src/assets/f6.png",
        gradient: "from-amber-500 to-yellow-600",
      },
      {
        id: 7,
        label: "Server-Side Validation",
        description: "Guaranteed fair play with move verification",
        image: "../../src/assets/f7.png",
        gradient: "from-cyan-500 to-blue-600",
      },
    ];
  }, []);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const totalDistance = (items.length - 1) * (ITEM_WIDTH + GAP);
  const x = useTransform(scrollYProgress, [0, 1], [0, -totalDistance]);

  return (
    <div className="relative bg-gradient-to-b from-black via-zinc-950 to-black">
      {/* Header Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(14,165,233,0.1),transparent_50%)]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 animate-pulse" />
              Features
            </div>

            {/* Title */}
            <h2 className="text-7xl md:text-8xl font-bold text-white font-serif mb-6 tracking-tight">
              Everything You Need
            </h2>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto font-light">
              Professional-grade features designed for chess players of all levels
            </p>
          </motion.div>
        </div>
      </section>

      {/* Horizontal Scroll Gallery */}
      <div ref={containerRef} className="scroll-container">
        <div className="sticky-wrapper">
          <motion.div className="gallery" style={{ x }}>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="gallery-item group"
                style={{
                  "--item-image": `url(${item.image})`,
                } as React.CSSProperties}
              >
                {/* Card background with glassmorphism */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl" />
                
                {/* Image background */}
                <div
                  className="absolute inset-0 bg-cover bg-center rounded-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500 rounded-3xl mix-blend-overlay`} />
                
                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-3xl" />
                
                {/* Content */}
                <div className="relative h-full flex flex-col justify-between p-8 z-10">
                  {/* Number badge */}
                  <div className="inline-flex">
                    <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white/90 text-sm font-mono font-semibold">
                      {String(item.id).padStart(2, '0')}
                    </span>
                  </div>
                  
                  {/* Text content */}
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-white leading-tight group-hover:translate-y-[-4px] transition-transform duration-300">
                      {item.label}
                    </h3>
                    <p className="text-white/70 text-base font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.1),transparent_70%)]" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-12"
        >
          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Author section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-white/90">
              Created by Rahul Gupta
            </h3>
            
            {/* Social links */}
            <div className="flex justify-center items-center gap-4">
              <motion.a
                href="https://github.com/RahulGIT24"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 group"
                title="GitHub"
              >
                <Github className="w-7 h-7 text-white/70 group-hover:text-white transition-colors" />
              </motion.a>
              
              <motion.a
                href="https://www.linkedin.com/in/rahul-gupta-142a85277/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 group"
                title="LinkedIn"
              >
                <Linkedin className="w-7 h-7 text-white/70 group-hover:text-white transition-colors" />
              </motion.a>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-white/40 text-sm font-light">
            © 2026 Chess Platform. All rights reserved.
          </p>
        </motion.div>
      </section>

      <StyleSheet />
    </div>
  );
}

function StyleSheet() {
  return (
    <style>{`
      body {
        overflow-x: hidden;
      }

      .scroll-container {
        height: 300vh;
        position: relative;
      }

      .sticky-wrapper {
        position: sticky;
        top: 0;
        height: 100vh;
        max-width: 100vw;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        overflow: hidden;
        padding: 0 max(2rem, calc((100vw - 420px) / 2));
      }

      .gallery {
        display: flex;
        gap: 32px;
        will-change: transform;
      }

      .gallery-item {
        flex-shrink: 0;
        width: 420px;
        height: 560px;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.3s ease;
      }

      .gallery-item:hover {
        transform: translateY(-8px);
      }

      @media (max-width: 768px) {
        .sticky-wrapper {
          padding: 0 1rem;
        }

        .gallery {
          gap: 20px;
        }

        .gallery-item {
          width: 320px;
          height: 450px;
        }
      }

      @media (max-width: 480px) {
        .gallery-item {
          width: 280px;
          height: 400px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .gallery {
          transform: none !important;
        }
        .scroll-container {
          height: auto;
        }
        .sticky-wrapper {
          position: relative;
          height: auto;
          overflow-x: auto;
          padding: 50px 1rem;
        }
        .gallery-item:hover {
          transform: none;
        }
      }
    `}</style>
  );
}