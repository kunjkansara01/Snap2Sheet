import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

type ThreeHeroSceneProps = {
  theme?: "light" | "dark";
};

function FloatingPoly({ theme }: ThreeHeroSceneProps) {
  const meshRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.2;
    meshRef.current.rotation.x += delta * 0.08;
  });

  const color = theme === "dark" ? "#7c3aed" : "#4338ca";
  const emissive = theme === "dark" ? "#22d3ee" : "#60a5fa";

  return (
    <Float floatIntensity={0.4} speed={1.2} rotationIntensity={0.2}>
      <mesh ref={meshRef} scale={2.4} castShadow>
        <icosahedronGeometry args={[1.3, 0]} />
        <meshStandardMaterial color={color} emissive={emissive} metalness={0.25} roughness={0.2} />
      </mesh>
    </Float>
  );
}

function Scene({ theme }: ThreeHeroSceneProps) {
  const lightColor = theme === "dark" ? "#22d3ee" : "#7c3aed";
  const fillColor = theme === "dark" ? "#0ea5e9" : "#818cf8";

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 5, 5]} intensity={1.8} color={lightColor} />
      <pointLight position={[-6, -3, -2]} intensity={0.8} color={fillColor} />
      <spotLight position={[3, 7, 4]} angle={0.6} penumbra={0.7} intensity={1.2} color={fillColor} />
      <FloatingPoly theme={theme} />
      <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
    </>
  );
}

export default function ThreeHeroScene({ theme }: ThreeHeroSceneProps) {
  const background = theme === "dark" ? "#070a12" : "#f7f8fb";

  return (
    <Canvas
      dpr={[1, 1.8]}
      gl={{ antialias: true }}
      camera={{ position: [0, 0, 9], fov: 45 }}
      style={{ width: "100%", height: "100%", background }}
    >
      <Scene theme={theme} />
    </Canvas>
  );
}
