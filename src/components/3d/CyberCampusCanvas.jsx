import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as THREE from "three";

/**
 * Ultra-3D Cyber-Campus Engine (CyberCampusCanvas.jsx)
 * - Permanent 3D WebGL World (Clean Full-Screen Spatial Depth)
 * - CatmullRomCurve3 3D Camera Spline traversing 6 spatial zones based on scroll
 * - Dynamic undulating Cyber Tron Wave Floor (animated wireframe terrain)
 * - Interactive 3D Cursor Lighting (PointLight tracks user mouse in 3D world space)
 * - Google DSC 4-Color Floating Orbitals (Blue, Red, Yellow, Green)
 * - 3,500 Deep Space Particle Field & Hyperspace Speed Streaks
 * - Raycast Click Navigation to sections on 3D island clicks
 */
export default function CyberCampusCanvas() {
  const mountRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // High-performance antialiased WebGL renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x060c13, 1);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060c13, 0.013);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300);

    // 1. Dynamic Lighting System
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));

    const mainTealLight = new THREE.PointLight(0x14b8a6, 3.2, 90);
    mainTealLight.position.set(16, 20, 18);
    scene.add(mainTealLight);

    const orangeAccentLight = new THREE.PointLight(0xea580c, 2.6, 85);
    orangeAccentLight.position.set(-18, -8, -12);
    scene.add(orangeAccentLight);

    const cyanDeepLight = new THREE.PointLight(0x06b6d4, 2.4, 85);
    cyanDeepLight.position.set(0, 16, -30);
    scene.add(cyanDeepLight);

    // Dynamic 3D Cursor Light that follows user pointer in 3D world space
    const cursor3DLight = new THREE.PointLight(0x22d3ee, 3.0, 45);
    cursor3DLight.position.set(0, 0, 10);
    scene.add(cursor3DLight);

    // 2. Animated Undulating Cyber Tron Wave Floor
    const waveSegments = 48;
    const waveGeo = new THREE.PlaneGeometry(240, 240, waveSegments, waveSegments);
    waveGeo.rotateX(-Math.PI / 2);
    const posAttr = waveGeo.attributes.position;
    const origY = new Float32Array(posAttr.count);
    for (let i = 0; i < posAttr.count; i++) {
      origY[i] = posAttr.getY(i);
    }

    const waveMat = new THREE.MeshStandardMaterial({
      color: 0x093339,
      emissive: 0x14b8a6,
      emissiveIntensity: 0.35,
      wireframe: true,
      roughness: 0.3,
      metalness: 0.8,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.position.y = -12;
    scene.add(waveMesh);

    // Perspective Cyber Grid Base
    const gridHelper = new THREE.GridHelper(260, 75, 0x14b8a6, 0x134e4a);
    gridHelper.position.y = -12.1;
    scene.add(gridHelper);

    // 3. 3,500 Starfield Particle Matrix
    const starCount = 3500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starPalette = [
      new THREE.Color(0x14b8a6), // Teal
      new THREE.Color(0x06b6d4), // Cyan
      new THREE.Color(0x4285f4), // Google Blue
      new THREE.Color(0xea4335), // Google Red
      new THREE.Color(0xfbbc05), // Google Yellow
      new THREE.Color(0x34a853), // Google Green
    ];

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 200;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 110;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      const c = starPalette[i % starPalette.length];
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    const starField = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ size: 0.35, vertexColors: true, transparent: true, opacity: 0.9 })
    );
    scene.add(starField);

    // 4. Six 3D Spatial Camera Waypoints along Catmull-Rom Spline
    const waypoints = [
      { name: "ZONE 01 // HERO CYBER-CORE", sectionId: "home", route: "/", cam: new THREE.Vector3(0, 2, 19), look: new THREE.Vector3(0, 0, 0) },
      { name: "ZONE 02 // ABOUT & DOMAINS", sectionId: "about", route: "/about", cam: new THREE.Vector3(19, 5, 5), look: new THREE.Vector3(19, 1, -9) },
      { name: "ZONE 03 // HOLOGRAM EVENTS", sectionId: "events", route: "/events", cam: new THREE.Vector3(7, -1, -21), look: new THREE.Vector3(0, -1, -35) },
      { name: "ZONE 04 // TEAM & ALUMNI PODS", sectionId: "team", route: "/team", cam: new THREE.Vector3(-19, 4, -15), look: new THREE.Vector3(-19, 2, -29) },
      { name: "ZONE 05 // GALLERY & CERT VAULT", sectionId: "gallery", route: "/verify", cam: new THREE.Vector3(-15, 11, 7), look: new THREE.Vector3(-15, 9, -7) },
      { name: "ZONE 06 // CONTACT & COMMAND", sectionId: "contact", route: "/positions", cam: new THREE.Vector3(0, 15, 13), look: new THREE.Vector3(0, 13, -1) },
    ];

    const camCurve = new THREE.CatmullRomCurve3(waypoints.map((w) => w.cam));
    const lookCurve = new THREE.CatmullRomCurve3(waypoints.map((w) => w.look));

    // 5. Floating 3D Technology Universe (React, Python, Node, Android, Flutter, Docker, TypeScript, Git, MongoDB, JavaScript, Cloud, Swift)
    const interactiveMeshes = [];

    // Helper to generate vibrant, unmasked, official tech logo textures using internet SVGs
    const createOfficialTechTexture = (iconName, title, category, colorHex, stepNum) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, 512, 512);

        // 1. Soft glowing energy aura behind official logo
        const aura = ctx.createRadialGradient(256, 185, 20, 256, 185, 145);
        aura.addColorStop(0, colorHex + "44");
        aura.addColorStop(0.7, colorHex + "15");
        aura.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(256, 185, 145, 0, Math.PI * 2);
        ctx.fill();

        // 2. Draw 100% authentic official vector logo
        ctx.save();
        ctx.shadowColor = colorHex;
        ctx.shadowBlur = 24;
        ctx.drawImage(img, 136, 65, 240, 240);
        ctx.restore();

        // 3. Official Technology Title with radiant glow
        ctx.save();
        ctx.shadowColor = colorHex;
        ctx.shadowBlur = 20;
        ctx.font = "900 46px 'Space Grotesk', 'Inter', monospace, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(title, 256, 355);
        ctx.restore();

        // 4. Domain Track badge
        ctx.save();
        ctx.font = "800 22px 'Space Grotesk', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = colorHex;
        ctx.shadowColor = colorHex;
        ctx.shadowBlur = 10;
        ctx.fillText(`[ ${category} // 0${stepNum} ]`, 256, 410);
        ctx.restore();

        texture.needsUpdate = true;
      };
      img.src = `/tech-icons/${iconName}.svg`;

      return texture;
    };

    // 12 Authentic Technologies with Official Devicon Logos
    const techBadgeDefs = [
      { icon: "react", title: "REACT", cat: "WEB DEV", col: "#61DAFB", route: "/about" },
      { icon: "python", title: "PYTHON", cat: "AI & ML", col: "#FFE052", route: "/about" },
      { icon: "nodejs", title: "NODE.JS", cat: "BACKEND", col: "#68A063", route: "/about" },
      { icon: "android", title: "ANDROID", cat: "MOBILE OS", col: "#3DDC84", route: "/about" },
      { icon: "flutter", title: "FLUTTER", cat: "CROSS-PLATFORM", col: "#54C5F8", route: "/about" },
      { icon: "docker", title: "DOCKER", cat: "DEVOPS & CLOUD", col: "#2496ED", route: "/events" },
      { icon: "typescript", title: "TYPESCRIPT", cat: "LANGUAGES", col: "#3178C6", route: "/about" },
      { icon: "git", title: "GIT", cat: "VCS & CI/CD", col: "#F05032", route: "/positions" },
      { icon: "mongodb", title: "MONGODB", cat: "DATABASE", col: "#47A248", route: "/events" },
      { icon: "javascript", title: "JAVASCRIPT", cat: "WEB CORE", col: "#F7DF1E", route: "/about" },
      { icon: "cloud", title: "GOOGLE CLOUD", cat: "INFRASTRUCTURE", col: "#4285F4", route: "/events" },
      { icon: "swift", title: "SWIFT", cat: "APPLE ECOSYSTEM", col: "#F05138", route: "/about" },
    ];

    const techBadges = [];
    techBadgeDefs.forEach((t, i) => {
      const group = new THREE.Group();

      // Target scroll position along the page (0.0 to 1.0)
      const targetT = i / (techBadgeDefs.length - 1);
      const camPt = camCurve.getPointAt(targetT);
      const lookPt = lookCurve.getPointAt(targetT);
      const dir = new THREE.Vector3().subVectors(lookPt, camPt).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(dir, up).normalize();

      // Position in 3D: in front of the camera, framing content neatly
      const sideSign = (i % 2 === 0 ? 1 : -0.75);
      const basePos = new THREE.Vector3()
        .copy(camPt)
        .addScaledVector(dir, 12.0)
        .addScaledVector(right, 4.6 * sideSign)
        .addScaledVector(up, 1.2);

      group.position.copy(basePos);
      group.scale.setScalar(0.0001); // Hidden initially until scroll reaches it

      const texture = createOfficialTechTexture(t.icon, t.title, t.cat, t.col, i + 1);

      // 100% Unmasked, luminous official logo billboard quad
      const logoGeo = new THREE.PlaneGeometry(3.8, 3.8);
      const logoMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        opacity: 0,
      });
      const logoMesh = new THREE.Mesh(logoGeo, logoMat);
      logoMesh.userData = { isTechBadge: true, name: t.title, route: t.route, waypointIndex: Math.floor(i / 2) };

      // Radiant glowing neon orbital ring
      const ringGeo = new THREE.TorusGeometry(2.4, 0.045, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: t.col, transparent: true, opacity: 0 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 3.2;

      // Orbiting energy spark bead
      const sparkGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const sparkMat = new THREE.MeshBasicMaterial({ color: t.col });
      const sparkMesh = new THREE.Mesh(sparkGeo, sparkMat);
      sparkMesh.position.set(2.4, 0, 0);
      ringMesh.add(sparkMesh);

      // Local brand colored light for 3D radiance
      const techLight = new THREE.PointLight(t.col, 0, 18);
      techLight.position.set(0, 0, 1.5);

      group.add(logoMesh, ringMesh, techLight);
      scene.add(group);

      techBadges.push({
        group,
        logoMat,
        ringMat,
        ringMesh,
        techLight,
        basePos,
        targetT,
        idx: i,
      });
      interactiveMeshes.push(logoMesh);
    });

    // Scroll & Pointer Handlers
    let scrollT = 0;
    let pointerX = 0;
    let pointerY = 0;
    const currentCam = waypoints[0].cam.clone();
    const currentLook = waypoints[0].look.clone();

    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollT = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };

    const handleMouseMove = (e) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    // Raycast Click Navigation
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleCanvasClick = (e) => {
      if (e.target.tagName !== "CANVAS") return;
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      if (hits.length > 0) {
        const uData = hits[0].object.userData;
        if (uData.route) {
          navigate(uData.route);
        } else if (uData.waypointIndex !== undefined) {
          const wp = waypoints[uData.waypointIndex];
          if (wp) {
            const el = document.getElementById(wp.sectionId);
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            } else {
              navigate(wp.route);
            }
          }
        }
      }
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("click", handleCanvasClick);
    window.addEventListener("resize", handleResize);
    handleScroll();

    // Render & Animation Loop
    let animId;
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Camera Spline Lerp
      const targetCam = camCurve.getPointAt(scrollT);
      const targetLook = lookCurve.getPointAt(scrollT);

      targetCam.x += pointerX * 1.8;
      targetCam.y += pointerY * 1.2;

      currentCam.lerp(targetCam, 0.07);
      currentLook.lerp(targetLook, 0.09);

      camera.position.copy(currentCam);
      camera.lookAt(currentLook);

      // 3D Cursor Light Position
      cursor3DLight.position.set(currentLook.x + pointerX * 12, currentLook.y + pointerY * 9, currentLook.z + 8);

      // Undulating Cyber Wave Terrain Animation
      const pos = waveGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vz = pos.getZ(i);
        const wave =
          Math.sin(vx * 0.06 + elapsed * 1.8) * Math.cos(vz * 0.05 + elapsed * 1.5) * 2.4 +
          Math.sin((vx + vz) * 0.04 + elapsed * 1.2) * 1.2;
        pos.setY(i, origY[i] + wave);
      }
      pos.needsUpdate = true;

      // Animate 3D Technology Universe Badges based on scroll progression (One Logo Revealed per Scroll Step)
      techBadges.forEach((b) => {
        const dist = Math.abs(scrollT - b.targetT);
        const threshold = 0.088; // Activation window around logo's scroll milestone

        let activeFactor = 0;
        if (dist < threshold) {
          const p = 1 - dist / threshold;
          activeFactor = p * p * (3 - 2 * p); // smoothstep curve
        }

        // Entrance scale: zooms in from 0 to 1.15 when active, shrinks away when scrolling past
        const scale = Math.max(0.0001, activeFactor * 1.15);
        b.group.scale.setScalar(scale);

        // Opacity
        b.logoMat.opacity = activeFactor;
        b.ringMat.opacity = activeFactor * 0.9;

        // Radiant PointLight intensity
        if (b.techLight) {
          b.techLight.intensity = activeFactor * 3.8;
        }

        // Only render/process when visible
        b.group.visible = activeFactor > 0.002;

        if (b.group.visible) {
          // Floating hovering motion
          b.group.position.y = b.basePos.y + Math.sin(elapsed * 2.2 + b.idx) * 0.4;
          // Always face camera with subtle organic cyber tilt
          b.group.quaternion.copy(camera.quaternion);
          b.group.rotateZ(Math.sin(elapsed * 0.9 + b.idx) * 0.05);

          // Fast spinning neon energy ring
          if (b.ringMesh) {
            b.ringMesh.rotation.z = elapsed * (1.8 + activeFactor * 1.5);
            b.ringMesh.rotation.y = Math.sin(elapsed * 1.3) * 0.35;
          }
        }
      });

      // Rotate Starfield
      starField.rotation.y = elapsed * 0.018;
      starField.rotation.x = Math.sin(elapsed * 0.2) * 0.01;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleCanvasClick);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [navigate, location.pathname]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 pointer-events-auto"
    />
  );
}
