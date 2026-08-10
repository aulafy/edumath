import { useEffect, useRef } from "react";
import * as THREE from "three";

type ThemeSceneProps = {
  theme: string;
};

function material(color: number, roughness = 0.8) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

function addDinosaurWorld(scene: THREE.Scene) {
  scene.background = new THREE.Color(0xbfe8f2);
  scene.fog = new THREE.Fog(0xbfe8f2, 9, 24);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(12, 48),
    material(0x73a942),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.65;
  scene.add(ground);

  const dinosaur = new THREE.Group();
  const green = material(0x3f7d4d, 0.65);
  const belly = material(0xb8d67a, 0.75);
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.05, 24, 16), green);
  body.scale.set(1.45, 0.85, 0.78);
  dinosaur.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 14), green);
  head.position.set(1.55, 0.75, 0);
  dinosaur.add(head);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 1.55, 16), green);
  neck.position.set(1.15, 0.28, 0);
  neck.rotation.z = -0.48;
  dinosaur.add(neck);

  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), belly);
  snout.scale.set(1.25, 0.65, 0.75);
  snout.position.set(1.9, 0.62, 0);
  dinosaur.add(snout);

  for (const z of [-0.48, 0.48]) {
    for (const x of [-0.72, 0.7]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 1.1, 12), green);
      leg.position.set(x, -0.75, z);
      dinosaur.add(leg);
    }
  }

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.42, 2.6, 16), green);
  tail.rotation.z = Math.PI / 2;
  tail.position.set(-1.85, 0.05, 0);
  dinosaur.add(tail);

  for (const z of [-0.37, 0.37]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), material(0x16221b));
    eye.position.set(1.84, 0.9, z);
    dinosaur.add(eye);
  }

  dinosaur.position.set(-2.8, -0.55, -2.2);
  dinosaur.rotation.y = -0.25;
  dinosaur.userData.animate = "dinosaur";
  scene.add(dinosaur);

  for (let index = 0; index < 7; index += 1) {
    const egg = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 12),
      material(index % 2 ? 0xf7df8b : 0xf4f0dc),
    );
    egg.scale.y = 1.3;
    egg.position.set(-1.2 + index * 0.55, -1.25, -0.1 + (index % 2) * 0.35);
    egg.userData.animate = "bob";
    egg.userData.phase = index * 0.7;
    scene.add(egg);
  }

  for (let index = 0; index < 11; index += 1) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 1.2, 8), material(0x7f5539));
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.5, 7), material(index % 2 ? 0x2f7d4a : 0x4f9b4f));
    const tree = new THREE.Group();
    trunk.position.y = -0.6;
    crown.position.y = 0.3;
    tree.add(trunk, crown);
    const angle = (index / 11) * Math.PI * 2;
    tree.position.set(Math.cos(angle) * 6.8, -0.95, Math.sin(angle) * 5.2 - 2);
    scene.add(tree);
  }
}

function addSpaceWorld(scene: THREE.Scene) {
  scene.background = new THREE.Color(0x11152f);
  scene.fog = new THREE.Fog(0x11152f, 12, 32);

  const starGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(360 * 3);
  for (let index = 0; index < positions.length; index += 3) {
    positions[index] = (Math.random() - 0.5) * 32;
    positions[index + 1] = (Math.random() - 0.5) * 19;
    positions[index + 2] = -4 - Math.random() * 18;
  }
  starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.065 })));

  const planetColors = [0x56b4d3, 0xe79f45, 0xb885d8];
  planetColors.forEach((color, index) => {
    const planet = new THREE.Mesh(new THREE.SphereGeometry(0.8 + index * 0.22, 30, 20), material(color, 0.7));
    planet.position.set(-5 + index * 4.8, 1.8 - index * 1.5, -4 - index * 1.8);
    planet.userData.animate = "planet";
    planet.userData.phase = index * 1.4;
    scene.add(planet);

    if (index === 1) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.45, 0.08, 12, 60),
        material(0xf2d88f),
      );
      ring.position.copy(planet.position);
      ring.rotation.x = 1.18;
      scene.add(ring);
    }
  });

  const rocket = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.5, 1.8, 20), material(0xf4f1e8));
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.75, 20), material(0xe24a4a));
  nose.position.y = 1.25;
  const windowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), material(0x63c7e6, 0.25));
  windowMesh.position.set(0, 0.45, 0.31);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.9, 18), material(0xf6c445));
  flame.position.y = -1.3;
  flame.rotation.z = Math.PI;
  rocket.add(hull, nose, windowMesh, flame);
  rocket.position.set(3.8, 0.8, -1.8);
  rocket.rotation.z = -0.55;
  rocket.userData.animate = "rocket";
  scene.add(rocket);
}

export function ThemeScene({ theme }: ThemeSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 1.2, 10);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x426138, 2.4));
    const sun = new THREE.DirectionalLight(0xfff2cc, 2.3);
    sun.position.set(5, 8, 7);
    scene.add(sun);
    if (theme === "SPACE") addSpaceWorld(scene);
    else addDinosaurWorld(scene);

    const pointer = new THREE.Vector2();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const move = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    const animate = (time: number) => {
      const seconds = time * 0.001;
      camera.position.x += (pointer.x * 0.45 - camera.position.x) * 0.025;
      camera.position.y += (1.2 - pointer.y * 0.22 - camera.position.y) * 0.025;
      scene.traverse((object) => {
        if (object.userData.animate === "bob") object.position.y = -1.25 + Math.sin(seconds * 2 + object.userData.phase) * 0.08;
        if (object.userData.animate === "planet") object.rotation.y = seconds * 0.18 + object.userData.phase;
        if (object.userData.animate === "rocket") object.position.y = 0.8 + Math.sin(seconds * 1.4) * 0.24;
        if (object.userData.animate === "dinosaur") object.rotation.y = -0.25 + Math.sin(seconds * 0.7) * 0.08;
      });
      renderer.render(scene, camera);
      if (!reducedMotion) frame = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    if (reducedMotion) renderer.render(scene, camera);
    else frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const meshMaterial = object.material;
          if (Array.isArray(meshMaterial)) meshMaterial.forEach((item) => item.dispose());
          else meshMaterial.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [theme]);

  return <div className="themeScene" ref={hostRef} aria-hidden="true" />;
}
