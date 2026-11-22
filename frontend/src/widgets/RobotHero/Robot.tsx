"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { RobotMood } from "@/types/robot";

// Свечение почти белое — лишь лёгкий оттенок настроения, чтобы не ломать монохром
const MOOD_COLORS: Record<RobotMood, string> = {
  idle: "#f2f6ff",
  wave: "#f2f6ff",
  happy: "#c9ffe2",
  celebrate: "#ffe7a8",
  sad: "#b9c8ff",
  thinking: "#e0d4ff",
  error: "#ff9a9a",
};

/** Хромированные материалы; блики дают Lightformer-панели из RobotScene */
const CHROME = { color: "#f2f3f7", metalness: 1, roughness: 0.16 } as const;
const CHROME_SATIN = { color: "#a7a9b2", metalness: 1, roughness: 0.32 } as const;
const GRAPHITE = { color: "#3b3c43", metalness: 0.9, roughness: 0.22 } as const;
const SCREEN = { color: "#050507", metalness: 0.3, roughness: 0.1 } as const;

const { damp } = THREE.MathUtils;

export interface RobotProps {
  mood: RobotMood;
  reactionId: number;
  reducedMotion: boolean;
  onPoke?: () => void;
}

function glowMaterial(intensity: number) {
  return new THREE.MeshStandardMaterial({
    color: MOOD_COLORS.idle,
    emissive: MOOD_COLORS.idle,
    emissiveIntensity: intensity,
    toneMapped: false,
  });
}

export function Robot({ mood, reactionId, reducedMotion, onPoke }: RobotProps) {
  const root = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const eyes = useRef<THREE.Group>(null!);
  const leftArm = useRef<THREE.Group>(null!);
  const rightArm = useRef<THREE.Group>(null!);
  const flame = useRef<THREE.Mesh>(null!);

  // Светящиеся части меняют цвет плавно, поэтому материалы создаём один раз и меняем в useFrame
  const glowMat = useMemo(() => glowMaterial(1.4), []);
  const beaconMat = useMemo(() => glowMaterial(1.2), []);
  const flameMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: MOOD_COLORS.idle, transparent: true, opacity: 0.75, toneMapped: false }),
    [],
  );
  useEffect(
    () => () => {
      glowMat.dispose();
      beaconMat.dispose();
      flameMat.dispose();
    },
    [glowMat, beaconMat, flameMat],
  );

  const targetColor = useMemo(() => new THREE.Color(MOOD_COLORS[mood]), [mood]);

  // Время начала текущей реакции; -1 значит «выставить в ближайшем кадре»
  const moodStart = useRef(-1);
  useEffect(() => {
    moodStart.current = -1;
  }, [mood, reactionId]);

  // Взгляд следит за курсором по всей странице. Клики при этом идут через обычные события холста,
  // поэтому реагирует только попадание точно в робота
  const canvas = useThree((state) => state.gl.domElement);
  const gaze = useRef({ x: 0, y: 0 });
  useEffect(() => {
    function handleMove(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      const clamp = (v: number) => THREE.MathUtils.clamp(v, -1, 1);
      gaze.current.x = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1);
      gaze.current.y = clamp(-((event.clientY - rect.top) / rect.height) * 2 + 1);
    }
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [canvas]);

  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = "pointer";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (moodStart.current < 0) moodStart.current = t;
    const e = t - moodStart.current;
    const k = reducedMotion ? 0.3 : 1;
    const breathe = Math.sin(t * 1.6);

    let lift = breathe * 0.06 * k;
    let spin = 0;
    let shake = 0;
    let tiltX = 0;
    let tiltZ = 0;
    let eyeOpen = 1;
    // Левая рука поднимается отрицательным углом, правая — положительным
    let leftAngle = -0.2 - breathe * 0.05 * k;
    let rightAngle = 0.2 + breathe * 0.05 * k;

    switch (mood) {
      case "happy": {
        const fade = Math.max(0, 1 - e / 1.6);
        lift += Math.abs(Math.sin(e * 7)) * 0.35 * k * fade;
        leftAngle = -2.4;
        rightAngle = 2.4;
        break;
      }
      case "celebrate":
        lift += Math.abs(Math.sin(e * 6)) * 0.35 * k;
        spin = reducedMotion ? 0 : Math.min(e / 1.2, 1) * Math.PI * 2;
        leftAngle = -2.5 - Math.sin(e * 12) * 0.3 * k;
        rightAngle = 2.5 + Math.sin(e * 12) * 0.3 * k;
        break;
      case "wave":
        rightAngle = 2.3 + Math.sin(e * 10) * 0.45 * k;
        tiltZ = -0.15;
        break;
      case "sad":
        lift -= 0.08;
        tiltX = 0.35;
        eyeOpen = 0.55;
        leftAngle = -0.05;
        rightAngle = 0.05;
        break;
      case "thinking":
        tiltZ = 0.22 + Math.sin(t * 2) * 0.05 * k;
        eyeOpen = 0.8;
        break;
      case "error":
        shake = Math.sin(e * 40) * 0.06 * k * Math.max(0, 1 - e / 0.8);
        tiltX = 0.2;
        eyeOpen = 0.7;
        break;
    }

    const blink = t % 3.4 < 0.13 ? 0.08 : 1;
    const { x: px, y: py } = gaze.current;

    root.current.position.y = damp(root.current.position.y, lift, 12, delta);
    root.current.position.x = shake;
    root.current.rotation.y = spin;

    head.current.rotation.y = damp(head.current.rotation.y, px * 0.6, 5, delta);
    head.current.rotation.x = damp(head.current.rotation.x, -py * 0.3 + tiltX, 5, delta);
    head.current.rotation.z = damp(head.current.rotation.z, tiltZ, 5, delta);
    body.current.rotation.y = damp(body.current.rotation.y, px * 0.2, 4, delta);

    leftArm.current.rotation.z = damp(leftArm.current.rotation.z, leftAngle, 8, delta);
    rightArm.current.rotation.z = damp(rightArm.current.rotation.z, rightAngle, 8, delta);
    eyes.current.scale.y = damp(eyes.current.scale.y, eyeOpen * blink, 30, delta);

    const width = 1 + Math.sin(t * 23) * 0.08 * k;
    flame.current.scale.set(width, 1 + Math.sin(t * 30) * 0.15 * k, width);

    glowMat.color.lerp(targetColor, 1 - Math.exp(-delta * 5));
    glowMat.emissive.copy(glowMat.color);
    beaconMat.color.copy(glowMat.color);
    beaconMat.emissive.copy(glowMat.color);
    beaconMat.emissiveIntensity =
      mood === "thinking" ? (Math.sin(t * 12) > 0 ? 2.4 : 0.4) : 1.2 + Math.sin(t * 3) * 0.5;
    flameMat.color.copy(glowMat.color);
  });

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onPoke?.();
  }

  const happyEyes = mood === "happy" || mood === "celebrate";
  const frown = mood === "sad" || mood === "error";

  return (
    <group
      ref={root}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Корпус, руки и реактивный «моторчик» */}
      <group ref={body}>
        <RoundedBox args={[0.9, 0.78, 0.72]} radius={0.3} smoothness={6} position={[0, -0.62, 0]}>
          <meshStandardMaterial {...CHROME} />
        </RoundedBox>
        <mesh position={[0, -0.6, 0.365]} material={glowMat}>
          <circleGeometry args={[0.07, 32]} />
        </mesh>
        <mesh position={[0, -0.6, 0.362]}>
          <torusGeometry args={[0.1, 0.018, 12, 32]} />
          <meshStandardMaterial {...GRAPHITE} />
        </mesh>

        {[
          { ref: leftArm, x: -0.52 },
          { ref: rightArm, x: 0.52 },
        ].map(({ ref, x }) => (
          <group key={x} ref={ref} position={[x, -0.42, 0]}>
            <mesh position={[0, -0.18, 0]}>
              <capsuleGeometry args={[0.075, 0.22, 8, 16]} />
              <meshStandardMaterial {...CHROME_SATIN} />
            </mesh>
            <mesh position={[0, -0.38, 0]}>
              <sphereGeometry args={[0.095, 24, 24]} />
              <meshStandardMaterial {...GRAPHITE} />
            </mesh>
          </group>
        ))}

        <mesh position={[0, -1.02, 0]}>
          <cylinderGeometry args={[0.16, 0.12, 0.06, 24]} />
          <meshStandardMaterial {...CHROME_SATIN} />
        </mesh>
        <mesh ref={flame} position={[0, -1.12, 0]} rotation={[Math.PI, 0, 0]} material={flameMat}>
          <coneGeometry args={[0.11, 0.22, 24]} />
        </mesh>
      </group>

      {/* Шея */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.13, 0.16, 0.14, 24]} />
        <meshStandardMaterial {...CHROME_SATIN} />
      </mesh>

      {/* Голова */}
      <group ref={head} position={[0, 0.3, 0]}>
        <RoundedBox args={[1.15, 0.86, 0.86]} radius={0.32} smoothness={6}>
          <meshStandardMaterial {...CHROME} />
        </RoundedBox>
        <RoundedBox args={[0.86, 0.56, 0.12]} radius={0.05} smoothness={4} position={[0, -0.02, 0.37]}>
          <meshStandardMaterial {...SCREEN} />
        </RoundedBox>

        <group ref={eyes} position={[0, 0.03, 0.44]}>
          {[-0.19, 0.19].map((x) =>
            happyEyes ? (
              <mesh key={x} position={[x, -0.03, 0]} material={glowMat}>
                <torusGeometry args={[0.085, 0.024, 12, 32, Math.PI]} />
              </mesh>
            ) : (
              <mesh key={x} position={[x, 0, 0]} scale={[0.1, 0.13, 0.04]} material={glowMat}>
                <sphereGeometry args={[1, 24, 24]} />
              </mesh>
            ),
          )}
        </group>

        {mood === "thinking" ? (
          <mesh position={[0, -0.17, 0.44]} scale={[0.035, 0.035, 0.02]} material={glowMat}>
            <sphereGeometry args={[1, 16, 16]} />
          </mesh>
        ) : (
          <mesh position={[0, frown ? -0.2 : -0.14, 0.44]} rotation={[0, 0, frown ? 0 : Math.PI]} material={glowMat}>
            <torusGeometry args={[0.06, 0.018, 12, 32, Math.PI]} />
          </mesh>
        )}

        {[-0.3, 0.3].map((x) => (
          <mesh key={x} position={[x, -0.12, 0.433]}>
            <circleGeometry args={[0.055, 24]} />
            <meshBasicMaterial color="#ff9fc0" transparent opacity={0.35} toneMapped={false} />
          </mesh>
        ))}

        {[-0.6, 0.6].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.08, 24]} />
            <meshStandardMaterial {...GRAPHITE} />
          </mesh>
        ))}

        <mesh position={[0, 0.53, 0]}>
          <cylinderGeometry args={[0.02, 0.025, 0.22, 12]} />
          <meshStandardMaterial {...CHROME_SATIN} />
        </mesh>
        <mesh position={[0, 0.68, 0]} material={beaconMat}>
          <sphereGeometry args={[0.07, 24, 24]} />
        </mesh>
      </group>
    </group>
  );
}
