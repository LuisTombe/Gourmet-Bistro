import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Utensils, RotateCw, ZoomIn, Eye } from 'lucide-react';

interface FoodPlate3DProps {
  variant?: 'hero' | 'compact' | 'interactive';
  activeDishIndex?: number;
  onDishChange?: (index: number) => void;
  className?: string;
}

export const DISHES = [
  {
    id: 1,
    name: 'Bife de Lomo & Hierbas Grill',
    category: 'Carnes & Grill',
    price: '$58.000',
    description: 'Medallón angus sellado a la parrilla, mantequilla de romero y espárragos glaseados.',
    colorAccent: '#f73b20',
  },
  {
    id: 2,
    name: 'Fettuccine Trufado & Parmigiano',
    category: 'Pastas & Risottos',
    price: '$46.000',
    description: 'Pasta artesanal en emulsión de trufa negra, champiñones salteados y lascas de queso.',
    colorAccent: '#f84d35',
  },
  {
    id: 3,
    name: 'Salmón Glaseado Cítrico',
    category: 'Pescados & Mariscos',
    price: '$54.000',
    description: 'Filete de salmón noruego a la plancha sobre puré de coliflor y reducción de cítricos.',
    colorAccent: '#fb2d54',
  },
];

export const FoodPlate3D: React.FC<FoodPlate3DProps> = ({
  variant = 'hero',
  activeDishIndex = 0,
  onDishChange,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentDish, setCurrentDish] = useState(activeDishIndex);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    setCurrentDish(activeDishIndex);
  }, [activeDishIndex]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let stopped = false;
    let animationFrameId = 0;

    const width = containerRef.current.clientWidth || 500;
    const height = containerRef.current.clientHeight || 450;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 6.2);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 3. Lighting (Warm restaurant ambient + editorial key & rim lights)
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.4);
    scene.add(ambientLight);

    // Key Light (Warm golden sunlight from upper-left)
    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Rim Light (Signal Orange / Coral backlight reflecting edges of plates)
    const rimLight = new THREE.DirectionalLight(0xf73b20, 2.6);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    // Soft Fill Light (Warm peach)
    const fillLight = new THREE.PointLight(0xffa894, 1.8, 15);
    fillLight.position.set(0, -2, 3);
    scene.add(fillLight);

    // 4. Materials
    const plateMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.05,
      transmission: 0.05,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });

    const plateGoldRimMaterial = new THREE.MeshStandardMaterial({
      color: 0xe5a93c,
      roughness: 0.25,
      metalness: 0.85,
    });

    const steakMaterial = new THREE.MeshStandardMaterial({
      color: 0x421d13, // Caramelized sear
      roughness: 0.65,
      metalness: 0.1,
    });

    const herbButterMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f3a4,
      roughness: 0.3,
      metalness: 0.0,
    });

    const garnishGreenMaterial = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.5,
      metalness: 0.0,
    });

    const salmonMaterial = new THREE.MeshStandardMaterial({
      color: 0xfb7153, // Salmon pink
      roughness: 0.45,
      metalness: 0.05,
    });

    const pastaMaterial = new THREE.MeshStandardMaterial({
      color: 0xf6dfa3, // Golden semolina
      roughness: 0.5,
      metalness: 0.0,
    });

    const sauceMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x7c2d12, // Rich reduction demi-glace
      roughness: 0.1,
      metalness: 0.2,
      clearcoat: 1.0,
    });

    // Helper: Construct an authentic Fine-Dining Porcelain Plate
    const createPorcelainPlate = (radius = 1.6, rimColor = 0xe5a93c) => {
      const plateGroup = new THREE.Group();

      // Rim rim bevel (cylinder with curved inner depression)
      const baseGeo = new THREE.CylinderGeometry(radius * 0.72, radius * 0.65, 0.08, 48);
      const baseMesh = new THREE.Mesh(baseGeo, plateMaterial);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      plateGroup.add(baseMesh);

      // Elevated Outer Rim
      const rimGeo = new THREE.TorusGeometry(radius * 0.9, 0.15, 20, 64);
      rimGeo.rotateX(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, plateMaterial);
      rimMesh.position.y = 0.06;
      rimMesh.castShadow = true;
      rimMesh.receiveShadow = true;
      plateGroup.add(rimMesh);

      // Delicate golden accent ring on plate border
      const goldRingGeo = new THREE.TorusGeometry(radius * 0.98, 0.015, 12, 64);
      goldRingGeo.rotateX(Math.PI / 2);
      const goldRingMesh = new THREE.Mesh(goldRingGeo, plateGoldRimMaterial);
      goldRingMesh.position.y = 0.07;
      plateGroup.add(goldRingMesh);

      return plateGroup;
    };

    // 5. Build 3 Distinct Floating Food Dishes

    // === DISH 1: Bife de Lomo & Hierbas Grill ===
    const dish1Group = new THREE.Group();
    const plate1 = createPorcelainPlate(1.7);
    dish1Group.add(plate1);

    // Demi-glace artistic swirl
    const sauceGeo = new THREE.RingGeometry(0.35, 0.85, 32);
    sauceGeo.rotateX(-Math.PI / 2);
    const sauceMesh = new THREE.Mesh(sauceGeo, sauceMaterial);
    sauceMesh.position.y = 0.05;
    dish1Group.add(sauceMesh);

    // Angus Steak Medallion
    const steakGeo = new THREE.CylinderGeometry(0.55, 0.6, 0.32, 28);
    const steakMesh = new THREE.Mesh(steakGeo, steakMaterial);
    steakMesh.position.set(0.05, 0.22, 0.0);
    steakMesh.castShadow = true;
    dish1Group.add(steakMesh);

    // Herb butter quenelle on top of steak
    const butterGeo = new THREE.SphereGeometry(0.16, 16, 16);
    butterGeo.scale(1.4, 0.7, 0.9);
    const butterMesh = new THREE.Mesh(butterGeo, herbButterMaterial);
    butterMesh.position.set(0.05, 0.42, 0.0);
    dish1Group.add(butterMesh);

    // Roasted asparagus spears
    for (let i = 0; i < 3; i++) {
      const asparagusGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.1, 12);
      asparagusGeo.rotateZ(Math.PI / 2.3);
      asparagusGeo.rotateY(0.2 * i);
      const asparagusMesh = new THREE.Mesh(asparagusGeo, garnishGreenMaterial);
      asparagusMesh.position.set(-0.25 + i * 0.1, 0.12 + i * 0.04, 0.35 + i * 0.08);
      asparagusMesh.castShadow = true;
      dish1Group.add(asparagusMesh);
    }

    // Rosemary & Microgreens garnish
    for (let i = 0; i < 5; i++) {
      const leafGeo = new THREE.ConeGeometry(0.05, 0.18, 8);
      leafGeo.rotateZ(0.4 * (i - 2));
      const leafMesh = new THREE.Mesh(leafGeo, garnishGreenMaterial);
      leafMesh.position.set(0.05 + 0.12 * Math.cos(i), 0.45, 0.05 + 0.12 * Math.sin(i));
      dish1Group.add(leafMesh);
    }

    // === DISH 2: Fettuccine Trufado & Parmigiano ===
    const dish2Group = new THREE.Group();
    const plate2 = createPorcelainPlate(1.7);
    dish2Group.add(plate2);

    // Truffle cream base swirl
    const pastaBaseGeo = new THREE.TorusGeometry(0.58, 0.28, 16, 32);
    pastaBaseGeo.rotateX(Math.PI / 2);
    const pastaBaseMesh = new THREE.Mesh(pastaBaseGeo, pastaMaterial);
    pastaBaseMesh.position.y = 0.2;
    dish2Group.add(pastaBaseMesh);

    // Secondary pasta spiral swirl
    const pastaSwirlGeo = new THREE.TorusGeometry(0.35, 0.22, 16, 32);
    pastaSwirlGeo.rotateX(Math.PI / 2);
    const pastaSwirlMesh = new THREE.Mesh(pastaSwirlGeo, pastaMaterial);
    pastaSwirlMesh.position.y = 0.36;
    dish2Group.add(pastaSwirlMesh);

    // Sautéed wild mushrooms
    for (let i = 0; i < 6; i++) {
      const mushroomCapGeo = new THREE.SphereGeometry(0.12, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      mushroomCapGeo.rotateX(Math.PI);
      const mushroomMesh = new THREE.Mesh(mushroomCapGeo, steakMaterial);
      const angle = (i * Math.PI) / 3;
      mushroomMesh.position.set(0.55 * Math.cos(angle), 0.28, 0.55 * Math.sin(angle));
      mushroomMesh.castShadow = true;
      dish2Group.add(mushroomMesh);
    }

    // Shaved parmesan flakes
    for (let i = 0; i < 8; i++) {
      const flakeGeo = new THREE.BoxGeometry(0.12, 0.02, 0.06);
      flakeGeo.rotateY(Math.random() * Math.PI);
      flakeGeo.rotateZ(Math.random() * 0.4);
      const flakeMesh = new THREE.Mesh(flakeGeo, herbButterMaterial);
      flakeMesh.position.set(
        (Math.random() - 0.5) * 0.7,
        0.42 + Math.random() * 0.06,
        (Math.random() - 0.5) * 0.7
      );
      dish2Group.add(flakeMesh);
    }

    // === DISH 3: Salmón Glaseado Cítrico ===
    const dish3Group = new THREE.Group();
    const plate3 = createPorcelainPlate(1.7);
    dish3Group.add(plate3);

    // Cauliflower cream puree bed
    const pureeGeo = new THREE.CylinderGeometry(0.7, 0.85, 0.08, 32);
    const pureeMesh = new THREE.Mesh(pureeGeo, herbButterMaterial);
    pureeMesh.position.y = 0.07;
    dish3Group.add(pureeMesh);

    // Salmon fillet block with crisp sear
    const salmonGeo = new THREE.BoxGeometry(0.95, 0.28, 0.55);
    salmonGeo.rotateY(Math.PI / 5);
    const salmonMesh = new THREE.Mesh(salmonGeo, salmonMaterial);
    salmonMesh.position.set(0, 0.24, 0);
    salmonMesh.castShadow = true;
    dish3Group.add(salmonMesh);

    // Glazed crispy skin layer
    const skinGeo = new THREE.BoxGeometry(0.96, 0.03, 0.56);
    skinGeo.rotateY(Math.PI / 5);
    const skinMesh = new THREE.Mesh(skinGeo, steakMaterial);
    skinMesh.position.set(0, 0.38, 0);
    dish3Group.add(skinMesh);

    // Citrus wheels (orange/lemon slice garnish)
    const citrusGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.03, 24);
    citrusGeo.rotateX(Math.PI / 3);
    const citrusMesh = new THREE.Mesh(citrusGeo, plateGoldRimMaterial);
    citrusMesh.position.set(0.48, 0.22, -0.32);
    dish3Group.add(citrusMesh);

    // Dill & herb sprigs
    for (let i = 0; i < 4; i++) {
      const dillGeo = new THREE.ConeGeometry(0.04, 0.25, 6);
      dillGeo.rotateZ(0.3 * (i - 1.5));
      const dillMesh = new THREE.Mesh(dillGeo, garnishGreenMaterial);
      dillMesh.position.set(-0.25 + i * 0.15, 0.42, 0.1);
      dish3Group.add(dillMesh);
    }

    // Master Pivot Hierarchy
    const masterPivot = new THREE.Group();
    scene.add(masterPivot);

    // Floating Staged Plates Hierarchy (Mirrors the editorial floating discs in the user's reference)
    // Plate 1: Main hero focal plate
    dish1Group.position.set(0.1, 0.1, 0);
    dish1Group.rotation.set(0.48, -0.32, 0.22); // Tilted presentation angle
    masterPivot.add(dish1Group);

    // Plate 2: Floating below/left
    dish2Group.position.set(-2.2, -1.3, -1.2);
    dish2Group.rotation.set(0.55, -0.28, 0.28);
    dish2Group.scale.set(0.82, 0.82, 0.82);
    masterPivot.add(dish2Group);

    // Plate 3: Floating upper/right
    dish3Group.position.set(2.0, 1.4, -1.5);
    dish3Group.rotation.set(0.42, -0.38, 0.18);
    dish3Group.scale.set(0.78, 0.78, 0.78);
    masterPivot.add(dish3Group);

    // Subtle background halo discs reflecting the warm salmon atmosphere
    const haloDiscGeo = new THREE.TorusGeometry(3.2, 0.04, 16, 64);
    haloDiscGeo.rotateX(Math.PI / 2.2);
    haloDiscGeo.rotateZ(0.3);
    const haloDiscMat = new THREE.MeshBasicMaterial({
      color: 0xf73b20,
      transparent: true,
      opacity: 0.22,
    });
    const haloMesh = new THREE.Mesh(haloDiscGeo, haloDiscMat);
    haloMesh.position.set(0, 0, -2.5);
    scene.add(haloMesh);

    // Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 0.7;
      targetY = y * 0.5;
    };

    const containerEl = containerRef.current;
    containerEl.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      if (stopped) return;
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse damping
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Gentle floating sinusoidal bobbing for all three plates
      dish1Group.position.y = 0.1 + Math.sin(elapsedTime * 1.4) * 0.12;
      dish2Group.position.y = -1.3 + Math.sin(elapsedTime * 1.4 + 1.2) * 0.14;
      dish3Group.position.y = 1.4 + Math.sin(elapsedTime * 1.4 + 2.4) * 0.13;

      if (isRotating) {
        // Continuous slow turntable rotation of the focal plate
        dish1Group.rotation.y += 0.0035;
        dish2Group.rotation.y += 0.0025;
        dish3Group.rotation.y += 0.003;
      }

      // Parallax camera offset
      masterPivot.rotation.y = mouseX;
      masterPivot.rotation.x = mouseY;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      stopped = true;
      cancelAnimationFrame(animationFrameId);
      containerEl.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [isRotating]);

  const selectDish = (idx: number) => {
    setCurrentDish(idx);
    if (onDishChange) onDishChange(idx);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden ${className}`}
    >
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
        title="Platos de alta cocina en 3D — interactivo con movimiento de cursor"
      />

      {/* Floating Bottom Dish Indicator Pill (Editorial Jeton Style) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-lg text-xs">
        {DISHES.map((dish, i) => (
          <button
            key={dish.id}
            onClick={() => selectDish(i)}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 text-xs ${
              currentDish === i
                ? 'bg-[#f73b20] text-white shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Utensils className="w-3 h-3" />
            <span className="hidden sm:inline">{dish.name}</span>
            <span className="sm:hidden">Plato {dish.id}</span>
          </button>
        ))}

        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 ml-1 transition-colors ${
            isRotating ? 'text-[#f73b20]' : ''
          }`}
          title={isRotating ? 'Pausar rotación 3D' : 'Reanudar rotación 3D'}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};

