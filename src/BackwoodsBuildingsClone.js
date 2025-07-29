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
    windows: [],
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
    { name: 'White', color: '#FFFFFF' },
    { name: 'Gray', color: '#808080' },
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
    scene.background = new THREE.Color(0x87CEEB);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(25, 15, 25);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    mountRef.current.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    
    // Initial building
    createBuilding();
    
    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
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
      
      const rotationSpeed = 0.005;
      camera.position.x = camera.position.x * Math.cos(deltaMove.x * rotationSpeed) - camera.position.z * Math.sin(deltaMove.x * rotationSpeed);
      camera.position.z = camera.position.x * Math.sin(deltaMove.x * rotationSpeed) + camera.position.z * Math.cos(deltaMove.x * rotationSpeed);
      
      camera.lookAt(0, 0, 0);
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };
    
    const handleMouseUp = () => {
      isDragging = false;
    };
    
    const handleWheel = (event) => {
      const zoomSpeed = 0.1;
      const direction = event.deltaY > 0 ? 1 : -1;
      camera.position.multiplyScalar(1 + direction * zoomSpeed);
      camera.lookAt(0, 0, 0);
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
    
    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update building when config changes
  useEffect(() => {
    createBuilding();
    calculatePricing();
  }, [buildingConfig.model, buildingConfig.width, buildingConfig.length, buildingConfig.height, buildingConfig.roofStyle, buildingConfig.features]);

  // Create 3D Building
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
    
    // Walls
    const wallMaterial = new THREE.MeshLambertMaterial({ color: buildingConfig.sidingColor });
    
    // Front wall
    const frontWallGeometry = new THREE.PlaneGeometry(width, height);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, height/2, length/2);
    frontWall.castShadow = true;
    buildingGroup.add(frontWall);
    
    // Back wall
    const backWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    backWall.position.set(0, height/2, -length/2);
    backWall.rotation.y = Math.PI;
    backWall.castShadow = true;
    buildingGroup.add(backWall);
    
    // Side walls
    const sideWallGeometry = new THREE.PlaneGeometry(length, height);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-width/2, height/2, 0);
    leftWall.rotation.y = Math.PI/2;
    leftWall.castShadow = true;
    buildingGroup.add(leftWall);
    
    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(width/2, height/2, 0);
    rightWall.rotation.y = -Math.PI/2;
    rightWall.castShadow = true;
    buildingGroup.add(rightWall);
    
    // Roof
    const roofMaterial = new THREE.MeshLambertMaterial({ color: buildingConfig.roofColor });
    
    if (buildingConfig.roofStyle === 'Gable') {
      // Gable roof
      const roofGeometry = new THREE.PlaneGeometry(width * 1.2, length * 1.2);
      const leftRoof = new THREE.Mesh(roofGeometry, roofMaterial);
      leftRoof.position.set(-width/4, height + 2, 0);
      leftRoof.rotation.z = Math.PI/6;
      leftRoof.castShadow = true;
      buildingGroup.add(leftRoof);
      
      const rightRoof = new THREE.Mesh(roofGeometry, roofMaterial);
      rightRoof.position.set(width/4, height + 2, 0);
      rightRoof.rotation.z = -Math.PI/6;
      rightRoof.castShadow = true;
      buildingGroup.add(rightRoof);
    } else if (buildingConfig.roofStyle === 'Hip') {
      // Hip roof (simplified)
      const roofGeometry = new THREE.ConeGeometry(Math.max(width, length)/2, 3, 4);
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(0, height + 1.5, 0);
      roof.rotation.y = Math.PI/4;
      roof.castShadow = true;
      buildingGroup.add(roof);
    }
    
    // Door
    const doorMaterial = new THREE.MeshLambertMaterial({ color: buildingConfig.trimColor });
    const doorGeometry = new THREE.PlaneGeometry(3, 6.5);
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(-width/4, 3.25, length/2 + 0.01);
    buildingGroup.add(door);
    
    // Door frame
    const frameMaterial = new THREE.MeshLambertMaterial({ color: buildingConfig.trimColor });
    const frameGeometry = new THREE.BoxGeometry(3.5, 7, 0.2);
    const doorFrame = new THREE.Mesh(frameGeometry, frameMaterial);
    doorFrame.position.set(-width/4, 3.5, length/2 + 0.1);
    buildingGroup.add(doorFrame);
    
    // Windows (if any)
    buildingConfig.windows.forEach((window, index) => {
      const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.7 });
      const windowGeometry = new THREE.PlaneGeometry(2, 2);
      const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
      windowMesh.position.set(width/4, height/2, length/2 + 0.01);
      buildingGroup.add(windowMesh);
    });
    
    buildingRef.current = buildingGroup;
    sceneRef.current.add(buildingGroup);
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
                { key: 'loft', name: 'Loft Storage', price: 800, description: 'Additional overhead storage space' },
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