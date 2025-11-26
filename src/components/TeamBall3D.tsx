import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Text } from "@react-three/drei";
import * as THREE from "three";
import { Team } from "@/types/team";

interface TeamBall3DProps {
  team: Team;
  position: [number, number, number];
  isAnimating: boolean;
  targetPosition?: [number, number, number];
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

const TeamBall3D = ({ team, position, isAnimating, targetPosition }: TeamBall3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isAnimating) {
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.y += 0.02;
      
      if (targetPosition) {
        // Smooth transition to target position
        meshRef.current.position.x += (targetPosition[0] - meshRef.current.position.x) * 0.1;
        meshRef.current.position.y += (targetPosition[1] - meshRef.current.position.y) * 0.1;
        meshRef.current.position.z += (targetPosition[2] - meshRef.current.position.z) * 0.1;
      } else {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.3;
      }
    }
    
    // Keep text facing camera
    if (textRef.current) {
      textRef.current.lookAt(state.camera.position);
    }
  });

  return (
    <group>
      <Sphere ref={meshRef} args={[1, 32, 32]} position={position}>
        <MeshDistortMaterial
          color={getPotColor(team.pot)}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      <Text
        ref={textRef}
        position={[position[0], position[1], position[2] + 1.5]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {team.name.length > 15 ? team.name.substring(0, 12) + "..." : team.name}
      </Text>
    </group>
  );
};

export default TeamBall3D;
