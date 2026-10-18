import * as THREE from 'three';

// Status constants
export const STALL_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  RESERVED: 'reserved',
  SELECTED: 'selected'
};

// Verified reference data for default occupied stalls
const INITIAL_OCCUPIED = {
  booked: [4, 13, 24, 33],
  reserved: [6, 28]
};

export class FloorPlan3D {
  constructor(containerElement, onStallSelectCallback) {
    this.container = containerElement;
    this.onStallSelect = onStallSelectCallback;
    
    this.stalls = [];
    this.stallMeshes = new Map(); // stallId -> Three.Group
    this.selectedStallId = null;
    this.hoveredStallId = null;

    // Camera target & animation
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
    this.desiredCameraPos = new THREE.Vector3(65, 75, 90);
    this.desiredLookAt = new THREE.Vector3(0, 0, 0);
    this.isTransitioningCamera = false;

    // Interaction controls
    this.isDragging = false;
    this.isPointerMoved = false;
    this.pointerDownPos = { x: 0, y: 0 };
    this.previousMousePosition = { x: 0, y: 0 };
    this.spherical = { radius: 130, phi: Math.PI / 3.2, theta: Math.PI / 4.2 };

    // Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-1000, -1000);

    this.initData();
    this.initThree();
    this.buildScene();
    this.setupEvents();
    this.animate();
  }

  initData() {
    for (let i = 1; i <= 40; i++) {
      let status = STALL_STATUS.AVAILABLE;
      if (INITIAL_OCCUPIED.booked.includes(i)) status = STALL_STATUS.BOOKED;
      if (INITIAL_OCCUPIED.reserved.includes(i)) status = STALL_STATUS.RESERVED;

      const wing = i <= 20 ? 'Left Wing' : 'Right Wing';
      const sideIndex = i <= 20 ? i : i - 20;
      
      this.stalls.push({
        id: i,
        name: `S${String(i).padStart(2, '0')}`,
        status,
        wing,
        positionText: `${wing} • Booth ${sideIndex}`,
        startingPrice: 60000,
        specs: {
          area: '3m x 3m (9 sq.m)',
          visitorSeats: 4,
          representativeChairs: 2,
          power: '5A Power Hookup Included',
          lighting: '2 LED Spotlights + Fascia Board'
        }
      });
    }
  }

  initThree() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 640;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0C1428);
    this.scene.fog = new THREE.FogExp2(0x0C1428, 0.0035);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    this.updateCameraFromSpherical();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container.querySelector('#floorplan-canvas'),
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Ambient and Directional Lights
    const ambientLight = new THREE.AmbientLight(0xE0ECFF, 0.9);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFF6E5, 1.8);
    dirLight.position.set(50, 90, 40);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 300;
    dirLight.shadow.camera.left = -90;
    dirLight.shadow.camera.right = 90;
    dirLight.shadow.camera.top = 90;
    dirLight.shadow.camera.bottom = -90;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Warm Gold Accent Lights
    const goldAccent1 = new THREE.PointLight(0xC9A66B, 2.5, 120);
    goldAccent1.position.set(-30, 25, 0);
    this.scene.add(goldAccent1);

    const goldAccent2 = new THREE.PointLight(0xC9A66B, 2.5, 120);
    goldAccent2.position.set(30, 25, 0);
    this.scene.add(goldAccent2);

    // Stage Spotlight
    const stageLight = new THREE.SpotLight(0xFFE8B5, 3.5, 90, Math.PI / 4, 0.3);
    stageLight.position.set(0, 45, -45);
    stageLight.target.position.set(0, 0, -65);
    this.scene.add(stageLight);
    this.scene.add(stageLight.target);
  }

  buildScene() {
    this.createHallFloor();
    this.createStageArea();
    this.createEntranceGate();
    this.createStudentSeatingArea();
    this.createExhibitionStalls();
    this.createSelectionBeacon();
  }

  createHallFloor() {
    // Main Floor
    const floorGeo = new THREE.PlaneGeometry(120, 160);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111B35,
      roughness: 0.7,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Floor Grid Line Accents
    const grid = new THREE.GridHelper(150, 30, 0xC9A66B, 0x1E2F52);
    grid.position.y = 0.05;
    this.scene.add(grid);

    // Center Red Carpet / Gold Runner Walkway
    const runnerGeo = new THREE.PlaneGeometry(14, 110);
    const runnerMat = new THREE.MeshStandardMaterial({
      color: 0x18284C,
      roughness: 0.5,
      metalness: 0.1
    });
    const runner = new THREE.Mesh(runnerGeo, runnerMat);
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(0, 0.08, 0);
    runner.receiveShadow = true;
    this.scene.add(runner);

    // Gold Boundary Ribbons
    const leftRibbonGeo = new THREE.PlaneGeometry(0.8, 110);
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xC9A66B, metalness: 0.8, roughness: 0.2 });
    
    const leftRibbon = new THREE.Mesh(leftRibbonGeo, ribbonMat);
    leftRibbon.rotation.x = -Math.PI / 2;
    leftRibbon.position.set(-7, 0.1, 0);
    this.scene.add(leftRibbon);

    const rightRibbon = new THREE.Mesh(leftRibbonGeo, ribbonMat);
    rightRibbon.rotation.x = -Math.PI / 2;
    rightRibbon.position.set(7, 0.1, 0);
    this.scene.add(rightRibbon);
  }

  createStageArea() {
    const stageGroup = new THREE.Group();
    stageGroup.position.set(0, 0, -68);

    // Raised Stage Deck
    const deckGeo = new THREE.BoxGeometry(54, 3, 18);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x8F2525,
      roughness: 0.4,
      metalness: 0.3
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.y = 1.5;
    deck.receiveShadow = true;
    deck.castShadow = true;
    stageGroup.add(deck);

    // Stage Gold Trim Border
    const trimGeo = new THREE.BoxGeometry(54.4, 0.4, 18.4);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xC9A66B, metalness: 0.8, roughness: 0.2 });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.y = 3;
    stageGroup.add(trim);

    // Stage Backdrop Screen
    const screenGeo = new THREE.BoxGeometry(44, 12, 1);
    const screenTex = this.createCanvasTexture('STAGE', 'EDUCARE SKILLS ACADEMY', 'KEYNOTE PRESENTATIONS & CAREER WORKSHOPS');
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTex,
      roughness: 0.3,
      metalness: 0.1
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 9, -8.5);
    screen.castShadow = true;
    stageGroup.add(screen);

    // Stage Podium
    const podiumGeo = new THREE.BoxGeometry(3, 4, 2.5);
    const podiumMat = new THREE.MeshStandardMaterial({ color: 0x101A35, metalness: 0.6, roughness: 0.3 });
    const podium = new THREE.Mesh(podiumGeo, podiumMat);
    podium.position.set(0, 5, 2);
    podium.castShadow = true;
    stageGroup.add(podium);

    this.scene.add(stageGroup);
  }

  createEntranceGate() {
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, 68);

    // Arch Pillars
    const pillarGeo = new THREE.BoxGeometry(3, 10, 3);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x101A35, metalness: 0.6, roughness: 0.3 });
    
    const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
    leftPillar.position.set(-14, 5, 0);
    leftPillar.castShadow = true;
    gateGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
    rightPillar.position.set(14, 5, 0);
    rightPillar.castShadow = true;
    gateGroup.add(rightPillar);

    // Arch Header Signboard
    const signGeo = new THREE.BoxGeometry(31, 4, 2);
    const signTex = this.createCanvasTexture('ENTRY', '↑ MAIN ENTRANCE GATE ↑', 'WELCOME TO EDUCATION FAIR (DEMO)');
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      roughness: 0.3,
      metalness: 0.2
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 10, 0);
    sign.castShadow = true;
    gateGroup.add(sign);

    this.scene.add(gateGroup);
  }

  createStudentSeatingArea() {
    const seatingGroup = new THREE.Group();
    seatingGroup.position.set(0, 0, -8);

    // 7 Rows of 8 chairs
    const chairBackGeo = new THREE.BoxGeometry(1.4, 1.2, 0.2);
    const chairSeatGeo = new THREE.BoxGeometry(1.4, 0.2, 1.2);
    const chairLegGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6);

    const chairMat = new THREE.MeshStandardMaterial({
      color: 0x586A85,
      roughness: 0.6
    });
    const legMat = new THREE.MeshStandardMaterial({
      color: 0xC9A66B,
      metalness: 0.8,
      roughness: 0.3
    });

    const rows = 7;
    const cols = 8;
    const spacingX = 2.4;
    const spacingZ = 3.6;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let offsetX = (c - (cols - 1) / 2) * spacingX;
        if (c >= 4) offsetX += 1.8;
        else offsetX -= 1.8;

        const posZ = (r - (rows - 1) / 2) * spacingZ;

        const chair = new THREE.Group();
        chair.position.set(offsetX, 0, posZ);

        // Seat
        const seat = new THREE.Mesh(chairSeatGeo, chairMat);
        seat.position.y = 0.8;
        seat.castShadow = true;
        chair.add(seat);

        // Back
        const back = new THREE.Mesh(chairBackGeo, chairMat);
        back.position.set(0, 1.4, 0.5);
        back.castShadow = true;
        chair.add(back);

        // Legs
        const legOffsets = [[-0.6, -0.5], [0.6, -0.5], [-0.6, 0.5], [0.6, 0.5]];
        legOffsets.forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(chairLegGeo, legMat);
          leg.position.set(lx, 0.4, lz);
          chair.add(leg);
        });

        seatingGroup.add(chair);
      }
    }

    this.scene.add(seatingGroup);
  }

  createExhibitionStalls() {
    this.stallsGroup = new THREE.Group();
    this.scene.add(this.stallsGroup);

    const zStart = -48;
    const zStep = 5.2;

    this.stalls.forEach((stall) => {
      const isLeft = stall.id <= 20;
      const index = isLeft ? stall.id - 1 : stall.id - 21;
      
      const posX = isLeft ? -34 : 34;
      const posZ = zStart + (index * zStep);
      const rotY = isLeft ? Math.PI / 2 : -Math.PI / 2;

      const booth = this.buildSingleBoothMesh(stall, posX, posZ, rotY);
      this.stallsGroup.add(booth);
      this.stallMeshes.set(stall.id, booth);
    });
  }

  buildSingleBoothMesh(stall, x, z, rotationY) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotationY;
    group.userData = { stallId: stall.id, originalY: 0 };

    // Platform Base
    const platformGeo = new THREE.BoxGeometry(4.8, 0.35, 4.2);
    let platformColor = 0x1E3158;
    if (stall.status === STALL_STATUS.BOOKED) platformColor = 0x0E4429;
    if (stall.status === STALL_STATUS.RESERVED) platformColor = 0x5C3810;

    const platformMat = new THREE.MeshStandardMaterial({
      color: platformColor,
      roughness: 0.5,
      metalness: 0.2
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = 0.175;
    platform.receiveShadow = true;
    platform.castShadow = true;
    group.add(platform);
    group.userData.platformMesh = platform;

    // Platform Gold Edge
    const edgeGeo = new THREE.BoxGeometry(4.9, 0.08, 4.3);
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0xC9A66B, metalness: 0.8, roughness: 0.3 });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.y = 0.32;
    group.add(edge);

    // Shell Scheme Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xE8ECF2,
      roughness: 0.6,
      metalness: 0.1
    });

    // Back Wall
    const backWallGeo = new THREE.BoxGeometry(4.6, 3.2, 0.1);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 1.8, -2.0);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    group.add(backWall);

    // Left Divider Wall
    const sideWallGeo = new THREE.BoxGeometry(0.1, 3.2, 4.0);
    const leftWall = new THREE.Mesh(sideWallGeo, wallMat);
    leftWall.position.set(-2.3, 1.8, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    group.add(leftWall);

    // Right Divider Wall
    const rightWall = new THREE.Mesh(sideWallGeo, wallMat);
    rightWall.position.set(2.3, 1.8, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    group.add(rightWall);

    // Front Fascia Board with Stall Number
    const fasciaGeo = new THREE.BoxGeometry(4.8, 0.75, 0.2);
    const fasciaTex = this.createStallFasciaTexture(stall, false);
    const fasciaMat = new THREE.MeshStandardMaterial({
      map: fasciaTex,
      roughness: 0.3,
      metalness: 0.2
    });
    const fascia = new THREE.Mesh(fasciaGeo, fasciaMat);
    fascia.position.set(0, 3.1, 2.0);
    fascia.castShadow = true;
    group.add(fascia);
    group.userData.fasciaMesh = fascia;

    // Exhibition Counter Desk
    const deskGeo = new THREE.BoxGeometry(2.6, 1.1, 0.9);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x101A35,
      roughness: 0.4,
      metalness: 0.3
    });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, 0.9, 0.4);
    desk.castShadow = true;
    group.add(desk);

    // Desk Counter Top (Champagne Gold)
    const deskTopGeo = new THREE.BoxGeometry(2.8, 0.1, 1.0);
    const deskTopMat = new THREE.MeshStandardMaterial({ color: 0xC9A66B, metalness: 0.7, roughness: 0.2 });
    const deskTop = new THREE.Mesh(deskTopGeo, deskTopMat);
    deskTop.position.set(0, 1.45, 0.4);
    deskTop.castShadow = true;
    group.add(deskTop);

    // 4 Visitor Chairs in front
    for (let c = 0; c < 4; c++) {
      const chairX = (c - 1.5) * 0.9;
      const vChair = this.createMiniChair(0x3B4E6B, true);
      vChair.position.set(chairX, 0.35, 1.4);
      group.add(vChair);
    }

    // 2 Representative Chairs behind desk
    for (let r = 0; r < 2; r++) {
      const chairX = (r - 0.5) * 1.2;
      const repChair = this.createMiniChair(0x1B2A4A, false);
      repChair.position.set(chairX, 0.35, -0.6);
      repChair.rotation.y = Math.PI;
      group.add(repChair);
    }

    // Interactive Hitbox
    const hitBoxGeo = new THREE.BoxGeometry(5.2, 4.2, 4.8);
    const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
    hitBox.position.set(0, 2.1, 0);
    hitBox.userData = { isStallHitBox: true, stallId: stall.id };
    group.add(hitBox);

    return group;
  }

  createMiniChair(colorHex, facingBack) {
    const chair = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.6 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0xC9A66B, metalness: 0.8, roughness: 0.2 });

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.7), mat);
    seat.position.y = 0.55;
    seat.castShadow = true;
    chair.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.08), mat);
    back.position.set(0, 0.85, facingBack ? 0.32 : -0.32);
    back.castShadow = true;
    chair.add(back);

    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.55, 6);
    [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 0.275, lz);
      chair.add(leg);
    });

    return chair;
  }

  createStallFasciaTexture(stall, isSelected = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Background based on status
    if (isSelected) {
      ctx.fillStyle = '#C9A66B';
    } else if (stall.status === STALL_STATUS.BOOKED) {
      ctx.fillStyle = '#0F5132';
    } else if (stall.status === STALL_STATUS.RESERVED) {
      ctx.fillStyle = '#78350F';
    } else {
      ctx.fillStyle = '#101A35';
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gold Top & Bottom Borders
    ctx.fillStyle = isSelected ? '#FFFFFF' : '#C9A66B';
    ctx.fillRect(0, 0, canvas.width, 6);
    ctx.fillRect(0, canvas.height - 6, canvas.width, 6);

    // Text: Stall Number
    ctx.fillStyle = isSelected ? '#101A35' : '#FFFFFF';
    ctx.font = 'bold 54px Outfit, Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(stall.name, 28, canvas.height / 2);

    // Status or Subtitle
    ctx.textAlign = 'right';
    if (isSelected) {
      ctx.fillStyle = '#101A35';
      ctx.font = 'bold 32px Outfit, sans-serif';
      ctx.fillText('SELECTED ★', canvas.width - 28, canvas.height / 2);
    } else if (stall.status === STALL_STATUS.BOOKED) {
      ctx.fillStyle = '#A3E635';
      ctx.font = 'bold 32px Outfit, sans-serif';
      ctx.fillText('BOOKED', canvas.width - 28, canvas.height / 2);
    } else if (stall.status === STALL_STATUS.RESERVED) {
      ctx.fillStyle = '#FBBF24';
      ctx.font = 'bold 32px Outfit, sans-serif';
      ctx.fillText('RESERVED', canvas.width - 28, canvas.height / 2);
    } else {
      ctx.fillStyle = '#C9A66B';
      ctx.font = '600 28px Outfit, sans-serif';
      ctx.fillText('EDUCARE SKILLS', canvas.width - 28, canvas.height / 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    return texture;
  }

  createCanvasTexture(type, mainText, subText) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#0B1327');
    grad.addColorStop(0.5, '#182746');
    grad.addColorStop(1, '#0B1327');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gold borders
    ctx.fillStyle = '#C9A66B';
    ctx.fillRect(0, 0, canvas.width, 10);
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);

    // Main Text
    ctx.fillStyle = '#F8F6F0';
    ctx.font = 'bold 58px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(mainText, canvas.width / 2, canvas.height / 2 - 20);

    // Sub Text
    ctx.fillStyle = '#C9A66B';
    ctx.font = '600 26px Plus Jakarta Sans, sans-serif';
    ctx.fillText(subText, canvas.width / 2, canvas.height / 2 + 45);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    return texture;
  }

  createSelectionBeacon() {
    this.beaconGroup = new THREE.Group();
    this.beaconGroup.visible = false;

    // Glowing Gold Ring
    const ringGeo = new THREE.RingGeometry(1.6, 2.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xC9A66B,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 4.2;
    this.beaconGroup.add(ring);

    // Holographic Cylinder Beam
    const beamGeo = new THREE.CylinderGeometry(0.1, 1.8, 4.0, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xC9A66B,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 2.1;
    this.beaconGroup.add(beam);

    this.scene.add(this.beaconGroup);
  }

  setupEvents() {
    const canvas = this.renderer.domElement;

    // Pointer down for click vs drag detection
    canvas.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.isPointerMoved = false;
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Pointer move for orbit & hover raycasting
    window.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const inCanvas = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        if (Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y) > 6) {
          this.isPointerMoved = true;
        }

        // Orbit update
        this.spherical.theta -= deltaX * 0.007;
        this.spherical.phi = Math.max(0.15, Math.min(Math.PI / 2.15, this.spherical.phi - deltaY * 0.007));
        this.updateCameraFromSpherical();

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }

      if (inCanvas) {
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.checkHover();
      }
    });

    // Pointer up for clean click trigger
    window.addEventListener('pointerup', (e) => {
      if (this.isDragging && !this.isPointerMoved) {
        const rect = canvas.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          this.handleClick();
        }
      }
      this.isDragging = false;
    });

    // Zoom on wheel
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.spherical.radius = Math.max(40, Math.min(220, this.spherical.radius + e.deltaY * 0.08));
      this.updateCameraFromSpherical();
    }, { passive: false });

    // Touch controls for mobile
    let initialTouchDist = null;
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && initialTouchDist) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = initialTouchDist - currentDist;
        this.spherical.radius = Math.max(40, Math.min(220, this.spherical.radius + diff * 0.2));
        this.updateCameraFromSpherical();
        initialTouchDist = currentDist;
      }
    }, { passive: true });

    // Resize observer
    window.addEventListener('resize', () => this.handleResize());
  }

  checkHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.stallsGroup.children, true);

    let hoveredStall = null;
    for (const hit of intersects) {
      if (hit.object.userData && hit.object.userData.isStallHitBox) {
        hoveredStall = hit.object.userData.stallId;
        break;
      }
    }

    if (hoveredStall !== this.hoveredStallId) {
      this.hoveredStallId = hoveredStall;
      this.updateHoverStates();
    }
  }

  updateHoverStates() {
    this.stallMeshes.forEach((mesh, stallId) => {
      const isSelected = stallId === this.selectedStallId;
      const isHovered = stallId === this.hoveredStallId;
      const stall = this.stalls.find(s => s.id === stallId);

      // Height bounce on hover if not selected
      if (isSelected) {
        mesh.position.y = 0.8;
      } else if (isHovered && stall && stall.status === STALL_STATUS.AVAILABLE) {
        mesh.position.y = 0.35;
      } else {
        mesh.position.y = 0;
      }
    });

    if (this.hoveredStallId) {
      const stall = this.stalls.find(s => s.id === this.hoveredStallId);
      this.renderer.domElement.style.cursor = (stall && stall.status === STALL_STATUS.AVAILABLE) ? 'pointer' : 'not-allowed';
    } else {
      this.renderer.domElement.style.cursor = 'grab';
    }
  }

  handleClick() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.stallsGroup.children, true);

    for (const hit of intersects) {
      if (hit.object.userData && hit.object.userData.isStallHitBox) {
        const stallId = hit.object.userData.stallId;
        this.selectStall(stallId);
        break;
      }
    }
  }

  selectStall(stallId) {
    const stall = this.stalls.find(s => s.id === stallId);
    if (!stall) return;

    // BOOKED Stall: Cannot be selected, clicking must not change currently selected stall
    if (stall.status === STALL_STATUS.BOOKED) {
      this.shakeBooth(stallId);
      if (this.onStallSelect) {
        this.onStallSelect(
          this.getSelectedStall(),
          `Stall ${stall.name} is already BOOKED by another institution. Please select an available stall.`,
          stall
        );
      }
      return;
    }

    // RESERVED Stall: Cannot be selected, clicking must not change currently selected stall
    if (stall.status === STALL_STATUS.RESERVED) {
      this.shakeBooth(stallId);
      if (this.onStallSelect) {
        this.onStallSelect(
          this.getSelectedStall(),
          `Stall ${stall.name} is currently RESERVED under institutional review. Please select an available stall.`,
          stall
        );
      }
      return;
    }

    // TOGGLE DESELECTION: If visitor clicks the currently selected stall again, deselect it!
    if (this.selectedStallId === stallId) {
      this.deselectCurrentStall();
      return;
    }

    // If another stall was selected, deselect it first
    if (this.selectedStallId) {
      this.resetStallMeshVisuals(this.selectedStallId);
    }

    // Mark newly clicked stall as selected
    this.selectedStallId = stallId;
    this.applySelectedVisuals(stallId);

    const mesh = this.stallMeshes.get(stallId);
    if (mesh) {
      this.focusOnBooth(mesh);
    }

    this.updateHoverStates();

    if (this.onStallSelect) {
      this.onStallSelect(stall, null);
    }
  }

  deselectCurrentStall() {
    if (this.selectedStallId) {
      this.resetStallMeshVisuals(this.selectedStallId);
      this.selectedStallId = null;
      this.beaconGroup.visible = false;
      this.updateHoverStates();
      if (this.onStallSelect) {
        this.onStallSelect(null, null);
      }
    }
  }

  resetStallMeshVisuals(stallId) {
    const mesh = this.stallMeshes.get(stallId);
    const stall = this.stalls.find(s => s.id === stallId);
    if (!mesh || !stall) return;

    mesh.position.y = 0;
    if (mesh.userData.platformMesh) {
      let origColor = 0x1E3158;
      if (stall.status === STALL_STATUS.BOOKED) origColor = 0x0E4429;
      if (stall.status === STALL_STATUS.RESERVED) origColor = 0x5C3810;
      mesh.userData.platformMesh.material.color.setHex(origColor);
      mesh.userData.platformMesh.material.emissive.setHex(0x000000);
      mesh.userData.platformMesh.material.emissiveIntensity = 0;
    }
    if (mesh.userData.fasciaMesh) {
      mesh.userData.fasciaMesh.material.map = this.createStallFasciaTexture(stall, false);
      mesh.userData.fasciaMesh.material.needsUpdate = true;
    }
  }

  applySelectedVisuals(stallId) {
    const mesh = this.stallMeshes.get(stallId);
    const stall = this.stalls.find(s => s.id === stallId);
    if (!mesh || !stall) return;

    mesh.position.y = 0.8;
    if (mesh.userData.platformMesh) {
      mesh.userData.platformMesh.material.color.setHex(0xC9A66B);
      mesh.userData.platformMesh.material.emissive.setHex(0x5A4218);
      mesh.userData.platformMesh.material.emissiveIntensity = 0.5;
    }
    if (mesh.userData.fasciaMesh) {
      mesh.userData.fasciaMesh.material.map = this.createStallFasciaTexture(stall, true);
      mesh.userData.fasciaMesh.material.needsUpdate = true;
    }

    this.beaconGroup.visible = true;
    this.beaconGroup.position.set(mesh.position.x, 0, mesh.position.z);
  }

  getSelectedStall() {
    return this.selectedStallId ? this.stalls.find(s => s.id === this.selectedStallId) : null;
  }

  focusOnBooth(mesh) {
    this.desiredLookAt.copy(mesh.position);
    this.desiredLookAt.y = 2;
    this.isTransitioningCamera = true;
  }

  shakeBooth(stallId) {
    const mesh = this.stallMeshes.get(stallId);
    if (!mesh) return;

    const startX = mesh.position.x;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      mesh.position.x = startX + (count % 2 === 0 ? 0.35 : -0.35);
      if (count > 6) {
        clearInterval(interval);
        mesh.position.x = startX;
      }
    }, 40);
  }

  setCameraPreset(preset) {
    switch (preset) {
      case 'isometric':
        this.spherical = { radius: 130, phi: Math.PI / 3.2, theta: Math.PI / 4.2 };
        this.cameraTarget.set(0, 0, 0);
        break;
      case 'top':
        this.spherical = { radius: 140, phi: 0.05, theta: 0 };
        this.cameraTarget.set(0, 0, 0);
        break;
      case 'stage':
        this.spherical = { radius: 100, phi: Math.PI / 2.6, theta: Math.PI };
        this.cameraTarget.set(0, 0, -20);
        break;
      case 'entrance':
        this.spherical = { radius: 100, phi: Math.PI / 2.6, theta: 0 };
        this.cameraTarget.set(0, 0, 20);
        break;
      case 'reset':
      default:
        this.spherical = { radius: 130, phi: Math.PI / 3.2, theta: Math.PI / 4.2 };
        this.cameraTarget.set(0, 0, 0);
        break;
    }
    this.updateCameraFromSpherical();
  }

  zoomIn() {
    this.spherical.radius = Math.max(40, this.spherical.radius - 18);
    this.updateCameraFromSpherical();
  }

  zoomOut() {
    this.spherical.radius = Math.min(220, this.spherical.radius + 18);
    this.updateCameraFromSpherical();
  }

  updateCameraFromSpherical() {
    const x = this.cameraTarget.x + this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
    const y = this.cameraTarget.y + this.spherical.radius * Math.cos(this.spherical.phi);
    const z = this.cameraTarget.z + this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.cameraTarget);
  }

  handleResize() {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 640;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Beacon subtle rotation and pulse
    if (this.beaconGroup.visible) {
      this.beaconGroup.rotation.y += 0.02;
      const scale = 1 + Math.sin(Date.now() * 0.005) * 0.08;
      this.beaconGroup.scale.set(scale, scale, scale);
    }

    // Camera glide interpolation if focusing
    if (this.isTransitioningCamera) {
      this.cameraTarget.lerp(this.desiredLookAt, 0.08);
      this.updateCameraFromSpherical();

      if (this.cameraTarget.distanceTo(this.desiredLookAt) < 0.2) {
        this.isTransitioningCamera = false;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize);
    this.renderer.dispose();
  }
}
