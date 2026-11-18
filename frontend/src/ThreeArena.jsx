import { useEffect, useRef, useState } from "react";
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
    fighter.userData.slot = slot;
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

function buildArena(scene) {
  scene.background = new THREE.Color("#080a18");
  scene.fog = new THREE.Fog("#080a18", 13, 28);
  scene.add(new THREE.HemisphereLight(0xc3d5ff, 0x141128, 2.1));

  const keyLight = new THREE.DirectionalLight(0xe4eaff, 3.2);
  keyLight.position.set(-4, 8, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x7f4eff, 2.4);
  fillLight.position.set(5, 4, 3);
  scene.add(fillLight);

  const arenaFloor = new THREE.Mesh(
    new THREE.CylinderGeometry(4.8, 5.2, 0.45, 40),
    new THREE.MeshStandardMaterial({
      color: 0x12172a,
      roughness: 0.35,
      metalness: 0.8
    })
  );
  arenaFloor.position.y = -0.22;
  scene.add(arenaFloor);

  const innerRing = new THREE.Mesh(
    new THREE.RingGeometry(2.2, 2.35, 48),
    new THREE.MeshBasicMaterial({ color: 0x00f2fe, side: THREE.DoubleSide })
  );
  innerRing.rotation.x = -Math.PI / 2;
  innerRing.position.y = 0.02;
  scene.add(innerRing);

  const playerLight = new THREE.PointLight(0x00f2fe, 3.5, 6.5);
  playerLight.position.set(-2.05, 1.8, 1.2);
  scene.add(playerLight);

  const rivalLight = new THREE.PointLight(0xff007a, 3.5, 6.5);
  rivalLight.position.set(2.05, 1.8, 1.2);
  scene.add(rivalLight);

  return { innerRing, playerLight, rivalLight };
}

export default function ThreeArena({
  models,
  playerName = "Fighter 1",
  opponentName = "Fighter 2",
  playerAvatar,
  opponentAvatar,
  compact = false,
  isRunning = false,
  className = "",
  onModelError,
  combatVisual = null // { attacker: "player" | "opponent", damage: number, type: "hit" | "blocked", id: number }
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const errorHandlerRef = useRef(onModelError);
  const runningRef = useRef(isRunning);
  errorHandlerRef.current = onModelError;
  runningRef.current = isRunning;

  // Real-time visual combat state
  const [activeStrike, setActiveStrike] = useState(null);
  const [screenShake, setScreenShake] = useState(false);

  // Trigger animations when a combat visual event occurs
  useEffect(() => {
    if (!combatVisual || !combatVisual.id) return;

    setActiveStrike(combatVisual);
    if (combatVisual.type === "hit") {
      setScreenShake(true);
    }

    const timer = setTimeout(() => {
      setActiveStrike(null);
      setScreenShake(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [combatVisual?.id]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    let active = true;
    let animationFrame = 0;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, compact ? 1.6 : 1.9, compact ? 5.8 : 6.8);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minPolarAngle = Math.PI * 0.35;
    controls.maxPolarAngle = Math.PI * 0.52;
    controls.minAzimuthAngle = -Math.PI * 0.22;
    controls.maxAzimuthAngle = Math.PI * 0.22;
    controls.target.set(0, 1.1, 0);
    controls.update();

    const arenaEffects = buildArena(scene);

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
    const animate = () => {
      const now = performance.now();
      const delta = Math.min((now - lastFrameTime) / 1000, 0.05);
      lastFrameTime = now;
      const time = (now - startTime) / 1000;

      scene.traverse((object) => {
        if (object.userData.isFighterModel) {
          const movement = runningRef.current ? 0.06 : 0.02;
          object.position.y = object.userData.baseHeight + Math.sin(time * 2.0 + object.position.x) * movement;
          object.userData.animationMixer?.update(delta);
        }
      });

      arenaEffects.innerRing.rotation.z = time * 0.25;
      controls.update();
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
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
    };
  }, [compact, models?.opponent?.url, models?.player?.url]);

  const isPlayerAttacking = activeStrike && activeStrike.attacker === "player";
  const isOpponentAttacking = activeStrike && activeStrike.attacker === "opponent";
  const isPlayerDefending = activeStrike && activeStrike.defender === "player";
  const isOpponentDefending = activeStrike && activeStrike.defender === "opponent";

  return (
    <div
      className={`three-arena ${compact ? "three-arena-compact" : ""} ${screenShake ? "arena-shake-active" : ""} ${className}`}
      ref={containerRef}
      role="img"
      aria-label="BrainBytes 1v1 Arena"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="three-arena-title" aria-hidden="true">
        BRAINBYTES <span>1v1 ARENA</span>
      </div>

      {/* FIGHTER 1 (PLAYER) */}
      <div className={`three-fighter-tag three-fighter-player`} aria-hidden="true">
        <strong>{playerName}</strong>
        <small>{isPlayerAttacking ? "⚡ STRIKING!" : isPlayerDefending ? "💥 HIT!" : "READY"}</small>
      </div>

      {/* FIGHTER 2 (OPPONENT) */}
      <div className={`three-fighter-tag three-fighter-opponent`} aria-hidden="true">
        <strong>{opponentName}</strong>
        <small>{isOpponentAttacking ? "⚡ STRIKING!" : isOpponentDefending ? "💥 HIT!" : "READY"}</small>
      </div>

      {/* 2D ILLUSTRATED AVATARS WITH REAL COMBAT ACTION ANIMATIONS */}
      {!models?.player && playerAvatar?.src && (
        <div
          className={`arena-avatar-wrapper avatar-player-wrap ${isPlayerAttacking ? "avatar-lunge-attack" : ""} ${isPlayerDefending ? (activeStrike.type === "blocked" ? "avatar-shield-active" : "avatar-stagger-hit") : ""}`}
        >
          <img
            className="three-fighter-avatar three-fighter-avatar-player"
            src={playerAvatar.src}
            alt={playerName}
            draggable="false"
          />
          {isPlayerDefending && activeStrike.type === "blocked" && (
            <div className="quantum-shield-bubble" title="Quantum Shield Absorbed Attack" />
          )}
          {isPlayerDefending && activeStrike.type === "hit" && (
            <div className="combat-hit-splash">
              <span className="damage-popup-text">-{activeStrike.damage || 25} HP!</span>
            </div>
          )}
        </div>
      )}

      {!models?.opponent && opponentAvatar?.src && (
        <div
          className={`arena-avatar-wrapper avatar-opponent-wrap ${isOpponentAttacking ? "avatar-lunge-attack-rival" : ""} ${isOpponentDefending ? (activeStrike.type === "blocked" ? "avatar-shield-active" : "avatar-stagger-hit-rival") : ""}`}
        >
          <img
            className="three-fighter-avatar three-fighter-avatar-opponent"
            src={opponentAvatar.src}
            alt={opponentName}
            draggable="false"
          />
          {isOpponentDefending && activeStrike.type === "blocked" && (
            <div className="quantum-shield-bubble" title="Quantum Shield Absorbed Attack" />
          )}
          {isOpponentDefending && activeStrike.type === "hit" && (
            <div className="combat-hit-splash rival-splash">
              <span className="damage-popup-text">-{activeStrike.damage || 25} HP!</span>
            </div>
          )}
        </div>
      )}

      {/* HIGH-ENERGY COMBAT LASER / PLASMA STRIKE BEAM */}
      {isPlayerAttacking && (
        <div className="plasma-attack-beam beam-to-right" aria-hidden="true">
          <div className="beam-glow" />
          <div className="beam-particles" />
        </div>
      )}

      {isOpponentAttacking && (
        <div className="plasma-attack-beam beam-to-left" aria-hidden="true">
          <div className="beam-glow" />
          <div className="beam-particles" />
        </div>
      )}
    </div>
  );
}
