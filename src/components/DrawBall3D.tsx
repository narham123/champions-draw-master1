import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface DrawBall3DProps {
  position: [number, number, number];
  isAnimating: boolean;
  color?: string;
  pot?: 1 | 2 | 3 | 4;
}

const getPotColor = (pot: 1 | 2 | 3 | 4): string => {
  switch (pot) {
    case 1: return "#FFD700"; // Gold
    case 2: return "#C0C0C0"; // Silver
    case 3: return "#CD7F32"; // Bronze
    case 4: return "#E5E4E2"; // Platinum
    default: return "#FFB81C";
  }
};

const DrawBall3D = ({ position, isAnimating, color, pot }: DrawBall3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isAnimating) {
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  const ballColor = color || (pot ? getPotColor(pot) : "#FFB81C");

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]} position={position}>
      <MeshDistortMaterial
        color={ballColor}
        attach="material"
        distort={0.3}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
};

export default DrawBall3D;
