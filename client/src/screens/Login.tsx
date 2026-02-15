import { useNavigate } from "react-router-dom";
import GoogleAuth from "../components/GoogleAuth";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Shield, Zap } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [isAuthenticated] = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/game");
    }
  }, [isAuthenticated]);

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      text: "Real-time gameplay",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      text: "Fair play guaranteed",
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      text: "AI-powered analysis",
    },
  ];

  return (
    <div className="relative h-screen w-full flex justify-center items-center overflow-hidden bg-black">
      <img
        src="https://images.unsplash.com/photo-1656820079852-a9d1e484271f?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hlc3MlMjBrbmlnaHR8ZW58MHx8MHx8fDA%3D"
        alt="Chess Background"
        className="absolute inset-0 h-full w-full object-cover brightness-[0.3] contrast-[1.1]"
      />

      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-[1]" />

      {/* Animated gradient overlay - matching hero */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-600/20 z-[2] pointer-events-none" />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)] z-[3]" />

      {/* Floating orbs for depth */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-20 w-96 h-96 bg-violet-500/30 rounded-full blur-[120px] z-[4]"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/30 rounded-full blur-[120px] z-[4]"
      />

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] z-[5]" />

      {/* Main content */}
      <div className="relative z-[10] w-full max-w-7xl mx-auto px-6">
        <div className="flex justify-center items-center">
          {/* Login form - centered */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center items-center"
          >
            <div className="w-full max-w-md">
              {/* Glass card */}
              <div className="relative">
                {/* Card glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 blur-2xl rounded-3xl" />

                {/* Card content */}
                <div className="relative bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 text-xs font-medium mb-6"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Join 10,000+ players online</span>
                  </motion.div>

                  {/* Title */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="mb-8"
                  >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                      Play Chess
                      <br />
                      <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                        Online
                      </span>
                    </h1>
                    <p className="text-white/60 text-base font-light">
                      Sign in to start your next game
                    </p>
                  </motion.div>

                  {/* Auth button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="space-y-4"
                  >
                    <GoogleAuth />
                  </motion.div>
                </div>
              </div>

              {/* Feature badges below the card */}
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/80 text-sm"
                  >
                    {feature.icon}
                    <span>{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
