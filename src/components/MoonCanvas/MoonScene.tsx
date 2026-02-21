'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MOON_LIBRATION_SPEED, MOON_LIBRATION_AMPLITUDE } from '@/lib/motion-constants';

// Terminator shader: lights the sphere based on moon phase
const terminatorVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const terminatorFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uPhase;

  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vec4 texColor = texture2D(uTexture, vUv);

    // Project 3D surface normal to 2D disk coordinates (as seen from camera)
    vec2 disk = vNormal.xy;

    // Elliptical terminator model
    float phaseAngle = uPhase * 6.283185;
    float k = cos(phaseAngle);
    float sinP = sin(phaseAngle);

    float limbX = sqrt(max(0.0, 1.0 - disk.y * disk.y));
    float termX = k * limbX;

    float dx = disk.x - termX;
    float signedDist = sinP >= 0.0 ? dx : -dx;

    float shadow = smoothstep(-0.06, 0.06, signedDist);

    // Limb darkening for 3D depth
    float depth = max(0.0, vNormal.z);
    float limbDarkening = mix(0.6, 1.0, pow(depth, 0.4));

    float earthshine = 0.03;
    float light = max(shadow * limbDarkening, earthshine);

    gl_FragColor = vec4(texColor.rgb * light, 1.0);
  }
`;

function MoonSphere({ phase }: { phase: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const [textureLoaded, setTextureLoaded] = useState(false);
  // Load texture and build shader material imperatively
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      '/textures/moon-surface.jpg',
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;

        const mat = new THREE.ShaderMaterial({
          vertexShader: terminatorVertexShader,
          fragmentShader: terminatorFragmentShader,
          uniforms: {
            uTexture: { value: tex },
            uPhase: { value: phase },
          },
        });

        matRef.current = mat;

        if (meshRef.current) {
          meshRef.current.material = mat;
        }

        setTextureLoaded(true);
      },
      undefined,
      (err) => console.error('[MoonScene] Texture load failed:', err)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_state) => {
    if (!meshRef.current) return;

    // Update phase uniform
    if (matRef.current?.uniforms?.uPhase) {
      matRef.current.uniforms.uPhase.value = phase;
    }

    // Slow libration (Y axis wobble)
    const time = _state.clock.elapsedTime;
    meshRef.current.rotation.y =
      Math.sin(time * MOON_LIBRATION_SPEED * 60) * MOON_LIBRATION_AMPLITUDE;
  });

  // Always render the sphere — grey fallback until texture loads
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      {!textureLoaded && <meshBasicMaterial color="#2a2a3e" />}
    </mesh>
  );
}

// Preload texture so it's cached by the time MoonSphere mounts
const preloadTexture = () => {
  if (typeof window !== 'undefined') {
    const img = new Image();
    img.src = '/textures/moon-surface.jpg';
  }
};

interface MoonSceneProps {
  phase: number;
  diameter: number;
}

export default function MoonScene({ phase, diameter }: MoonSceneProps) {
  if (diameter <= 0) return null;

  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 2.5], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      dpr={[1, 2]}
      onCreated={() => {
        preloadTexture();
      }}
    >
      <MoonSphere phase={phase} />
    </Canvas>
  );
}
