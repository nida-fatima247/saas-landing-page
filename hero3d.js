/* ==========================================================
   AUTONIX — Hero 3D scene (Three.js)
   A slowly rotating semicircular arc + orbiting nodes,
   evoking an autonomous radar / agent-orbit system.
========================================================== */
(function () {
  const canvasHost = document.getElementById('hero-canvas');
  if (!canvasHost || typeof THREE === 'undefined') return;

  const colors = {
    mauve: 0x864879,
    rose: 0xe9a6a6,
    plum: 0x3f3351,
  };

  let width = canvasHost.clientWidth || window.innerWidth;
  let height = canvasHost.clientHeight || window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  canvasHost.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  // ---- Semicircle arc (torus, half revolved) ----
  const arcGeo = new THREE.TorusGeometry(3.1, 0.045, 16, 128, Math.PI);
  const arcMat = new THREE.MeshBasicMaterial({ color: colors.rose, transparent: true, opacity: 0.85 });
  const arc = new THREE.Mesh(arcGeo, arcMat);
  arc.rotation.x = Math.PI / 2.4;
  group.add(arc);

  // secondary fainter arc, offset
  const arcGeo2 = new THREE.TorusGeometry(3.7, 0.02, 16, 128, Math.PI * 1.3);
  const arcMat2 = new THREE.MeshBasicMaterial({ color: colors.mauve, transparent: true, opacity: 0.5 });
  const arc2 = new THREE.Mesh(arcGeo2, arcMat2);
  arc2.rotation.x = Math.PI / 1.8;
  arc2.rotation.y = 0.6;
  group.add(arc2);

  // ---- Core sphere ----
  const coreGeo = new THREE.IcosahedronGeometry(0.75, 2);
  const coreMat = new THREE.MeshBasicMaterial({ color: colors.mauve, wireframe: true, transparent: true, opacity: 0.55 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  const coreGlowGeo = new THREE.IcosahedronGeometry(0.5, 1);
  const coreGlowMat = new THREE.MeshBasicMaterial({ color: colors.rose, transparent: true, opacity: 0.25 });
  const coreGlow = new THREE.Mesh(coreGlowGeo, coreGlowMat);
  group.add(coreGlow);

  // ---- Orbiting nodes ----
  const nodes = [];
  const nodeCount = 8;
  for (let i = 0; i < nodeCount; i++) {
    const r = 0.05 + Math.random() * 0.05;
    const geo = new THREE.SphereGeometry(r, 12, 12);
    const mat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? colors.rose : colors.mauve });
    const node = new THREE.Mesh(geo, mat);
    const radius = 2.4 + Math.random() * 2.0;
    const speed = 0.15 + Math.random() * 0.25;
    const offset = Math.random() * Math.PI * 2;
    const tilt = (Math.random() - 0.5) * 1.6;
    node.userData = { radius, speed, offset, tilt };
    nodes.push(node);
    group.add(node);
  }

  // ---- Particle field ----
  const particleCount = 220;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = 4 + Math.random() * 5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02, transparent: true, opacity: 0.35 });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ---- Mouse parallax ----
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ---- Resize ----
  function onResize() {
    width = canvasHost.clientWidth || window.innerWidth;
    height = canvasHost.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);

  // ---- Animation loop ----
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // continuous circular motion of the semicircle arcs
    group.rotation.z = t * 0.18;
    arc.rotation.y = t * 0.12;
    arc2.rotation.z = -t * 0.1;

    core.rotation.x = t * 0.25;
    core.rotation.y = t * 0.3;
    coreGlow.scale.setScalar(1 + Math.sin(t * 1.5) * 0.08);

    nodes.forEach((node) => {
      const { radius, speed, offset, tilt } = node.userData;
      const angle = t * speed + offset;
      node.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * Math.cos(tilt),
        Math.sin(angle) * radius * Math.sin(tilt)
      );
    });

    particles.rotation.y = t * 0.015;

    // gentle parallax camera drift toward mouse
    camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.4 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();
})();