'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const CROWN_MODEL = '/models/celeste_crown.glb';
const RING_MODEL = '/models/ring.glb';

useGLTF.preload(CROWN_MODEL);
useGLTF.preload(RING_MODEL);

function StudioEnvironment() {
  const { scene, gl } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envScene = new RoomEnvironment();
    const envMap = pmrem.fromScene(envScene, 0.04).texture;
    scene.environment = envMap;
    return () => {
      envMap.dispose();
      pmrem.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);
  return null;
}

function Ring({
  url,
  scrollY,
  position,
  scale,
  tilt,
  rotateSpeed,
  opacity,
}: {
  url: string;
  scrollY: { current: number };
  position: [number, number, number];
  scale: number;
  tilt: [number, number, number];
  rotateSpeed: number;
  opacity: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url) as unknown as { scene: THREE.Group };

  const cloned = useMemo(() => {
    const root = scene.clone(true);
    const useAlpha = opacity < 1;

    root.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const slots = Array.isArray(mesh.material) ? mesh.material : [mesh.material as THREE.Material];
      const next = slots.map((m) => {
        const cm = m.clone();
        if (useAlpha) {
          cm.transparent = true;
          cm.opacity = opacity;
          cm.depthWrite = false;
        }
        return cm;
      });
      mesh.material = Array.isArray(mesh.material) ? next : next[0];
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    });

    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const normalizeScale = 6 / maxDim;
    root.position.sub(center.multiplyScalar(normalizeScale));
    root.scale.setScalar(normalizeScale);
    const wrapper = new THREE.Group();
    wrapper.add(root);
    return wrapper;
  }, [scene, opacity]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x = tilt[0] + scrollY.current * 0.3;
    groupRef.current.rotation.y += delta * rotateSpeed;
    groupRef.current.rotation.z = tilt[2] + scrollY.current * 0.12;
  });

  return (
    <group ref={groupRef} position={position} scale={scale} rotation={tilt}>
      <primitive object={cloned} />
    </group>
  );
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 26;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return arr;
  }, [count]);

  const velocities = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 0.0015;
      arr[i * 3 + 1] = (Math.random() - 0.2) * 0.0012;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.0015;
    }
    return arr;
  }, [count]);

  const texture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 232, 192, 0.95)');
    grad.addColorStop(0.5, 'rgba(212, 175, 55, 0.45)');
    grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
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
        if (pos[i * 3 + j] > 13) pos[i * 3 + j] = -13;
        if (pos[i * 3 + j] < -13) pos[i * 3 + j] = 13;
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
        size={0.35}
        map={texture}
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function JewelCanvas() {
  const [active, setActive] = useState(true);
  const scrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      scrollY.current = window.scrollY / Math.max(window.innerHeight, 1);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const onVisibility = () => setActive(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 22], fov: 42 }}
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 14, 8]} intensity={1.0} color="#ffffff" />
      <directionalLight position={[-12, -6, 6]} intensity={0.4} color="#dde6f0" />

      <Suspense fallback={null}>
        <StudioEnvironment />
        <Ring
          url={CROWN_MODEL}
          scrollY={scrollY}
          position={[3.5, -1, -2]}
          scale={1}
          tilt={[0.5, 0.2, -0.25]}
          rotateSpeed={0.18}
          opacity={0.55}
        />
        <Ring
          url={RING_MODEL}
          scrollY={scrollY}
          position={[-4.5, 2.5, -5]}
          scale={0.55}
          tilt={[1.0, -0.3, 0.5]}
          rotateSpeed={-0.12}
          opacity={0.32}
        />
      </Suspense>

      <Dust count={36} />
    </Canvas>
  );
}
