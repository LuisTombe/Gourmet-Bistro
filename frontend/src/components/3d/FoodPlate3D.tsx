import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { ProductCategory } from '../../types/index.ts';
import { Utensils, RotateCw, MousePointerClick, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';

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
  /** Ruta opcional a escaneo fotogramétrico .glb comprimido con Draco/Meshopt */
  glbUrl?: string;
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
      'Modelado PBR con medallón de Ojo de Bife Angosto sellado a la parrilla, costillas de cordero al romero y filete de salmón austral glaseado.',
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
      'Modelado PBR con corona de Risotto ai Frutti di Mare con langostinos y mejillones, raviolis de ossobuco al vino tinto y cintas pappardelle.',
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
      'Modelado PBR con Burrata Pugliese artesanal e higos caramelizados, láminas de carpaccio de res trufado y timbal de dados de atún rojo con palta.',
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
      'Modelado PBR con glaseado espejo de Chocolate Valrhona 70% con hoja de oro, bizcocho savoiardi al espresso y crema mascarpone espolvoreada en cacao.',
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
      'Cristalería PBR con refracción física (IOR 1.52): Old Fashioned ahumado con esfera de hielo tallada, copa balón de Gin Tonic con botánicos y limonada.',
    sculptedItems: [
      'Cóctel Smoked Old Fashioned',
      'Gin Tonic Botánico',
      'Limonada de Hierbabuena & Jengibre',
    ],
    colorAccent: '#477ee9',
    badgeBg: '#f5ffbb',
  },
];

export const DISHES = PLATES_3D_CATALOG;

// ============================================================================
// GENERADOR DE TEXTURAS PBR PROCEDURALES (ALBEDO + BUMP/MICRO-RELIEVE)
// ============================================================================
function createCanvasTexture(
  drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  maxAnisotropy: number,
  isColor = true
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawFn(ctx, canvas.width, canvas.height);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  if (isColor) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.needsUpdate = true;
  return tex;
}

/** Deforma orgánicamente una geometría para eliminar la apariencia rígida/caricaturesca */
function displaceGeometryOrganically(
  geo: THREE.BufferGeometry,
  amplitude: number,
  freqX = 4.2,
  freqY = 3.7,
  freqZ = 4.5
) {
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  geo.computeVertexNormals();
  const norm = geo.attributes.normal;

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    n.fromBufferAttribute(norm, i);
    const wave =
      Math.sin(v.x * freqX + v.z * 2.3) * 0.45 +
      Math.cos(v.y * freqY + v.x * 3.1) * 0.35 +
      Math.sin(v.z * freqZ - v.y * 2.7) * 0.2;
    v.addScaledVector(n, wave * amplitude);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
}

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
  const zoomTargetRef = useRef<number>(variant === 'interactive' ? 8.8 : 10.2);

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

  const handleZoomStep = (delta: number) => {
    zoomTargetRef.current = Math.min(Math.max(zoomTargetRef.current + delta, 6.2), 13.5);
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    let stopped = false;
    let animationFrameId = 0;

    const width = containerRef.current.clientWidth || 900;
    const height = containerRef.current.clientHeight || 640;

    // 1. Escena & Cámara con rango de zoom suave
    const scene = new THREE.Scene();
    const initialZ = variant === 'interactive' ? 8.8 : 10.2;
    zoomTargetRef.current = initialZ;
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0.4, initialZ);
    camera.lookAt(0, 0.1, 0);

    // 2. Renderizador WebGL con ToneMapping ACES Filmic para rango dinámico fotorrealista
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
    renderer.toneMappingExposure = 1.18;

    // 3. Iluminación Basada en Imagen (IBL Studio HDRI via PMREMGenerator + RoomEnvironment)
    // Clave para que el glaseado espejo, salsas húmedas, porcelana y cristal reflejen un estudio real
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    // Luces de Estudio Fotográfico Culinario (Key Light cálida, Rim Light contraluz para SSS, Fill suave)
    const ambientLight = new THREE.AmbientLight(0xfff5ed, 0.85);
    scene.add(ambientLight);

    const sunKeyLight = new THREE.DirectionalLight(0xfffaf2, 2.6);
    sunKeyLight.position.set(6, 9.5, 7.5);
    sunKeyLight.castShadow = true;
    sunKeyLight.shadow.mapSize.width = 1024;
    sunKeyLight.shadow.mapSize.height = 1024;
    sunKeyLight.shadow.bias = -0.0005;
    scene.add(sunKeyLight);

    const signalRimLight = new THREE.DirectionalLight(0xff6a45, 2.2);
    signalRimLight.position.set(-7, 5, -5.5);
    scene.add(signalRimLight);

    const softFillLight = new THREE.DirectionalLight(0xffe4d6, 1.35);
    softFillLight.position.set(2, -6, 4.5);
    scene.add(softFillLight);

    const maxAniso = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);

    // ============================================================================
    // 4. TEXTURAS PBR CULINARIAS (MAILLARD, SALMÓN, RISOTTO, CACAO, BIZCOCHO)
    // ============================================================================
    // Textura Albedo + Costra Maillard de Carne Asada a la Parrilla
    const searedMeatAlbedo = createCanvasTexture((ctx, w, h) => {
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 12, w * 0.5, h * 0.5, w * 0.55);
      grad.addColorStop(0, '#5c2214');
      grad.addColorStop(0.55, '#3d150b');
      grad.addColorStop(1, '#230b05');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Vetas de grasa intramuscular caramelizada y fibras
      for (let i = 0; i < 180; i++) {
        ctx.strokeStyle = i % 5 === 0 ? 'rgba(185, 92, 58, 0.28)' : 'rgba(28, 8, 3, 0.45)';
        ctx.lineWidth = 1 + (i % 3);
        ctx.beginPath();
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(x + 15, y - 8, x + 30, y + 12, x + 42, y + 3);
        ctx.stroke();
      }
      // Marcas de parrilla de hierro fundido (char grill lines)
      ctx.strokeStyle = 'rgba(14, 4, 2, 0.72)';
      ctx.lineWidth = 10;
      for (let g = -w; g < w * 2; g += 38) {
        ctx.beginPath();
        ctx.moveTo(g, 0);
        ctx.lineTo(g + w * 0.65, h);
        ctx.stroke();
      }
    }, maxAniso, true);

    const organicMicroBump = createCanvasTexture((ctx, w, h) => {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        const shade = Math.floor(90 + Math.random() * 140);
        ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, 1.5 + Math.random() * 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }, maxAniso, false);

    // Textura de Salmón Austral con líneas de miocommata blancas y glaseado
    const salmonStriationAlbedo = createCanvasTexture((ctx, w, h) => {
      ctx.fillStyle = '#ee6445';
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 16) {
        ctx.strokeStyle = 'rgba(255, 232, 218, 0.58)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(w * 0.35, y + 10, w * 0.65, y - 6, w, y + 8);
        ctx.stroke();
      }
    }, maxAniso, true);

    // Textura de granos de arroz Carnaroli en emulsión de azafrán y perejil
    const risottoGrainAlbedo = createCanvasTexture((ctx, w, h) => {
      ctx.fillStyle = '#f4d58d';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 420; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const angle = Math.random() * Math.PI;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = i % 14 === 0 ? '#2f6f31' : i % 3 === 0 ? '#fff6dc' : '#ecc56a';
        ctx.beginPath();
        ctx.ellipse(0, 0, 5.5, 2.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }, maxAniso, true);

    // Textura de Dados de Atún Rojo Bluefin con sésamo tostado
    const tunaTartareAlbedo = createCanvasTexture((ctx, w, h) => {
      ctx.fillStyle = '#8f161c';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 160; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.fillStyle = i % 2 === 0 ? '#b31e26' : '#731015';
        ctx.fillRect(x, y, 16, 14);
        ctx.strokeStyle = 'rgba(255, 190, 185, 0.22)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 16, 14);
      }
      // Semillas de sésamo blanco y negro
      for (let s = 0; s < 45; s++) {
        ctx.fillStyle = s % 3 === 0 ? '#1c1412' : '#fff8e7';
        ctx.beginPath();
        ctx.ellipse(Math.random() * w, Math.random() * h, 2.2, 1.1, Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }, maxAniso, true);

    // ============================================================================
    // 5. MATERIALES FÍSICOS PBR CON SUBSURFACE SCATTERING APROXIMADO & CLEARCOAT
    // ============================================================================
    const porcelainMat = new THREE.MeshPhysicalMaterial({
      color: 0xfffaf6,
      roughness: 0.11,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.96,
      envMapIntensity: 1.15,
    });

    const coralUndersideMat = new THREE.MeshPhysicalMaterial({
      color: 0xe86146,
      roughness: 0.28,
      metalness: 0.05,
      clearcoat: 0.55,
      clearcoatRoughness: 0.2,
    });

    const warmGoldRimMat = new THREE.MeshStandardMaterial({
      color: 0xf7d4ac,
      roughness: 0.2,
      metalness: 0.78,
      envMapIntensity: 1.3,
    });

    const searBeefMat = new THREE.MeshPhysicalMaterial({
      map: searedMeatAlbedo,
      bumpMap: organicMicroBump,
      bumpScale: 0.032,
      roughness: 0.42,
      metalness: 0.04,
      clearcoat: 0.72, // Jugo natural de cocción sobre la costra Maillard
      clearcoatRoughness: 0.22,
      sheen: 0.35,
      sheenColor: new THREE.Color(0xc94a29),
      envMapIntensity: 1.1,
    });

    const mediumRareCenterMat = new THREE.MeshPhysicalMaterial({
      color: 0xa82323,
      bumpMap: organicMicroBump,
      bumpScale: 0.018,
      roughness: 0.28,
      clearcoat: 0.85,
      clearcoatRoughness: 0.14,
      sheen: 0.55,
      sheenColor: new THREE.Color(0xff6b5b),
    });

    const tunaTartareMat = new THREE.MeshPhysicalMaterial({
      map: tunaTartareAlbedo,
      bumpMap: organicMicroBump,
      bumpScale: 0.028,
      roughness: 0.18,
      clearcoat: 0.92,
      clearcoatRoughness: 0.1,
      sheen: 0.45,
      sheenColor: new THREE.Color(0xff4d4d),
    });

    const salmonMat = new THREE.MeshPhysicalMaterial({
      map: salmonStriationAlbedo,
      bumpMap: organicMicroBump,
      bumpScale: 0.016,
      roughness: 0.26,
      clearcoat: 0.88, // Glaseado teriyaki húmedo
      clearcoatRoughness: 0.12,
      sheen: 0.5,
      sheenColor: new THREE.Color(0xff9e80),
    });

    const crispySalmonSkinMat = new THREE.MeshStandardMaterial({
      color: 0x2c3539,
      bumpMap: organicMicroBump,
      bumpScale: 0.03,
      roughness: 0.55,
      metalness: 0.25,
    });

    const saffronRisottoMat = new THREE.MeshPhysicalMaterial({
      map: risottoGrainAlbedo,
      bumpMap: organicMicroBump,
      bumpScale: 0.035,
      roughness: 0.32,
      clearcoat: 0.78, // Mantecatura cremosa de mantequilla y Parmigiano
      clearcoatRoughness: 0.18,
    });

    const goldenPastaMat = new THREE.MeshPhysicalMaterial({
      color: 0xf2c66d,
      bumpMap: organicMicroBump,
      bumpScale: 0.015,
      roughness: 0.36,
      clearcoat: 0.55,
      clearcoatRoughness: 0.24,
      sheen: 0.35,
      sheenColor: new THREE.Color(0xffe8b3),
    });

    const burrataCreamMat = new THREE.MeshPhysicalMaterial({
      color: 0xfffdf9,
      bumpMap: organicMicroBump,
      bumpScale: 0.008,
      roughness: 0.14,
      clearcoat: 0.95,
      clearcoatRoughness: 0.08,
      transmission: 0.18, // Translucidez láctea realista (Subsurface Scattering)
      thickness: 0.45,
      ior: 1.44,
    });

    const herbGreenMat = new THREE.MeshPhysicalMaterial({
      color: 0x2d7a36,
      bumpMap: organicMicroBump,
      bumpScale: 0.012,
      roughness: 0.38,
      clearcoat: 0.35,
      sheen: 0.4,
      sheenColor: new THREE.Color(0x76d275),
    });

    const avocadoMat = new THREE.MeshPhysicalMaterial({
      color: 0x6ea838,
      bumpMap: organicMicroBump,
      bumpScale: 0.022,
      roughness: 0.34,
      clearcoat: 0.42,
      sheen: 0.3,
      sheenColor: new THREE.Color(0xb8e986),
    });

    const darkValrhonaMirrorMat = new THREE.MeshPhysicalMaterial({
      color: 0x1d0a04,
      roughness: 0.05,
      metalness: 0.08,
      clearcoat: 1.0, // Glaseado espejo de pastelería francesa
      clearcoatRoughness: 0.03,
      reflectivity: 1.0,
      envMapIntensity: 1.6,
    });

    const cocoaPowderMat = new THREE.MeshStandardMaterial({
      color: 0x3b180c,
      bumpMap: organicMicroBump,
      bumpScale: 0.035,
      roughness: 0.94, // Polvo de cacao alcalino ultra mate
      metalness: 0.0,
    });

    const mascarponeMat = new THREE.MeshPhysicalMaterial({
      color: 0xfbf2df,
      bumpMap: organicMicroBump,
      bumpScale: 0.012,
      roughness: 0.32,
      clearcoat: 0.45,
      sheen: 0.35,
    });

    const espressoSavoiardiMat = new THREE.MeshStandardMaterial({
      color: 0x4f2714,
      bumpMap: organicMicroBump,
      bumpScale: 0.038,
      roughness: 0.78, // Bizcocho poroso embebido en café espresso
    });

    const wineSauceMat = new THREE.MeshPhysicalMaterial({
      color: 0x590d08,
      roughness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      ior: 1.48,
      reflectivity: 0.98,
    });

    const oliveOilDrizzleMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37,
      roughness: 0.05,
      clearcoat: 1.0,
      transmission: 0.65,
      ior: 1.47,
    });

    const crystalGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.03,
      metalness: 0.02,
      transmission: 0.92, // Cristal soplado con refracción óptica real
      thickness: 0.28,
      ior: 1.52,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.5,
    });

    const clearIceMat = new THREE.MeshPhysicalMaterial({
      color: 0xeef9ff,
      bumpMap: organicMicroBump,
      bumpScale: 0.015,
      roughness: 0.08,
      transmission: 0.88,
      thickness: 0.4,
      ior: 1.31, // Índice de refracción físico del hielo
      clearcoat: 1.0,
    });

    const bourbonAmberMat = new THREE.MeshPhysicalMaterial({
      color: 0xc84b0f,
      roughness: 0.05,
      transmission: 0.78,
      thickness: 0.5,
      ior: 1.36,
      clearcoat: 1.0,
    });

    const berryGinMat = new THREE.MeshPhysicalMaterial({
      color: 0xe82c52,
      roughness: 0.05,
      transmission: 0.76,
      thickness: 0.45,
      ior: 1.35,
      clearcoat: 1.0,
    });

    const mintLemonadeMat = new THREE.MeshPhysicalMaterial({
      color: 0xd8f594,
      roughness: 0.14,
      transmission: 0.68,
      thickness: 0.4,
      ior: 1.34,
      clearcoat: 0.9,
    });

    // Helper: Plato de Porcelana de Hueso (Bone China) con perfil torneado
    const createGourmetPlateBase = (radius: number, plateIndex: number) => {
      const group = new THREE.Group();

      const underGeo = new THREE.CylinderGeometry(radius * 0.96, radius * 0.76, 0.15, 64);
      const underMesh = new THREE.Mesh(underGeo, coralUndersideMat);
      underMesh.position.y = -0.04;
      underMesh.castShadow = true;
      underMesh.receiveShadow = true;
      underMesh.userData = { plateIndex };
      group.add(underMesh);

      const wellGeo = new THREE.CylinderGeometry(radius * 0.89, radius * 0.73, 0.08, 64);
      const wellMesh = new THREE.Mesh(wellGeo, porcelainMat);
      wellMesh.position.y = 0.04;
      wellMesh.receiveShadow = true;
      wellMesh.userData = { plateIndex };
      group.add(wellMesh);

      const rimGeo = new THREE.TorusGeometry(radius * 0.92, 0.105, 28, 72);
      rimGeo.rotateX(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, porcelainMat);
      rimMesh.position.y = 0.062;
      rimMesh.castShadow = true;
      rimMesh.receiveShadow = true;
      rimMesh.userData = { plateIndex };
      group.add(rimMesh);

      const edgeGeo = new THREE.TorusGeometry(radius * 1.01, 0.022, 16, 72);
      edgeGeo.rotateX(Math.PI / 2);
      const edgeMesh = new THREE.Mesh(edgeGeo, warmGoldRimMat.clone());
      edgeMesh.position.y = 0.072;
      edgeMesh.userData = { plateIndex, isRimHighlight: true };
      group.add(edgeMesh);

      return { group, edgeMesh };
    };

    const tagGroupWithPlateIndex = (grp: THREE.Object3D, plateIndex: number) => {
      grp.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.userData = { ...child.userData, plateIndex };
        }
      });
    };

    // ============================================================================
    // CONSTRUCCIÓN DE LOS 5 PLATOS CON GEOMETRÍA ORGÁNICA Y TEXTURIZADO PBR REAL
    // ============================================================================

    // --- PLATO 0: Carnes & Grill (Ojo de Bife 400g + Costillas de Cordero + Salmón Glaseado) ---
    const buildPlate0Carnes = (radius: number) => {
      const { group, edgeMesh } = createGourmetPlateBase(radius, 0);

      // Reducción espejo de Malbec y jugo de carne
      const sauceGeo = new THREE.CylinderGeometry(radius * 0.56, radius * 0.58, 0.018, 48);
      displaceGeometryOrganically(sauceGeo, 0.012, 3.2, 2.0, 3.5);
      const sauce = new THREE.Mesh(sauceGeo, wineSauceMat);
      sauce.position.set(-0.08, 0.088, 0.05);
      group.add(sauce);

      // 1. Ojo de Bife Angosto (400g) con contorno anatómico orgánico, tapa de ribeye y corte jugoso
      const bifeGroup = new THREE.Group();
      const bifeGeo = new THREE.CylinderGeometry(0.5, 0.54, 0.32, 48, 8);
      bifeGeo.scale(1.14, 1.0, 0.88);
      displaceGeometryOrganically(bifeGeo, 0.032, 5.5, 4.2, 5.1);
      const bife = new THREE.Mesh(bifeGeo, searBeefMat);
      bife.castShadow = true;
      bife.receiveShadow = true;
      bifeGroup.add(bife);

      // Medallón lateral trinchado que deja ver el interior punto medio-rojo jugoso
      const sliceGeo = new THREE.BoxGeometry(0.46, 0.24, 0.16, 12, 6, 4);
      displaceGeometryOrganically(sliceGeo, 0.015, 6.0, 5.0, 4.0);
      const sliceMesh = new THREE.Mesh(sliceGeo, mediumRareCenterMat);
      sliceMesh.position.set(0.32, -0.02, 0.34);
      sliceMesh.rotation.set(0.22, -0.35, 0.12);
      sliceMesh.castShadow = true;
      bifeGroup.add(sliceMesh);

      // Mantequilla maître d'hôtel fundiéndose sobre la costra caliente + cristales de sal Maldon
      const butterGeo = new THREE.SphereGeometry(0.17, 24, 18);
      butterGeo.scale(1.15, 0.38, 1.05);
      displaceGeometryOrganically(butterGeo, 0.012);
      const butter = new THREE.Mesh(butterGeo, mascarponeMat);
      butter.position.set(-0.05, 0.18, -0.02);
      bifeGroup.add(butter);

      // Ramita de romero fresco sobre el bife
      const stemGeo = new THREE.CylinderGeometry(0.012, 0.016, 0.55, 8);
      stemGeo.rotateZ(Math.PI / 2.2);
      const rosemaryStem = new THREE.Mesh(stemGeo, herbGreenMat);
      rosemaryStem.position.set(0, 0.23, 0);
      bifeGroup.add(rosemaryStem);

      bifeGroup.position.set(-0.38, 0.24, 0.16);
      group.add(bifeGroup);

      // 2. Costillas de Cordero Patagónico (French rack cruzado con hueso limpio curvado)
      for (let r = 0; r < 2; r++) {
        const chopGroup = new THREE.Group();
        const meatGeo = new THREE.SphereGeometry(0.24, 28, 22);
        meatGeo.scale(1.25, 0.82, 0.92);
        displaceGeometryOrganically(meatGeo, 0.024, 5.2, 4.8, 5.0);
        const meat = new THREE.Mesh(meatGeo, searBeefMat);
        meat.castShadow = true;
        chopGroup.add(meat);

        const boneGeo = new THREE.CylinderGeometry(0.026, 0.042, 0.88, 14);
        boneGeo.rotateZ(-0.52);
        const bone = new THREE.Mesh(boneGeo, mascarponeMat);
        bone.position.set(0.24, 0.34, 0);
        bone.castShadow = true;
        chopGroup.add(bone);

        chopGroup.position.set(0.36, 0.27 + r * 0.06, -0.34 + r * 0.32);
        chopGroup.rotation.y = -0.42 + r * 0.38;
        group.add(chopGroup);
      }

      // 3. Salmón Austral Glaseado (Lomo con vetas + piel crujiente inferior + sésamo)
      const salmonGroup = new THREE.Group();
      const salmonGeo = new THREE.BoxGeometry(0.76, 0.22, 0.42, 16, 8, 10);
      displaceGeometryOrganically(salmonGeo, 0.014, 4.0, 3.5, 4.2);
      const salmon = new THREE.Mesh(salmonGeo, salmonMat);
      salmon.castShadow = true;
      salmonGroup.add(salmon);

      const skinGeo = new THREE.BoxGeometry(0.77, 0.035, 0.43, 12, 2, 8);
      const skin = new THREE.Mesh(skinGeo, crispySalmonSkinMat);
      skin.position.y = -0.11;
      salmonGroup.add(skin);

      salmonGroup.position.set(0.28, 0.22, 0.46);
      salmonGroup.rotation.y = -0.35;
      group.add(salmonGroup);

      // Espárragos trigueros asados con puntas detalladas
      for (let i = 0; i < 3; i++) {
        const aspGeo = new THREE.CylinderGeometry(0.034, 0.044, 1.15, 14);
        aspGeo.rotateZ(Math.PI / 2.05);
        aspGeo.rotateY(0.24 + i * 0.11);
        const asp = new THREE.Mesh(aspGeo, herbGreenMat);
        asp.position.set(-0.04, 0.14 + i * 0.028, -0.42 + i * 0.11);
        asp.castShadow = true;
        group.add(asp);
      }

      tagGroupWithPlateIndex(group, 0);
      return { group, edgeMesh };
    };

    // --- PLATO 1: Pastas & Risottos (Risotto Frutti di Mare + Ravioli Ossobuco + Pappardelle) ---
    const buildPlate1Pastas = (radius: number) => {
      const { group, edgeMesh } = createGourmetPlateBase(radius, 1);

      // 1. Risotto ai Frutti di Mare con micro-relieve de granos Carnaroli
      const risottoGeo = new THREE.SphereGeometry(0.68, 40, 28, 0, Math.PI * 2, 0, Math.PI / 2);
      risottoGeo.scale(1.04, 0.38, 1.04);
      displaceGeometryOrganically(risottoGeo, 0.025, 7.5, 6.2, 7.5);
      const risotto = new THREE.Mesh(risottoGeo, saffronRisottoMat);
      risotto.position.set(-0.22, 0.08, -0.15);
      risotto.receiveShadow = true;
      group.add(risotto);

      // Langostinos tigre articulados y mejillones negros abiertos sobre el risotto
      for (let i = 0; i < 3; i++) {
        const prawnGroup = new THREE.Group();
        const bodyGeo = new THREE.TorusGeometry(0.145, 0.058, 16, 28, Math.PI * 1.32);
        bodyGeo.rotateX(Math.PI / 2.3);
        displaceGeometryOrganically(bodyGeo, 0.008, 9.0, 9.0, 9.0);
        const prawnBody = new THREE.Mesh(bodyGeo, salmonMat);
        prawnBody.castShadow = true;
        prawnGroup.add(prawnBody);

        const tailGeo = new THREE.ConeGeometry(0.055, 0.12, 8);
        tailGeo.rotateZ(Math.PI / 3);
        const tail = new THREE.Mesh(tailGeo, mediumRareCenterMat);
        tail.position.set(0.12, -0.02, 0.06);
        prawnGroup.add(tail);

        const ang = (i * Math.PI * 2) / 3 + 0.2;
        prawnGroup.position.set(-0.22 + Math.cos(ang) * 0.27, 0.34, -0.15 + Math.sin(ang) * 0.27);
        prawnGroup.rotation.y = ang;
        group.add(prawnGroup);
      }

      // Valvas de mejillón negro brillantes
      for (let m = 0; m < 2; m++) {
        const shellGeo = new THREE.SphereGeometry(0.16, 18, 14, 0, Math.PI);
        shellGeo.scale(1.35, 0.45, 0.85);
        const shell = new THREE.Mesh(shellGeo, crispySalmonSkinMat);
        shell.position.set(-0.48 + m * 0.52, 0.22, -0.42 + m * 0.18);
        shell.rotation.set(0.35, m * 1.2, -0.25);
        group.add(shell);
      }

      // 2. Nido de cintas Pappardelle al Ragù de Jabalí
      const nestGroup = new THREE.Group();
      for (let r = 0; r < 5; r++) {
        const ribbonGeo = new THREE.TorusGeometry(0.28 + (r % 2) * 0.06, 0.055, 14, 36);
        ribbonGeo.rotateX(Math.PI / 2 + (r - 2) * 0.08);
        ribbonGeo.rotateY(r * 0.4);
        displaceGeometryOrganically(ribbonGeo, 0.018, 6.0, 5.0, 6.0);
        const ribbon = new THREE.Mesh(ribbonGeo, goldenPastaMat);
        ribbon.position.y = r * 0.032;
        ribbon.castShadow = true;
        nestGroup.add(ribbon);
      }
      const raguTopGeo = new THREE.SphereGeometry(0.24, 24, 20);
      raguTopGeo.scale(1.12, 0.52, 1.12);
      displaceGeometryOrganically(raguTopGeo, 0.028, 8.0, 7.0, 8.0);
      const raguTop = new THREE.Mesh(raguTopGeo, searBeefMat);
      raguTop.position.set(0, 0.22, 0);
      nestGroup.add(raguTop);

      nestGroup.position.set(0.45, 0.14, 0.3);
      group.add(nestGroup);

      // 3. Ravioli artesanales de Ossobuco Braseado con centro abombado y borde dentado
      for (let i = 0; i < 3; i++) {
        const ravGroup = new THREE.Group();
        const basePadGeo = new THREE.BoxGeometry(0.34, 0.035, 0.34, 10, 2, 10);
        displaceGeometryOrganically(basePadGeo, 0.008, 12.0, 4.0, 12.0);
        const basePad = new THREE.Mesh(basePadGeo, goldenPastaMat);
        ravGroup.add(basePad);

        const pillowGeo = new THREE.SphereGeometry(0.14, 20, 16);
        pillowGeo.scale(1.1, 0.55, 1.1);
        const pillow = new THREE.Mesh(pillowGeo, goldenPastaMat);
        pillow.position.y = 0.03;
        ravGroup.add(pillow);

        // Glaseado de reducción de vino sobre el ravioli
        const glazeDotGeo = new THREE.SphereGeometry(0.09, 14, 12);
        glazeDotGeo.scale(1.2, 0.25, 1.2);
        const glazeDot = new THREE.Mesh(glazeDotGeo, wineSauceMat);
        glazeDot.position.y = 0.085;
        ravGroup.add(glazeDot);

        ravGroup.position.set(-0.34 + i * 0.24, 0.16 + i * 0.028, 0.48 - i * 0.08);
        ravGroup.rotation.set(0.08, i * 0.48, 0.12);
        group.add(ravGroup);
      }

      // Hojas de albahaca fresca curvadas
      for (let i = 0; i < 5; i++) {
        const leafGeo = new THREE.SphereGeometry(0.075, 12, 10);
        leafGeo.scale(1.7, 0.22, 0.95);
        const leaf = new THREE.Mesh(leafGeo, herbGreenMat);
        leaf.position.set(-0.2 + (i - 2) * 0.22, 0.38, -0.05 + ((i % 2) - 0.5) * 0.35);
        leaf.rotation.set(0.2, i * 1.1, 0.15);
        group.add(leaf);
      }

      tagGroupWithPlateIndex(group, 1);
      return { group, edgeMesh };
    };

    // --- PLATO 2: Entradas de Autor (Burrata Pugliese + Carpaccio Trufado + Tartar de Atún) ---
    const buildPlate2Entradas = (radius: number) => {
      const { group, edgeMesh } = createGourmetPlateBase(radius, 2);

      // 1. Carpaccio de Res Trufado (Rosetas orgánicas de lomo veteado + lascas de trufa negra y Parmigiano)
      for (let i = 0; i < 6; i++) {
        const sliceGeo = new THREE.CylinderGeometry(0.32, 0.34, 0.022, 32, 4);
        displaceGeometryOrganically(sliceGeo, 0.018, 7.0, 5.0, 7.0);
        const slice = new THREE.Mesh(sliceGeo, mediumRareCenterMat);
        const angle = -0.95 + i * 0.36;
        slice.position.set(Math.cos(angle) * 0.56, 0.095 + i * 0.01, Math.sin(angle) * 0.56);
        slice.receiveShadow = true;
        group.add(slice);

        // Lasca de trufa negra Périgord sobre el carpaccio
        if (i % 2 === 0) {
          const truffleGeo = new THREE.CylinderGeometry(0.075, 0.08, 0.012, 16);
          const truffle = new THREE.Mesh(truffleGeo, crispySalmonSkinMat);
          truffle.position.set(Math.cos(angle) * 0.54, 0.12 + i * 0.01, Math.sin(angle) * 0.54);
          group.add(truffle);
        }
      }

      // 2. Burrata Pugliese artesanal con moño superior e higos negros caramelizados
      const burrataGroup = new THREE.Group();
      const burrataGeo = new THREE.SphereGeometry(0.37, 36, 28);
      burrataGeo.scale(1.1, 0.8, 1.08);
      displaceGeometryOrganically(burrataGeo, 0.016, 4.5, 4.2, 4.5);
      const burrata = new THREE.Mesh(burrataGeo, burrataCreamMat);
      burrata.castShadow = true;
      burrataGroup.add(burrata);

      // Nudo artesanal superior de la burrata (testina)
      const knotGeo = new THREE.ConeGeometry(0.12, 0.16, 16);
      displaceGeometryOrganically(knotGeo, 0.012, 6.0, 6.0, 6.0);
      const knot = new THREE.Mesh(knotGeo, burrataCreamMat);
      knot.position.y = 0.28;
      burrataGroup.add(knot);

      // Hilo de aceite de oliva virgen extra sobre la burrata
      const oilRingGeo = new THREE.TorusGeometry(0.22, 0.014, 10, 32, Math.PI * 1.5);
      oilRingGeo.rotateX(Math.PI / 2);
      const oilRing = new THREE.Mesh(oilRingGeo, oliveOilDrizzleMat);
      oilRing.position.y = 0.24;
      burrataGroup.add(oilRing);

      burrataGroup.position.set(-0.28, 0.3, -0.14);
      group.add(burrataGroup);

      // Higos negros caramelizados abiertos al medio
      for (let i = 0; i < 3; i++) {
        const figGeo = new THREE.SphereGeometry(0.145, 20, 16);
        figGeo.scale(1.05, 0.65, 1.05);
        displaceGeometryOrganically(figGeo, 0.01, 5.0, 5.0, 5.0);
        const fig = new THREE.Mesh(figGeo, wineSauceMat);
        const ang = i * 2.1;
        fig.position.set(-0.28 + Math.cos(ang) * 0.44, 0.17, -0.14 + Math.sin(ang) * 0.44);
        fig.castShadow = true;
        group.add(fig);
      }

      // 3. Tartar de Atún Rojo & Palta (Timbal gourmet con dados de atún en relieve real, sin bordes de sombrero)
      const tartarGroup = new THREE.Group();
      const paltaLayerGeo = new THREE.CylinderGeometry(0.32, 0.33, 0.14, 36, 6);
      displaceGeometryOrganically(paltaLayerGeo, 0.014, 8.0, 6.0, 8.0);
      const paltaLayer = new THREE.Mesh(paltaLayerGeo, avocadoMat);
      paltaLayer.position.y = 0.15;
      paltaLayer.castShadow = true;
      tartarGroup.add(paltaLayer);

      const tunaLayerGeo = new THREE.CylinderGeometry(0.315, 0.32, 0.2, 36, 8);
      displaceGeometryOrganically(tunaLayerGeo, 0.02, 9.5, 7.5, 9.5);
      const tunaLayer = new THREE.Mesh(tunaLayerGeo, tunaTartareMat);
      tunaLayer.position.y = 0.31;
      tunaLayer.castShadow = true;
      tartarGroup.add(tunaLayer);

      // Quenelle de emulsión de wasabi y brotes sobre el tartar
      const quenelleGeo = new THREE.SphereGeometry(0.11, 18, 14);
      quenelleGeo.scale(1.6, 0.65, 0.75);
      const quenelle = new THREE.Mesh(quenelleGeo, avocadoMat);
      quenelle.position.set(0, 0.43, 0);
      tartarGroup.add(quenelle);

      tartarGroup.position.set(0.38, 0.0, -0.22);
      group.add(tartarGroup);

      // Hojas de rúcula selvática
      for (let i = 0; i < 6; i++) {
        const leafGeo = new THREE.SphereGeometry(0.075, 12, 10);
        leafGeo.scale(1.85, 0.28, 0.85);
        const leaf = new THREE.Mesh(leafGeo, herbGreenMat);
        leaf.position.set((i - 2.5) * 0.22, 0.44, ((i % 3) - 1) * 0.24);
        leaf.rotation.y = i * 0.8;
        group.add(leaf);
      }

      tagGroupWithPlateIndex(group, 2);
      return { group, edgeMesh };
    };

    // --- PLATO 3: Postres Artesanales (Esfera de Chocolate Valrhona + Tiramisú Tradizionale) ---
    const buildPlate3Postres = (radius: number) => {
      const { group, edgeMesh } = createGourmetPlateBase(radius, 3);

      // Trazo de coulis de frutos rojos y cacao brillante
      const swooshGeo = new THREE.RingGeometry(0.32, 0.76, 48, 2, 0, Math.PI * 1.42);
      swooshGeo.rotateX(-Math.PI / 2);
      const swoosh = new THREE.Mesh(swooshGeo, wineSauceMat);
      swoosh.position.y = 0.086;
      group.add(swoosh);

      // 1. Esfera de Chocolate Valrhona 70% con glaseado espejo (Mirror Glaze) + hoja de oro 24k
      const sphereGeo = new THREE.SphereGeometry(0.41, 48, 48);
      const sphere = new THREE.Mesh(sphereGeo, darkValrhonaMirrorMat);
      sphere.position.set(-0.34, 0.43, 0.15);
      sphere.castShadow = true;
      group.add(sphere);

      const goldBeltGeo = new THREE.TorusGeometry(0.422, 0.018, 18, 64);
      goldBeltGeo.rotateX(Math.PI / 2.25);
      const goldBelt = new THREE.Mesh(goldBeltGeo, warmGoldRimMat);
      goldBelt.position.set(-0.34, 0.43, 0.15);
      group.add(goldBelt);

      // Lámina de oro comestible en la cúspide de la esfera
      const goldLeafGeo = new THREE.DodecahedronGeometry(0.065, 0);
      goldLeafGeo.scale(1.4, 0.25, 1.1);
      const goldLeaf = new THREE.Mesh(goldLeafGeo, warmGoldRimMat);
      goldLeaf.position.set(-0.34, 0.84, 0.15);
      group.add(goldLeaf);

      // 2. Tiramisú Tradizionale (Capas de bizcocho savoiardi poroso al espresso + ondas de mascarpone y cacao mate)
      const tiraGroup = new THREE.Group();
      const layerHeights = [0.095, 0.105, 0.095, 0.11];
      let currY = 0.08;
      layerHeights.forEach((h, idx) => {
        const lGeo = new THREE.BoxGeometry(0.66, h, 0.46, 14, 4, 10);
        displaceGeometryOrganically(lGeo, 0.008, 6.0, 4.0, 6.0);
        const lMat = idx % 2 === 0 ? espressoSavoiardiMat : mascarponeMat;
        const lMesh = new THREE.Mesh(lGeo, lMat);
        lMesh.position.y = currY + h / 2;
        lMesh.castShadow = true;
        tiraGroup.add(lMesh);
        currY += h;
      });

      // Rosetones de crema mascarpone espolvoreados con cacao amargo mate
      for (let x = -1; x <= 1; x++) {
        for (let z = -0.5; z <= 0.5; z += 1) {
          const tuftGeo = new THREE.SphereGeometry(0.092, 20, 16);
          tuftGeo.scale(1.05, 0.82, 1.05);
          const tuft = new THREE.Mesh(tuftGeo, cocoaPowderMat);
          tuft.position.set(x * 0.2, currY + 0.038, z * 0.17);
          tuft.castShadow = true;
          tiraGroup.add(tuft);
        }
      }
      tiraGroup.position.set(0.38, 0.02, -0.16);
      tiraGroup.rotation.y = 0.35;
      group.add(tiraGroup);

      // Frambuesas frescas compuestas por drupéolas
      for (let i = 0; i < 4; i++) {
        const berryGroup = new THREE.Group();
        const coreGeo = new THREE.SphereGeometry(0.075, 16, 16);
        displaceGeometryOrganically(coreGeo, 0.016, 14.0, 14.0, 14.0);
        const berry = new THREE.Mesh(coreGeo, mediumRareCenterMat);
        berry.castShadow = true;
        berryGroup.add(berry);
        berryGroup.position.set(-0.04 + i * 0.17, 0.16, 0.54 - i * 0.11);
        group.add(berryGroup);
      }

      tagGroupWithPlateIndex(group, 3);
      return { group, edgeMesh };
    };

    // --- PLATO 4: Bebidas & Coctelería (Smoked Old Fashioned + Gin Tonic Botánico + Limonada) ---
    const buildPlate4Bebidas = (radius: number) => {
      const { group, edgeMesh } = createGourmetPlateBase(radius, 4);

      // 1. Cóctel Smoked Old Fashioned (Vaso rocks tallado + bourbon + esfera de hielo cristalino + piel de naranja)
      const oldFashionedGroup = new THREE.Group();
      const glassGeo = new THREE.CylinderGeometry(0.34, 0.31, 0.56, 36, 1, true);
      const glass = new THREE.Mesh(glassGeo, crystalGlassMat);
      glass.position.y = 0.3;
      oldFashionedGroup.add(glass);

      // Base gruesa de cristal del vaso Old Fashioned
      const heavyBaseGeo = new THREE.CylinderGeometry(0.31, 0.3, 0.09, 36);
      const heavyBase = new THREE.Mesh(heavyBaseGeo, crystalGlassMat);
      heavyBase.position.y = 0.06;
      oldFashionedGroup.add(heavyBase);

      const liquidGeo = new THREE.CylinderGeometry(0.315, 0.295, 0.36, 32);
      const liquid = new THREE.Mesh(liquidGeo, bourbonAmberMat);
      liquid.position.y = 0.26;
      oldFashionedGroup.add(liquid);

      const iceSphereGeo = new THREE.IcosahedronGeometry(0.19, 3);
      displaceGeometryOrganically(iceSphereGeo, 0.01, 5.0, 5.0, 5.0);
      const iceSphere = new THREE.Mesh(iceSphereGeo, clearIceMat);
      iceSphere.position.y = 0.36;
      oldFashionedGroup.add(iceSphere);

      const orangePeelGeo = new THREE.TorusGeometry(0.17, 0.028, 14, 28, Math.PI * 1.15);
      const orangePeel = new THREE.Mesh(orangePeelGeo, salmonMat);
      orangePeel.position.set(0.12, 0.48, 0);
      oldFashionedGroup.add(orangePeel);

      oldFashionedGroup.position.set(-0.42, 0.06, 0.24);
      group.add(oldFashionedGroup);

      // 2. Gin Tonic Botánico en Copa Balón de Cristal con Hielos y Frutos Rojos
      const ginGroup = new THREE.Group();
      const footGeo = new THREE.CylinderGeometry(0.04, 0.24, 0.03, 28);
      const foot = new THREE.Mesh(footGeo, crystalGlassMat);
      foot.position.y = 0.03;
      ginGroup.add(foot);

      const stemGeo = new THREE.CylinderGeometry(0.032, 0.042, 0.36, 20);
      const stem = new THREE.Mesh(stemGeo, crystalGlassMat);
      stem.position.y = 0.21;
      ginGroup.add(stem);

      const bowlGeo = new THREE.SphereGeometry(0.39, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.72);
      bowlGeo.rotateX(Math.PI);
      const bowl = new THREE.Mesh(bowlGeo, crystalGlassMat);
      bowl.position.y = 0.64;
      ginGroup.add(bowl);

      const ginLiquidGeo = new THREE.SphereGeometry(0.36, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.58);
      ginLiquidGeo.rotateX(Math.PI);
      const ginLiquid = new THREE.Mesh(ginLiquidGeo, berryGinMat);
      ginLiquid.position.y = 0.61;
      ginGroup.add(ginLiquid);

      // Cubos de hielo cristalinos flotando en el Gin Tonic
      const ginIceGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
      const ginIce = new THREE.Mesh(ginIceGeo, clearIceMat);
      ginIce.position.set(0.05, 0.62, 0.04);
      ginIce.rotation.set(0.4, 0.6, 0.2);
      ginGroup.add(ginIce);

      ginGroup.position.set(0.36, 0.06, -0.25);
      group.add(ginGroup);

      // 3. Limonada de Hierbabuena & Jengibre en Vaso Highball
      const limGroup = new THREE.Group();
      const tallGlassGeo = new THREE.CylinderGeometry(0.26, 0.23, 0.74, 32);
      const tallGlass = new THREE.Mesh(tallGlassGeo, crystalGlassMat);
      tallGlass.position.y = 0.39;
      limGroup.add(tallGlass);

      const limLiquidGeo = new THREE.CylinderGeometry(0.24, 0.21, 0.58, 28);
      const limLiquid = new THREE.Mesh(limLiquidGeo, mintLemonadeMat);
      limLiquid.position.y = 0.33;
      limGroup.add(limLiquid);

      const mintCrownGeo = new THREE.SphereGeometry(0.13, 16, 12);
      mintCrownGeo.scale(1.35, 0.55, 1.35);
      displaceGeometryOrganically(mintCrownGeo, 0.018, 8.0, 8.0, 8.0);
      const mintCrown = new THREE.Mesh(mintCrownGeo, herbGreenMat);
      mintCrown.position.set(0, 0.71, 0);
      limGroup.add(mintCrown);

      limGroup.position.set(0.22, 0.06, 0.46);
      group.add(limGroup);

      tagGroupWithPlateIndex(group, 4);
      return { group, edgeMesh };
    };

    // ============================================================================
    // LOADER DE MODELOS FOTOGRAMÉTRICOS GLTF/GLB CON NORMALIZACIÓN DE ESCALA Y PIVOTE
    // ============================================================================
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    gltfLoader.setDRACOLoader(dracoLoader);

    const loadPhotogrammetryGLBIntoPlate = (
      glbUrl: string,
      targetSpinGroup: THREE.Group,
      plateRadius: number,
      plateIndex: number
    ) => {
      gltfLoader.load(
        glbUrl,
        (gltf) => {
          if (stopped) return;
          const model = gltf.scene;

          // 1. Calcular BoundingBox para normalizar escala al diámetro del plato
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);

          const maxHorizontal = Math.max(size.x, size.z, 0.001);
          const targetDiameter = plateRadius * 1.35;
          const scaleFactor = targetDiameter / maxHorizontal;
          model.scale.setScalar(scaleFactor);

          // 2. Re-calcular caja y anclar el punto de pivote exactamente en el centro de la base del plato (y = 0.08)
          const scaledBox = new THREE.Box3().setFromObject(model);
          const scaledCenter = new THREE.Vector3();
          scaledBox.getCenter(scaledCenter);

          model.position.x -= scaledCenter.x;
          model.position.z -= scaledCenter.z;
          model.position.y -= scaledBox.min.y - 0.08;

          // 3. Configurar sombras, anisotropía PBR y etiquetar plateIndex para Raycaster
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              mesh.userData = { ...mesh.userData, plateIndex };
              const mat = mesh.material as THREE.MeshStandardMaterial;
              if (mat) {
                mat.envMapIntensity = 1.25;
                if (mat.map) mat.map.anisotropy = maxAniso;
                if (mat.normalMap) mat.normalMap.anisotropy = maxAniso;
                if (mat.roughnessMap) mat.roughnessMap.anisotropy = maxAniso;
              }
            }
          });

          targetSpinGroup.add(model);
        },
        undefined,
        () => {
          // Si no hay archivo .glb externo en la ruta, conserva el modelo PBR procedural de alta fidelidad
        }
      );
    };

    // ============================================================================
    // CASCADA DIAGONAL SINCRONIZADA (PRESERVANDO COMPOSICIÓN DINÁMICA DE PORTADA)
    // ============================================================================
    const masterSceneGroup = new THREE.Group();
    scene.add(masterSceneGroup);

    const cascadeSlots = [
      {
        basePos: new THREE.Vector3(-1.35, -1.55, 1.45),
        baseRot: new THREE.Euler(0.68, 0.38, -0.46),
        radius: 1.95,
        orbitRadius: 0.26,
        phaseOffset: 0.0,
        spinSpeed: 0.0085,
        builder: buildPlate0Carnes,
      },
      {
        basePos: new THREE.Vector3(-0.65, -0.58, 0.75),
        baseRot: new THREE.Euler(0.64, 0.36, -0.48),
        radius: 1.88,
        orbitRadius: 0.28,
        phaseOffset: 0.85,
        spinSpeed: 0.0092,
        builder: buildPlate1Pastas,
      },
      {
        basePos: new THREE.Vector3(0.08, 0.38, 0.0),
        baseRot: new THREE.Euler(0.6, 0.34, -0.5),
        radius: 1.92,
        orbitRadius: 0.3,
        phaseOffset: 1.7,
        spinSpeed: 0.0088,
        builder: buildPlate2Entradas,
      },
      {
        basePos: new THREE.Vector3(0.88, 1.32, -0.75),
        baseRot: new THREE.Euler(0.56, 0.32, -0.52),
        radius: 1.85,
        orbitRadius: 0.28,
        phaseOffset: 2.55,
        spinSpeed: 0.0095,
        builder: buildPlate3Postres,
      },
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

      const catalogMeta = PLATES_3D_CATALOG[index];
      if (catalogMeta?.glbUrl) {
        loadPhotogrammetryGLBIntoPlate(catalogMeta.glbUrl, spinGroup, slot.radius, index);
      }

      return {
        index,
        carrierGroup,
        spinGroup,
        edgeMesh,
        slot,
        currentScale: 1.0,
      };
    });

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
    // CONTROLES DE INTERACCIÓN: ROTACIÓN 360° POR ARRASTRE, ZOOM Y RAYCASTER
    // ============================================================================
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2(-999, -999);

    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let smoothParallaxX = 0;
    let smoothParallaxY = 0;

    // Acumuladores de rotación manual por arrastre 360° e impulso fluido
    let isDragging = false;
    let manualSpinAngle = 0;
    let manualTiltAngle = 0;
    let dragVelocityY = 0;
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

      const dx = clientX - lastMouseX;
      const dy = clientY - lastMouseY;

      // Si el usuario arrastra sobre el lienzo, gira los platos 360° directamente con inercia
      if (isDragging) {
        dragVelocityY = dx * 0.012;
        manualSpinAngle += dragVelocityY;
        manualTiltAngle = Math.min(Math.max(manualTiltAngle + dy * 0.004, -0.38), 0.38);
      }

      const speed = Math.min(Math.hypot(dx, dy), 65);
      waterVelocity = Math.min(waterVelocity + speed * 0.0018, 0.09);
      lastMouseX = clientX;
      lastMouseY = clientY;

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
      if (foundPlate !== null && !isDragging) {
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
      isDragging = true;
      pointerDownPos = { x: e.clientX, y: e.clientY };
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDragging = false;
      const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (moveDist > 12) return; // Fue un giro por arrastre 360°, no un clic de selección

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

    const handleCanvasWheel = (e: WheelEvent) => {
      // En modo interactivo (o con Ctrl/Meta presionado), la rueda acerca/aleja el plato 3D
      if (variant === 'interactive' || e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomStep = e.deltaY * 0.0045;
        zoomTargetRef.current = Math.min(Math.max(zoomTargetRef.current + zoomStep, 6.2), 13.5);
      }
      waterVelocity = Math.min(
        waterVelocity + Math.min(Math.abs(e.deltaY) * 0.0009, 0.055),
        0.11
      );
    };

    const handleWindowScroll = () => {
      waterVelocity = Math.min(waterVelocity + 0.018, 0.11);
    };

    const canvasEl = canvasRef.current;
    canvasEl.addEventListener('pointermove', handlePointerMove);
    canvasEl.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    canvasEl.addEventListener('wheel', handleCanvasWheel, { passive: false });
    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    // ============================================================================
    // BUCLE DE ANIMACIÓN: GIRO AXIAL 360° + ÓRBITA SINCRONIZADA + ZOOM SUAVE
    // ============================================================================
    const clock = new THREE.Clock();

    const animate = () => {
      if (stopped) return;
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      waterVelocity *= 0.955;
      if (!isDragging) {
        dragVelocityY *= 0.92;
        manualSpinAngle += dragVelocityY;
        manualTiltAngle *= 0.96;
      }
      waterPhase += (isRotatingRef.current ? 0.022 : 0.004) + waterVelocity;

      smoothParallaxX += (targetParallaxX - smoothParallaxX) * 0.055;
      smoothParallaxY += (targetParallaxY - smoothParallaxY) * 0.055;

      masterSceneGroup.rotation.y = smoothParallaxX;
      masterSceneGroup.rotation.x = smoothParallaxY + manualTiltAngle;

      // Interpolación suave de zoom de cámara
      camera.position.z += (zoomTargetRef.current - camera.position.z) * 0.085;

      plateNodes.forEach((node) => {
        const { index, carrierGroup, spinGroup, edgeMesh, slot } = node;
        const syncAngle = waterPhase + slot.phaseOffset;

        const orbitRadius = slot.orbitRadius * (1 + waterVelocity * 4.5);
        carrierGroup.position.x = slot.basePos.x + Math.cos(syncAngle) * orbitRadius;
        carrierGroup.position.y = slot.basePos.y + Math.sin(syncAngle) * orbitRadius * 0.85;
        carrierGroup.position.z =
          slot.basePos.z +
          Math.sin(syncAngle * 0.9) * 0.18 +
          (hoveredIndexInternal === index ? 0.35 : 0);

        carrierGroup.rotation.x = slot.baseRot.x + Math.sin(syncAngle) * 0.055;
        carrierGroup.rotation.z = slot.baseRot.z + Math.cos(syncAngle) * 0.045;

        // Giro axial 360° continuo alrededor del pivote central del plato + rotación manual por arrastre
        if (isRotatingRef.current && !isDragging) {
          const fluidSpin =
            slot.spinSpeed +
            Math.sin(elapsed * 1.4 + slot.phaseOffset) * 0.0025 +
            waterVelocity * 0.45;
          spinGroup.rotation.y += fluidSpin;
        }
        spinGroup.rotation.y += dragVelocityY;

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
          rimMat.color.setHex(0xf7d4ac);
          rimMat.emissive.setHex(0x000000);
          rimMat.emissiveIntensity = 0;
        }
      });

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
      window.removeEventListener('pointerup', handlePointerUp);
      canvasEl.removeEventListener('wheel', handleCanvasWheel);
      window.removeEventListener('scroll', handleWindowScroll);
      window.removeEventListener('resize', handleResize);
      dracoLoader.dispose();
      pmremGenerator.dispose();
      envTexture.dispose();
      renderer.dispose();
    };
  }, [variant]);

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

      {/* Controles discretos de Zoom 3D cuando está en el visor interactivo */}
      {variant === 'interactive' && (
        <div className="absolute top-5 right-16 z-20 flex items-center gap-1.5 bg-[#360802]/45 backdrop-blur-md p-1 rounded-full border border-white/20">
          <button
            type="button"
            onClick={() => handleZoomStep(-1.1)}
            className="w-7 h-7 rounded-full text-white hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            title="Acercar plato 3D (Zoom In)"
            aria-label="Acercar plato 3D"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleZoomStep(1.1)}
            className="w-7 h-7 rounded-full text-white hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            title="Alejar plato 3D (Zoom Out)"
            aria-label="Alejar plato 3D"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Cursor Tooltip when hovering a 3D Plate */}
      {hoveredPlate && hoverPointerPos && (
        <div
          style={{
            left: Math.min(
              Math.max(hoverPointerPos.x + 18, 16),
              (containerRef.current?.clientWidth || 800) - 290
            ),
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
