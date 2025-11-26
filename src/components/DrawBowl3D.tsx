import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DrawBowl3DProps {
  position: [number, number, number];
  color: string;
}

const DrawBowl3D = ({ position, color }: DrawBowl3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial
        color={color}
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
};

export default DrawBowl3D;
