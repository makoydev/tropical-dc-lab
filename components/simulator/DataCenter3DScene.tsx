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
  outputs: SimulationOutputs;
  onSelect: (key: ComponentKey) => void;
}

interface FlowParticle {
  mesh: THREE.Mesh;
  start: THREE.Vector3;
  end: THREE.Vector3;
  offset: number;
  speed: number;
}

export function DataCenter3DScene({ activeKey, inputs, outputs, onSelect }: DataCenter3DSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const onSelectRef = useRef(onSelect);
  const activeKeyRef = useRef(activeKey);
  const inputsRef = useRef(inputs);
  const outputsRef = useRef(outputs);

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

    const register = (object: THREE.Object3D, key: ComponentKey) => {
      object.userData.componentKey = key;
      selectable.push(object);
      keyedObjects.set(key, [...(keyedObjects.get(key) ?? []), object]);
    };

    buildRoom(scene);
    buildRackRows(scene, register);
    buildAisles(scene, register);
    buildCoolingUnits(scene, register, fans);
    buildPlant(scene, register, fans);
    buildGrid(scene, register, pulses);
    buildFlow(scene, flowParticles);
    buildLoopPipes(scene);

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
        particle.offset = (particle.offset + delta * particle.speed * (0.65 + loadRatio)) % 1;
        particle.mesh.position.lerpVectors(particle.start, particle.end, particle.offset);
        const scale = 0.75 + Math.sin((particle.offset + elapsed) * Math.PI * 2) * 0.18;
        particle.mesh.scale.setScalar(scale);
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
  }, []);

  const activeComponent = schematicComponents.find((component) => component.key === activeKey) ?? schematicComponents[0];

  return (
    <div className="relative overflow-hidden bg-[#0d1b18]">
      <div className="pointer-events-none absolute left-4 right-4 top-4 z-10 flex items-start justify-between gap-3 text-white">
        <div>
          <p className="text-xs font-semibold uppercase text-[#79d6c9]">Live 3D simulator</p>
          <p className="text-sm text-white/72">Drag to orbit. Scroll to zoom. Click equipment to inspect it.</p>
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

function buildRoom(scene: THREE.Scene) {
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
  for (let x = -5.8; x <= 1.8; x += 1.1) {
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
}

function buildRackRows(scene: THREE.Scene, register: (object: THREE.Object3D, key: ComponentKey) => void) {
  const rackGroup = new THREE.Group();
  const rackMaterial = new THREE.MeshStandardMaterial({ color: 0x111f1d, roughness: 0.45, metalness: 0.4 });
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x233834, roughness: 0.35, metalness: 0.55 });
  const ledMaterial = new THREE.MeshStandardMaterial({ color: 0x79d6c9, emissive: 0x0f8b8d, emissiveIntensity: 0.5 });

  [-1.7, 1.7].forEach((z) => {
    for (let i = 0; i < 6; i += 1) {
      const rack = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.78, 2.4, 0.9), rackMaterial.clone());
      body.castShadow = true;
      body.receiveShadow = true;
      register(body, "racks");
      rack.add(body);

      const door = new THREE.Mesh(new THREE.BoxGeometry(0.68, 2.05, 0.04), doorMaterial.clone());
      door.position.set(0, 0, z < 0 ? 0.47 : -0.47);
      register(door, "racks");
      rack.add(door);

      for (let slatIndex = 0; slatIndex < 8; slatIndex += 1) {
        const slat = new THREE.Mesh(
          new THREE.BoxGeometry(0.52, 0.018, 0.018),
          new THREE.MeshStandardMaterial({ color: 0x6f8881, emissive: 0x0f8b8d, emissiveIntensity: 0.08 }),
        );
        slat.position.set(0, -0.76 + slatIndex * 0.2, z < 0 ? 0.5 : -0.5);
        rack.add(slat);
      }

      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.42, 0.035),
        new THREE.MeshStandardMaterial({ color: 0xdbe7e2, roughness: 0.35, metalness: 0.7 }),
      );
      handle.position.set(0.26, 0, z < 0 ? 0.52 : -0.52);
      rack.add(handle);

      for (let ledIndex = 0; ledIndex < 4; ledIndex += 1) {
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.03), ledMaterial.clone());
        led.position.set(-0.27 + ledIndex * 0.18, 0.65, z < 0 ? 0.51 : -0.51);
        rack.add(led);
      }

      rack.position.set(-4.9 + i * 1.05, 1.2, z);
      rackGroup.add(rack);
    }
  });

  const trayMaterial = new THREE.MeshStandardMaterial({ color: 0x4c6b63, roughness: 0.45, metalness: 0.35 });
  [-1.7, 1.7].forEach((z) => {
    const tray = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.08, 0.16), trayMaterial.clone());
    tray.position.set(-2.25, 2.55, z);
    rackGroup.add(tray);
    for (let i = 0; i < 7; i += 1) {
      const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 6.6, 8),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x79d6c9 : 0xf6a94c, roughness: 0.4 }),
      );
      cable.rotation.z = Math.PI / 2;
      cable.position.set(-2.25, 2.63 + i * 0.018, z - 0.05 + i * 0.016);
      rackGroup.add(cable);
    }
  });

  rackGroup.add(createLabel("IT racks", -2.25, 2.85, 2.38));
  scene.add(rackGroup);
}

function buildAisles(scene: THREE.Scene, register: (object: THREE.Object3D, key: ComponentKey) => void) {
  const cold = new THREE.Mesh(
    new THREE.BoxGeometry(6.7, 0.04, 0.9),
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

  [-0.62, 0.62].forEach((z) => {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(6.8, 2.15, 0.04), panelMaterial.clone());
    panel.position.set(-2.25, 1.26, z);
    register(panel, "coldAisle");
    scene.add(panel);
  });

  const canopy = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.05, 1.28), panelMaterial.clone());
  canopy.position.set(-2.25, 2.36, 0);
  register(canopy, "coldAisle");
  scene.add(canopy);

  const hotA = new THREE.Mesh(
    new THREE.BoxGeometry(6.7, 0.04, 0.7),
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

  [-2.72, 2.72].forEach((z) => {
    for (let i = 0; i < 5; i += 1) {
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
      scene.add(plume);
    }
  });

  scene.add(createLabel("cold aisle", -2.25, 0.32, 0));
  scene.add(createLabel("hot aisles", -5.3, 0.36, -2.65));
}

function buildCoolingUnits(
  scene: THREE.Scene,
  register: (object: THREE.Object3D, key: ComponentKey) => void,
  fans: THREE.Object3D[],
) {
  const unitMaterial = new THREE.MeshStandardMaterial({ color: 0x29443e, roughness: 0.48, metalness: 0.25 });
  const fanMaterial = new THREE.MeshStandardMaterial({ color: 0x79d6c9, emissive: 0x0f8b8d, emissiveIntensity: 0.32 });

  [-2.4, 0, 2.4].forEach((z) => {
    const crah = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.8, 1.0), unitMaterial.clone());
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

    crah.position.set(2.55, 0.9, z);
    scene.add(crah);
  });

  scene.add(createLabel("CRAH / CRAC", 2.55, 2.35, 2.4));
}

function buildPlant(
  scene: THREE.Scene,
  register: (object: THREE.Object3D, key: ComponentKey) => void,
  fans: THREE.Object3D[],
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
  pump.position.set(5.2, 0.9, -2.6);
  scene.add(pump);

  const chiller = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 1.2, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x253d39, roughness: 0.42, metalness: 0.28 }),
  );
  chiller.position.set(5.4, 0.6, 0);
  chiller.castShadow = true;
  chiller.receiveShadow = true;
  register(chiller, "chiller");
  scene.add(chiller);

  for (let i = 0; i < 6; i += 1) {
    const coilLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.82, 0.035),
      new THREE.MeshStandardMaterial({ color: 0x79d6c9, emissive: 0x0f8b8d, emissiveIntensity: 0.18 }),
    );
    coilLine.position.set(4.48, 0.75, -0.42 + i * 0.17);
    register(coilLine, "chiller");
    scene.add(coilLine);
  }

  const controlPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.42, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x111f1d, emissive: 0x79d6c9, emissiveIntensity: 0.12 }),
  );
  controlPanel.position.set(6.32, 0.78, 0);
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
  tower.position.set(6.4, 0, 2.6);
  scene.add(tower);

  scene.add(createLabel("pump", 5.2, 1.75, -2.6));
  scene.add(createLabel("chiller", 5.4, 1.55, 0));
  scene.add(createLabel("heat rejection", 6.4, 2.45, 2.6));
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

function buildFlow(scene: THREE.Scene, particles: FlowParticle[]) {
  const coldMaterial = new THREE.MeshStandardMaterial({ color: 0x79d6c9, emissive: 0x0f8b8d, emissiveIntensity: 0.72 });
  const hotMaterial = new THREE.MeshStandardMaterial({ color: 0xf6a94c, emissive: 0xc16a15, emissiveIntensity: 0.65 });
  const waterMaterial = new THREE.MeshStandardMaterial({ color: 0x4e79a7, emissive: 0x4e79a7, emissiveIntensity: 0.5 });

  for (let i = 0; i < 36; i += 1) {
    addParticle(scene, particles, coldMaterial.clone(), new THREE.Vector3(2.0, 0.55 + (i % 4) * 0.18, 0), new THREE.Vector3(-5.3, 0.55 + (i % 4) * 0.18, 0), i / 36, 0.18);
  }

  for (let i = 0; i < 24; i += 1) {
    const z = i % 2 === 0 ? -2.55 : 2.55;
    addParticle(scene, particles, hotMaterial.clone(), new THREE.Vector3(-5.3, 1.85, z), new THREE.Vector3(2.4, 1.5, z), i / 24, 0.14);
  }

  for (let i = 0; i < 24; i += 1) {
    const z = i % 2 === 0 ? -1.8 : 1.8;
    addParticle(scene, particles, waterMaterial.clone(), new THREE.Vector3(3.2, 0.35, z), new THREE.Vector3(5.8, 0.35, z), i / 24, 0.12);
  }
}

function buildLoopPipes(scene: THREE.Scene) {
  const pipeMaterial = new THREE.MeshStandardMaterial({ color: 0x4e79a7, roughness: 0.35, metalness: 0.35 });
  [
    [3.4, 0.25, -2.6, 5.2, 0.25, -2.6],
    [5.2, 0.25, -2.6, 5.4, 0.25, 0],
    [5.4, 0.25, 0, 6.4, 0.25, 2.6],
    [6.4, 0.25, 2.6, 3.4, 0.25, 2.4],
  ].forEach(([x1, y1, z1, x2, y2, z2]) => {
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
) {
  const particle = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), material);
  particle.position.copy(start);
  scene.add(particle);
  particles.push({ mesh: particle, start, end, offset, speed });
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
