'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useSensorStore } from '../../stores';
import { Card } from '../common';

interface Phone3DVisualizerProps {
  autoRotate?: boolean;
  showAxes?: boolean;
  showInfo?: boolean;
}

export const Phone3DVisualizer = ({
  autoRotate = false,
  showAxes = true,
  showInfo = true,
}: Phone3DVisualizerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const phoneRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  const { latestGyroscopeReading, latestAccelerometerReading } = useSensorStore();

  useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    // ============================================
    // INITIALISATION SCÈNE 3D
    // ============================================

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0.25);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ============================================
    // CRÉER LE MODÈLE 3D DU TÉLÉPHONE
    // ============================================

    // Groupe principal du téléphone
    const phoneGroup = new THREE.Group();
    scene.add(phoneGroup);

    // Corps du téléphone (boîte noire)
    const bodyGeometry = new THREE.BoxGeometry(0.08, 0.16, 0.01);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a,
      emissive: 0x2a2a2a,
      shininess: 80,
      side: THREE.FrontSide,
    });
    const phoneBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    phoneBody.castShadow = true;
    phoneBody.receiveShadow = true;
    phoneGroup.add(phoneBody);
    phoneRef.current = phoneGroup;

    // Écran du téléphone (rectangle bleu)
    const screenGeometry = new THREE.BoxGeometry(0.072, 0.14, 0.0001);
    const screenMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a3a6a,
      emissive: 0x2a5a9a,
      shininess: 60,
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.0055;
    screen.castShadow = true;
    phoneGroup.add(screen);

    // Coins du téléphone (arrondi simulé)
    const cornerGeometry = new THREE.CylinderGeometry(0.002, 0.002, 0.01, 8);
    const cornerMaterial = new THREE.MeshPhongMaterial({
      color: 0x0a0a0a,
      shininess: 60,
    });

    const corners = [
      [-0.036, 0.073, 0],
      [0.036, 0.073, 0],
      [-0.036, -0.073, 0],
      [0.036, -0.073, 0],
    ];

    corners.forEach((pos) => {
      const corner = new THREE.Mesh(cornerGeometry, cornerMaterial);
      corner.position.set(pos[0], pos[1], pos[2]);
      corner.castShadow = true;
      phoneGroup.add(corner);
    });

    // ============================================
    // AJOUTER LES AXES (X, Y, Z)
    // ============================================

    if (showAxes) {
      const axesHelper = new THREE.AxesHelper(0.15);
      phoneGroup.add(axesHelper);
    }

    // ============================================
    // ÉCLAIRAGE
    // ============================================

    // Lumière directionnelle (soleil)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Lumière ambiante
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);

    // Lumière d'accent
    const pointLight = new THREE.PointLight(0x4488ff, 0.6);
    pointLight.position.set(-3, 3, 5);
    scene.add(pointLight);

    // ============================================
    // ANIMATION LOOP
    // ============================================

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (phoneGroup && latestGyroscopeReading) {
        // Appliquer la rotation du gyroscope
        phoneGroup.rotation.x = latestGyroscopeReading.x * 0.02;
        phoneGroup.rotation.y = latestGyroscopeReading.y * 0.02;
        phoneGroup.rotation.z = latestGyroscopeReading.z * 0.02;

        // Mettre à jour l'état pour affichage
        setRotation({
          x: (latestGyroscopeReading.x * 0.02 * 180) / Math.PI,
          y: (latestGyroscopeReading.y * 0.02 * 180) / Math.PI,
          z: (latestGyroscopeReading.z * 0.02 * 180) / Math.PI,
        });
      }

      if (autoRotate && phoneGroup) {
        phoneGroup.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };

    animate();

    // ============================================
    // HANDLE RESIZE
    // ============================================

    const handleResize = () => {
      if (!containerRef.current) return;

      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // ============================================
    // CLEANUP
    // ============================================

    setIsInitialized(true);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement.parentElement === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      screenGeometry.dispose();
      screenMaterial.dispose();
      cornerGeometry.dispose();
      cornerMaterial.dispose();
    };
  }, [isInitialized, autoRotate, showAxes, latestGyroscopeReading]);

  return (
    <Card className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Visualiseur 3D</h3>
        <div className="flex items-center gap-2">
          {latestGyroscopeReading && (
            <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
              ✓ En direct
            </div>
          )}
        </div>
      </div>

      {/* Container 3D */}
      <div
        ref={containerRef}
        className="w-full h-96 bg-gradient-to-b from-gray-950 to-gray-900 rounded-lg border border-gray-800 overflow-hidden"
      />

      {/* Informations */}
      {showInfo && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Rotation X</p>
            <p className="text-sm font-semibold text-red-600">{rotation.x.toFixed(1)}°</p>
            <p className="text-xs text-gray-500">(Pitch)</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Rotation Y</p>
            <p className="text-sm font-semibold text-green-600">{rotation.y.toFixed(1)}°</p>
            <p className="text-xs text-gray-500">(Roll)</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Rotation Z</p>
            <p className="text-sm font-semibold text-blue-600">{rotation.z.toFixed(1)}°</p>
            <p className="text-xs text-gray-500">(Yaw)</p>
          </div>
        </div>
      )}

      {/* Légende des axes */}
      {showAxes && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-2">Axes:</p>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-red-500" />
              <span className="text-gray-600">X (Rouge)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-green-500" />
              <span className="text-gray-600">Y (Vert)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-blue-500" />
              <span className="text-gray-600">Z (Bleu)</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
