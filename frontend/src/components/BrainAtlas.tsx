import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Text, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Define brain regions for highlighting
export type BrainRegion = 'Frontal' | 'Parietal' | 'Temporal' | 'Occipital' | 'Cerebellum' | null;

interface RegionProps {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  name: BrainRegion;
  activeRegion: BrainRegion;
  onHover: (name: BrainRegion) => void;
}

function BrainPart({ position, scale, color, name, activeRegion, onHover }: RegionProps) {
  const mesh = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const isActive = activeRegion === name;

  // Animation: subtle scale pulse if active or hovered
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const targetScale = (isActive || hovered) ? 1.1 : 1.0;
    mesh.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    
    if (isActive) {
      mesh.current.position.y += Math.sin(t * 2) * 0.001;
    }
  });

  return (
    <mesh
      ref={mesh}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        onHover(name);
      }}
      onPointerOut={() => {
        setHover(false);
        onHover(null);
      }}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={isActive ? '#00e5ff' : hovered ? '#4fc3f7' : color}
        roughness={0.3}
        metalness={0.2}
        emissive={isActive ? '#00e5ff' : '#000'}
        emissiveIntensity={isActive ? 0.5 : 0}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

interface BrainAtlasProps {
  highlightRegion?: BrainRegion;
}

export default function BrainAtlas({ highlightRegion }: BrainAtlasProps) {
  const [hoveredRegion, setHoveredRegion] = useState<BrainRegion>(null);
  const activeRegion = highlightRegion || hoveredRegion;

  // Simple stylized brain mapping
  const parts = useMemo(() => [
    { name: 'Frontal' as BrainRegion, pos: [0, 0.2, 0.8] as [number, number, number], scale: [0.8, 0.7, 0.7], color: '#64b5f6' },
    { name: 'Parietal' as BrainRegion, pos: [0, 0.5, -0.2] as [number, number, number], scale: [0.75, 0.6, 0.7], color: '#81c784' },
    { name: 'Temporal' as BrainRegion, pos: [0.7, -0.1, 0.2] as [number, number, number], scale: [0.4, 0.5, 0.6], color: '#ffd54f' },
    { name: 'Temporal' as BrainRegion, pos: [-0.7, -0.1, 0.2] as [number, number, number], scale: [0.4, 0.5, 0.6], color: '#ffd54f' },
    { name: 'Occipital' as BrainRegion, pos: [0, 0.1, -0.9] as [number, number, number], scale: [0.6, 0.5, 0.5], color: '#ba68c8' },
    { name: 'Cerebellum' as BrainRegion, pos: [0, -0.6, -0.7] as [number, number, number], scale: [0.5, 0.4, 0.4], color: '#e57373' },
  ], []);

  return (
    <div className="w-full h-full bg-surface-container-lowest rounded-3xl overflow-hidden relative border border-outline-variant/10 shadow-inner">
      {/* Legend / Status Overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-1">Anatomical Model</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${activeRegion ? 'bg-primary animate-pulse' : 'bg-outline/30'}`} />
          <span className="text-sm font-headline font-bold text-on-surface">
            {activeRegion ? activeRegion : 'Interactive Atlas'}
          </span>
        </div>
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={40} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <group position={[0, 0.3, 0]}>
            {parts.map((part, i) => (
              <group key={i} scale={part.scale as any}>
                <BrainPart
                  name={part.name}
                  position={part.pos}
                  color={part.color}
                  activeRegion={activeRegion}
                  onHover={setHoveredRegion}
                />
              </group>
            ))}
          </group>
        </Float>

        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
        <OrbitControls 
          enablePan={false} 
          minDistance={3} 
          maxDistance={8} 
          autoRotate={!activeRegion}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      <div className="absolute bottom-6 right-6 z-10 text-[10px] text-outline font-medium uppercase tracking-tighter opacity-50">
        3D Neural Mapping v1.0
      </div>
    </div>
  );
}
