import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ProductCategory } from '../../types/index.ts';
import { Utensils, RotateCw, MousePointerClick, Sparkles } from 'lucide-react';

export interface Plate3DMeta {
  id: number;
  index: number;
  name: string;
  shortName: string;
  category: ProductCategory;
  subtitle: string;
  description: string;
  sculptedItems: string[];
  colorAccent: string;
  badgeBg: string;
}

export const PLATES_3D_CATALOG: Plate3DMeta[] = [
  {
    id: 1,
    index: 0,
    name: 'Plato I · Carnes & Grill a la Leña',
    shortName: 'Carnes & Grill',
    category: 'Carnes & Grill',
    subtitle: 'Cortes madurados, cordero patagónico y salmón austral',
    description:
      'Modelado 3D con medallón de Ojo de Bife Angosto sellado a la parrilla, costillas de cordero al romero y filete de salmón austral glaseado.',
    sculptedItems: [
      'Ojo de Bife Angosto (400g)',
      'Costillas de Cordero Patagónico',
      'Salmón Austral Glaseado',
    ],
    colorAccent: '#f73b20',
    badgeBg: '#fdedea',
  },
  {
    id: 2,
    index: 1,
    name: 'Plato II · Pastas & Risottos Artesanales',
    shortName: 'Pastas & Risottos',
    category: 'Pastas & Risottos',
    subtitle: 'Arroz carnaroli marino, ravioli braseado y pappardelle toscano',
    description:
      'Modelado 3D con corona de Risotto ai Frutti di Mare con langostinos y mejillones, raviolis de ossobuco al vino tinto y cintas pappardelle.',
    sculptedItems: [
      'Risotto ai Frutti di Mare',
      'Ravioli de Ossobuco Braseado',
      'Pappardelle al Ragu de Jabalí',
    ],
    colorAccent: '#f84d35',
    badgeBg: '#f5ffbb',
  },
  {
    id: 3,
    index: 2,
    name: 'Plato III · Entradas de Autor',
    shortName: 'Entradas',
    category: 'Entradas',
    subtitle: 'Burrata pugliese, carpaccio trufado y tartar de atún rojo',
    description:
      'Modelado 3D con esfera de Burrata Pugliese fresca e higos caramelizados, láminas de carpaccio de res trufado y cilindro de tartar de atún con palta.',
    sculptedItems: [
      'Carpaccio de Res Trufado',
      'Burrata Pugliese con Higos',
      'Tartar de Atún Rojo & Palta',
    ],
    colorAccent: '#fb2d54',
    badgeBg: '#fdedea',
  },
  {
    id: 4,
    index: 3,
    name: 'Plato IV · Alta Pastelería & Postres',
    shortName: 'Postres',
    category: 'Postres',
    subtitle: 'Esfera de cacao Valrhona 70% y Tiramisú Tradizionale',
    description:
      'Modelado 3D con esfera brillante de Chocolate Valrhona con lámina de oro, mousse de avellana y bloque clásico de Tiramisú al espresso.',
    sculptedItems: [
      'Esfera de Chocolate Valrhona',
      'Tiramisú Tradizionale',
    ],
    colorAccent: '#360802',
    badgeBg: '#bcffbb',
  },
  {
    id: 5,
    index: 4,
    name: 'Plato V · Coctelería de Autor & Bar',
    shortName: 'Bebidas & Bar',
    category: 'Bebidas & Bar',
    subtitle: 'Smoked Old Fashioned, Gin Tonic Botánico y Limonada Fresca',
    description:
      'Bandeja 3D de mixología con cristal Old Fashioned ahumado y esfera de hielo, copa balón de Gin Tonic con frutos rojos y limonada de hierbabuena.',
    sculptedItems: [
      'Cóctel Smoked Old Fashioned',
      'Gin Tonic Botánico',
      'Limonada de Hierbabuena & Jengibre',
    ],
    colorAccent: '#477ee9',
    badgeBg: '#f5ffbb',
  },
];

// Keep DISHES alias for backwards compatibility
export const DISHES = PLATES_3D_CATALOG;

interface FoodPlate3DProps {
  variant?: 'hero' | 'compact' | 'interactive';
  activeDishIndex?: number;
  onDishChange?: (index: number) => void;
  onPlateClick?: (index: number, plate: Plate3DMeta) => void;
  showControlsPill?: boolean;
  className?: string;
}

export const FoodPlate3D: React.FC<FoodPlate3DProps> = ({
  variant = 'hero',
  activeDishIndex = 0,
  onDishChange,
  onPlateClick,
  showControlsPill = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentDish, setCurrentDish] = useState(activeDishIndex);
  const [hoveredPlateIdx, setHoveredPlateIdx] = useState<number | null>(null);
  const [hoverPointerPos, setHoverPointerPos] = useState<{ x: number; y: number } | null>(null);
  const [isRotating, setIsRotating] = useState(true);

  const activeDishRef = useRef(activeDishIndex);
  const isRotatingRef = useRef(isRotating);
  const onPlateClickRef = useRef(onPlateClick);
  const onDishChangeRef = useRef(onDishChange);

  useEffect(() => {
    setCurrentDish(activeDishIndex);
    activeDishRef.current = activeDishIndex;
  }, [activeDishIndex]);

  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  useEffect(() => {
    onPlateClickRef.current = onPlateClick;
    onDishChangeRef.current = onDishChange;
  }, [onPlateClick, onDishChange]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    let stopped = false;
    let animationFrameId = 0;

    const width = containerRef.current.clientWidth || 900;
    const height = containerRef.current.clientHeight || 640;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 10.2);
    camera.lookAt(0, 0.1, 0);

    // 2. WebGL Renderer (Transparent canvas over Jeton coral-orange editorial backdrop)
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    // 3. Studio & Editorial Lighting (Matching Jeton warm salmon/orange directional highlights)
    const ambientLight = new THREE.AmbientLight(0xfff4ec, 1.55);
    scene.add(ambientLight);

    const sunKeyLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    sunKeyLight.position.set(6, 9, 7);
    sunKeyLight.castShadow = true;
    sunKeyLight.shadow.mapSize.width = 1024;
    sunKeyLight.shadow.mapSize.height = 1024;
    scene.add(sunKeyLight);

    const signalRimLight = new THREE.DirectionalLight(0xf73b20, 2.8);
    signalRimLight.position.set(-7, 4, -5);
    scene.add(signalRimLight);

    const peachBottomLight = new THREE.DirectionalLight(0xffb49a, 1.9);
    peachBottomLight.position.set(2, -6, 4);
    scene.add(peachBottomLight);

    // 4. Shared High-Craft Materials
    const porcelainMat = new THREE.MeshPhysicalMaterial({
      color: 0xfff8f4,
      roughness: 0.14,
      metalness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95,
    });

    const coralUndersideMat = new THREE.MeshPhysicalMaterial({
      color: 0xf46d54,
      roughness: 0.25,
      metalness: 0.08,
      clearcoat: 0.6,
      clearcoatRoughness: 0.18,
    });

    const warmGoldRimMat = new THREE.MeshStandardMaterial({
      color: 0xffdfbe,
      roughness: 0.22,
      metalness: 0.65,
    });

    const activeHighlightRimMat = new THREE.MeshStandardMaterial({
      color: 0xf73b20,
      emissive: 0xf73b20,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.3,
    });

    const searBeefMat = new THREE.MeshStandardMaterial({
      color: 0x4a1c11,
      roughness: 0.55,
      metalness: 0.08,
    });

    const rubyMeatMat = new THREE.MeshStandardMaterial({
      color: 0xb92b27,
      roughness: 0.38,
      metalness: 0.05,
    });

    const salmonMat = new THREE.MeshStandardMaterial({
      color: 0xff785a,
      roughness: 0.35,
      metalness: 0.05,
    });

    const saffronRisottoMat = new THREE.MeshStandardMaterial({
      color: 0xf8e2a8,
      roughness: 0.48,
      metalness: 0.02,
    });

    const goldenPastaMat = new THREE.MeshStandardMaterial({
      color: 0xf4cc70,
      roughness: 0.42,
      metalness: 0.05,
    });

    const burrataCreamMat = new THREE.MeshPhysicalMaterial({
      color: 0xfffdf9,
      roughness: 0.15,
      clearcoat: 0.85,
    });

    const herbGreenMat = new THREE.MeshStandardMaterial({
      color: 0x2e8540,
      roughness: 0.45,
    });

    const avocadoMat = new THREE.MeshStandardMaterial({
      color: 0x7cb342,
      roughness: 0.4,
    });

    const darkValrhonaMat = new THREE.MeshPhysicalMaterial({
      color: 0x261008,
      roughness: 0.12,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    const mascarponeMat = new THREE.MeshStandardMaterial({
      color: 0xfaf0dc,
      roughness: 0.4,
    });

    const wineSauceMat = new THREE.MeshPhysicalMaterial({
      color: 0x6e140e,
      roughness: 0.08,
      clearcoat: 1.0,
    });

    const crystalGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.52,
      roughness: 0.05,
      metalness: 0.1,
      clearcoat: 1.0,
    });

    const bourbonAmberMat = new THREE.MeshPhysicalMaterial({
      color: 0xd95f18,
      transparent: true,
      opacity: 0.86,
      roughness: 0.08,
      clearcoat: 1.0,
    });

    const berryGinMat = new THREE.MeshPhysicalMaterial({
      color: 0xfb2d54,
      transparent: true,
      opacity: 0.78,
      roughness: 0.08,
      clearcoat: 1.0,
    });

    const mintLemonadeMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4f799,
      transparent: true,
      opacity: 0.82,
      roughness: 0.1,
      clearcoat: 0.9,
    });

    // Helper: Build sculpted Jeton-style Porcelain & Coral Plate Base
    const createGourmetPlateBase = (radius: number, plateIndex: number) => {
      const group = new THREE.Group();

      // Coral-terracotta sculpted underside (matches the warm coral disc silhouette of Jeton)
      const underGeo = new THREE.CylinderGeometry(radius * 0.96, radius * 0.78, 0.16, 64);
      const underMesh = new THREE.Mesh(underGeo, coralUndersideMat);
      underMesh.position.y = -0.04;
      underMesh.castShadow = true;
      underMesh.receiveShadow = true;
      underMesh.userData = { plateIndex };
      group.add(underMesh);

      // Glossy ivory porcelain inner well
      const wellGeo = new THREE.CylinderGeometry(radius * 0.88, radius * 0.72, 0.08, 64);
      const wellMesh = new THREE.Mesh(wellGeo, porcelainMat);
      wellMesh.position.y = 0.04;
      wellMesh.receiveShadow = true;
      wellMesh.userData = { plateIndex };
      group.add(wellMesh);

      // Thick luminous rim torus
      const rimGeo = new THREE.TorusGeometry(radius * 0.92, 0.11, 24, 64);
      rimGeo.rotateX(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, porcelainMat);
      rimMesh.position.y = 0.06;
      rimMesh.castShadow = true;
      rimMesh.receiveShadow = true;
      rimMesh.userData = { plateIndex };
      group.add(rimMesh);

      // Outer luminous specular edge ring (updated dynamically on hover/selection)
      const edgeGeo = new THREE.TorusGeometry(radius * 1.01, 0.025, 16, 64);
      edgeGeo.rotateX(Math.PI / 2);
      const edgeMesh = new THREE.Mesh(edgeGeo, warmGoldRimMat.clone());
      edgeMesh.position.y = 0.07;
      edgeMesh.userData = { plateIndex, isRimHighlight: true };
      group.add(edgeMesh);

      return { group, edgeMesh };
    };

    // Helper to tag all child meshes with plateIndex for Raycaster clicking
    const tagGroupWithPlateIndex = (grp: THREE.Object3D, plateIndex: number) => {
      grp.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.userData = { ...child.userData, plateIndex };
        }
      });
    };

    // ============================================================================
    // BUILD THE 5 3D PLATES WITH REAL CULINARY MODELS MATCHING THE MENU CATALOG
    // ============================================================================

    // --- PLATE 0: Carnes & Grill (Ojo de Bife 400g + Costillas de Cordero + Salmón Glaseado) ---
    const buildPlate0Carnes = (radius: number) => {
      const { group, edgeMesh } = createGourmetPlateBase(radius, 0);

      // Red wine demi-glace mirror pool
      const sauceGeo = new THREE.CylinderGeometry(radius * 0.58, radius * 0.58, 0.02, 40);
      const sauce = new THREE.Mesh(sauceGeo, wineSauceMat);
      sauce.position.set(-0.1, 0.09, 0.05);
      group.add(sauce);

      // 1. Ojo de Bife Angosto (400g) - thick seared ribeye medallion with grill marks
      const bifeGeo = new THREE.CylinderGeometry(0.52, 0.56, 0.34, 32);
      const bife = new THREE.Mesh(bifeGeo, searBeefMat);
      bife.position.set(-0.38, 0.25, 0.18);
      bife.castShadow = true;
      group.add(bife);

      // Grill marks on Bife
      for (let i = -1; i <= 1; i++) {
        const markGeo = new THREE.BoxGeometry(0.72, 0.025, 0.045);
        markGeo.rotateY(Math.PI / 4);
        const mark = new THREE.Mesh(markGeo, darkValrhonaMat);
        mark.position.set(-0.38 + i * 0.14, 0.425, 0.18 + i * 0.08);
        group.add(mark);
      }

      // Melting herb butter pat on Bife
      const butterGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.07, 20);
      const butter = new THREE.Mesh(butterGeo, mascarponeMat);
      butter.position.set(-0.38, 0.45, 0.18);
      group.add(butter);

      // 2. Costillas de Cordero Patagónico (Frenched rack ribs leaning upright)
      for (let r = 0; r < 2; r++) {
        const chopGroup = new THREE.Group();
        const meatGeo = new THREE.SphereGeometry(0.24, 18, 18);
        meatGeo.scale(1.2, 0.85, 0.9);
        const meat = new THREE.Mesh(meatGeo, searBeefMat);
        chopGroup.add(meat);

        const boneGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.85, 12);
        boneGeo.rotateZ(-0.48);
        const bone = new THREE.Mesh(boneGeo, mascarponeMat);
        bone.position.set(0.22, 0.32, 0);
        chopGroup.add(bone);

        chopGroup.position.set(0.38, 0.28 + r * 0.06, -0.35 + r * 0.32);
        chopGroup.rotation.y = -0.4 + r * 0.35;
        group.add(chopGroup);
      }

      // 3. Salmón Austral Glaseado (Teriyaki glazed salmon fillet block)
      const salmonGeo = new THREE.BoxGeometry(0.78, 0.24, 0.44);
      salmonGeo.rotateY(-0.35);
      const salmon = new THREE.Mesh(salmonGeo, salmonMat);
      salmon.position.set(0.28, 0.21, 0.45);
      salmon.castShadow = true;
      group.add(salmon);

      // Asparagus spears & cherry tomatoes
      for (let i = 0; i < 3; i++) {
        const aspGeo = new THREE.CylinderGeometry(0.04, 0.045, 1.15, 12);
        aspGeo.rotateZ(Math.PI / 2.05);
        aspGeo.rotateY(0.25 + i * 0.12);
        const asp = new THREE.Mesh(aspGeo, herbGreenMat);
        asp.position.set(-0.05, 0.15 + i * 0.03, -0.42 + i * 0.12);
        group.add(asp);
      }

      tagGroupWithPlateIndex(group, 0);
      return { group, edgeMesh };
    };

    // --- PLATE 1: Pastas & Risottos (Risotto Frutti di Mare + Ravioli Ossobuco + Pappardelle) ---
    const buildPlate1Pastas = (radius: number) => {
      const { group, edgeMesh } = createGourmetPlateBase(radius, 1);

      // 1. Risotto ai Frutti di Mare (Creamy saffron mound)
      const risottoGeo = new THREE.SphereGeometry(0.68, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2);
      risottoGeo.scale(1, 0.42, 1);
      const risotto = new THREE.Mesh(risottoGeo, saffronRisottoMat);
      risotto.position.set(-0.22, 0.08, -0.15);
      group.add(risotto);

      // Sculpted Coral Prawns & Black Mussels on the Risotto
      for (let i = 0; i < 3; i++) {
        const prawnGeo = new THREE.TorusGeometry(0.16, 0.065, 12, 24, Math.PI * 1.35);
        prawnGeo.rotateX(Math.PI / 2.4);
        const prawn = new THREE.Mesh(prawnGeo, salmonMat);
        const ang = (i * Math.PI * 2) / 3;
        prawn.position.set(-0.22 + Math.cos(ang) * 0.28, 0.36, -0.15 + Math.sin(ang) * 0.28);
        group.add(prawn);
      }

      // 2. Pappardelle al Ragu de Jabalí (Golden pasta nest + rich ragu)
      const nestGeo = new THREE.TorusGeometry(0.38, 0.18, 18, 36);
      nestGeo.rotateX(Math.PI / 2);
      const nest = new THREE.Mesh(nestGeo, goldenPastaMat);
      nest.position.set(0.45, 0.22, 0.32);
      group.add(nest);

      const raguTopGeo = new THREE.SphereGeometry(0.24, 16, 16);
      raguTopGeo.scale(1.1, 0.55, 1.1);
      const raguTop = new THREE.Mesh(raguTopGeo, searBeefMat);
      raguTop.position.set(0.45, 0.36, 0.32);
      group.add(raguTop);

      // 3. Ravioli de Ossobuco Braseado (Artisan pillows in wine reduction)
      for (let i = 0; i < 3; i++) {
        const ravGeo = new THREE.BoxGeometry(0.34, 0.09, 0.34);
        ravGeo.rotateY(i * 0.5);
        ravGeo.rotateZ(0.15);
        const rav = new THREE.Mesh(ravGeo, goldenPastaMat);
        rav.position.set(-0.35 + i * 0.24, 0.18 + i * 0.03, 0.48 - i * 0.08);
        group.add(rav);
      }

      // Fresh basil & Parmigiano shards
      for (let i = 0; i < 6; i++) {
        const herbGeo = new THREE.ConeGeometry(0.065, 0.18, 8);
        const herb = new THREE.Mesh(herbGeo, herbGreenMat);
        herb.position.set((Math.random() - 0.5) * 0.9, 0.42, (Math.random() - 0.5) * 0.9);
        group.add(herb);
      }

      tagGroupWithPlateIndex(group, 1);
      return { group, edgeMesh };
    };

    // --- PLATE 2: Entradas de Autor (Burrata Pugliese + Carpaccio Trufado + Tartar de Atún) ---
    const buildPlate2Entradas = (radius: number) => {
      const { group, edgeMesh } = createGourmetPlateBase(radius, 2);

      // 1. Carpaccio de Res Trufado (Delicate ruby beef rosettes fanning across plate)
      for (let i = 0; i < 5; i++) {
        const sliceGeo = new THREE.CylinderGeometry(0.32, 0.34, 0.03, 24);
        const slice = new THREE.Mesh(sliceGeo, rubyMeatMat);
        const angle = -0.8 + i * 0.42;
        slice.position.set(Math.cos(angle) * 0.58, 0.1 + i * 0.012, Math.sin(angle) * 0.58);
        group.add(slice);
      }

      // 2. Burrata Pugliese con Higos (Glossy creamy sphere + caramelized figs & arugula)
      const burrataGeo = new THREE.SphereGeometry(0.38, 28, 24);
      burrataGeo.scale(1.08, 0.82, 1.08);
      const burrata = new THREE.Mesh(burrataGeo, burrataCreamMat);
      burrata.position.set(-0.28, 0.32, -0.12);
      burrata.castShadow = true;
      group.add(burrata);

      // Caramelized Fig halves
      for (let i = 0; i < 3; i++) {
        const figGeo = new THREE.SphereGeometry(0.15, 16, 16);
        figGeo.scale(1, 0.65, 1);
        const fig = new THREE.Mesh(figGeo, wineSauceMat);
        const ang = i * 2.1;
        fig.position.set(-0.28 + Math.cos(ang) * 0.44, 0.18, -0.12 + Math.sin(ang) * 0.44);
        group.add(fig);
      }

      // 3. Tartar de Atún Rojo & Palta (Two-tone cylindrical timbale: avocado base + ruby tuna top)
      const paltaLayerGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.16, 28);
      const paltaLayer = new THREE.Mesh(paltaLayerGeo, avocadoMat);
      paltaLayer.position.set(0.38, 0.16, -0.22);
      group.add(paltaLayer);

      const tunaLayerGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.22, 28);
      const tunaLayer = new THREE.Mesh(tunaLayerGeo, rubyMeatMat);
      tunaLayer.position.set(0.38, 0.35, -0.22);
      tunaLayer.castShadow = true;
      group.add(tunaLayer);

      // Wild arugula crown
      for (let i = 0; i < 7; i++) {
        const leafGeo = new THREE.SphereGeometry(0.08, 10, 10);
        leafGeo.scale(1.8, 0.35, 0.9);
        const leaf = new THREE.Mesh(leafGeo, herbGreenMat);
        leaf.position.set((Math.random() - 0.5) * 0.85, 0.46, (Math.random() - 0.5) * 0.85);
        leaf.rotation.y = Math.random() * Math.PI;
        group.add(leaf);
      }

      tagGroupWithPlateIndex(group, 2);
      return { group, edgeMesh };
    };

    // --- PLATE 3: Postres Artesanales (Esfera de Chocolate Valrhona + Tiramisú Tradizionale) ---
    const buildPlate3Postres = (radius: number) => {
      const { group, edgeMesh } = createGourmetPlateBase(radius, 3);

      // Artistic berry & cacao sauce swoosh
      const swooshGeo = new THREE.RingGeometry(0.32, 0.78, 36, 1, 0, Math.PI * 1.4);
      swooshGeo.rotateX(-Math.PI / 2);
      const swoosh = new THREE.Mesh(swooshGeo, wineSauceMat);
      swoosh.position.y = 0.085;
      group.add(swoosh);

      // 1. Esfera de Chocolate Valrhona (Mirror-glazed dark chocolate sphere + gold collar)
      const sphereGeo = new THREE.SphereGeometry(0.42, 32, 32);
      const sphere = new THREE.Mesh(sphereGeo, darkValrhonaMat);
      sphere.position.set(-0.34, 0.44, 0.15);
      sphere.castShadow = true;
      group.add(sphere);

      const goldBeltGeo = new THREE.TorusGeometry(0.43, 0.022, 14, 48);
      goldBeltGeo.rotateX(Math.PI / 2.3);
      const goldBelt = new THREE.Mesh(goldBeltGeo, warmGoldRimMat);
      goldBelt.position.set(-0.34, 0.44, 0.15);
      group.add(goldBelt);

      // 2. Tiramisú Tradizionale (Layered mascarpone & espresso savoiardi patisserie block)
      const tiraGroup = new THREE.Group();
      const layerHeights = [0.1, 0.11, 0.1, 0.11];
      let currY = 0.08;
      layerHeights.forEach((h, idx) => {
        const lGeo = new THREE.BoxGeometry(0.68, h, 0.48);
        const lMat = idx % 2 === 0 ? searBeefMat : mascarponeMat;
        const lMesh = new THREE.Mesh(lGeo, lMat);
        lMesh.position.y = currY + h / 2;
        lMesh.castShadow = true;
        tiraGroup.add(lMesh);
        currY += h;
      });
      // Cocoa powder pillows on top of Tiramisú
      for (let x = -1; x <= 1; x++) {
        for (let z = -0.5; z <= 0.5; z += 1) {
          const tuftGeo = new THREE.SphereGeometry(0.09, 14, 14);
          const tuft = new THREE.Mesh(tuftGeo, darkValrhonaMat);
          tuft.position.set(x * 0.2, currY + 0.04, z * 0.18);
          tiraGroup.add(tuft);
        }
      }
      tiraGroup.position.set(0.38, 0.02, -0.16);
      tiraGroup.rotation.y = 0.35;
      group.add(tiraGroup);

      // Fresh raspberries & mint leaf
      for (let i = 0; i < 4; i++) {
        const berryGeo = new THREE.SphereGeometry(0.095, 14, 14);
        const berry = new THREE.Mesh(berryGeo, rubyMeatMat);
        berry.position.set(-0.05 + i * 0.18, 0.17, 0.55 - i * 0.12);
        group.add(berry);
      }

      tagGroupWithPlateIndex(group, 3);
      return { group, edgeMesh };
    };

    // --- PLATE 4: Bebidas & Coctelería (Smoked Old Fashioned + Gin Tonic Botánico + Limonada) ---
    const buildPlate4Bebidas = (radius: number) => {
      const { group, edgeMesh } = createGourmetPlateBase(radius, 4);

      // 1. Cóctel Smoked Old Fashioned (Lowball crystal tumbler + bourbon + ice sphere + orange peel)
      const oldFashionedGroup = new THREE.Group();
      const glassGeo = new THREE.CylinderGeometry(0.34, 0.3, 0.56, 28);
      const glass = new THREE.Mesh(glassGeo, crystalGlassMat);
      glass.position.y = 0.3;
      oldFashionedGroup.add(glass);

      const liquidGeo = new THREE.CylinderGeometry(0.31, 0.28, 0.38, 28);
      const liquid = new THREE.Mesh(liquidGeo, bourbonAmberMat);
      liquid.position.y = 0.24;
      oldFashionedGroup.add(liquid);

      const iceSphereGeo = new THREE.SphereGeometry(0.2, 20, 20);
      const iceSphere = new THREE.Mesh(iceSphereGeo, burrataCreamMat);
      iceSphere.position.y = 0.34;
      oldFashionedGroup.add(iceSphere);

      const orangePeelGeo = new THREE.TorusGeometry(0.18, 0.035, 12, 24, Math.PI);
      const orangePeel = new THREE.Mesh(orangePeelGeo, activeHighlightRimMat);
      orangePeel.position.set(0.12, 0.52, 0);
      oldFashionedGroup.add(orangePeel);

      oldFashionedGroup.position.set(-0.42, 0.06, 0.24);
      group.add(oldFashionedGroup);

      // 2. Gin Tonic Botánico (Balloon goblet + botanical ruby gin + berries)
      const ginGroup = new THREE.Group();
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.22, 0.36, 20);
      const stem = new THREE.Mesh(stemGeo, crystalGlassMat);
      stem.position.y = 0.2;
      ginGroup.add(stem);

      const bowlGeo = new THREE.SphereGeometry(0.38, 28, 24, 0, Math.PI * 2, 0, Math.PI * 0.72);
      bowlGeo.rotateX(Math.PI);
      const bowl = new THREE.Mesh(bowlGeo, crystalGlassMat);
      bowl.position.y = 0.62;
      ginGroup.add(bowl);

      const ginLiquidGeo = new THREE.SphereGeometry(0.34, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.58);
      ginLiquidGeo.rotateX(Math.PI);
      const ginLiquid = new THREE.Mesh(ginLiquidGeo, berryGinMat);
      ginLiquid.position.y = 0.58;
      ginGroup.add(ginLiquid);

      ginGroup.position.set(0.36, 0.06, -0.25);
      group.add(ginGroup);

      // 3. Limonada de Hierbabuena & Jengibre (Tall highball + lime wheel + fresh mint crown)
      const limGroup = new THREE.Group();
      const tallGlassGeo = new THREE.CylinderGeometry(0.26, 0.23, 0.74, 24);
      const tallGlass = new THREE.Mesh(tallGlassGeo, crystalGlassMat);
      tallGlass.position.y = 0.39;
      limGroup.add(tallGlass);

      const limLiquidGeo = new THREE.CylinderGeometry(0.24, 0.21, 0.58, 24);
      const limLiquid = new THREE.Mesh(limLiquidGeo, mintLemonadeMat);
      limLiquid.position.y = 0.33;
      limGroup.add(limLiquid);

      const mintCrownGeo = new THREE.SphereGeometry(0.14, 12, 12);
      mintCrownGeo.scale(1.3, 0.6, 1.3);
      const mintCrown = new THREE.Mesh(mintCrownGeo, herbGreenMat);
      mintCrown.position.set(0, 0.72, 0);
      limGroup.add(mintCrown);

      limGroup.position.set(0.22, 0.06, 0.46);
      group.add(limGroup);

      tagGroupWithPlateIndex(group, 4);
      return { group, edgeMesh };
    };

    // ============================================================================
    // DIAGONAL CASCADE LAYOUT (MIRRORING THE JETON REFERENCE HERO IMAGE)
    // ============================================================================
    const masterSceneGroup = new THREE.Group();
    scene.add(masterSceneGroup);

    // 5 plates arranged from bottom-left to top-right just like the 5 discs in the Jeton screenshot
    const cascadeSlots = [
      // Slot 0: Bottom-left foreground large plate (Carnes & Grill)
      {
        basePos: new THREE.Vector3(-1.35, -1.55, 1.45),
        baseRot: new THREE.Euler(0.68, 0.38, -0.46),
        radius: 1.95,
        orbitRadius: 0.26,
        phaseOffset: 0.0,
        spinSpeed: 0.0085,
        builder: buildPlate0Carnes,
      },
      // Slot 1: Lower-mid plate (Pastas & Risottos)
      {
        basePos: new THREE.Vector3(-0.65, -0.58, 0.75),
        baseRot: new THREE.Euler(0.64, 0.36, -0.48),
        radius: 1.88,
        orbitRadius: 0.28,
        phaseOffset: 0.85,
        spinSpeed: 0.0092,
        builder: buildPlate1Pastas,
      },
      // Slot 2: Center focal plate (Entradas de Autor)
      {
        basePos: new THREE.Vector3(0.08, 0.38, 0.0),
        baseRot: new THREE.Euler(0.6, 0.34, -0.5),
        radius: 1.92,
        orbitRadius: 0.3,
        phaseOffset: 1.7,
        spinSpeed: 0.0088,
        builder: buildPlate2Entradas,
      },
      // Slot 3: Upper-mid plate (Postres Artesanales)
      {
        basePos: new THREE.Vector3(0.88, 1.32, -0.75),
        baseRot: new THREE.Euler(0.56, 0.32, -0.52),
        radius: 1.85,
        orbitRadius: 0.28,
        phaseOffset: 2.55,
        spinSpeed: 0.0095,
        builder: buildPlate3Postres,
      },
      // Slot 4: Top-right plate (Bebidas & Coctelería)
      {
        basePos: new THREE.Vector3(1.68, 2.22, -1.45),
        baseRot: new THREE.Euler(0.52, 0.3, -0.54),
        radius: 1.78,
        orbitRadius: 0.25,
        phaseOffset: 3.4,
        spinSpeed: 0.0082,
        builder: buildPlate4Bebidas,
      },
    ];

    interface PlateNode {
      index: number;
      carrierGroup: THREE.Group;
      spinGroup: THREE.Group;
      edgeMesh: THREE.Mesh;
      slot: (typeof cascadeSlots)[0];
      currentScale: number;
    }

    const plateNodes: PlateNode[] = cascadeSlots.map((slot, index) => {
      const carrierGroup = new THREE.Group();
      carrierGroup.position.copy(slot.basePos);
      carrierGroup.rotation.copy(slot.baseRot);

      const { group: spinGroup, edgeMesh } = slot.builder(slot.radius);
      carrierGroup.add(spinGroup);
      masterSceneGroup.add(carrierGroup);

      return {
        index,
        carrierGroup,
        spinGroup,
        edgeMesh,
        slot,
        currentScale: 1.0,
      };
    });

    // Subtle concentric wireframe rings in upper-right corner (matching the Jeton reference graphic)
    const ringsGroup = new THREE.Group();
    ringsGroup.position.set(2.85, 2.75, -2.6);
    ringsGroup.rotation.set(0.48, 0.28, -0.52);
    for (let r = 0; r < 6; r++) {
      const ringGeo = new THREE.TorusGeometry(1.35 + r * 0.16, 0.014, 12, 72);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.42 - r * 0.05,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = r * 0.06;
      ringsGroup.add(ringMesh);
    }
    masterSceneGroup.add(ringsGroup);

    // ============================================================================
    // FLUID WATER-LIKE INTERACTION, RAYCASTER HOVER & CLICK, SCROLL & CURSOR IMPULSE
    // ============================================================================
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2(-999, -999);

    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let smoothParallaxX = 0;
    let smoothParallaxY = 0;

    // Fluid water momentum accumulator (excited by mouse movement and scroll wheel)
    let waterVelocity = 0;
    let waterPhase = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let hoveredIndexInternal: number | null = null;
    let pointerDownPos = { x: 0, y: 0 };

    const updatePointerAndRaycast = (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) return;

      const normX = (clientX - rect.left) / rect.width - 0.5;
      const normY = (clientY - rect.top) / rect.height - 0.5;
      targetParallaxX = normX * 0.42;
      targetParallaxY = normY * 0.32;

      // Measure cursor speed to inject fluid water-like kinetic energy
      const dx = clientX - lastMouseX;
      const dy = clientY - lastMouseY;
      const speed = Math.min(Math.hypot(dx, dy), 65);
      waterVelocity = Math.min(waterVelocity + speed * 0.0018, 0.09);
      lastMouseX = clientX;
      lastMouseY = clientY;

      // NDC coordinates for Three.js Raycaster
      pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointerNDC, camera);
      const intersects = raycaster.intersectObjects(masterSceneGroup.children, true);

      let foundPlate: number | null = null;
      for (const hit of intersects) {
        if (typeof hit.object.userData?.plateIndex === 'number') {
          foundPlate = hit.object.userData.plateIndex;
          break;
        }
      }

      if (foundPlate !== hoveredIndexInternal) {
        hoveredIndexInternal = foundPlate;
        setHoveredPlateIdx(foundPlate);
      }
      if (foundPlate !== null) {
        setHoverPointerPos({
          x: clientX - rect.left,
          y: clientY - rect.top,
        });
      } else {
        setHoverPointerPos(null);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      updatePointerAndRaycast(e.clientX, e.clientY);
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (moveDist > 12) return; // Ignore drag gestures

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointerNDC, camera);
      const intersects = raycaster.intersectObjects(masterSceneGroup.children, true);

      for (const hit of intersects) {
        if (typeof hit.object.userData?.plateIndex === 'number') {
          const clickedIdx = hit.object.userData.plateIndex;
          setCurrentDish(clickedIdx);
          activeDishRef.current = clickedIdx;
          waterVelocity = Math.min(waterVelocity + 0.045, 0.1);
          if (onDishChangeRef.current) onDishChangeRef.current(clickedIdx);
          if (onPlateClickRef.current) {
            onPlateClickRef.current(clickedIdx, PLATES_3D_CATALOG[clickedIdx]);
          }
          break;
        }
      }
    };

    // React naturally to user scroll anywhere on the window or canvas
    const handleWheelOrScroll = (e: WheelEvent | Event) => {
      let delta = 24;
      if ('deltaY' in e && typeof (e as WheelEvent).deltaY === 'number') {
        delta = Math.abs((e as WheelEvent).deltaY);
      }
      waterVelocity = Math.min(waterVelocity + Math.min(delta * 0.0009, 0.055), 0.11);
    };

    const canvasEl = canvasRef.current;
    canvasEl.addEventListener('pointermove', handlePointerMove);
    canvasEl.addEventListener('pointerdown', handlePointerDown);
    canvasEl.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('wheel', handleWheelOrScroll, { passive: true });
    window.addEventListener('scroll', handleWheelOrScroll, { passive: true });

    // ============================================================================
    // ANIMATION LOOP: FLUID WATER AXIAL SPIN + SYNCHRONIZED CIRCULAR ORBITS
    // ============================================================================
    const clock = new THREE.Clock();

    const animate = () => {
      if (stopped) return;
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Viscosity decay so motion flows and settles like water
      waterVelocity *= 0.955;
      waterPhase += (isRotatingRef.current ? 0.022 : 0.004) + waterVelocity;

      // Smooth cursor parallax damping
      smoothParallaxX += (targetParallaxX - smoothParallaxX) * 0.055;
      smoothParallaxY += (targetParallaxY - smoothParallaxY) * 0.055;

      masterSceneGroup.rotation.y = smoothParallaxX;
      masterSceneGroup.rotation.x = smoothParallaxY;

      // Animate all 5 plates in synchronized circular water trajectories + axial rotation
      plateNodes.forEach((node) => {
        const { index, carrierGroup, spinGroup, edgeMesh, slot } = node;
        const syncAngle = waterPhase + slot.phaseOffset;

        // 1. Synchronized circular orbital displacement (all plates move in circular harmony)
        const orbitRadius = slot.orbitRadius * (1 + waterVelocity * 4.5);
        carrierGroup.position.x = slot.basePos.x + Math.cos(syncAngle) * orbitRadius;
        carrierGroup.position.y = slot.basePos.y + Math.sin(syncAngle) * orbitRadius * 0.85;
        carrierGroup.position.z =
          slot.basePos.z + Math.sin(syncAngle * 0.9) * 0.18 + (hoveredIndexInternal === index ? 0.35 : 0);

        // Gentle water-like undulating tilt wave
        carrierGroup.rotation.x = slot.baseRot.x + Math.sin(syncAngle) * 0.055;
        carrierGroup.rotation.z = slot.baseRot.z + Math.cos(syncAngle) * 0.045;

        // 2. Fluid axial rotation around the plate's own axis
        if (isRotatingRef.current) {
          const fluidSpin =
            slot.spinSpeed +
            Math.sin(elapsed * 1.4 + slot.phaseOffset) * 0.0025 +
            waterVelocity * 0.45;
          spinGroup.rotation.y += fluidSpin;
        }

        // 3. Smooth hover / active selection scale & rim illumination
        const isHovered = hoveredIndexInternal === index;
        const isSelected = activeDishRef.current === index;
        const targetScale = isHovered ? 1.11 : isSelected ? 1.05 : 1.0;
        node.currentScale += (targetScale - node.currentScale) * 0.1;
        carrierGroup.scale.setScalar(node.currentScale);

        const rimMat = edgeMesh.material as THREE.MeshStandardMaterial;
        if (isHovered || isSelected) {
          rimMat.color.setHex(0xffffff);
          rimMat.emissive.setHex(0xf73b20);
          rimMat.emissiveIntensity = isHovered ? 0.85 : 0.45;
        } else {
          rimMat.color.setHex(0xffdfbe);
          rimMat.emissive.setHex(0x000000);
          rimMat.emissiveIntensity = 0;
        }
      });

      // Subtle rotation of upper-right concentric rings
      ringsGroup.rotation.z = -0.52 + Math.sin(waterPhase * 0.5) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const newW = containerRef.current.clientWidth || 900;
      const newH = containerRef.current.clientHeight || 640;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      stopped = true;
      cancelAnimationFrame(animationFrameId);
      canvasEl.removeEventListener('pointermove', handlePointerMove);
      canvasEl.removeEventListener('pointerdown', handlePointerDown);
      canvasEl.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('wheel', handleWheelOrScroll);
      window.removeEventListener('scroll', handleWheelOrScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  const handleSelectPlateFromPill = (idx: number) => {
    setCurrentDish(idx);
    activeDishRef.current = idx;
    if (onDishChange) onDishChange(idx);
    if (onPlateClick) onPlateClick(idx, PLATES_3D_CATALOG[idx]);
  };

  const hoveredPlate = hoveredPlateIdx !== null ? PLATES_3D_CATALOG[hoveredPlateIdx] : null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden ${className}`}
    >
      {/* Interactive Three.js 3D Food Plates Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full block transition-transform duration-300 ${
          hoveredPlateIdx !== null ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
        }`}
        aria-label="Escena 3D interactiva de 5 platos de comida gourmet giratorios"
      />

      {/* Floating Cursor Tooltip when hovering a 3D Plate */}
      {hoveredPlate && hoverPointerPos && (
        <div
          style={{
            left: Math.min(Math.max(hoverPointerPos.x + 18, 16), (containerRef.current?.clientWidth || 800) - 290),
            top: Math.max(hoverPointerPos.y - 76, 16),
          }}
          className="pointer-events-none absolute z-30 w-[275px] rounded-2xl bg-[#ffffff]/95 backdrop-blur-xl px-4 py-3 text-[#360802] border border-[#e7dcdb] shadow-[0_12px_32px_rgba(54,8,2,0.16)] transition-all duration-150"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fdedea] text-[#f73b20] tracking-[0.03em]">
              <Sparkles className="w-3 h-3" />
              {hoveredPlate.shortName}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#f73b20]">
              <MousePointerClick className="w-3.5 h-3.5" />
              Clic para pedir
            </span>
          </div>
          <p className="text-sm font-medium text-[#360802] leading-snug">{hoveredPlate.name}</p>
          <p className="text-[11px] text-[#74514b] mt-1 line-clamp-2">
            En el plato 3D: {hoveredPlate.sculptedItems.join(' · ')}
          </p>
        </div>
      )}

      {/* Optional Quick Selector Bar for Compact / Modal Mode */}
      {showControlsPill && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1.5 rounded-full bg-[#360802]/80 backdrop-blur-xl border border-white/20 shadow-lg text-xs max-w-[95vw] overflow-x-auto">
          {PLATES_3D_CATALOG.map((plate, i) => (
            <button
              key={plate.id}
              onClick={() => handleSelectPlateFromPill(i)}
              className={`px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer ${
                currentDish === i
                  ? 'bg-[#f73b20] text-white shadow-xs'
                  : 'text-white/85 hover:text-white hover:bg-white/15'
              }`}
            >
              <Utensils className="w-3 h-3" />
              <span>{plate.shortName}</span>
            </button>
          ))}

          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-1.5 rounded-full text-white/85 hover:text-white hover:bg-white/15 ml-1 transition-colors cursor-pointer ${
              isRotating ? 'text-[#f5ffbb]' : ''
            }`}
            title={isRotating ? 'Pausar rotación fluida' : 'Reanudar rotación fluida'}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
};
