import { Github, Linkedin } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useMemo, useRef } from "react";

export default function FeatureSection() {
  const items = useMemo(() => {
    return [
      {
        id: 1,
        color: "#ff0088",
        label: "Real Time Clock Synchronization.",
        image: "../../src/assets/f1.png",
      },
      {
        id: 2,
        color: "#dd00ee",
        label: "Rating based matchmaking.",
        image: "../../src/assets/f2.png",
      },
      {
        id: 3,
        color: "#9911ff",
        label: "Different time bound games.",
        image: "../../src/assets/f3.png",
      },
      {
        id: 4,
        color: "#0d63f8",
        label: "Game Review after game ends.",
        image: "../../src/assets/f4.png",
      },
      {
        id: 5,
        color: "#0cdcf7",
        label: "Game Replay after every game.",
        image: "../../src/assets/f5.png",
      },
      {
        id: 6,
        color: "#0cdcf7",
        label: "Whole game history maintained.",
        image: "../../src/assets/f6.png",
      },
      {
        id: 7,
        color: "#0cdcf7",
        label: "Server move validations for fair play.",
        image: "../../src/assets/f7.png",
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
    <div>
      <section className="intro-section">
        <h1 className="impact font-serif">Features Available</h1>
      </section>

      <div ref={containerRef} className="scroll-container">
        <div className="sticky-wrapper">
          <motion.div className="gallery" style={{ x }}>
            {items.map((item) => (
              <div
                key={item.id}
                className="gallery-item h-full"
                style={
                  {
                    "--item-color": "black",
                    "--item-image": `url(${item.image})`,
                  } as React.CSSProperties
                }
              >
                <div className="item-content shadow-2xl shadow-black">
                  <span className="item-number">0{item.id}</span>
                  <h2>{item.label}</h2>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      <div className="flex justify-center items-center gap-y-3.5 flex-col">
        <div className="font-serif">
          <p className="font-semibold text-3xl">Author's Handles:</p>
        </div>
        <div className="flex justify-center items-center gap-x-3.5">
          <a
            href="https://github.com/RahulGIT24"
            target="_blank"
            title="Github"
          >
            <Github color="white" size={35} />
          </a>
          <a
            href="https://www.linkedin.com/in/rahul-gupta-142a85277/"
            target="_blank"
            title="Linkedin"
          >
            <Linkedin color="white" size={35} />
          </a>
        </div>
      </div>
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

            #example {
                height: auto;
                overflow: visible;
            }

            .intro-section {
                height: 15vh;
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                align-items: center;
                text-align: center;
            }

            .intro-section h1 {
                font-size: clamp(36px, 8vw, 72px);
                color: #f5f5f5;
                margin: 0;
                text-transform: uppercase;
            }

            .scroll-container {
                height: 200vh;
                position: relative;
            }

            .sticky-wrapper {
                position: sticky;
                top: 0;
                height: 100vh;
                width: 400px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: flex-start;
                overflow: visible;
            }

            .gallery {
                display: flex;
                gap: 29px;
                will-change: transform;
            }

            .gallery-item {
                flex-shrink: 0;
                width: 400px;
                height: 500px;
                border-radius: 12px;
                position: relative;
                overflow: hidden;
                background-image: var(--item-image);
                background-size: cover;
                background-position: center;
            }

            .gallery-item::before {
                content: "";
                position: absolute;
                inset: 0;
                background: linear-gradient(
                    to bottom,
                    transparent 60%,
                    var(--item-color)
                );
                mix-blend-mode: multiply;
            }

            .item-content {
                position: absolute;
                bottom: 30px;
                left: 30px;
                z-index: 1;
            }

            .item-number {
                font-size: 14px;
                color: var(--item-color);
                font-family: "Azeret Mono", monospace;
                display: block;
                margin-bottom: 8px;
            }

            .gallery-item h2 {
                font-size: 28px;
                font-weight: 600;
                color: #f5f5f5;
                margin: 0;
            }

            .outro-section {
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            @media (max-width: 600px) {
                .sticky-wrapper {
                    width: 280px;
                }

                .gallery {
                    gap: 15px;
                }

                .gallery-item {
                    width: 280px;
                    height: 350px;
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
                    width: 100%;
                    overflow-x: auto;
                    padding: 50px 0;
                }
            }
        `}</style>
  );
}
const ITEM_WIDTH = 400;
const GAP = 30;