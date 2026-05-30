"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { formatKw, formatNumber } from "@/lib/format";
import type { SimulationInputs, SimulationOutputs } from "@/lib/types";
import { schematicComponents, type ComponentKey } from "@/components/simulator/DataCenterSchematic";

interface DataCenter3DSceneProps {
  activeKey: ComponentKey;
  inputs: SimulationInputs;
  layoutKey: DataCenterLayoutKey;
  outputs: SimulationOutputs;
  onSelect: (key: ComponentKey) => void;
}

interface FlowParticle {
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
  start: THREE.Vector3;
  end: THREE.Vector3;
  offset: number;
  speed: number;
  kind: "cold" | "hot" | "water";
}

type GeometryInputs = Pick<SimulationInputs, "coolingType" | "rackDensityKw" | "redundancyLevel">;

export type DataCenterLayoutKey = "contained_air_hall" | "liquid_cooling_pod" | "hybrid_cooling_campus";

export const dataCenterLayouts: {
  key: DataCenterLayoutKey;
  label: string;
  description: string;
}[] = [
  {
    key: "contained_air_hall",
    label: "Contained Air Hall",
    description: "Two rack rows, cold-aisle containment, CRAH units, chilled water, and tower heat rejection.",
  },
  {
    key: "liquid_cooling_pod",
    label: "Liquid Cooling Pod",
    description: "Dense rack pod with liquid manifolds, fewer room air units, stronger chilled-water loop, and compact heat rejection.",
  },
  {
    key: "hybrid_cooling_campus",
    label: "Hybrid Cooling Campus",
    description: "Larger hall with optimized air cooling, hybrid dry-cooler/tower heat rejection, and higher planning visibility.",
  },
];

export function DataCenter3DScene({ activeKey, inputs, layoutKey, outputs, onSelect }: DataCenter3DSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const onSelectRef = useRef(onSelect);
  const activeKeyRef = useRef(activeKey);
  const inputsRef = useRef(inputs);
  const outputsRef = useRef(outputs);
  const { coolingType, rackDensityKw, redundancyLevel } = inputs;

  useEffect(() => {
    onSelectRef.current = onSelect;
    activeKeyRef.current = activeKey;
    inputsRef.current = inputs;
    outputsRef.current = outputs;
  }, [activeKey, inputs, onSelect, outputs]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }
    const layout = dataCenterLayouts.find((item) => item.key === layoutKey) ?? dataCenterLayouts[0];
    const geometryInputs: GeometryInputs = { coolingType, rackDensityKw, redundancyLevel };

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1b18);
    scene.fog = new THREE.Fog(0x0d1b18, 18, 42);

    const camera = new THREE.PerspectiveCamera(48, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(9, 7, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.minDistance = 7;
    controls.maxDistance = 28;

    const ambient = new THREE.AmbientLight(0xa8d8ce, 0.75);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(4, 9, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x0f8b8d, 2.4, 20);
    fillLight.position.set(-5, 4, 3);
    scene.add(fillLight);

    const selectable: THREE.Object3D[] = [];
    const keyedObjects = new Map<ComponentKey, THREE.Object3D[]>();
    const fans: THREE.Object3D[] = [];
    const pulses: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>[] = [];
    const flowParticles: FlowParticle[] = [];
    const thermalPlumes: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial>[] = [];

    const register = (object: THREE.Object3D, key: ComponentKey) => {
      object.userData.componentKey = key;
      selectable.push(object);
      keyedObjects.set(key, [...(keyedObjects.get(key) ?? []), object]);
    };

    buildRoom(scene, layoutKey);
    buildRackRows(scene, register, layoutKey, geometryInputs);
    buildAisles(scene, register, thermalPlumes, layoutKey);
    buildCoolingUnits(scene, register, fans, layoutKey, geometryInputs);
    buildPlant(scene, register, fans, layoutKey, geometryInputs);
    buildGrid(scene, register, pulses);
    buildFlow(scene, flowParticles, layoutKey);
    buildLoopPipes(scene, layoutKey);
    scene.add(createLabel(`layout: ${layout.label}`, 0, 3.25, 3.7));

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const setPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerMove = (event: PointerEvent) => {
      setPointer(event);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(selectable, true)[0];
      renderer.domElement.style.cursor = hit ? "pointer" : "grab";
    };

    const handlePointerDown = (event: PointerEvent) => {
      setPointer(event);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(selectable, true)[0];
      const key = findComponentKey(hit?.object);
      if (key) {
        onSelectRef.current(key);
      }
    };

    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);

    const frameCamera = () => {
      if (mount.clientWidth < 640) {
        camera.position.set(9, 7, 18);
        controls.target.set(1.2, 1.2, 0.2);
      } else {
        camera.position.set(9, 7, 12);
        controls.target.set(0.3, 1.2, 0);
      }
      controls.update();
    };

    frameCamera();

    let lastTime = performance.now() / 1000;
    let focusedKey = activeKeyRef.current;
    let focusUntil = lastTime + 0.8;
    let frameId = 0;

    const animate = () => {
      const elapsed = performance.now() / 1000;
      const delta = Math.min(elapsed - lastTime, 0.05);
      lastTime = elapsed;
      const loadRatio = THREE.MathUtils.clamp(inputsRef.current.itLoadKw / 5000, 0.25, 1);
      const puePressure = THREE.MathUtils.clamp(outputsRef.current.pue - 1, 0.15, 0.8);
      const coolingStress = THREE.MathUtils.clamp(outputsRef.current.coolingPowerKw / outputsRef.current.itPowerKw, 0.05, 0.45);
      const fanStress = THREE.MathUtils.clamp(outputsRef.current.fanPowerKw / outputsRef.current.itPowerKw, 0.02, 0.2);

      if (activeKeyRef.current !== focusedKey) {
        focusedKey = activeKeyRef.current;
        focusUntil = elapsed + 1.25;
      }

      if (elapsed < focusUntil) {
        const preset = getCameraPreset(focusedKey, mount.clientWidth < 640);
        camera.position.lerp(preset.position, 0.06);
        controls.target.lerp(preset.target, 0.08);
      }

      fans.forEach((fan) => {
        fan.rotation.z += delta * (3 + loadRatio * 8);
      });

      flowParticles.forEach((particle) => {
        const kindBoost = particle.kind === "hot" ? 1 + puePressure : particle.kind === "water" ? 1 + coolingStress : 1 + fanStress;
        particle.offset = (particle.offset + delta * particle.speed * (0.65 + loadRatio + kindBoost * 0.35)) % 1;
        particle.mesh.position.lerpVectors(particle.start, particle.end, particle.offset);
        const baseScale = particle.kind === "hot" ? 0.75 + puePressure * 1.4 : particle.kind === "water" ? 0.78 + coolingStress * 1.2 : 0.72 + fanStress * 2.2;
        const scale = baseScale + Math.sin((particle.offset + elapsed) * Math.PI * 2) * 0.18;
        particle.mesh.scale.setScalar(scale);
        particle.mesh.material.opacity = particle.kind === "hot" ? 0.45 + puePressure * 0.5 : particle.kind === "water" ? 0.5 + coolingStress : 0.5 + fanStress * 1.8;
      });

      thermalPlumes.forEach((plume, index) => {
        const phase = Math.sin(elapsed * (1.1 + loadRatio) + index * 0.7) * 0.5 + 0.5;
        plume.scale.setScalar(0.88 + phase * 0.18 + puePressure * 0.55);
        plume.material.opacity = 0.08 + puePressure * 0.28 + phase * 0.04;
      });

      pulses.forEach((pulse, index) => {
        const phase = (elapsed * (0.7 + puePressure) + index * 0.22) % 1;
        pulse.position.y = 0.08 + phase * 2.6;
        pulse.material.opacity = 1 - phase;
      });

      keyedObjects.forEach((objects, key) => {
        const selected = key === activeKeyRef.current;
        objects.forEach((object) => {
          object.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
              if (child.userData.baseEmissive === undefined) {
                child.userData.baseEmissive = child.material.emissive.getHex();
              }
              child.material.emissive.setHex(selected ? 0x0f8b8d : child.userData.baseEmissive);
              child.material.emissiveIntensity = selected ? 0.55 + Math.sin(elapsed * 4) * 0.18 : 0.08;
            }
          });
        });
      });

      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const resize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      frameCamera();
    };

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      controls.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      mount.removeChild(renderer.domElement);
    };
  }, [coolingType, rackDensityKw, redundancyLevel, layoutKey]);

  const activeComponent = schematicComponents.find((component) => component.key === activeKey) ?? schematicComponents[0];

  return (
    <div className="relative overflow-hidden bg-[#0d1b18]">
      <div className="pointer-events-none absolute left-4 right-4 top-4 z-10 flex items-start justify-between gap-3 text-white">
        <div>
          <p className="text-xs font-semibold uppercase text-[#79d6c9]">Live 3D simulator</p>
          <p className="text-sm text-white/72">Drag to orbit. Scroll to zoom. Click equipment to inspect it.</p>
          <p className="mt-2 text-sm font-semibold text-[#79d6c9]">Layout: {dataCenterLayouts.find((item) => item.key === layoutKey)?.label}</p>
          <p className="mt-2 text-sm font-semibold text-white">Inspecting: {activeComponent.label}</p>
        </div>
        <div className="hidden flex-col items-end gap-3 md:flex">
          <div className="flex gap-2 text-xs">
            <span className="rounded bg-[#0f8b8d] px-2 py-1">cold air</span>
            <span className="rounded bg-[#c16a15] px-2 py-1">hot air</span>
            <span className="rounded bg-[#4e79a7] px-2 py-1">chilled water</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-right">
            <SceneMetric label="PUE" value={formatNumber(outputs.pue, 2)} />
            <SceneMetric label="IT Load" value={formatKw(outputs.itPowerKw)} />
            <SceneMetric label="WUE" value={`${formatNumber(outputs.wueLitresPerKwh, 1)} L/kWh`} />
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 z-10 flex gap-2 overflow-x-auto pb-1">
        {schematicComponents.map((component) => (
          <button
            className={`shrink-0 rounded border px-3 py-2 text-xs font-semibold text-white transition ${
              activeKey === component.key
                ? "border-white bg-[var(--accent)]"
                : "border-white/20 bg-[#10201d]/80 hover:border-white/60"
            }`}
            key={component.key}
            onClick={() => onSelect(component.key)}
            type="button"
          >
            {component.label}
          </button>
        ))}
      </div>
      <div
        aria-label="Interactive 3D tropical data centre simulator"
        className="h-[58vh] min-h-[440px] w-full sm:min-h-[560px]"
        ref={mountRef}
      />
    </div>
  );
}

function SceneMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-white/15 bg-[#10201d]/80 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase text-[#79d6c9]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function getCameraPreset(key: ComponentKey, compact: boolean) {
  const presets: Record<ComponentKey, { position: THREE.Vector3; target: THREE.Vector3 }> = {
    racks: {
      position: new THREE.Vector3(7.8, 5.9, compact ? 17 : 11.5),
      target: new THREE.Vector3(-2.5, 1.35, 0.2),
    },
    coldAisle: {
      position: new THREE.Vector3(4.6, 4.8, compact ? 14 : 8.8),
      target: new THREE.Vector3(-2.4, 1.15, 0),
    },
    hotAisle: {
      position: new THREE.Vector3(4.4, 5.2, compact ? -13 : -8.6),
      target: new THREE.Vector3(-2.3, 1.35, -2.45),
    },
    crah: {
      position: new THREE.Vector3(8.2, 4.7, compact ? 10 : 6.2),
      target: new THREE.Vector3(2.55, 1.05, 0),
    },
    pump: {
      position: new THREE.Vector3(8.6, 4.4, compact ? -8 : -5.2),
      target: new THREE.Vector3(5.2, 0.9, -2.6),
    },
    chiller: {
      position: new THREE.Vector3(9.4, 4.6, compact ? 4.8 : 2.8),
      target: new THREE.Vector3(5.4, 0.85, 0),
    },
    tower: {
      position: new THREE.Vector3(9.5, 4.9, compact ? 9 : 5.8),
      target: new THREE.Vector3(6.4, 1.2, 2.6),
    },
    grid: {
      position: new THREE.Vector3(-1.8, 5.1, compact ? 12 : 8),
      target: new THREE.Vector3(-6.7, 1.5, 3.4),
    },
  };

  return presets[key];
}

function buildRoom(scene: THREE.Scene, layoutKey: DataCenterLayoutKey) {
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(15, 0.12, 9),
    new THREE.MeshStandardMaterial({ color: 0x182925, roughness: 0.72, metalness: 0.08 }),
  );
  floor.receiveShadow = true;
  floor.position.y = -0.08;
  scene.add(floor);

  const grid = new THREE.GridHelper(15, 15, 0x6aa69b, 0x28433d);
  grid.position.y = 0.01;
  scene.add(grid);

  const tileMaterial = new THREE.MeshStandardMaterial({ color: 0x213a34, roughness: 0.68, metalness: 0.08 });
  const ventMaterial = new THREE.MeshStandardMaterial({ color: 0x0f8b8d, emissive: 0x0f8b8d, emissiveIntensity: 0.18 });
  const ventEnd = layoutKey === "hybrid_cooling_campus" ? 3.2 : layoutKey === "liquid_cooling_pod" ? 0.8 : 1.8;
  for (let x = -5.8; x <= ventEnd; x += 1.1) {
    const tile = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.018, 0.86), tileMaterial.clone());
    tile.position.set(x, 0.035, 0);
    scene.add(tile);

    for (let slot = -0.24; slot <= 0.24; slot += 0.16) {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.012, 0.54), ventMaterial.clone());
      vent.position.set(x + slot, 0.052, 0);
      scene.add(vent);
    }
  }

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(15, 3.2, 0.14),
    new THREE.MeshStandardMaterial({ color: 0x14231f, roughness: 0.84 }),
  );
  backWall.position.set(0, 1.55, -4.52);
  backWall.receiveShadow = true;
  scene.add(backWall);

  const sideWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 3.2, 9),
    new THREE.MeshStandardMaterial({ color: 0x172a25, roughness: 0.84 }),
  );
  sideWall.position.set(-7.55, 1.55, 0);
  sideWall.receiveShadow = true;
  scene.add(sideWall);

  const ceilingRails = new THREE.Group();
  for (let i = -6; i <= 6; i += 2) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.04, 8.6),
      new THREE.MeshStandardMaterial({ color: 0x35514a, roughness: 0.5 }),
    );
    rail.position.set(i, 3.15, 0);
    ceilingRails.add(rail);
  }
  for (let i = -5; i <= 5; i += 2.5) {
    const light = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.035, 0.16),
      new THREE.MeshStandardMaterial({ color: 0xe5fff8, emissive: 0x79d6c9, emissiveIntensity: 0.7 }),
    );
    light.position.set(i, 3.08, -3.65);
    ceilingRails.add(light);
  }
  scene.add(ceilingRails);

  if (layoutKey === "hybrid_cooling_campus") {
    const planningLane = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.025, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x4e79a7, emissive: 0x4e79a7, emissiveIntensity: 0.18, transparent: true, opacity: 0.32 }),
    );
    planningLane.position.set(-0.5, 0.07, 3.35);
    scene.add(planningLane);
  }
}

function buildRackRows(
  scene: THREE.Scene,
  register: (object: THREE.Object3D, key: ComponentKey) => void,
  layoutKey: DataCenterLayoutKey,
  inputs: GeometryInputs,
) {
  const rackGroup = new THREE.Group();
  const rackMaterial = new THREE.MeshStandardMaterial({ color: 0x111f1d, roughness: 0.45, metalness: 0.4 });
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x233834, roughness: 0.35, metalness: 0.55 });
  const ledMaterial = new THREE.MeshStandardMaterial({ color: 0x79d6c9, emissive: 0x0f8b8d, emissiveIntensity: 0.5 });
  const densityRatio = THREE.MathUtils.clamp(inputs.rackDensityKw / 50, 0.1, 1);
  const rackHeight = 2.1 + densityRatio * 0.72;
  const rackDepth = inputs.coolingType === "direct_to_chip_liquid_cooling" ? 1.05 : 0.9;

  const rackRows = layoutKey === "liquid_cooling_pod" || inputs.rackDensityKw >= 30 ? [-2.2, -0.75, 0.75, 2.2] : layoutKey === "hybrid_cooling_campus" ? [-2.25, 0, 2.25] : [-1.7, 1.7];
  const rackCount = layoutKey === "liquid_cooling_pod" ? 4 : layoutKey === "hybrid_cooling_campus" ? 7 : inputs.rackDensityKw >= 30 ? 5 : 6;
  const rackStart = layoutKey === "hybrid_cooling_campus" ? -5.55 : layoutKey === "liquid_cooling_pod" ? -4.75 : -4.9;
  const rackSpacing = layoutKey === "hybrid_cooling_campus" ? 0.92 : 1.05;

  rackRows.forEach((z) => {
    for (let i = 0; i < rackCount; i += 1) {
      const rack = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.78, rackHeight, rackDepth), rackMaterial.clone());
      body.castShadow = true;
      body.receiveShadow = true;
      register(body, "racks");
      rack.add(body);

      const door = new THREE.Mesh(new THREE.BoxGeometry(0.68, rackHeight - 0.35, 0.04), doorMaterial.clone());
      door.position.set(0, 0, z < 0 ? rackDepth / 2 + 0.02 : -rackDepth / 2 - 0.02);
      register(door, "racks");
      rack.add(door);

      const slatCount = inputs.rackDensityKw >= 30 ? 11 : 8;
      for (let slatIndex = 0; slatIndex < slatCount; slatIndex += 1) {
        const slat = new THREE.Mesh(
          new THREE.BoxGeometry(0.52, 0.018, 0.018),
          new THREE.MeshStandardMaterial({ color: 0x6f8881, emissive: 0x0f8b8d, emissiveIntensity: 0.08 }),
        );
        slat.position.set(0, -rackHeight / 2 + 0.35 + slatIndex * ((rackHeight - 0.7) / slatCount), z < 0 ? rackDepth / 2 + 0.05 : -rackDepth / 2 - 0.05);
        rack.add(slat);
      }

      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.42, 0.035),
        new THREE.MeshStandardMaterial({ color: 0xdbe7e2, roughness: 0.35, metalness: 0.7 }),
      );
      handle.position.set(0.26, 0, z < 0 ? rackDepth / 2 + 0.07 : -rackDepth / 2 - 0.07);
      rack.add(handle);

      for (let ledIndex = 0; ledIndex < 4; ledIndex += 1) {
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.03), ledMaterial.clone());
        led.position.set(-0.27 + ledIndex * 0.18, rackHeight / 2 - 0.45, z < 0 ? rackDepth / 2 + 0.08 : -rackDepth / 2 - 0.08);
        rack.add(led);
      }

      if (inputs.coolingType === "direct_to_chip_liquid_cooling") {
        const rearDoor = new THREE.Mesh(
          new THREE.BoxGeometry(0.72, rackHeight - 0.25, 0.08),
          new THREE.MeshStandardMaterial({ color: 0x1f3f54, emissive: 0x4e79a7, emissiveIntensity: 0.18, transparent: true, opacity: 0.72 }),
        );
        rearDoor.position.set(0, 0, z < 0 ? -rackDepth / 2 - 0.08 : rackDepth / 2 + 0.08);
        register(rearDoor, "racks");
        rack.add(rearDoor);
      }

      rack.position.set(rackStart + i * rackSpacing, rackHeight / 2, z);
      rackGroup.add(rack);
    }
  });

  const trayMaterial = new THREE.MeshStandardMaterial({ color: 0x4c6b63, roughness: 0.45, metalness: 0.35 });
  rackRows.forEach((z) => {
    const trayLength = rackCount * rackSpacing + 0.5;
    const tray = new THREE.Mesh(new THREE.BoxGeometry(trayLength, 0.08, 0.16), trayMaterial.clone());
    tray.position.set(rackStart + ((rackCount - 1) * rackSpacing) / 2, 2.55, z);
    rackGroup.add(tray);
    for (let i = 0; i < 7; i += 1) {
      const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 6.6, 8),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x79d6c9 : 0xf6a94c, roughness: 0.4 }),
      );
      cable.rotation.z = Math.PI / 2;
      cable.position.set(rackStart + ((rackCount - 1) * rackSpacing) / 2, 2.63 + i * 0.018, z - 0.05 + i * 0.016);
      rackGroup.add(cable);
    }
  });

  if (layoutKey === "liquid_cooling_pod" || inputs.coolingType === "direct_to_chip_liquid_cooling") {
    const manifoldMaterial = new THREE.MeshStandardMaterial({ color: 0x4e79a7, emissive: 0x4e79a7, emissiveIntensity: 0.32, roughness: 0.3, metalness: 0.35 });
    const manifoldRows = rackRows.length > 2 ? [-2.85, 2.85] : [-2.25, 2.25];
    manifoldRows.forEach((z) => {
      const manifold = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 5.1, 16), manifoldMaterial.clone());
      manifold.rotation.z = Math.PI / 2;
      manifold.position.set(-3.2, 1.9, z);
      register(manifold, "pump");
      rackGroup.add(manifold);
    });
  }

  rackGroup.add(createLabel("IT racks", -2.25, 2.85, layoutKey === "liquid_cooling_pod" ? 2.9 : 2.38));
  scene.add(rackGroup);
}

function buildAisles(
  scene: THREE.Scene,
  register: (object: THREE.Object3D, key: ComponentKey) => void,
  thermalPlumes: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial>[],
  layoutKey: DataCenterLayoutKey,
) {
  const coldLength = layoutKey === "hybrid_cooling_campus" ? 7.4 : layoutKey === "liquid_cooling_pod" ? 5.3 : 6.7;
  const coldWidth = layoutKey === "liquid_cooling_pod" ? 0.72 : 0.9;
  const cold = new THREE.Mesh(
    new THREE.BoxGeometry(coldLength, 0.04, coldWidth),
    new THREE.MeshStandardMaterial({ color: 0x0f8b8d, emissive: 0x0f8b8d, emissiveIntensity: 0.24, transparent: true, opacity: 0.42 }),
  );
  cold.position.set(-2.25, 0.05, 0);
  register(cold, "coldAisle");
  scene.add(cold);

  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x79d6c9,
    emissive: 0x0f8b8d,
    emissiveIntensity: 0.12,
    transparent: true,
    opacity: 0.18,
    roughness: 0.2,
    metalness: 0.05,
  });

  const panelZ = layoutKey === "liquid_cooling_pod" ? [-0.42, 0.42] : [-0.62, 0.62];
  panelZ.forEach((z) => {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(coldLength, 2.15, 0.04), panelMaterial.clone());
    panel.position.set(-2.25, 1.26, z);
    register(panel, "coldAisle");
    scene.add(panel);
  });

  const canopy = new THREE.Mesh(new THREE.BoxGeometry(coldLength, 0.05, layoutKey === "liquid_cooling_pod" ? 0.9 : 1.28), panelMaterial.clone());
  canopy.position.set(-2.25, 2.36, 0);
  register(canopy, "coldAisle");
  scene.add(canopy);

  const hotLength = layoutKey === "hybrid_cooling_campus" ? 7.4 : coldLength;
  const hotA = new THREE.Mesh(
    new THREE.BoxGeometry(hotLength, 0.04, 0.7),
    new THREE.MeshStandardMaterial({ color: 0xc16a15, emissive: 0xc16a15, emissiveIntensity: 0.2, transparent: true, opacity: 0.34 }),
  );
  hotA.position.set(-2.25, 0.06, -2.65);
  register(hotA, "hotAisle");
  scene.add(hotA);

  const hotB = hotA.clone();
  hotB.material = (hotA.material as THREE.MeshStandardMaterial).clone();
  hotB.position.z = 2.65;
  register(hotB, "hotAisle");
  scene.add(hotB);

  const plumeRows = layoutKey === "liquid_cooling_pod" ? [-2.95, -1.35, 1.35, 2.95] : [-2.72, 2.72];
  plumeRows.forEach((z) => {
    const plumeCount = layoutKey === "hybrid_cooling_campus" ? 6 : 5;
    for (let i = 0; i < plumeCount; i += 1) {
      const plume = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18 + i * 0.02, 0.08, 0.9, 18),
        new THREE.MeshStandardMaterial({
          color: 0xf6a94c,
          emissive: 0xc16a15,
          emissiveIntensity: 0.18,
          transparent: true,
          opacity: 0.12,
          roughness: 0.8,
        }),
      );
      plume.position.set(-4.8 + i * 1.2, 1.65 + i * 0.05, z);
      register(plume, "hotAisle");
      thermalPlumes.push(plume);
      scene.add(plume);
    }
  });

  scene.add(createLabel("cold aisle", -2.25, 0.32, 0));
  scene.add(createLabel(layoutKey === "liquid_cooling_pod" ? "dense hot return" : "hot aisles", -5.3, 0.36, -2.65));
}

function buildCoolingUnits(
  scene: THREE.Scene,
  register: (object: THREE.Object3D, key: ComponentKey) => void,
  fans: THREE.Object3D[],
  layoutKey: DataCenterLayoutKey,
  inputs: GeometryInputs,
) {
  const unitMaterial = new THREE.MeshStandardMaterial({ color: 0x29443e, roughness: 0.48, metalness: 0.25 });
  const fanMaterial = new THREE.MeshStandardMaterial({ color: 0x79d6c9, emissive: 0x0f8b8d, emissiveIntensity: 0.32 });
  const liquidMode = inputs.coolingType === "direct_to_chip_liquid_cooling";
  const unitPositions = liquidMode ? [-2.1, 2.1] : layoutKey === "hybrid_cooling_campus" ? [-3, -1, 1, 3] : [-2.4, 0, 2.4];

  unitPositions.forEach((z) => {
    const crah = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(liquidMode ? 0.85 : 1.1, liquidMode ? 1.35 : 1.8, 1.0), unitMaterial.clone());
    body.castShadow = true;
    body.receiveShadow = true;
    register(body, "crah");
    crah.add(body);

    const coil = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 1.05, 0.72),
      new THREE.MeshStandardMaterial({ color: 0x79d6c9, emissive: 0x0f8b8d, emissiveIntensity: 0.22, roughness: 0.35 }),
    );
    coil.position.set(-0.59, 0.35, 0);
    register(coil, "crah");
    crah.add(coil);

    for (let ventIndex = 0; ventIndex < 5; ventIndex += 1) {
      const vent = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.04, 0.72),
        new THREE.MeshStandardMaterial({ color: 0xdbe7e2, roughness: 0.45, metalness: 0.45 }),
      );
      vent.position.set(-0.62, -0.42 + ventIndex * 0.18, 0);
      crah.add(vent);
    }

    const fan = createFan(fanMaterial.clone());
    fan.position.set(-0.56, 0.28, 0);
    fan.rotation.y = Math.PI / 2;
    fans.push(fan);
    crah.add(fan);

    crah.position.set(layoutKey === "hybrid_cooling_campus" ? 3.15 : 2.55, liquidMode ? 0.7 : 0.9, z);
    scene.add(crah);
  });

  if (liquidMode) {
    const cduMaterial = new THREE.MeshStandardMaterial({ color: 0x1f3f54, emissive: 0x4e79a7, emissiveIntensity: 0.2, roughness: 0.38, metalness: 0.3 });
    [-1.2, 1.2].forEach((z) => {
      const cdu = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.8), cduMaterial.clone());
      cdu.position.set(1.35, 0.55, z);
      cdu.castShadow = true;
      register(cdu, "pump");
      scene.add(cdu);
    });
    scene.add(createLabel("liquid CDU", 1.35, 1.55, 1.2));
  }

  scene.add(createLabel(liquidMode ? "trim air units" : "CRAH / CRAC", layoutKey === "hybrid_cooling_campus" ? 3.15 : 2.55, 2.35, 2.4));
}

function buildPlant(
  scene: THREE.Scene,
  register: (object: THREE.Object3D, key: ComponentKey) => void,
  fans: THREE.Object3D[],
  layoutKey: DataCenterLayoutKey,
  inputs: GeometryInputs,
) {
  const pump = new THREE.Group();
  const pumpBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.9, 32),
    new THREE.MeshStandardMaterial({ color: 0x31544d, roughness: 0.38, metalness: 0.38 }),
  );
  pumpBody.rotation.z = Math.PI / 2;
  pumpBody.castShadow = true;
  register(pumpBody, "pump");
  pump.add(pumpBody);
  const pumpBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.16, 0.72),
    new THREE.MeshStandardMaterial({ color: 0x1a2e29, roughness: 0.55, metalness: 0.25 }),
  );
  pumpBase.position.y = -0.48;
  register(pumpBase, "pump");
  pump.add(pumpBase);
  const pumpFan = createFan(new THREE.MeshStandardMaterial({ color: 0x91e6d9, emissive: 0x0f8b8d, emissiveIntensity: 0.3 }));
  pumpFan.scale.setScalar(0.7);
  pumpFan.position.set(0.52, 0, 0);
  fans.push(pumpFan);
  pump.add(pumpFan);
  pump.position.set(layoutKey === "liquid_cooling_pod" ? 4.6 : 5.2, 0.9, layoutKey === "liquid_cooling_pod" ? -1.9 : -2.6);
  scene.add(pump);

  const chiller = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 1.2, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x253d39, roughness: 0.42, metalness: 0.28 }),
  );
  chiller.position.set(layoutKey === "liquid_cooling_pod" ? 5.2 : 5.4, 0.6, 0);
  chiller.castShadow = true;
  chiller.receiveShadow = true;
  register(chiller, "chiller");
  scene.add(chiller);

  for (let i = 0; i < 6; i += 1) {
    const coilLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.82, 0.035),
      new THREE.MeshStandardMaterial({ color: 0x79d6c9, emissive: 0x0f8b8d, emissiveIntensity: 0.18 }),
    );
    coilLine.position.set(layoutKey === "liquid_cooling_pod" ? 4.28 : 4.48, 0.75, -0.42 + i * 0.17);
    register(coilLine, "chiller");
    scene.add(coilLine);
  }

  const controlPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.42, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x111f1d, emissive: 0x79d6c9, emissiveIntensity: 0.12 }),
  );
  controlPanel.position.set(layoutKey === "liquid_cooling_pod" ? 6.12 : 6.32, 0.78, 0);
  register(controlPanel, "chiller");
  scene.add(controlPanel);

  const tower = new THREE.Group();
  const basin = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.22, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x203631, roughness: 0.58, metalness: 0.2 }),
  );
  basin.position.y = 0.1;
  register(basin, "tower");
  tower.add(basin);

  const towerBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.9, 1.8, 6),
    new THREE.MeshStandardMaterial({ color: 0x31443f, roughness: 0.55, metalness: 0.2 }),
  );
  towerBody.position.y = 0.9;
  towerBody.castShadow = true;
  register(towerBody, "tower");
  tower.add(towerBody);
  const topFan = createFan(new THREE.MeshStandardMaterial({ color: 0xf6a94c, emissive: 0xc16a15, emissiveIntensity: 0.22 }));
  topFan.position.y = 1.86;
  fans.push(topFan);
  tower.add(topFan);
  for (let i = 0; i < 4; i += 1) {
    const mist = new THREE.Mesh(
      new THREE.SphereGeometry(0.18 + i * 0.04, 14, 14),
      new THREE.MeshStandardMaterial({
        color: 0xdbe7e2,
        emissive: 0x79d6c9,
        emissiveIntensity: 0.1,
        transparent: true,
        opacity: 0.12,
      }),
    );
    mist.position.set(-0.15 + i * 0.1, 2.1 + i * 0.18, 0.05 - i * 0.08);
    tower.add(mist);
  }
  tower.position.set(layoutKey === "liquid_cooling_pod" ? 6.0 : 6.4, 0, layoutKey === "liquid_cooling_pod" ? 2.1 : 2.6);
  scene.add(tower);

  if (inputs.redundancyLevel !== "N") {
    const standbyCount = inputs.redundancyLevel === "2N" ? 2 : 1;
    for (let index = 0; index < standbyCount; index += 1) {
      const offset = index * 0.72;
      const standbyChiller = new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 0.86, 0.82),
        new THREE.MeshStandardMaterial({
          color: 0x31443f,
          emissive: 0x79d6c9,
          emissiveIntensity: 0.08,
          transparent: true,
          opacity: inputs.redundancyLevel === "2N" ? 0.9 : 0.62,
          roughness: 0.45,
          metalness: 0.24,
        }),
      );
      standbyChiller.position.set(4.35 + offset, 0.43, -3.35);
      standbyChiller.castShadow = true;
      register(standbyChiller, "chiller");
      scene.add(standbyChiller);

      const standbyPump = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.72, 24),
        new THREE.MeshStandardMaterial({
          color: 0x31544d,
          emissive: 0x4e79a7,
          emissiveIntensity: 0.08,
          transparent: true,
          opacity: inputs.redundancyLevel === "2N" ? 0.9 : 0.62,
          roughness: 0.38,
          metalness: 0.38,
        }),
      );
      standbyPump.rotation.z = Math.PI / 2;
      standbyPump.position.set(5.85 + offset, 0.55, -3.35);
      standbyPump.castShadow = true;
      register(standbyPump, "pump");
      scene.add(standbyPump);
    }
    scene.add(createLabel(`${inputs.redundancyLevel} standby plant`, 5.25, 1.25, -3.35));
  }

  if (layoutKey === "hybrid_cooling_campus") {
    const dryCoolerMaterial = new THREE.MeshStandardMaterial({ color: 0x2a403b, roughness: 0.44, metalness: 0.25 });
    [1.35, 2.35, 3.35].forEach((z, index) => {
      const dryCooler = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.85, 0.72), dryCoolerMaterial.clone());
      dryCooler.position.set(4.55 + index * 0.95, 0.52, z);
      dryCooler.castShadow = true;
      register(dryCooler, "tower");
      scene.add(dryCooler);
      const fan = createFan(new THREE.MeshStandardMaterial({ color: 0xdbe7e2, emissive: 0x79d6c9, emissiveIntensity: 0.18 }));
      fan.scale.setScalar(0.62);
      fan.rotation.x = Math.PI / 2;
      fan.position.set(4.55 + index * 0.95, 0.98, z);
      fans.push(fan);
      scene.add(fan);
    });
    scene.add(createLabel("hybrid dry coolers", 5.55, 1.45, 3.45));
  }

  scene.add(createLabel("pump", layoutKey === "liquid_cooling_pod" ? 4.6 : 5.2, 1.75, layoutKey === "liquid_cooling_pod" ? -1.9 : -2.6));
  scene.add(createLabel("chiller", layoutKey === "liquid_cooling_pod" ? 5.2 : 5.4, 1.55, 0));
  scene.add(createLabel("heat rejection", layoutKey === "liquid_cooling_pod" ? 6.0 : 6.4, 2.45, layoutKey === "liquid_cooling_pod" ? 2.1 : 2.6));
}

function buildGrid(
  scene: THREE.Scene,
  register: (object: THREE.Object3D, key: ComponentKey) => void,
  pulses: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>[],
) {
  const gridGroup = new THREE.Group();
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x4d5f59, roughness: 0.5, metalness: 0.3 });
  const wireMaterial = new THREE.MeshStandardMaterial({ color: 0xdbe7e2, emissive: 0xdbe7e2, emissiveIntensity: 0.15 });

  const pole = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.9, 0.16), poleMaterial);
  pole.position.y = 1.45;
  register(pole, "grid");
  gridGroup.add(pole);

  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.08), poleMaterial);
  bar.position.y = 2.72;
  register(bar, "grid");
  gridGroup.add(bar);

  [-0.42, 0, 0.42].forEach((x) => {
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 4.7, 12), wireMaterial.clone());
    wire.rotation.x = Math.PI / 2;
    wire.position.set(x, 2.62, -2.35);
    register(wire, "grid");
    gridGroup.add(wire);
  });

  for (let i = 0; i < 5; i += 1) {
    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf2f7f5, emissive: 0x79d6c9, emissiveIntensity: 0.8, transparent: true, opacity: 1 }),
    );
    pulse.position.set(0, 0.1 + i * 0.4, -4.1);
    pulses.push(pulse);
    gridGroup.add(pulse);
  }

  gridGroup.position.set(-6.7, 0, 3.4);
  gridGroup.add(createLabel("grid power", 0, 3.3, 0));
  scene.add(gridGroup);
}

function buildFlow(scene: THREE.Scene, particles: FlowParticle[], layoutKey: DataCenterLayoutKey) {
  const coldMaterial = new THREE.MeshStandardMaterial({ color: 0x79d6c9, emissive: 0x0f8b8d, emissiveIntensity: 0.72 });
  const hotMaterial = new THREE.MeshStandardMaterial({ color: 0xf6a94c, emissive: 0xc16a15, emissiveIntensity: 0.65 });
  const waterMaterial = new THREE.MeshStandardMaterial({ color: 0x4e79a7, emissive: 0x4e79a7, emissiveIntensity: 0.5 });
  const coldCount = layoutKey === "liquid_cooling_pod" ? 20 : layoutKey === "hybrid_cooling_campus" ? 46 : 36;
  const hotCount = layoutKey === "liquid_cooling_pod" ? 34 : layoutKey === "hybrid_cooling_campus" ? 32 : 24;
  const waterCount = layoutKey === "liquid_cooling_pod" ? 46 : layoutKey === "hybrid_cooling_campus" ? 34 : 24;

  for (let i = 0; i < coldCount; i += 1) {
    addParticle(scene, particles, coldMaterial.clone(), new THREE.Vector3(2.0, 0.55 + (i % 4) * 0.18, 0), new THREE.Vector3(-5.3, 0.55 + (i % 4) * 0.18, 0), i / 36, 0.18, "cold");
  }

  for (let i = 0; i < hotCount; i += 1) {
    const hotRows = layoutKey === "liquid_cooling_pod" ? [-2.9, -1.35, 1.35, 2.9] : [-2.55, 2.55];
    const z = hotRows[i % hotRows.length];
    addParticle(scene, particles, hotMaterial.clone(), new THREE.Vector3(-5.3, 1.85, z), new THREE.Vector3(2.4, 1.5, z), i / 24, 0.14, "hot");
  }

  for (let i = 0; i < waterCount; i += 1) {
    const waterRows = layoutKey === "liquid_cooling_pod" ? [-2.6, -1.2, 1.2, 2.6] : [-1.8, 1.8];
    const z = waterRows[i % waterRows.length];
    addParticle(scene, particles, waterMaterial.clone(), new THREE.Vector3(layoutKey === "liquid_cooling_pod" ? 1.35 : 3.2, 0.35, z), new THREE.Vector3(5.8, 0.35, z), i / 24, 0.12, "water");
  }
}

function buildLoopPipes(scene: THREE.Scene, layoutKey: DataCenterLayoutKey) {
  const pipeMaterial = new THREE.MeshStandardMaterial({ color: 0x4e79a7, roughness: 0.35, metalness: 0.35 });
  const pipeSegments = layoutKey === "liquid_cooling_pod" ? [
    [1.35, 0.25, -2.6, 4.6, 0.25, -1.9],
    [1.35, 0.25, 2.6, 4.6, 0.25, -1.9],
    [4.6, 0.25, -1.9, 5.2, 0.25, 0],
    [5.2, 0.25, 0, 6.0, 0.25, 2.1],
  ] : [
    [3.4, 0.25, -2.6, 5.2, 0.25, -2.6],
    [5.2, 0.25, -2.6, 5.4, 0.25, 0],
    [5.4, 0.25, 0, 6.4, 0.25, 2.6],
    [6.4, 0.25, 2.6, 3.4, 0.25, 2.4],
  ];
  pipeSegments.forEach(([x1, y1, z1, x2, y2, z2]) => {
    scene.add(createPipe(new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2), pipeMaterial.clone()));
  });
}

function addParticle(
  scene: THREE.Scene,
  particles: FlowParticle[],
  material: THREE.MeshStandardMaterial,
  start: THREE.Vector3,
  end: THREE.Vector3,
  offset: number,
  speed: number,
  kind: FlowParticle["kind"],
) {
  const particle = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), material);
  particle.material.transparent = true;
  particle.position.copy(start);
  scene.add(particle);
  particles.push({ mesh: particle, start, end, offset, speed, kind });
}

function createFan(material: THREE.MeshStandardMaterial) {
  const fan = new THREE.Group();
  for (let i = 0; i < 4; i += 1) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.03), material);
    blade.position.y = 0.19;
    blade.rotation.z = (Math.PI / 2) * i;
    fan.add(blade);
  }
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), material.clone());
  fan.add(hub);
  return fan;
}

function createPipe(start: THREE.Vector3, end: THREE.Vector3, material: THREE.MeshStandardMaterial) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, length, 16), material);
  pipe.position.copy(start).add(direction.multiplyScalar(0.5));
  pipe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(end, start).normalize());
  return pipe;
}

function createLabel(text: string, x: number, y: number, z: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "rgba(13, 27, 24, 0.72)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(121, 214, 201, 0.8)";
    context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
    context.font = "700 42px Arial";
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.position.set(x, y, z);
  sprite.scale.set(1.8, 0.45, 1);
  return sprite;
}

function findComponentKey(object?: THREE.Object3D): ComponentKey | null {
  let current = object;
  while (current) {
    if (current.userData.componentKey) {
      return current.userData.componentKey as ComponentKey;
    }
    current = current.parent ?? undefined;
  }
  return null;
}
