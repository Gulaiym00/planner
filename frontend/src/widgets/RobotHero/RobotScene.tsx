"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, Sparkles } from "@react-three/drei";
import { Robot, type RobotProps } from "./Robot";
import styles from "./RobotHero.module.css";

type Shape = "torus" | "ico" | "sphere" | "octa";

const DECORATIONS: { position: [number, number, number]; shape: Shape; graphite?: boolean }[] = [
  { position: [-1.2, 0.75, -0.8], shape: "torus" },
  { position: [1.25, 0.55, -0.6], shape: "ico", graphite: true },
  { position: [-1.1, -0.85, -0.4], shape: "sphere", graphite: true },
  { position: [1.15, -0.75, -1], shape: "octa" },
];

function Decorations({ reducedMotion }: { reducedMotion: boolean }) {
  return DECORATIONS.map(({ position, shape, graphite }, i) => (
    <Float key={shape} speed={reducedMotion ? 0 : 1.2 + i * 0.3} rotationIntensity={1.4} floatIntensity={1.2}>
      <mesh position={position}>
        {shape === "torus" && <torusGeometry args={[0.12, 0.045, 16, 32]} />}
        {shape === "ico" && <icosahedronGeometry args={[0.14, 0]} />}
        {shape === "sphere" && <sphereGeometry args={[0.1, 24, 24]} />}
        {shape === "octa" && <octahedronGeometry args={[0.13, 0]} />}
        <meshStandardMaterial
          color={graphite ? "#3b3c43" : "#e6e7ec"}
          metalness={1}
          roughness={graphite ? 0.25 : 0.12}
        />
      </mesh>
    </Float>
  ));
}

/** Студийный свет из светящихся панелей — даёт хрому полосатые блики без загрузки HDR-файлов */
function StudioLights() {
  return (
    <Environment resolution={256} frames={1} environmentIntensity={1.3}>
      {/* Серый «студийный» фон — из него хром получает серебристый базовый тон */}
      <color attach="background" args={["#6b6b73"]} />
      <Lightformer form="rect" intensity={2.2} position={[0, 0, 6]} scale={[10, 5, 1]} />
      <Lightformer form="rect" intensity={3} position={[0, 4, 2]} scale={[8, 1.2, 1]} rotation-x={Math.PI / 2} />
      <Lightformer form="rect" intensity={2.2} position={[-4, 1, 1]} scale={[1.2, 6, 1]} rotation-y={Math.PI / 2} />
      <Lightformer form="rect" intensity={2.2} position={[4, 1, 1]} scale={[1.2, 6, 1]} rotation-y={-Math.PI / 2} />
      <Lightformer form="rect" intensity={1.2} position={[0, 0.5, 5]} scale={[4, 0.6, 1]} />
      <Lightformer form="ring" intensity={1.5} position={[0, -3, 2]} scale={2.5} rotation-x={-Math.PI / 2} />
    </Environment>
  );
}

export default function RobotScene(props: RobotProps) {
  return (
    <Canvas
      className={styles.canvas}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5.2], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      fallback={<p className={styles.fallback}>3D недоступно в этом браузере</p>}
    >
      <StudioLights />
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 4, 5]} intensity={0.8} />

      <group position={[0, -0.25, 0]}>
        <Robot {...props} />
      </group>
      <Decorations reducedMotion={props.reducedMotion} />
      {props.mood === "celebrate" && (
        <Sparkles count={60} scale={[3.2, 2.6, 1.5]} size={4} speed={0.6} color="#ffffff" />
      )}
      <ContactShadows position={[0, -1.62, 0]} opacity={0.7} scale={5} blur={2.6} far={2} color="#000000" />
    </Canvas>
  );
}
