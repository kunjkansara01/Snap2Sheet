import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThreeHeroScene = dynamic(() => import("./ThreeHeroScene"), { ssr: false });

export function AnimatedBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const allow3d =
    mounted &&
    typeof window !== "undefined" &&
    !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) &&
    window.innerWidth >= 768;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {mounted && allow3d ? (
        <div className="absolute inset-0 opacity-70">
          <ThreeHeroScene theme={theme === "dark" ? "dark" : "light"} />
        </div>
      ) : (
        <div className="absolute inset-0">
          <div className="absolute inset-0 blur-3xl opacity-70 gradient-accent" />
          <div className="noise-layer absolute inset-0 opacity-40" />
        </div>
      )}
      <div className="noise-layer absolute inset-0 opacity-20" />
    </div>
  );
}
