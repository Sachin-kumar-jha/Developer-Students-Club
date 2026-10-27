import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * 3D DSC Tech Galaxy Core (matching official DSC RTU Kota design)
 * - Central 3D Glowing Orange/Amber `< >` Code Brackets
 * - 2 Concentric Orbital Paths with glowing neon rings
 * - Inner Orbit Nodes: React, Node, Express, MongoDB, JavaScript, Git
 * - Outer Orbit Nodes: Flutter, Kotlin, Android, TypeScript, Swift, MySQL, GitHub, Angular, Tailwind
 * - Amber particle embers floating in 3D space
 * - Interactive 3D mouse drag & gyroscopic tilt
 */
export default function HeroHoloCore() {
  const mountRef = useRef(null);
  const [hoveredTech, setHoveredTech] = useState(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 420;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 13.5);

    // Ambient & Accent Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const orangePoint = new THREE.PointLight(0xff7700, 3.5, 40);
    orangePoint.position.set(0, 0, 6);
    scene.add(orangePoint);

    const cyanPoint = new THREE.PointLight(0x00d8ff, 1.8, 35);
    cyanPoint.position.set(-6, -4, 5);
    scene.add(cyanPoint);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // ==========================================
    // 1. CENTRAL GLOWING < > CODE BRACKETS
    // ==========================================
    const bracketGroup = new THREE.Group();
    rootGroup.add(bracketGroup);

    const bracketMat = new THREE.MeshStandardMaterial({
      color: 0xff6200,
      emissive: 0xff4500,
      emissiveIntensity: 0.95,
      metalness: 0.3,
      roughness: 0.2,
    });

    const createBracketSide = (isLeft) => {
      const g = new THREE.Group();
      const legLength = 1.6;
      const legRadius = 0.2;
      const angle = Math.PI / 3.4;

      const topGeo = new THREE.CylinderGeometry(legRadius, legRadius, legLength, 24);
      topGeo.rotateZ(isLeft ? -angle : angle);
      topGeo.translate(isLeft ? -0.45 : 0.45, 0.65, 0);
      const topMesh = new THREE.Mesh(topGeo, bracketMat);

      const botGeo = new THREE.CylinderGeometry(legRadius, legRadius, legLength, 24);
      botGeo.rotateZ(isLeft ? angle : -angle);
      botGeo.translate(isLeft ? -0.45 : 0.45, -0.65, 0);
      const botMesh = new THREE.Mesh(botGeo, bracketMat);

      // Corner joint sphere
      const elbowGeo = new THREE.SphereGeometry(legRadius * 1.05, 24, 24);
      elbowGeo.translate(isLeft ? -0.85 : 0.85, 0, 0);
      const elbowMesh = new THREE.Mesh(elbowGeo, bracketMat);

      g.add(topMesh, botMesh, elbowMesh);
      return g;
    };

    const leftBracket = createBracketSide(true);
    leftBracket.position.x = -0.7;
    const rightBracket = createBracketSide(false);
    rightBracket.position.x = 0.7;

    bracketGroup.add(leftBracket, rightBracket);

    // Central bracket ambient glow aura
    const auraGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const canvasAura = document.createElement("canvas");
    canvasAura.width = 128;
    canvasAura.height = 128;
    const ctxAura = canvasAura.getContext("2d");
    const radGrad = ctxAura.createRadialGradient(64, 64, 0, 64, 64, 64);
    radGrad.addColorStop(0, "rgba(255, 106, 0, 0.45)");
    radGrad.addColorStop(0.5, "rgba(255, 69, 0, 0.15)");
    radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctxAura.fillStyle = radGrad;
    ctxAura.fillRect(0, 0, 128, 128);
    const auraTex = new THREE.CanvasTexture(canvasAura);
    const auraMat = new THREE.MeshBasicMaterial({ map: auraTex, transparent: true, opacity: 0.9, depthWrite: false });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    auraMesh.position.z = -0.1;
    bracketGroup.add(auraMesh);

    // ==========================================
    // 2. CONCENTRIC ORBITAL RINGS
    // ==========================================
    const innerRadius = 3.0;
    const outerRadius = 5.2;

    const createDashedOrbit = (radius, colorHex) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.022, 16, 120);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.38,
      });
      return new THREE.Mesh(ringGeo, ringMat);
    };

    const innerOrbitRing = createDashedOrbit(innerRadius, 0x14b8a6);
    const outerOrbitRing = createDashedOrbit(outerRadius, 0x06b6d4);
    rootGroup.add(innerOrbitRing, outerOrbitRing);

    // ==========================================
    // 3. TECH NODES GENERATOR (Canvas Badges)
    // ==========================================
    const createNodeTexture = (symbol, label, colorHex) => {
      const c = document.createElement("canvas");
      c.width = 160;
      c.height = 160;
      const ctx = c.getContext("2d");

      // Outer glow disc
      ctx.beginPath();
      ctx.arc(80, 80, 72, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(10, 20, 32, 0.92)";
      ctx.fill();

      // Colored rim border
      ctx.lineWidth = 6;
      ctx.strokeStyle = colorHex;
      ctx.stroke();

      // Symbol
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(symbol, 80, 68);

      // Sub-label below symbol
      ctx.fillStyle = colorHex;
      ctx.font = "bold 15px monospace";
      ctx.fillText(label, 80, 108);

      return new THREE.CanvasTexture(c);
    };

    // Inner Orbit Data (6 Technologies)
    const innerTechs = [
      { symbol: "⚛", label: "REACT", color: "#00d8ff", colorHex: 0x00d8ff },
      { symbol: "JS", label: "NODE", color: "#68a063", colorHex: 0x68a063 },
      { symbol: "Ex", label: "EXPRESS", color: "#ffffff", colorHex: 0xffffff },
      { symbol: "🍃", label: "MONGO", color: "#47a248", colorHex: 0x47a248 },
      { symbol: "JS", label: "JAVASCRIPT", color: "#f7df1e", colorHex: 0xf7df1e },
      { symbol: "⌥", label: "GIT", color: "#f05032", colorHex: 0xf05032 },
    ];

    // Outer Orbit Data (9 Technologies)
    const outerTechs = [
      { symbol: "Flutter", label: "FLUTTER", color: "#02569b", colorHex: 0x02569b },
      { symbol: "K", label: "KOTLIN", color: "#7f52ff", colorHex: 0x7f52ff },
      { symbol: "🤖", label: "ANDROID", color: "#3ddc84", colorHex: 0x3ddc84 },
      { symbol: "TS", label: "TYPESCRIPT", color: "#3178c6", colorHex: 0x3178c6 },
      { symbol: "Swift", label: "SWIFT", color: "#f05138", colorHex: 0xf05138 },
      { symbol: "🐬", label: "MYSQL", color: "#00758f", colorHex: 0x00758f },
      { symbol: "🐙", label: "GITHUB", color: "#ffffff", colorHex: 0xffffff },
      { symbol: "A", label: "ANGULAR", color: "#dd0031", colorHex: 0xdd0031 },
      { symbol: "≈", label: "TAILWIND", color: "#38bdf8", colorHex: 0x38bdf8 },
    ];

    const innerNodesGroup = new THREE.Group();
    const outerNodesGroup = new THREE.Group();
    rootGroup.add(innerNodesGroup, outerNodesGroup);

    const nodeDiscs = [];

    const spawnNodes = (techList, radius, parentGroup) => {
      const count = techList.length;
      techList.forEach((tech, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const discGeo = new THREE.CircleGeometry(0.55, 32);
        const tex = createNodeTexture(tech.symbol, tech.label, tech.color);
        const discMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
        const discMesh = new THREE.Mesh(discGeo, discMat);
        discMesh.position.set(x, y, 0);

        // Glowing outer halo ring
        const haloGeo = new THREE.RingGeometry(0.57, 0.64, 32);
        const haloMat = new THREE.MeshBasicMaterial({ color: tech.colorHex, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        discMesh.add(haloMesh);

        discMesh.userData = { techName: tech.label, color: tech.color };
        parentGroup.add(discMesh);
        nodeDiscs.push(discMesh);
      });
    };

    spawnNodes(innerTechs, innerRadius, innerNodesGroup);
    spawnNodes(outerTechs, outerRadius, outerNodesGroup);

    // ==========================================
    // 4. FLOATING WARM EMBER PARTICLES
    // ==========================================
    const emberCount = 120;
    const emberGeo = new THREE.BufferGeometry();
    const emberPos = new Float32Array(emberCount * 3);
    const emberColors = new Float32Array(emberCount * 3);
    const emberPalette = [new THREE.Color(0xff6a00), new THREE.Color(0xffaa00), new THREE.Color(0x14b8a6)];

    for (let i = 0; i < emberCount; i++) {
      const rad = 1.0 + Math.random() * 5.5;
      const ang = Math.random() * Math.PI * 2;
      emberPos[i * 3] = Math.cos(ang) * rad;
      emberPos[i * 3 + 1] = Math.sin(ang) * rad;
      emberPos[i * 3 + 2] = (Math.random() - 0.5) * 4;

      const col = emberPalette[i % emberPalette.length];
      emberColors[i * 3] = col.r;
      emberColors[i * 3 + 1] = col.g;
      emberColors[i * 3 + 2] = col.b;
    }
    emberGeo.setAttribute("position", new THREE.BufferAttribute(emberPos, 3));
    emberGeo.setAttribute("color", new THREE.BufferAttribute(emberColors, 3));
    const embers = new THREE.Points(
      emberGeo,
      new THREE.PointsMaterial({ size: 0.1, vertexColors: true, transparent: true, opacity: 0.85 })
    );
    rootGroup.add(embers);

    // ==========================================
    // 5. INTERACTION (Drag & Tilt)
    // ==========================================
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotY += deltaX * 0.007;
        targetRotX += deltaY * 0.007;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        const rect = container.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / width - 0.5) * 2;
        const normY = -((e.clientY - rect.top) / height - 0.5) * 2;
        targetRotY = normX * 0.35;
        targetRotX = -normY * 0.35;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 500;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth lerp to mouse tilt
      rootGroup.rotation.y = THREE.MathUtils.lerp(rootGroup.rotation.y, targetRotY, 0.06);
      rootGroup.rotation.x = THREE.MathUtils.lerp(rootGroup.rotation.x, targetRotX, 0.06);

      // Central < > subtle breathing float & rotation
      bracketGroup.position.y = Math.sin(elapsed * 2.0) * 0.12;
      bracketGroup.rotation.z = Math.sin(elapsed * 1.4) * 0.04;
      bracketMat.emissiveIntensity = 0.85 + Math.sin(elapsed * 3.0) * 0.25;

      // Inner orbit revolves clockwise
      innerNodesGroup.rotation.z = elapsed * 0.18;
      // Outer orbit revolves counter-clockwise
      outerNodesGroup.rotation.z = -elapsed * 0.12;

      // Keep node badges upright to camera
      innerNodesGroup.children.forEach((child) => {
        child.rotation.z = -innerNodesGroup.rotation.z - rootGroup.rotation.z;
      });
      outerNodesGroup.children.forEach((child) => {
        child.rotation.z = -outerNodesGroup.rotation.z - rootGroup.rotation.z;
      });

      // Embers swirl
      embers.rotation.z = elapsed * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[380px] flex flex-col items-center justify-center select-none bg-radial from-teal-500/5 via-transparent to-transparent">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center" />

      {/* Official DSC Branding Overlay */}
      <div className="absolute bottom-2 inset-x-0 flex flex-col items-center justify-center pointer-events-none text-center">
        <h4 className="text-xs md:text-sm font-extrabold tracking-[0.3em] text-white uppercase drop-shadow-[0_0_12px_rgba(255,106,0,0.6)]">
          DEVELOPER STUDENTS CLUB
        </h4>
        <p className="text-[10px] font-mono tracking-[0.25em] text-teal-400 font-semibold mt-0.5">
          RTU KOTA CHAPTER
        </p>
      </div>
    </div>
  );
}
