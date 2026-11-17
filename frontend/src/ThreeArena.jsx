import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function disposeObject(root) {
  root.traverse((object) => {
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material) continue;
      for (const value of Object.values(material)) {
        if (value?.isTexture) value.dispose();
      }
      material.dispose();
    }
  });
}

async function addModel(scene, model, slot, setError, isActive) {
  if (!model?.url) return;

  const loader = new GLTFLoader();
  let loadedGltf;
  try {
    let vrmUtils;
    if (/\.vrm$/i.test(model.name)) {
      const vrmLibrary = await import("@pixiv/three-vrm");
      loader.register((parser) => new vrmLibrary.VRMLoaderPlugin(parser));
      vrmUtils = vrmLibrary.VRMUtils;
    }

    loadedGltf = await loader.loadAsync(model.url);
    if (!isActive()) {
      disposeObject(loadedGltf.scene);
      return;
    }

    const vrm = loadedGltf.userData.vrm;
    if (vrm) vrmUtils?.rotateVRM0(vrm);
    const fighter = vrm?.scene || loadedGltf.scene;
    fighter.updateMatrixWorld(true);
    const originalBounds = new THREE.Box3().setFromObject(fighter);
    const modelHeight = originalBounds.max.y - originalBounds.min.y;
    if (!Number.isFinite(modelHeight) || modelHeight <= 0) {
      throw new Error(`${model.name} does not contain a visible 3D character.`);
    }

    fighter.scale.multiplyScalar(2.65 / modelHeight);
    fighter.updateMatrixWorld(true);
    const scaledBounds = new THREE.Box3().setFromObject(fighter);
    fighter.position.y -= scaledBounds.min.y;
    fighter.position.x = slot === "player" ? -2.05 : 2.05;
    fighter.rotation.y = slot === "player" ? 0.3 : -0.3;
    fighter.userData.baseHeight = fighter.position.y;
    fighter.userData.isFighterModel = true;
    if (loadedGltf.animations.length > 0) {
      const idleAnimation = loadedGltf.animations.find((animation) => /idle/i.test(animation.name)) || loadedGltf.animations[0];
      fighter.userData.animationMixer = new THREE.AnimationMixer(fighter);
      fighter.userData.animationMixer.clipAction(idleAnimation).play();
    }
    scene.add(fighter);
  } catch (error) {
    if (loadedGltf) disposeObject(loadedGltf.scene);
    if (isActive()) {
      setError(error instanceof Error ? error.message : `${model.name} could not be loaded.`);
    }
  }
}

function addBuilding(scene, x, height, index) {
  const width = index % 3 === 0 ? 1.15 : 0.8;
  const material = new THREE.MeshStandardMaterial({
    color: index % 2 === 0 ? 0x151b34 : 0x1b1937,
    roughness: 0.84,
    metalness: 0.15
  });
  const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.75), material);
  building.position.set(x, height / 2 - 0.2, -6.5);
  scene.add(building);

  const windowMaterial = new THREE.MeshBasicMaterial({
    color: index % 2 === 0 ? 0x4abde8 : 0xa16cff,
    transparent: true,
    opacity: 0.4
  });
  for (let row = 0; row < Math.floor(height / 0.55); row += 1) {
    const windowLight = new THREE.Mesh(new THREE.BoxGeometry(width * 0.44, 0.035, 0.02), windowMaterial);
    windowLight.position.set(x, row * 0.55 + 0.15, -6.1);
    scene.add(windowLight);
  }
}

function buildArena(scene) {
  scene.background = new THREE.Color("#080a18");
  scene.fog = new THREE.Fog("#080a18", 13, 28);
  scene.add(new THREE.HemisphereLight(0xc3d5ff, 0x141128, 2.1));

  const keyLight = new THREE.DirectionalLight(0xe4eaff, 3.2);
  keyLight.position.set(-4, 8, 6);
  scene.add(keyLight);

  const cyanLight = new THREE.PointLight(0x37cfff, 95, 14, 2);
  cyanLight.position.set(-5, 3.4, 1);
  scene.add(cyanLight);
  const violetLight = new THREE.PointLight(0xa34bff, 110, 14, 2);
  violetLight.position.set(5, 3.8, 0);
  scene.add(violetLight);
  const topLight = new THREE.PointLight(0x816aff, 70, 13, 2);
  topLight.position.set(0, 7, -3);
  scene.add(topLight);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(34, 30),
    new THREE.MeshStandardMaterial({ color: 0x0d1124, roughness: 0.42, metalness: 0.64 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -0.08, -1.5);
  scene.add(floor);

  const grid = new THREE.GridHelper(28, 44, 0x53c9f3, 0x26345e);
  grid.position.set(0, -0.045, -1.5);
  grid.material.transparent = true;
  grid.material.opacity = 0.24;
  scene.add(grid);

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(5.2, 5.45, 0.28, 72),
    new THREE.MeshStandardMaterial({ color: 0x171b35, roughness: 0.3, metalness: 0.72 })
  );
  platform.position.y = 0.08;
  scene.add(platform);

  const platformEdge = new THREE.Mesh(
    new THREE.TorusGeometry(5.18, 0.055, 8, 100),
    new THREE.MeshBasicMaterial({ color: 0x57dfff })
  );
  platformEdge.rotation.x = Math.PI / 2;
  platformEdge.position.y = 0.23;
  scene.add(platformEdge);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.55, 0.024, 6, 96),
    new THREE.MeshBasicMaterial({ color: 0xa678ff, transparent: true, opacity: 0.8 })
  );
  innerRing.rotation.x = Math.PI / 2;
  innerRing.position.y = 0.235;
  scene.add(innerRing);

  for (let index = 0; index < 19; index += 1) {
    const x = (index - 9) * 1.3;
    const height = 1.6 + ((index * 7) % 8) * 0.46;
    addBuilding(scene, x, height, index);
  }

  for (const x of [-6.2, 6.2]) {
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 4.7, 10),
      new THREE.MeshBasicMaterial({ color: x < 0 ? 0x55dfff : 0xb876ff, transparent: true, opacity: 0.72 })
    );
    beam.position.set(x, 2.35, -1.5);
    scene.add(beam);
  }

  for (const x of [-2.05, 2.05]) {
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.84, 0.18, 48),
      new THREE.MeshStandardMaterial({ color: 0x212340, metalness: 0.72, roughness: 0.28 })
    );
    pedestal.position.set(x, 0.31, 0.5);
    scene.add(pedestal);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.025, 6, 48),
      new THREE.MeshBasicMaterial({ color: x < 0 ? 0x5de4ff : 0xbf81ff })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.set(x, 0.41, 0.5);
    scene.add(rim);
  }

  return { platformEdge, innerRing };
}

export default function ThreeArena({
  models,
  playerName,
  opponentName,
  compact = false,
  isRunning = false,
  className = "",
  onModelError
}) {
  const containerRef = useRef(null);
  const runningRef = useRef(isRunning);
  const errorHandlerRef = useRef(onModelError);

  useEffect(() => {
    runningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    errorHandlerRef.current = onModelError;
  }, [onModelError]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let active = true;
    let animationFrame = 0;
    let renderer;
    let controls;
    let arenaEffects;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
    camera.position.set(0, compact ? 3.4 : 4.1, compact ? 12 : 11.6);
    camera.lookAt(0, 1.35, -0.6);

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.prepend(renderer.domElement);
      arenaEffects = buildArena(scene);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 1.35, -0.6);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.enablePan = false;
      controls.enableZoom = !compact;
      controls.minDistance = 7;
      controls.maxDistance = 16;
      controls.maxPolarAngle = Math.PI / 2.05;
    } catch (error) {
      errorHandlerRef.current?.(error instanceof Error ? error.message : "WebGL is unavailable in this browser.");
      return undefined;
    }

    addModel(scene, models?.player, "player", (error) => errorHandlerRef.current?.(error), () => active);
    addModel(scene, models?.opponent, "opponent", (error) => errorHandlerRef.current?.(error), () => active);

    const resize = () => {
      if (!renderer || !container.clientWidth || !container.clientHeight) return;
      renderer.setSize(container.clientWidth, container.clientHeight, false);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    if (resizeObserver) resizeObserver.observe(container);
    else window.addEventListener("resize", resize);
    resize();

    const startTime = performance.now();
    let lastFrameTime = startTime;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = () => {
      const now = performance.now();
      const delta = Math.min((now - lastFrameTime) / 1000, 0.05);
      lastFrameTime = now;
      const time = reduceMotion ? 0 : (now - startTime) / 1000;
      scene.traverse((object) => {
        if (object.userData.isFighterModel) {
          const movement = runningRef.current ? 0.07 : 0.022;
          object.position.y = object.userData.baseHeight + Math.sin(time * 1.8 + object.position.x) * movement;
          object.userData.animationMixer?.update(delta);
        }
      });
      arenaEffects.platformEdge.rotation.y = Math.sin(time * 0.18) * 0.025;
      arenaEffects.innerRing.rotation.y = -time * 0.08;
      controls.update();
      renderer.render(scene, camera);
      if (!reduceMotion) animationFrame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      active = false;
      window.cancelAnimationFrame(animationFrame);
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener("resize", resize);
      controls.dispose();
      disposeObject(scene);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [compact, models?.opponent?.url, models?.player?.url]);

  const empty = !models?.player && !models?.opponent;
  return (
    <div
      className={`three-arena ${compact ? "three-arena-compact" : ""} ${className}`}
      ref={containerRef}
      role="img"
      aria-label="Three-dimensional neon training arena"
    >
      <div className="three-arena-title" aria-hidden="true">BRAINBYTES <span>3D ARENA</span></div>
      <div className="three-fighter-tag three-fighter-player" aria-hidden="true">
        <strong>{playerName}</strong><small>{models?.player ? models.player.name : "ADD YOUR MODEL"}</small>
      </div>
      <div className="three-fighter-tag three-fighter-opponent" aria-hidden="true">
        <strong>{opponentName}</strong><small>{models?.opponent ? models.opponent.name : "ADD RIVAL MODEL"}</small>
      </div>
      {empty && <p className="three-arena-empty">Upload original GLB or VRM fighters to see them in the arena.</p>}
    </div>
  );
}
