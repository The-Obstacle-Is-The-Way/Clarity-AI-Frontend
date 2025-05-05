import * as THREE from 'three';

/**
 * Neural glow shader for highlighting brain regions
 */
export const neuralGlowVertex = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const neuralGlowFragment = `
  uniform vec3 color;
  uniform float intensity;
  uniform float pulseFactor;
  uniform float time;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Fresnel effect for edge glow
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = dot(viewDirection, vNormal);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    
    // Pulse effect based on time
    float pulse = 0.5 + 0.5 * sin(time * pulseFactor);
    
    // Combine effects
    float glow = fresnel * intensity * (0.8 + 0.2 * pulse);
    
    gl_FragColor = vec4(color, glow);
  }
`;

export const createNeuralGlowUniforms = (options: { intensity?: number; pulseFactor?: number } = {}) => {
  const color = new THREE.Color(0x00aaff);
  const intensity = options.intensity ?? 1.0;
  const pulseFactor = options.pulseFactor ?? 0.5;
  return {
    color: { value: color },
    intensity: { value: intensity },
    pulseFactor: { value: pulseFactor },
    time: { value: 0.0 }
  };
};

export const updateNeuralGlow = (uniforms: any, deltaTime: number) => {
  if (uniforms.time) {
    uniforms.time.value += deltaTime;
  }
};

export const createNeuralGlowMaterial = (
  color: THREE.Color = new THREE.Color(0x00aaff),
  intensity: number = 1.0,
  pulseFactor: number = 0.5
): THREE.ShaderMaterial => {
  return new THREE.ShaderMaterial({
    uniforms: {
      color: { value: color },
      intensity: { value: intensity },
      pulseFactor: { value: pulseFactor },
      time: { value: 0.0 }
    },
    vertexShader: neuralGlowVertex,
    fragmentShader: neuralGlowFragment,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
};