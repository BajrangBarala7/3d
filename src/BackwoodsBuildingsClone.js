import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

const BackwoodsBuildingsClone = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [buildingConfig, setBuildingConfig] = useState({
    model: 'Standard Shed',
    width: 24,
    depth: 12,
    height: 8,
    ceilingHeight: "8' 0\"",
    roofPitch: "4:12",
    roofOverhang: "12\"",
    material: "Steel",
    sidingColor: "#8B4513",
    trimColor: "#654321",
    roofColor: "#2F4F4F",
    features: {
      shutters: false,
      enclosed: false,
      postWrap: false,
      concrete: false,
      loft: false
    },
    price: 2850
  });
  
  const [quoteForm, setQuoteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    deliveryZip: '',
    description: '',
    builder: ''
  });

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const buildingRef = useRef(null);

  const steps = [
    { name: 'Model', key: 'model' },
    { name: 'Width', key: 'width' },
    { name: 'Length', key: 'depth' },
    { name: 'Roof', key: 'roofPitch' },
    { name: 'Siding', key: 'sidingColor' },
    { name: 'Trim', key: 'trimColor' }
  ];

  const models = [
    { name: 'Standard Shed', basePrice: 2500 },
    { name: 'Barn Style', basePrice: 3200 },
    { name: 'Garage', basePrice: 4500 },
    { name: 'Workshop', basePrice: 3800 }
  ];

  const sidingColors = [
    { name: 'Brown', color: '#8B4513' },
    { name: 'Red', color: '#B22222' },
    { name: 'Green', color: '#228B22' },
    { name: 'Blue', color: '#4682B4' },
    { name: 'White', color: '#F5F5F5' },
    { name: 'Gray', color: '#808080' }
  ];

  const trimColors = [
    { name: 'Dark Brown', color: '#654321' },
    { name: 'White', color: '#FFFFFF' },
    { name: 'Black', color: '#000000' },
    { name: 'Gray', color: '#A0A0A0' }
  ];

  // Initialize 3D Scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xE6F3FF);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(35, 25, 35);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0xE6F3FF);
    
    mountRef.current.appendChild(renderer.domElement);
    
    // Enhanced Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Additional fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);
    
    // Ground with texture
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x90EE90,
      transparent: true,
      opacity: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper for reference
    const gridHelper = new THREE.GridHelper(100, 20, 0x888888, 0xCCCCCC);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.3;
    scene.add(gridHelper);
    
    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    
    // Initial building
    createBuilding();
    
    // Enhanced Controls
    let isDragging = false;
    let isRightClick = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    const handleMouseDown = (event) => {
      isDragging = true;
      isRightClick = event.button === 2;
      previousMousePosition = { x: event.clientX, y: event.clientY };
      event.preventDefault();
    };
    
    const handleMouseMove = (event) => {
      if (!isDragging) return;
      
      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };
      
      if (isRightClick) {
        // Pan camera
        const panSpeed = 0.1;
        camera.position.x -= deltaMove.x * panSpeed;
        camera.position.y += deltaMove.y * panSpeed;
      } else {
        // Rotate camera
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(camera.position);
        spherical.theta -= deltaMove.x * 0.01;
        spherical.phi += deltaMove.y * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        
        camera.position.setFromSpherical(spherical);
      }
      
      camera.lookAt(0, 5, 0);
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };
    
    const handleMouseUp = () => {
      isDragging = false;
      isRightClick = false;
    };
    
    const handleWheel = (event) => {
      const scale = event.deltaY > 0 ? 1.1 : 0.9;
      const newPosition = camera.position.clone().multiplyScalar(scale);
      const minDistance = 15;
      const maxDistance = 100;
      
      if (newPosition.length() > minDistance && newPosition.length() < maxDistance) {
        camera.position.copy(newPosition);
      }
      event.preventDefault();
    };

    const handleContextMenu = (event) => {
      event.preventDefault();
    };
    
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);
    renderer.domElement.addEventListener('contextmenu', handleContextMenu);
    
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

  const createBuilding = () => {
    if (!sceneRef.current) return;
    
    // Remove existing building
    if (buildingRef.current) {
      sceneRef.current.remove(buildingRef.current);
    }
    
    const building = new THREE.Group();
    
    // Base structure
    const wallHeight = buildingConfig.height;
    const roofHeight = 4;
    
    // Enhanced materials
    const wallMaterial = new THREE.MeshLambertMaterial({ 
      color: buildingConfig.sidingColor
    });
    
    const trimMaterial = new THREE.MeshLambertMaterial({ 
      color: buildingConfig.trimColor
    });

    const roofMaterial = new THREE.MeshLambertMaterial({ 
      color: buildingConfig.roofColor
    });
    
    // Foundation
    const foundationGeometry = new THREE.BoxGeometry(buildingConfig.width + 1, 0.5, buildingConfig.depth + 1);
    const foundationMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
    const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
    foundation.position.set(0, 0.25, 0);
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    building.add(foundation);

    // Walls with proper geometry
    const wallThickness = 0.2;
    
    // Front wall
    const frontWallGeometry = new THREE.BoxGeometry(buildingConfig.width, wallHeight, wallThickness);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, wallHeight/2 + 0.5, buildingConfig.depth/2);
    frontWall.castShadow = true;
    building.add(frontWall);
    
    // Back wall
    const backWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    backWall.position.set(0, wallHeight/2 + 0.5, -buildingConfig.depth/2);
    backWall.castShadow = true;
    building.add(backWall);
    
    // Side walls
    const sideWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, buildingConfig.depth);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-buildingConfig.width/2, wallHeight/2 + 0.5, 0);
    leftWall.castShadow = true;
    building.add(leftWall);
    
    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(buildingConfig.width/2, wallHeight/2 + 0.5, 0);
    rightWall.castShadow = true;
    building.add(rightWall);
    
    // Enhanced Roof
    const roofGeometry = new THREE.CylinderGeometry(0, buildingConfig.width/2 + 2, roofHeight, 4);
    roofGeometry.rotateY(Math.PI/4);
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, wallHeight + roofHeight/2 + 0.5, 0);
    roof.scale.set(1, 1, buildingConfig.depth/buildingConfig.width);
    roof.castShadow = true;
    building.add(roof);

    // Roof trim
    const trimGeometry = new THREE.BoxGeometry(buildingConfig.width + 4, 0.3, buildingConfig.depth + 4);
    const roofTrim = new THREE.Mesh(trimGeometry, trimMaterial);
    roofTrim.position.set(0, wallHeight + 0.65, 0);
    roofTrim.castShadow = true;
    building.add(roofTrim);
    
    // Door with frame
    const doorFrameGeometry = new THREE.BoxGeometry(3.2, 7.2, 0.3);
    const doorFrame = new THREE.Mesh(doorFrameGeometry, trimMaterial);
    doorFrame.position.set(-buildingConfig.width/4, 4.1, buildingConfig.depth/2 + 0.15);
    building.add(doorFrame);

    const doorGeometry = new THREE.BoxGeometry(3, 7, 0.2);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(-buildingConfig.width/4, 4, buildingConfig.depth/2 + 0.25);
    building.add(door);

    // Door handle
    const handleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const handleMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
    const doorHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    doorHandle.position.set(-buildingConfig.width/4 + 1, 4, buildingConfig.depth/2 + 0.35);
    building.add(doorHandle);
    
    // Windows with frames
    const windowFrameGeometry = new THREE.BoxGeometry(4.2, 3.2, 0.3);
    const windowFrame = new THREE.Mesh(windowFrameGeometry, trimMaterial);
    windowFrame.position.set(buildingConfig.width/4, 5.1, buildingConfig.depth/2 + 0.15);
    building.add(windowFrame);

    const windowGeometry = new THREE.BoxGeometry(4, 3, 0.1);
    const windowMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x87CEEB, 
      transparent: true, 
      opacity: 0.7 
    });
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(buildingConfig.width/4, 5, buildingConfig.depth/2 + 0.25);
    building.add(window1);

    // Side window
    const sideWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    const sideWindowFrame = new THREE.Mesh(windowFrameGeometry, trimMaterial);
    sideWindow.position.set(buildingConfig.width/2 + 0.25, 5, 0);
    sideWindowFrame.position.set(buildingConfig.width/2 + 0.15, 5.1, 0);
    sideWindow.rotation.y = Math.PI/2;
    sideWindowFrame.rotation.y = Math.PI/2;
    building.add(sideWindow);
    building.add(sideWindowFrame);
    
    building.castShadow = true;
    buildingRef.current = building;
    sceneRef.current.add(building);
    
    // Update price based on configuration
    updatePrice();
  };

  const updatePrice = () => {
    const baseModel = models.find(m => m.name === buildingConfig.model) || models[0];
    let price = baseModel.basePrice;
    
    // Size multiplier
    const area = buildingConfig.width * buildingConfig.depth;
    price += area * 8; // $8 per square foot
    
    // Height multiplier
    if (buildingConfig.height > 8) {
      price += (buildingConfig.height - 8) * 200;
    }
    
    // Feature additions
    if (buildingConfig.features.loft) price += 800;
    if (buildingConfig.features.concrete) price += 600;
    if (buildingConfig.features.postWrap) price += 400;
    if (buildingConfig.features.shutters) price += 300;
    if (buildingConfig.features.enclosed) price += 500;
    
    setBuildingConfig(prev => ({ ...prev, price }));
  };

  useEffect(() => {
    createBuilding();
  }, [buildingConfig]);

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType('');
  };

  const handleConfigChange = (key, value) => {
    setBuildingConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFeatureToggle = (feature) => {
    setBuildingConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
  };

  const handleFormChange = (field, value) => {
    setQuoteForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
    'Wisconsin', 'Wyoming'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-800 to-green-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Backwoods Buildings & Truss LLC.</h1>
              <p className="text-green-200 text-lg">3D Designer</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-200">Contact Us</p>
              <p className="text-lg font-semibold">(555) 123-4567</p>
            </div>
          </div>
        </div>
      </header>

      {/* Step Progress Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.name} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  index <= currentStep 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  index <= currentStep ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-4 ${
                    index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Panel - Enhanced Controls */}
        <div className="w-96 bg-white shadow-xl border-r max-h-screen overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Current Configuration Display */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg text-gray-800 mb-2">Current Design</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-semibold">Model:</span> {buildingConfig.model}</p>
                <p><span className="font-semibold">Size:</span> {buildingConfig.width}' × {buildingConfig.depth}' × {buildingConfig.height}'</p>
                <p><span className="font-semibold">Price:</span> <span className="text-green-600 font-bold text-lg">${buildingConfig.price.toLocaleString()}</span></p>
              </div>
            </div>

            {/* Step-based Configuration */}
            {currentStep === 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-lg">Select Model</h3>
                <div className="space-y-2">
                  {models.map(model => (
                    <button
                      key={model.name}
                      onClick={() => handleConfigChange('model', model.name)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        buildingConfig.model === model.name
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="font-medium">{model.name}</div>
                      <div className="text-sm text-gray-600">Starting at ${model.basePrice.toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <h3 className="font-semibold mb-3 text-lg">Select Width</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[12, 16, 20, 24, 28, 32].map(width => (
                    <button
                      key={width}
                      onClick={() => handleConfigChange('width', width)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        buildingConfig.width === width
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {width}'
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h3 className="font-semibold mb-3 text-lg">Select Length</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[8, 10, 12, 16, 20, 24].map(depth => (
                    <button
                      key={depth}
                      onClick={() => handleConfigChange('depth', depth)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        buildingConfig.depth === depth
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {depth}'
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h3 className="font-semibold mb-3 text-lg">Select Roof</h3>
                <div className="space-y-2">
                  {['3:12', '4:12', '6:12'].map(pitch => (
                    <button
                      key={pitch}
                      onClick={() => handleConfigChange('roofPitch', pitch)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        buildingConfig.roofPitch === pitch
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {pitch} Pitch
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h3 className="font-semibold mb-3 text-lg">Select Siding Color</h3>
                <div className="grid grid-cols-2 gap-3">
                  {sidingColors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => handleConfigChange('sidingColor', color.color)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        buildingConfig.sidingColor === color.color
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div 
                        className="w-full h-8 rounded mb-2" 
                        style={{ backgroundColor: color.color }}
                      />
                      <div className="text-sm font-medium">{color.name}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">*Actual colors may vary</p>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <h3 className="font-semibold mb-3 text-lg">Select Trim Color</h3>
                <div className="grid grid-cols-2 gap-3">
                  {trimColors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => handleConfigChange('trimColor', color.color)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        buildingConfig.trimColor === color.color
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div 
                        className="w-full h-8 rounded mb-2" 
                        style={{ backgroundColor: color.color }}
                      />
                      <div className="text-sm font-medium">{color.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex space-x-2">
              <button 
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Previous
              </button>
              <button 
                onClick={nextStep}
                disabled={currentStep === steps.length - 1}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Next
              </button>
            </div>

            {/* Advanced Options */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Additional Options</h3>
              
              {/* Height Control */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Wall Height</label>
                <input 
                  type="range"
                  min="8"
                  max="16"
                  value={buildingConfig.height}
                  onChange={(e) => handleConfigChange('height', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-gray-600">{buildingConfig.height} feet</div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="font-medium">Features</h4>
                {Object.entries(buildingConfig.features).map(([feature, enabled]) => (
                  <label key={feature} className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      checked={enabled}
                      onChange={() => handleFeatureToggle(feature)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm capitalize">
                      {feature.replace(/([A-Z])/g, ' $1')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 border-t pt-6">
              <button 
                onClick={() => openModal('quote')}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-semibold text-lg shadow-lg"
              >
                Request Quote
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => openModal('share')}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Share
                </button>
                <button 
                  onClick={() => openModal('save')}
                  className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main 3D Viewer */}
        <div className="flex-1 relative">
          <div ref={mountRef} className="w-full h-screen" />
          
          {/* Enhanced Instructions Overlay */}
          <div className="absolute top-6 left-6 bg-black bg-opacity-80 text-white p-6 rounded-lg shadow-xl max-w-sm">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-bold">3D</span>
              </div>
              <h3 className="font-bold text-lg">Designer Instructions</h3>
            </div>
            <ul className="text-sm space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Click and drag to rotate view
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                Scroll wheel to zoom in/out
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                Right-click and drag to pan
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-gray-600">
              <p className="text-xs text-gray-300">3D configurators by ON THE Z</p>
            </div>
          </div>

          {/* Price Display */}
          <div className="absolute top-6 right-6 bg-white shadow-xl rounded-lg p-4 border-l-4 border-green-600">
            <div className="text-center">
              <p className="text-sm text-gray-600">Estimated Price</p>
              <p className="text-2xl font-bold text-green-600">${buildingConfig.price.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">*Price may vary based on location and options</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {modalType === 'quote' && (
              <div>
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
                  <h2 className="text-2xl font-bold">Request Quote</h2>
                  <p className="text-green-100 mt-1">Get a personalized quote for your building</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="First name"
                      value={quoteForm.firstName}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input 
                      type="text" 
                      placeholder="Last name"
                      value={quoteForm.lastName}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <input 
                    type="email" 
                    placeholder="Email address"
                    value={quoteForm.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone number"
                    value={quoteForm.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input 
                    type="text" 
                    placeholder="Street address"
                    value={quoteForm.address}
                    onChange={(e) => handleFormChange('address', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="City"
                      value={quoteForm.city}
                      onChange={(e) => handleFormChange('city', e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <select 
                      value={quoteForm.state}
                      onChange={(e) => handleFormChange('state', e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Zip code"
                      value={quoteForm.zip}
                      onChange={(e) => handleFormChange('zip', e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input 
                      type="text" 
                      placeholder="Delivery zip"
                      value={quoteForm.deliveryZip}
                      onChange={(e) => handleFormChange('deliveryZip', e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Who is your builder? (optional)"
                    value={quoteForm.builder}
                    onChange={(e) => handleFormChange('builder', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <textarea 
                    placeholder="Tell us about your building project (optional)"
                    value={quoteForm.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  
                  {/* Building Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Your Design Summary</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Model:</strong> {buildingConfig.model}</p>
                      <p><strong>Size:</strong> {buildingConfig.width}' × {buildingConfig.depth}' × {buildingConfig.height}'</p>
                      <p><strong>Estimated Price:</strong> <span className="text-green-600 font-bold">${buildingConfig.price.toLocaleString()}</span></p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 p-6 bg-gray-50 rounded-b-xl">
                  <button 
                    onClick={closeModal}
                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      alert('Quote request submitted! We\'ll contact you within 48 hours.');
                      closeModal();
                    }}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    Submit for Quote
                  </button>
                </div>
              </div>
            )}

            {modalType === 'share' && (
              <div>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
                  <h2 className="text-2xl font-bold">Share your creation</h2>
                  <p className="text-blue-100 mt-1">Share your building design with others</p>
                </div>
                <div className="p-6 space-y-4">
                  <input 
                    type="email" 
                    placeholder="Who would you like to share with? (email)"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Your first name"
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input 
                      type="text" 
                      placeholder="Your last name"
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <input 
                    type="email" 
                    placeholder="Your email address"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <textarea 
                    placeholder="Add a personal message (optional)"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  {/* Preview */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Sharing Design</h4>
                    <div className="text-sm text-gray-600">
                      <p>{buildingConfig.model} - {buildingConfig.width}' × {buildingConfig.depth}'</p>
                      <p className="text-blue-600 font-medium">Estimated: ${buildingConfig.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 p-6 bg-gray-50 rounded-b-xl">
                  <button 
                    onClick={closeModal}
                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      alert('Design shared successfully! The recipient will receive an email with your design.');
                      closeModal();
                    }}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Share Design
                  </button>
                </div>
              </div>
            )}

            {modalType === 'save' && (
              <div>
                <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-6 rounded-t-xl">
                  <h2 className="text-2xl font-bold">Save Your Design</h2>
                  <p className="text-gray-100 mt-1">Nice looking building! Save it for later.</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <h4 className="font-semibold text-green-800">Your Design</h4>
                    </div>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><strong>{buildingConfig.model}</strong></p>
                      <p>Size: {buildingConfig.width}' × {buildingConfig.depth}' × {buildingConfig.height}'</p>
                      <p>Price: <span className="font-bold">${buildingConfig.price.toLocaleString()}</span></p>
                    </div>
                  </div>
                  
                  <input 
                    type="email" 
                    placeholder="Email address to save design"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                  <textarea 
                    placeholder="Add notes about your design (optional)"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                  
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    <p>💡 When you save, you'll receive a link to return and make edits to your building design anytime.</p>
                  </div>
                </div>
                <div className="flex space-x-3 p-6 bg-gray-50 rounded-b-xl">
                  <button 
                    onClick={closeModal}
                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      alert('Design saved successfully! Check your email for the link to edit your design.');
                      closeModal();
                    }}
                    className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 font-medium transition-colors"
                  >
                    Save Design
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