import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useNavigate } from "react-router-dom";
// import { ChessKing, Github, Linkedin } from "lucide-react";

const App = () => {
  const heroRef = useRef(null);
  const navigate = useNavigate()

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const blur = useTransform(
    scrollYProgress,
    [0, 1],
    ["blur(0px)", "blur(22px)"],
  );

  // Text effects
  const textY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const textBlur = useTransform(
    scrollYProgress,
    [0, 1],
    ["blur(0px)", "blur(8px)"],
  );

  return (
    <div className="w-full">
      {/* Hero */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Image */}
        <motion.img
          src="https://images.unsplash.com/photo-1656820079852-a9d1e484271f?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hlc3MlMjBrbmlnaHR8ZW58MHx8MHx8fDA%3D"
          alt="Chess Hero"
          style={{ scale, filter: blur }}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay text */}
        <motion.div
          style={{ y: textY, opacity: textOpacity, filter: textBlur }}
          className="relative z-10 flex h-full items-start justify-center"
        >
          <div className="flex justify-between flex-col h-full">
            <div className="mt-28">
              <h1 className="text-white text-center text-9xl font-bold tracking-tight mt-3 font-serif">
                Chess
              </h1>
              <p className="text-black text-6xl mt-2 font-bold tracking-tight font-serif">
                Where Stratergies Meet the Square.
              </p>
            </div>
            <div className="flex justify-center items-center mb-28">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
                onClick={()=>{
                    navigate("/login")
                }}
                className="
                  relative
                  p-6
                  rounded-full
                  text-3xl
                  font-serif
                  font-semibold
                  cursor-pointer
                  text-black
                  overflow-hidden
                  border-4 border-black
                  shadow-xl
                  w-[16vw]
                "
              >
                {/* Chessboard background */}
                <span
                  className="
                  absolute inset-0
                  bg-[linear-gradient(45deg,
                    #000 25%,
                    #fff 25%,
                    #fff 50%,
                    #000 50%,
                    #000 75%,
                    #fff 75%,
                    #fff)]
                "
                />

                {/* Overlay for readability */}
                <span className="absolute inset-0 bg-white/70" />

                {/* Text */}
                <span className="relative z-10 tracking-tight flex justify-center items-center gap-x-2.5">
                  <p>Get Started </p>
                  <p>
                    {/* <ChessKing /> */}
                    {"->"}
                  </p>
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
        <div className="absolute inset-0 bg-black/30" />
      </section>

      {/* Content after hero */}
    </div>
  );
};

export default App;
