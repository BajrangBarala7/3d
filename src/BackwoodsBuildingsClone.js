import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

const BackwoodsBuildingsClone = () => {
  // Configuration Steps
  const [currentStep, setCurrentStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  
  // Building Configuration
  const [buildingConfig, setBuildingConfig] = useState({
    model: 'Utility Shed',
    width: 12,
    length: 16,
    height: 8,
    roofStyle: 'Gable',
    roofPitch: '4:12',
    sidingColor: '#8B4513',
    trimColor: '#FFFFFF',
    roofColor: '#2F4F4F',
    doorStyle: 'Single Door',
    doorPosition: 'front',
    windows: [{ position: 'front-right', style: 'standard' }],
    features: {
      loft: false,
      shelving: false,
      workbench: false,
      electrical: false,
      insulation: false
    },
    pricing: {
      base: 2500,
      options: 0,
      total: 2500
    }
  });

  // User Information
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zipCode: '',
    password: ''
  });

  // Available Options
  const buildingModels = [
    { name: 'Utility Shed', basePrice: 2500 },
    { name: 'Barn Style', basePrice: 3200 },
    { name: 'Lean-To', basePrice: 1800 },
    { name: 'Garage', basePrice: 4500 },
    { name: 'Workshop', basePrice: 3800 }
  ];

  const widthOptions = [8, 10, 12, 14, 16, 18, 20, 24];
  const lengthOptions = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32];
  
  const roofStyles = [
    { name: 'Gable', price: 0 },
    { name: 'Hip', price: 300 },
    { name: 'Gambrel', price: 500 },
    { name: 'Shed', price: -200 }
  ];

  const sidingColors = [
    { name: 'Brown', color: '#8B4513' },
    { name: 'White', color: '#F5F5F5' },
    { name: 'Gray', color: '#696969' },
    { name: 'Green', color: '#228B22' },
    { name: 'Red', color: '#B22222' },
    { name: 'Blue', color: '#4169E1' },
    { name: 'Tan', color: '#D2B48C' },
    { name: 'Black', color: '#2F2F2F' }
  ];

  const trimColors = [
    { name: 'White', color: '#FFFFFF' },
    { name: 'Black', color: '#2F2F2F' },
    { name: 'Brown', color: '#8B4513' },
    { name: 'Gray', color: '#808080' }
  ];

  // 3D Scene References
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const buildingRef = useRef(null);
  const controlsRef = useRef(null);

  // Configuration Steps
  const steps = [
    { title: 'Select Model', component: 'model' },
    { title: 'Choose Width', component: 'width' },
    { title: 'Choose Length', component: 'length' },
    { title: 'Select Roof', component: 'roof' },
    { title: 'Siding Color', component: 'siding' },
    { title: 'Trim Color', component: 'trim' },
    { title: 'Add Features', component: 'features' },
    { title: 'Review & Save', component: 'review' }
  ];

  // Initialize 3D Scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xE6F3FF); // Light blue sky
    scene.fog = new THREE.Fog(0xE6F3FF, 50, 200); // Atmospheric fog
    
    // Camera setup with better positioning
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(35, 25, 35);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup with enhanced quality
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    mountRef.current.appendChild(renderer.domElement);
    
    // Professional Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xFFFFE0, 1.2);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);
    
    // Fill light for softer shadows
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
    fillLight.position.set(-30, 30, -30);
    scene.add(fillLight);
    
    // Professional Ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x4A7C59,
      transparent: true,
      opacity: 0.8
    });
    
    // Add subtle noise to ground
    const groundVertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < groundVertices.length; i += 3) {
      groundVertices[i + 2] += Math.random() * 0.3 - 0.15; // Random height variation
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Add environment elements
    createEnvironment(scene);
    
    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    
    // Initial building
    createBuilding();
    
    // Enhanced mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraDistance = 50;
    let cameraAngleX = 0;
    let cameraAngleY = 0.5;
    
    const updateCameraPosition = () => {
      const x = cameraDistance * Math.sin(cameraAngleX) * Math.cos(cameraAngleY);
      const y = cameraDistance * Math.sin(cameraAngleY);
      const z = cameraDistance * Math.cos(cameraAngleX) * Math.cos(cameraAngleY);
      
      camera.position.set(x, y, z);
      camera.lookAt(0, buildingConfig.height / 2, 0);
    };
    
    const handleMouseDown = (event) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };
    
    const handleMouseMove = (event) => {
      if (!isDragging) return;
      
      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };
      
      cameraAngleX += deltaMove.x * 0.01;
      cameraAngleY += deltaMove.y * 0.01;
      cameraAngleY = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, cameraAngleY));
      
      updateCameraPosition();
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };
    
    const handleMouseUp = () => {
      isDragging = false;
    };
    
    const handleWheel = (event) => {
      cameraDistance += event.deltaY * 0.05;
      cameraDistance = Math.max(15, Math.min(80, cameraDistance));
      updateCameraPosition();
    };
    
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (mountRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Create Environment
  const createEnvironment = (scene) => {
    // Add some trees in background
    for (let i = 0; i < 8; i++) {
      const treeGroup = new THREE.Group();
      
      // Tree trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 8);
      const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = 4;
      trunk.castShadow = true;
      treeGroup.add(trunk);
      
      // Tree foliage
      const foliageGeometry = new THREE.SphereGeometry(4, 8, 6);
      const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.y = 10;
      foliage.castShadow = true;
      treeGroup.add(foliage);
      
      // Random positioning
      const angle = (i / 8) * Math.PI * 2;
      const distance = 60 + Math.random() * 40;
      treeGroup.position.x = Math.cos(angle) * distance;
      treeGroup.position.z = Math.sin(angle) * distance;
      treeGroup.scale.set(0.8 + Math.random() * 0.4, 0.8 + Math.random() * 0.4, 0.8 + Math.random() * 0.4);
      
      scene.add(treeGroup);
    }
    
    // Add clouds
    for (let i = 0; i < 5; i++) {
      const cloudGroup = new THREE.Group();
      
      for (let j = 0; j < 6; j++) {
        const cloudGeometry = new THREE.SphereGeometry(3 + Math.random() * 2, 8, 6);
        const cloudMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xFFFFFF,
          transparent: true,
          opacity: 0.8
        });
        const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloudPart.position.set(
          (Math.random() - 0.5) * 15,
          Math.random() * 3,
          (Math.random() - 0.5) * 15
        );
        cloudGroup.add(cloudPart);
      }
      
      cloudGroup.position.set(
        (Math.random() - 0.5) * 150,
        40 + Math.random() * 20,
        (Math.random() - 0.5) * 150
      );
      
      scene.add(cloudGroup);
    }
  };

  // Update building when config changes
  useEffect(() => {
    createBuilding();
    calculatePricing();
  }, [buildingConfig.model, buildingConfig.width, buildingConfig.length, buildingConfig.height, buildingConfig.roofStyle, buildingConfig.sidingColor, buildingConfig.trimColor, buildingConfig.features]);

  // Create Professional 3D Building
  const createBuilding = () => {
    if (!sceneRef.current) return;
    
    // Remove existing building
    if (buildingRef.current) {
      sceneRef.current.remove(buildingRef.current);
    }
    
    const buildingGroup = new THREE.Group();
    
    // Building dimensions
    const width = buildingConfig.width;
    const length = buildingConfig.length;
    const height = buildingConfig.height;
    
    // Create materials with proper properties
    const sidingMaterial = new THREE.MeshPhongMaterial({ 
      color: buildingConfig.sidingColor,
      shininess: 5,
      specular: 0x111111
    });
    
    const trimMaterial = new THREE.MeshPhongMaterial({ 
      color: buildingConfig.trimColor,
      shininess: 10,
      specular: 0x222222
    });
    
    const roofMaterial = new THREE.MeshPhongMaterial({ 
      color: buildingConfig.roofColor,
      shininess: 30,
      specular: 0x333333
    });
    
    // Foundation
    const foundationGeometry = new THREE.BoxGeometry(width + 1, 0.5, length + 1);
    const foundationMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
    foundation.position.y = 0.25;
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    buildingGroup.add(foundation);
    
    // Main building structure
    const wallThickness = 0.2;
    
    // Front wall with door opening
    const frontWallShape = new THREE.Shape();
    frontWallShape.moveTo(-width/2, 0);
    frontWallShape.lineTo(width/2, 0);
    frontWallShape.lineTo(width/2, height);
    frontWallShape.lineTo(-width/2, height);
    frontWallShape.lineTo(-width/2, 0);
    
    // Door opening
    const doorHole = new THREE.Path();
    doorHole.moveTo(-width/4 - 1.5, 0);
    doorHole.lineTo(-width/4 + 1.5, 0);
    doorHole.lineTo(-width/4 + 1.5, 6.5);
    doorHole.lineTo(-width/4 - 1.5, 6.5);
    doorHole.lineTo(-width/4 - 1.5, 0);
    frontWallShape.holes.push(doorHole);
    
    // Window opening
    if (buildingConfig.windows.length > 0) {
      const windowHole = new THREE.Path();
      windowHole.moveTo(width/4 - 1, 3);
      windowHole.lineTo(width/4 + 1, 3);
      windowHole.lineTo(width/4 + 1, 5);
      windowHole.lineTo(width/4 - 1, 5);
      windowHole.lineTo(width/4 - 1, 3);
      frontWallShape.holes.push(windowHole);
    }
    
    const frontWallGeometry = new THREE.ExtrudeGeometry(frontWallShape, {
      depth: wallThickness,
      bevelEnabled: false
    });
    const frontWall = new THREE.Mesh(frontWallGeometry, sidingMaterial);
    frontWall.position.z = length/2;
    frontWall.castShadow = true;
    frontWall.receiveShadow = true;
    buildingGroup.add(frontWall);
    
    // Back wall
    const backWallGeometry = new THREE.BoxGeometry(width, height, wallThickness);
    const backWall = new THREE.Mesh(backWallGeometry, sidingMaterial);
    backWall.position.set(0, height/2, -length/2);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    buildingGroup.add(backWall);
    
    // Side walls
    const leftWallGeometry = new THREE.BoxGeometry(wallThickness, height, length);
    const leftWall = new THREE.Mesh(leftWallGeometry, sidingMaterial);
    leftWall.position.set(-width/2, height/2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    buildingGroup.add(leftWall);
    
    const rightWall = new THREE.Mesh(leftWallGeometry, sidingMaterial);
    rightWall.position.set(width/2, height/2, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    buildingGroup.add(rightWall);
    
    // Professional Roof System
    createRoof(buildingGroup, width, length, height, roofMaterial);
    
    // Door
    const doorGeometry = new THREE.BoxGeometry(3, 6.5, 0.1);
    const doorMaterial = new THREE.MeshPhongMaterial({ 
      color: new THREE.Color(buildingConfig.trimColor).multiplyScalar(0.8),
      shininess: 20
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(-width/4, 3.25, length/2 + 0.15);
    door.castShadow = true;
    buildingGroup.add(door);
    
    // Door handle
    const handleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const handleMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFD700,
      shininess: 100,
      specular: 0x666666
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(-width/4 + 1, 3.25, length/2 + 0.2);
    buildingGroup.add(handle);
    
    // Door frame
    const frameGeometry = new THREE.BoxGeometry(3.2, 6.7, 0.3);
    const doorFrame = new THREE.Mesh(frameGeometry, trimMaterial);
    doorFrame.position.set(-width/4, 3.35, length/2 + 0.05);
    doorFrame.castShadow = true;
    buildingGroup.add(doorFrame);
    
    // Windows
    if (buildingConfig.windows.length > 0) {
      const windowGeometry = new THREE.BoxGeometry(2, 2, 0.05);
      const windowMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.7,
        shininess: 100,
        specular: 0x444444
      });
      const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
      windowMesh.position.set(width/4, 4, length/2 + 0.12);
      buildingGroup.add(windowMesh);
      
      // Window frame
      const windowFrameGeometry = new THREE.BoxGeometry(2.2, 2.2, 0.2);
      const windowFrame = new THREE.Mesh(windowFrameGeometry, trimMaterial);
      windowFrame.position.set(width/4, 4, length/2 + 0.05);
      windowFrame.castShadow = true;
      buildingGroup.add(windowFrame);
      
      // Window cross
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2, 0.1), trimMaterial);
      crossV.position.set(width/4, 4, length/2 + 0.13);
      buildingGroup.add(crossV);
      
      const crossH = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 0.1), trimMaterial);
      crossH.position.set(width/4, 4, length/2 + 0.13);
      buildingGroup.add(crossH);
    }
    
    // Corner trim
    const cornerTrimGeometry = new THREE.BoxGeometry(0.3, height, 0.3);
    const corners = [
      { x: -width/2, z: length/2 },
      { x: width/2, z: length/2 },
      { x: -width/2, z: -length/2 },
      { x: width/2, z: -length/2 }
    ];
    
    corners.forEach(corner => {
      const cornerTrim = new THREE.Mesh(cornerTrimGeometry, trimMaterial);
      cornerTrim.position.set(corner.x, height/2, corner.z);
      cornerTrim.castShadow = true;
      buildingGroup.add(cornerTrim);
    });
    
    // Base trim
    const baseTrimGeometry = new THREE.BoxGeometry(width + 0.5, 0.5, 0.3);
    const frontBaseTrim = new THREE.Mesh(baseTrimGeometry, trimMaterial);
    frontBaseTrim.position.set(0, 0.25, length/2 + 0.1);
    buildingGroup.add(frontBaseTrim);
    
    const backBaseTrim = new THREE.Mesh(baseTrimGeometry, trimMaterial);
    backBaseTrim.position.set(0, 0.25, -length/2 - 0.1);
    buildingGroup.add(backBaseTrim);
    
    // Add features if selected
    if (buildingConfig.features.loft) {
      addLoftFeature(buildingGroup, width, length, height);
    }
    
    buildingRef.current = buildingGroup;
    sceneRef.current.add(buildingGroup);
  };

  // Create Professional Roof
  const createRoof = (buildingGroup, width, length, height, roofMaterial) => {
    const roofOverhang = 1.5;
    const roofHeight = 4;
    
    if (buildingConfig.roofStyle === 'Gable') {
      // Gable roof with proper geometry
      const roofShape = new THREE.Shape();
      roofShape.moveTo(-width/2 - roofOverhang, 0);
      roofShape.lineTo(0, roofHeight);
      roofShape.lineTo(width/2 + roofOverhang, 0);
      roofShape.lineTo(-width/2 - roofOverhang, 0);
      
      const roofGeometry = new THREE.ExtrudeGeometry(roofShape, {
        depth: length + roofOverhang * 2,
        bevelEnabled: false
      });
      
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(0, height, -roofOverhang);
      roof.castShadow = true;
      roof.receiveShadow = true;
      buildingGroup.add(roof);
      
      // Roof end caps
      const endCapGeometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        -width/2 - roofOverhang, 0, 0,
        0, roofHeight, 0,
        width/2 + roofOverhang, 0, 0
      ]);
      endCapGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      endCapGeometry.computeVertexNormals();
      
      const frontEndCap = new THREE.Mesh(endCapGeometry, roofMaterial);
      frontEndCap.position.set(0, height, length/2 + roofOverhang);
      frontEndCap.castShadow = true;
      buildingGroup.add(frontEndCap);
      
      const backEndCap = new THREE.Mesh(endCapGeometry, roofMaterial);
      backEndCap.position.set(0, height, -length/2 - roofOverhang);
      backEndCap.rotation.y = Math.PI;
      backEndCap.castShadow = true;
      buildingGroup.add(backEndCap);
      
    } else if (buildingConfig.roofStyle === 'Hip') {
      // Hip roof
      const roofGeometry = new THREE.ConeGeometry(Math.max(width, length)/2 + roofOverhang, roofHeight, 4);
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(0, height + roofHeight/2, 0);
      roof.rotation.y = Math.PI/4;
      roof.castShadow = true;
      buildingGroup.add(roof);
      
    } else if (buildingConfig.roofStyle === 'Gambrel') {
      // Gambrel roof (barn style)
      const roofShape = new THREE.Shape();
      roofShape.moveTo(-width/2 - roofOverhang, 0);
      roofShape.lineTo(-width/4, roofHeight * 0.6);
      roofShape.lineTo(0, roofHeight);
      roofShape.lineTo(width/4, roofHeight * 0.6);
      roofShape.lineTo(width/2 + roofOverhang, 0);
      roofShape.lineTo(-width/2 - roofOverhang, 0);
      
      const roofGeometry = new THREE.ExtrudeGeometry(roofShape, {
        depth: length + roofOverhang * 2,
        bevelEnabled: false
      });
      
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(0, height, -roofOverhang);
      roof.castShadow = true;
      buildingGroup.add(roof);
    }
    
    // Ridge cap
    if (buildingConfig.roofStyle === 'Gable' || buildingConfig.roofStyle === 'Gambrel') {
      const ridgeGeometry = new THREE.BoxGeometry(0.3, 0.3, length + roofOverhang * 2);
      const ridgeMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color(buildingConfig.roofColor).multiplyScalar(0.9)
      });
      const ridge = new THREE.Mesh(ridgeGeometry, ridgeMaterial);
      ridge.position.set(0, height + roofHeight + 0.15, 0);
      ridge.castShadow = true;
      buildingGroup.add(ridge);
    }
  };

  // Add Loft Feature
  const addLoftFeature = (buildingGroup, width, length, height) => {
    // Loft floor
    const loftGeometry = new THREE.BoxGeometry(width - 1, 0.2, length - 1);
    const loftMaterial = new THREE.MeshPhongMaterial({ color: 0xDEB887 });
    const loft = new THREE.Mesh(loftGeometry, loftMaterial);
    loft.position.set(0, height - 2, 0);
    loft.castShadow = true;
    loft.receiveShadow = true;
    buildingGroup.add(loft);
    
    // Loft supports
    const supportGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
    const supportMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    
    const supportPositions = [
      { x: -width/3, z: -length/3 },
      { x: width/3, z: -length/3 },
      { x: -width/3, z: length/3 },
      { x: width/3, z: length/3 }
    ];
    
    supportPositions.forEach(pos => {
      const support = new THREE.Mesh(supportGeometry, supportMaterial);
      support.position.set(pos.x, height - 3, pos.z);
      support.castShadow = true;
      buildingGroup.add(support);
    });
  };

  // Calculate Pricing
  const calculatePricing = () => {
    const baseModel = buildingModels.find(m => m.name === buildingConfig.model);
    let basePrice = baseModel ? baseModel.basePrice : 2500;
    
    // Size adjustments
    const sizeMultiplier = (buildingConfig.width * buildingConfig.length) / 192; // 12x16 = 192 base
    basePrice *= sizeMultiplier;
    
    // Roof style adjustment
    const roofStyle = roofStyles.find(r => r.name === buildingConfig.roofStyle);
    const roofPrice = roofStyle ? roofStyle.price : 0;
    
    // Features pricing
    let featuresPrice = 0;
    if (buildingConfig.features.loft) featuresPrice += 800;
    if (buildingConfig.features.shelving) featuresPrice += 200;
    if (buildingConfig.features.workbench) featuresPrice += 350;
    if (buildingConfig.features.electrical) featuresPrice += 500;
    if (buildingConfig.features.insulation) featuresPrice += 600;
    
    const total = Math.round(basePrice + roofPrice + featuresPrice);
    
    setBuildingConfig(prev => ({
      ...prev,
      pricing: {
        base: Math.round(basePrice),
        options: roofPrice + featuresPrice,
        total: total
      }
    }));
  };

  // Handle configuration changes
  const updateConfig = (key, value) => {
    setBuildingConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateFeature = (feature, value) => {
    setBuildingConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: value
      }
    }));
  };

  // Navigation
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  // Modal handlers
  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType('');
  };

  // Render step content
  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.component) {
      case 'model':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Select Building Model</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buildingModels.map((model) => (
                <div
                  key={model.name}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    buildingConfig.model === model.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => updateConfig('model', model.name)}
                >
                  <h4 className="font-semibold text-gray-800">{model.name}</h4>
                  <p className="text-sm text-gray-600">Starting at ${model.basePrice.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'width':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Select Width</h3>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {widthOptions.map((width) => (
                <button
                  key={width}
                  className={`p-3 border-2 rounded-lg font-semibold transition-colors ${
                    buildingConfig.width === width
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => updateConfig('width', width)}
                >
                  {width}'
                </button>
              ))}
            </div>
          </div>
        );
        
      case 'length':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Select Length</h3>
            <div className="grid grid-cols-4 md:grid-cols-10 gap-3">
              {lengthOptions.map((length) => (
                <button
                  key={length}
                  className={`p-3 border-2 rounded-lg font-semibold transition-colors ${
                    buildingConfig.length === length
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => updateConfig('length', length)}
                >
                  {length}'
                </button>
              ))}
            </div>
          </div>
        );
        
      case 'roof':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Select Roof Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roofStyles.map((roof) => (
                <div
                  key={roof.name}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    buildingConfig.roofStyle === roof.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => updateConfig('roofStyle', roof.name)}
                >
                  <h4 className="font-semibold text-gray-800">{roof.name}</h4>
                  <p className="text-sm text-gray-600">
                    {roof.price === 0 ? 'Included' : `+$${roof.price}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'siding':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Select Siding Color</h3>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {sidingColors.map((color) => (
                <div
                  key={color.name}
                  className={`p-2 border-2 rounded-lg cursor-pointer transition-colors ${
                    buildingConfig.sidingColor === color.color
                      ? 'border-blue-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => updateConfig('sidingColor', color.color)}
                >
                  <div
                    className="w-full h-16 rounded mb-2"
                    style={{ backgroundColor: color.color }}
                  ></div>
                  <p className="text-sm text-center font-medium">{color.name}</p>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'trim':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Select Trim Color</h3>
            <div className="grid grid-cols-4 md:grid-cols-4 gap-4">
              {trimColors.map((color) => (
                <div
                  key={color.name}
                  className={`p-2 border-2 rounded-lg cursor-pointer transition-colors ${
                    buildingConfig.trimColor === color.color
                      ? 'border-blue-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => updateConfig('trimColor', color.color)}
                >
                  <div
                    className="w-full h-16 rounded mb-2"
                    style={{ backgroundColor: color.color }}
                  ></div>
                  <p className="text-sm text-center font-medium">{color.name}</p>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'features':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Features</h3>
            <div className="space-y-4">
              {[
                { key: 'loft', name: 'Loft Storage', price: 800, description: 'Additional overhead storage space with support beams' },
                { key: 'shelving', name: 'Wall Shelving', price: 200, description: 'Built-in wall mounted shelves' },
                { key: 'workbench', name: 'Workbench', price: 350, description: 'Sturdy work surface' },
                { key: 'electrical', name: 'Electrical Package', price: 500, description: 'Wiring and outlets' },
                { key: 'insulation', name: 'Insulation', price: 600, description: 'Wall and roof insulation' }
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{feature.name}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                    <p className="text-sm font-medium text-green-600">+${feature.price}</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={buildingConfig.features[feature.key]}
                      onChange={(e) => updateFeature(feature.key, e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'review':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Review Your Design</h3>
            
            {/* Configuration Summary */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-4">Configuration Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Model:</span> {buildingConfig.model}</div>
                <div><span className="font-medium">Size:</span> {buildingConfig.width}' × {buildingConfig.length}'</div>
                <div><span className="font-medium">Roof:</span> {buildingConfig.roofStyle}</div>
                <div><span className="font-medium">Siding:</span> {sidingColors.find(c => c.color === buildingConfig.sidingColor)?.name}</div>
                <div><span className="font-medium">Trim:</span> {trimColors.find(c => c.color === buildingConfig.trimColor)?.name}</div>
              </div>
              
              {/* Features */}
              <div className="mt-4">
                <span className="font-medium">Features:</span>
                <ul className="list-disc list-inside text-sm mt-2">
                  {Object.entries(buildingConfig.features).map(([key, value]) => 
                    value && <li key={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</li>
                  )}
                </ul>
              </div>
            </div>
            
            {/* Pricing */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-4">Pricing</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>${buildingConfig.pricing.base.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Options:</span>
                  <span>${buildingConfig.pricing.options.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${buildingConfig.pricing.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {/* Save Options */}
            <div className="flex space-x-4">
              <button
                onClick={() => openModal('save')}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Save Design
              </button>
              <button
                onClick={() => openModal('quote')}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Get Quote
              </button>
            </div>
          </div>
        );
        
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Backwoods Buildings</h1>
              <span className="ml-2 text-sm text-gray-500">3D Building Designer</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => openModal('login')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Login
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Price</div>
                <div className="text-xl font-bold text-green-600">
                  ${buildingConfig.pricing.total.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <button
                  onClick={() => goToStep(index)}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
                <span className={`ml-2 text-sm font-medium ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`ml-4 w-8 h-0.5 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3D Viewer */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">3D Preview</h2>
              <p className="text-sm text-gray-600">Drag to rotate • Scroll to zoom</p>
            </div>
            <div className="relative">
              <div ref={mountRef} className="w-full h-96"></div>
              <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded text-sm">
                <div><strong>Size:</strong> {buildingConfig.width}' × {buildingConfig.length}'</div>
                <div><strong>Model:</strong> {buildingConfig.model}</div>
              </div>
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6">
              {renderStepContent()}
            </div>
            
            {/* Navigation */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Previous
              </button>
              
              <button
                onClick={nextStep}
                disabled={currentStep === steps.length - 1}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === steps.length - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            {modalType === 'save' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Save Your Design</h3>
                <p className="text-gray-600 mb-4">Create an account to save your design and get a quote.</p>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={userInfo.firstName}
                    onChange={(e) => setUserInfo(prev => ({...prev, firstName: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={userInfo.lastName}
                    onChange={(e) => setUserInfo(prev => ({...prev, lastName: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo(prev => ({...prev, email: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo(prev => ({...prev, phone: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Zip Code"
                    value={userInfo.zipCode}
                    onChange={(e) => setUserInfo(prev => ({...prev, zipCode: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert('Design saved successfully!');
                      closeModal();
                    }}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Design
                  </button>
                </div>
              </div>
            )}
            
            {modalType === 'quote' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Request Quote</h3>
                <p className="text-gray-600 mb-4">Get a detailed quote for your custom building.</p>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2">Your Configuration:</h4>
                  <p className="text-sm">{buildingConfig.model} - {buildingConfig.width}' × {buildingConfig.length}'</p>
                  <p className="text-lg font-bold text-green-600">${buildingConfig.pricing.total.toLocaleString()}</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      alert('Quote request sent! We will contact you soon.');
                      closeModal();
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Request Quote
                  </button>
                </div>
              </div>
            )}
            
            {modalType === 'login' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Login</h3>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert('Login functionality would be connected to backend');
                      closeModal();
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackwoodsBuildingsClone;