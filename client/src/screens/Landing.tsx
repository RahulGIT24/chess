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
    <main className="bg-ink-950 text-cream">
      <HeroSection />
      <FeatureSection />
    </main>
  );
};

export default Landing;
