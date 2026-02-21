'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
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

    // Elliptical terminator model:
    // k = cos(phase * 2π) controls the terminator's x-radius
    // phase 0 (new):  k=1  → terminator at right limb → all dark
    // phase 0.25 (Q1): k=0  → terminator at centre → right half lit
    // phase 0.5 (full): k=-1 → terminator at left limb → all lit
    float phaseAngle = uPhase * 6.283185;
    float k = cos(phaseAngle);
    float sinP = sin(phaseAngle);

    // Limb x-radius at this y-height (circle cross-section)
    float limbX = sqrt(max(0.0, 1.0 - disk.y * disk.y));

    // Terminator x-position traces an ellipse as y varies
    float termX = k * limbX;

    // Signed distance from terminator (positive = lit side)
    // sinP >= 0 for waxing (right side lit), < 0 for waning (left side lit)
    float dx = disk.x - termX;
    float signedDist = sinP >= 0.0 ? dx : -dx;

    // Smooth shadow edge
    float shadow = smoothstep(-0.06, 0.06, signedDist);

    // Limb darkening for 3D depth (brighter at centre, darker at edges)
    float depth = max(0.0, vNormal.z);
    float limbDarkening = mix(0.6, 1.0, pow(depth, 0.4));

    // Earthshine: faint glow on the dark side
    float earthshine = 0.03;
    float light = max(shadow * limbDarkening, earthshine);

    gl_FragColor = vec4(texColor.rgb * light, 1.0);
  }
`;

function MoonSphere({ phase }: { phase: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load texture manually (avoids drei/Suspense version issues)
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      '/textures/moon-surface.jpg',
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      (err) => console.error('[MoonScene] Texture load failed:', err)
    );
  }, []);

  const uniforms = useMemo(() => {
    if (!texture) return null;
    return {
      uTexture: { value: texture },
      uPhase: { value: phase },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture]);

  // Update phase uniform every frame
  useFrame((_state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      if (mat.uniforms?.uPhase) {
        mat.uniforms.uPhase.value = phase;
      }

      // Slow libration (Y axis wobble)
      const time = _state.clock.elapsedTime;
      meshRef.current.rotation.y =
        Math.sin(time * MOON_LIBRATION_SPEED * 60) * MOON_LIBRATION_AMPLITUDE;
    }
  });

  // Don't render until texture is loaded
  if (!texture || !uniforms) return null;

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
      onCreated={({ gl }) => {
        // Verify WebGL context is alive
        if (!gl.getContext()) {
          console.error('[MoonScene] WebGL context lost');
        }
      }}
    >
      <MoonSphere phase={phase} />
    </Canvas>
  );
}
