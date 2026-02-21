'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
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
    // Phase to light direction:
    // phase=0   → light behind (new moon, dark)
    // phase=0.25 → light from right (first quarter)
    // phase=0.5  → light toward viewer (full moon)
    // phase=0.75 → light from left (last quarter)
    float phaseAngle = uPhase * 6.283185;
    vec3 lightDir = normalize(vec3(sin(phaseAngle), 0.0, -cos(phaseAngle)));

    float illumination = dot(vNormal, lightDir);
    float shadow = smoothstep(-0.05, 0.15, illumination);

    vec4 texColor = texture2D(uTexture, vUv);

    // Earthshine: faint glow on the dark side
    float earthshine = 0.03;
    float light = max(shadow, earthshine);

    gl_FragColor = vec4(texColor.rgb * light, 1.0);
  }
`;

function MoonSphere({ phase }: { phase: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture('/textures/moon-surface.jpg');

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uPhase: { value: phase },
    }),
    [texture, phase]
  );

  // Update phase uniform when it changes
  useFrame((_state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uPhase.value = phase;

      // Slow libration (Y axis wobble)
      const time = _state.clock.elapsedTime;
      meshRef.current.rotation.y =
        Math.sin(time * MOON_LIBRATION_SPEED * 60) * MOON_LIBRATION_AMPLITUDE;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        vertexShader={terminatorVertexShader}
        fragmentShader={terminatorFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

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
    >
      <MoonSphere phase={phase} />
    </Canvas>
  );
}
