import { useNavigate } from "react-router-dom";
import FeatureSection from "../components/FeatureSection";
import HeroSection from "../components/HeroSection";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [isAuthenticated] = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/game");
    }
  }, [isAuthenticated]);

  return (
    <>
      <HeroSection />
      <section className="min-h-screen bg-zinc-950 text-white px-10 py-20">
        <FeatureSection />
      </section>
    </>
  );
};

export default Landing;
