'use client'

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const Cloth: React.FC = () => {
  const { camera } = useThree(); 
  const meshRef = useRef<THREE.Mesh>(null);

  const segments = 100; // higher = smoother waves
  const size = 30; // size of the cloth

  // Generate plane geometry with high segments
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2); // orient horizontally
    return geo;
  }, [segments, size]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const positions = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const scrollY = window.scrollY / window.innerHeight; // normalize scroll
    const time = clock.getElapsedTime() * 0.5 + scrollY * 2; // blend with scroll

    camera.position.z = 25 - scrollY * 5;

    for (let i = 0; i < positions.count; i++) {
      const ix = i * 3;
      const x = positions.array[ix];
      const z = positions.array[ix + 2];
      positions.array[ix + 1] = Math.sin(x * 0.3 + time) * 0.6 + Math.cos(z * 0.3 + (time * 0.7)) * 0.6;
    }
    positions.needsUpdate = true;
  });

  // Elegant gradient material
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#001B3D'),
      side: THREE.DoubleSide,
      roughness: 0.6,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    return mat;
  }, []);

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
};

const Sparkles: React.FC<{ count: number }> = ({ count }) => {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = Math.random() * 10; // slightly above cloth
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  const velocities = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 0.002;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return arr;
  }, [count]);

  const texture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0, 27, 61,1)'); // gold
    grad.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame(() => {
    if (!ref.current || !texture) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] += velocities[i * 3 + 0];
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      pos[i * 3 + 2] += velocities[i * 3 + 2];

      for (let j = 0; j < 3; j++) {
        if (pos[i * 3 + j] > 10) pos[i * 3 + j] = -10;
        if (pos[i * 3 + j] < -10) pos[i * 3 + j] = 10;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!texture) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        map={texture}
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default function ClothBackground() {
  return (
    <div className="fixed top-0 left-0 inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={0.8} />
        <Cloth />
        <Sparkles count={100} />
      </Canvas>
    </div>
  )
}
