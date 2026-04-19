import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, ContactShadows, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense } from 'react';

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

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const targetScale = (isActive || hovered) ? 1.05 : 1.0;
    mesh.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    
    if (isActive) {
      mesh.current.position.y += Math.sin(t * 3) * 0.0005;
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
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhysicalMaterial
        color={isActive ? '#00fbff' : hovered ? '#b3f0ff' : color}
        emissive={isActive ? '#00fbff' : hovered ? '#00fbff' : '#000'}
        emissiveIntensity={isActive ? 2.5 : hovered ? 0.8 : 0}
        roughness={0.1}
        metalness={0.8}
        transmission={0.4}
        thickness={0.5}
        ior={1.5}
        attenuationColor="#ffffff"
        attenuationDistance={1}
      />
    </mesh>
  );
}

// Placeholder for future GLTF integration
function Model({ highlightRegion }: { highlightRegion: BrainRegion }) {
  // const { nodes, materials } = useGLTF('/models/brain.glb');
  return null;
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
        <PerspectiveCamera makeDefault position={[0, 2, 6]} fov={35} />
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow color="#fff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#4fc3f7" />
        <Environment preset="night" />
        
        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.6} floatIntensity={0.6}>
            <group position={[0, 0, 0]}>
              <Model highlightRegion={activeRegion} />
              
              {/* Fallback geometric model */}
              <group scale={1.2}>
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
            </group>
          </Float>
        </Suspense>

        <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={12} blur={2.5} far={5} color="#000000" />
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
