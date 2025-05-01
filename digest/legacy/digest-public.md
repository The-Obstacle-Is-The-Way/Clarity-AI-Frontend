This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.
The content has been processed where content has been compressed (code blocks are separated by ⋮---- delimiter).

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: public/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Files are sorted by Git change count (files with more changes are at the bottom)

## Additional Info

# Directory Structure
```
public/
  brain-icon.svg
  brain-standalone-demo.html
```

# Files

## File: public/brain-icon.svg
```
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="64" fill="url(#paint0_linear)" />
  <path d="M64 32V36M80.3636 40.7273L77.0909 43.0909M47.6364 40.7273L50.9091 43.0909M46 60H50M78 60H82M39.5 79.5L42.5 77M88.5 79.5L85.5 77M54 84H74M64 36C53.5066 36 45 44.5066 45 55C45 60.4108 47.1318 65.2798 50.6183 68.8368C51.491 69.7182 52 70.9145 52 72.1646V73C52 74.6569 53.3431 76 55 76H73C74.6569 76 76 74.6569 76 73V72.1646C76 70.9145 76.509 69.7182 77.3817 68.8368C80.8682 65.2798 83 60.4108 83 55C83 44.5066 74.4934 36 64 36Z" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  <defs>
    <linearGradient id="paint0_linear" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#10B981" />
      <stop offset="1" stop-color="#3B82F6" />
    </linearGradient>
  </defs>
</svg>
```

## File: public/brain-standalone-demo.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novamind Digital Twin - Brain Visualization</title>
  <script src="https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.158.0/examples/js/controls/OrbitControls.js"></script>
  <style>
    body { 
      margin: 0; 
      overflow: hidden; 
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
      background: #121212;
      color: white;
    }
    #info {
      position: absolute;
      bottom: 20px;
      left: 0;
      right: 0;
      text-align: center;
      padding: 10px;
      z-index: 100;
    }
    .info-panel {
      display: inline-block;
      background: rgba(0, 0, 0, 0.5);
      padding: 10px 20px;
      border-radius: 5px;
      backdrop-filter: blur(10px);
      max-width: 80%;
    }
    .region-tag {
      display: inline-block;
      margin: 4px;
      padding: 4px 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    .region-tag.active {
      background: rgba(77, 171, 247, 0.3);
    }
    .controls {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.5);
      padding: 15px;
      border-radius: 5px;
      backdrop-filter: blur(10px);
    }
    .controls button {
      background: #4c6ef5;
      color: white;
      border: none;
      padding: 8px 12px;
      margin: 4px 0;
      border-radius: 4px;
      cursor: pointer;
      display: block;
      width: 100%;
    }
    .controls button:hover {
      background: #5c7cff;
    }
    h1 {
      position: absolute;
      top: 20px;
      left: 20px;
      margin: 0;
      padding: 10px 20px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 5px;
      backdrop-filter: blur(10px);
      font-size: 1.5rem;
    }
    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.2rem;
      background: rgba(0, 0, 0, 0.7);
      padding: 20px 30px;
      border-radius: 8px;
      text-align: center;
    }
    .loading-bar {
      height: 4px;
      background: #4c6ef5;
      width: 0%;
      transition: width 0.3s;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <h1>Novamind Digital Twin</h1>
  
  <div id="loading" class="loading">
    Loading Brain Model...
    <div id="loading-bar" class="loading-bar"></div>
  </div>
  
  <div class="controls">
    <button id="anatomical">Anatomical View</button>
    <button id="functional">Functional View</button>
    <button id="activity">Activity View</button>
    <button id="toggle-rotation">Toggle Rotation</button>
  </div>
  
  <div id="info">
    <div class="info-panel">
      <div id="region-list">
        <span class="region-tag active">Prefrontal Cortex</span>
        <span class="region-tag">Amygdala</span>
        <span class="region-tag">Hippocampus</span>
        <span class="region-tag">Thalamus</span>
        <span class="region-tag active">Cerebellum</span>
      </div>
    </div>
  </div>

  <script>
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x121212);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    
    // Add camera controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    
    // Brain region data
    const brainRegions = [
      { name: "Prefrontal Cortex", position: [0, 5, 0], scale: 2.5, color: 0xff6b6b, active: true },
      { name: "Amygdala", position: [-3, 0, 1], scale: 1.2, color: 0x4dabf7, active: false },
      { name: "Hippocampus", position: [-2, -2, 2], scale: 1.5, color: 0x4dabf7, active: false },
      { name: "Thalamus", position: [0, 1, -1], scale: 1.8, color: 0x4dabf7, active: false },
      { name: "Cerebellum", position: [0, -6, 0], scale: 2.2, color: 0xff6b6b, active: true },
      { name: "Insula", position: [4, 2, 0], scale: 1.3, color: 0x4dabf7, active: false },
      { name: "Anterior Cingulate", position: [0, 3, -2], scale: 1.4, color: 0x4dabf7, active: false },
      { name: "Basal Ganglia", position: [2, 0, 0], scale: 1.7, color: 0x4dabf7, active: false },
      { name: "Temporal Lobe", position: [5, -2, 1], scale: 2.0, color: 0x4dabf7, active: false },
      { name: "Occipital Lobe", position: [0, -4, -3], scale: 1.9, color: 0x4dabf7, active: false },
      { name: "Broca's Area", position: [-5, 3, 0], scale: 1.1, color: 0x4dabf7, active: false },
      { name: "Wernicke's Area", position: [5, -1, -1], scale: 1.2, color: 0x4dabf7, active: false },
    ];
    
    // Connections between regions
    const connections = [
      { source: 0, target: 6, strength: 0.8, type: "excitatory" },
      { source: 0, target: 2, strength: 0.6, type: "excitatory" },
      { source: 1, target: 2, strength: 0.9, type: "inhibitory" },
      { source: 3, target: 7, strength: 0.7, type: "excitatory" },
      { source: 4, target: 9, strength: 0.5, type: "excitatory" },
      { source: 5, target: 1, strength: 0.8, type: "inhibitory" },
      { source: 6, target: 10, strength: 0.6, type: "excitatory" },
      { source: 7, target: 3, strength: 0.7, type: "excitatory" },
      { source: 8, target: 11, strength: 0.9, type: "excitatory" },
      { source: 10, target: 11, strength: 0.8, type: "excitatory" },
    ];
    
    // Create brain regions
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);
    
    const regions = [];
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    
    // Create neural pathway curves
    function createNeuralPathway(source, target, strength, type) {
      const sourcePosition = new THREE.Vector3(
        brainRegions[source].position[0],
        brainRegions[source].position[1],
        brainRegions[source].position[2]
      );
      
      const targetPosition = new THREE.Vector3(
        brainRegions[target].position[0],
        brainRegions[target].position[1],
        brainRegions[target].position[2]
      );
      
      // Create midpoint with some curvature
      const midPoint = new THREE.Vector3()
        .addVectors(sourcePosition, targetPosition)
        .multiplyScalar(0.5)
        .add(new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ));
      
      const curve = new THREE.QuadraticBezierCurve3(
        sourcePosition,
        midPoint,
        targetPosition
      );
      
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      
      const color = type === "excitatory" ? 0x4c6ef5 : 0xff6b6b;
      const material = new THREE.LineBasicMaterial({ 
        color: color,
        opacity: 0.6 * strength,
        transparent: true,
        linewidth: 1
      });
      
      const line = new THREE.Line(geometry, material);
      return line;
    }
    
    // Loading simulation
    let loadingProgress = 0;
    const loadingBar = document.getElementById('loading-bar');
    const loading = document.getElementById('loading');
    
    const loadingInterval = setInterval(() => {
      loadingProgress += 5;
      loadingBar.style.width = `${loadingProgress}%`;
      
      if (loadingProgress >= 100) {
        clearInterval(loadingInterval);
        setTimeout(() => {
          loading.style.display = 'none';
          init();
        }, 500);
      }
    }, 100);
    
    function init() {
      // Create regions
      brainRegions.forEach((region, i) => {
        const material = new THREE.MeshPhongMaterial({ 
          color: region.active ? region.color : 0xaaaaaa,
          shininess: 50,
          emissive: region.active ? region.color : 0x000000,
          emissiveIntensity: region.active ? 0.3 : 0
        });
        
        const mesh = new THREE.Mesh(sphereGeometry, material);
        mesh.position.set(region.position[0], region.position[1], region.position[2]);
        mesh.scale.set(region.scale, region.scale, region.scale);
        mesh.userData = { index: i, active: region.active };
        
        regions.push(mesh);
        brainGroup.add(mesh);
      });
      
      // Create connections
      connections.forEach(conn => {
        const pathway = createNeuralPathway(
          conn.source, 
          conn.target, 
          conn.strength, 
          conn.type
        );
        brainGroup.add(pathway);
      });
    }
    
    // Animation loop
    let autoRotate = true;
    function animate() {
      requestAnimationFrame(animate);
      
      if (autoRotate) {
        brainGroup.rotation.y += 0.002;
      }
      
      // Pulse active regions
      regions.forEach(region => {
        if (region.userData && region.userData.active) {
          const time = Date.now() * 0.001;
          const pulse = Math.sin(time * 2 + region.userData.index * 0.5) * 0.1 + 0.9;
          const scale = brainRegions[region.userData.index].scale * pulse;
          region.scale.set(scale, scale, scale);
          
          region.material.emissiveIntensity = 0.3 + Math.sin(time * 3) * 0.1;
        }
      });
      
      controls.update();
      renderer.render(scene, camera);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Handle button clicks
    document.getElementById('anatomical').addEventListener('click', () => {
      regions.forEach(region => {
        region.material.color.set(0xaaaaaa);
        if (region.userData.active) {
          region.material.color.set(0xff6b6b);
        }
      });
    });
    
    document.getElementById('functional').addEventListener('click', () => {
      regions.forEach(region => {
        region.material.color.set(0xaaaaaa);
        if (region.userData.active) {
          region.material.color.set(0x4dabf7);
        }
      });
    });
    
    document.getElementById('activity').addEventListener('click', () => {
      regions.forEach(region => {
        region.material.color.set(0xaaaaaa);
        if (region.userData.active) {
          region.material.color.set(0x74b816);
        }
      });
    });
    
    document.getElementById('toggle-rotation').addEventListener('click', () => {
      autoRotate = !autoRotate;
    });
    
    // Start animation
    animate();
  </script>
</body>
</html>
```
