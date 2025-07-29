import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

const BackwoodsBuildingsClone = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [buildingConfig, setBuildingConfig] = useState({
    width: 24,
    depth: 12,
    height: 8,
    ceilingHeight: "8' 0\"",
    roofPitch: "4:12",
    roofOverhang: "12\"",
    material: "Steel",
    features: {
      shutters: false,
      enclosed: false,
      postWrap: false,
      concrete: false
    }
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
    description: ''
  });

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const buildingRef = useRef(null);

  // Initialize 3D Scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(30, 20, 30);
    
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
    
    // Controls
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
      
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position);
      spherical.theta -= deltaMove.x * 0.01;
      spherical.phi += deltaMove.y * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
      
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
      
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };
    
    const handleMouseUp = () => {
      isDragging = false;
    };
    
    const handleWheel = (event) => {
      const scale = event.deltaY > 0 ? 1.1 : 0.9;
      camera.position.multiplyScalar(scale);
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
    
    // Walls
    const wallMaterial = new THREE.MeshLambertMaterial({ 
      color: buildingConfig.material === 'Steel' ? 0x8B4513 : 
             buildingConfig.material === 'Wood' ? 0xDEB887 : 0xD3D3D3 
    });
    
    // Front and back walls
    const frontWallGeometry = new THREE.PlaneGeometry(buildingConfig.width, wallHeight);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, wallHeight/2, buildingConfig.depth/2);
    building.add(frontWall);
    
    const backWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    backWall.position.set(0, wallHeight/2, -buildingConfig.depth/2);
    backWall.rotation.y = Math.PI;
    building.add(backWall);
    
    // Side walls
    const sideWallGeometry = new THREE.PlaneGeometry(buildingConfig.depth, wallHeight);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-buildingConfig.width/2, wallHeight/2, 0);
    leftWall.rotation.y = Math.PI/2;
    building.add(leftWall);
    
    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(buildingConfig.width/2, wallHeight/2, 0);
    rightWall.rotation.y = -Math.PI/2;
    building.add(rightWall);
    
    // Roof
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const roofGeometry = new THREE.CylinderGeometry(0, buildingConfig.width/2 + 2, roofHeight, 4);
    roofGeometry.rotateY(Math.PI/4);
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, wallHeight + roofHeight/2, 0);
    roof.scale.set(1, 1, buildingConfig.depth/buildingConfig.width);
    building.add(roof);
    
    // Door
    const doorGeometry = new THREE.PlaneGeometry(3, 7);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(-buildingConfig.width/4, 3.5, buildingConfig.depth/2 + 0.1);
    building.add(door);
    
    // Window
    const windowGeometry = new THREE.PlaneGeometry(4, 3);
    const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB });
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(buildingConfig.width/4, 5, buildingConfig.depth/2 + 0.1);
    building.add(window1);
    
    building.castShadow = true;
    buildingRef.current = building;
    sceneRef.current.add(building);
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-800 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Backwoods Buildings & Truss LLC.</h1>
          <p className="text-sm">3D Designer</p>
        </div>
      </header>

      <div className="flex">
        {/* Left Panel - Controls */}
        <div className="w-80 bg-white shadow-lg p-4 max-h-screen overflow-y-auto">
          <div className="space-y-6">
            {/* Size Controls */}
            <div>
              <h3 className="font-semibold mb-3">Size</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <label className="w-8">W</label>
                  <input 
                    type="number" 
                    value={buildingConfig.width}
                    onChange={(e) => handleConfigChange('width', parseInt(e.target.value))}
                    className="border rounded px-2 py-1 w-16"
                  />
                  <span>ft.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="w-8">D</label>
                  <input 
                    type="number" 
                    value={buildingConfig.depth}
                    onChange={(e) => handleConfigChange('depth', parseInt(e.target.value))}
                    className="border rounded px-2 py-1 w-16"
                  />
                  <span>ft.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="w-8">H</label>
                  <input 
                    type="number" 
                    value={buildingConfig.height}
                    onChange={(e) => handleConfigChange('height', parseInt(e.target.value))}
                    className="border rounded px-2 py-1 w-16"
                  />
                  <span>ft.</span>
                </div>
              </div>
            </div>

            {/* Ceiling Height */}
            <div>
              <h3 className="font-semibold mb-2">Ceiling Height</h3>
              <select 
                value={buildingConfig.ceilingHeight}
                onChange={(e) => handleConfigChange('ceilingHeight', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option>7' 0"</option>
                <option>7' 6"</option>
                <option>8' 0"</option>
                <option>8' 6"</option>
                <option>9' 0"</option>
              </select>
            </div>

            {/* Roof Pitch */}
            <div>
              <h3 className="font-semibold mb-2">Roof Pitch</h3>
              <select 
                value={buildingConfig.roofPitch}
                onChange={(e) => handleConfigChange('roofPitch', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option>3:12</option>
                <option>4:12</option>
                <option>6:12</option>
              </select>
            </div>

            {/* Roof Overhang */}
            <div>
              <h3 className="font-semibold mb-2">Roof Overhang</h3>
              <select 
                value={buildingConfig.roofOverhang}
                onChange={(e) => handleConfigChange('roofOverhang', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option>None</option>
                <option>12"</option>
                <option>18"</option>
                <option>24"</option>
              </select>
            </div>

            {/* Material */}
            <div>
              <h3 className="font-semibold mb-2">Material</h3>
              <select 
                value={buildingConfig.material}
                onChange={(e) => handleConfigChange('material', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option>Steel</option>
                <option>Half Wood</option>
                <option>Wood</option>
                <option>Drywall</option>
              </select>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <div className="space-y-2">
                {Object.entries(buildingConfig.features).map(([feature, enabled]) => (
                  <label key={feature} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={enabled}
                      onChange={() => handleFeatureToggle(feature)}
                      className="rounded"
                    />
                    <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button 
                onClick={() => openModal('quote')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                Request Quote
              </button>
              <button 
                onClick={() => openModal('share')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Share Creation
              </button>
              <button 
                onClick={() => openModal('save')}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
              >
                Save Design
              </button>
            </div>
          </div>
        </div>

        {/* Main 3D Viewer */}
        <div className="flex-1 relative">
          <div ref={mountRef} className="w-full h-screen" />
          
          {/* Instructions Overlay */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded">
            <h3 className="font-semibold mb-2">3D Designer Instructions:</h3>
            <ul className="text-sm space-y-1">
              <li>Click and drag to rotate</li>
              <li>Scroll to zoom in and out</li>
              <li>Right click to move</li>
            </ul>
            <p className="text-xs mt-2 text-gray-300">3D configurators by ON THE Z</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            {modalType === 'quote' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Request Quote</h2>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="First name"
                    value={quoteForm.firstName}
                    onChange={(e) => handleFormChange('firstName', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                  <input 
                    type="text" 
                    placeholder="Last name"
                    value={quoteForm.lastName}
                    onChange={(e) => handleFormChange('lastName', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                  <input 
                    type="email" 
                    placeholder="Email"
                    value={quoteForm.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone"
                    value={quoteForm.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                  <input 
                    type="text" 
                    placeholder="Address"
                    value={quoteForm.address}
                    onChange={(e) => handleFormChange('address', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                  <input 
                    type="text" 
                    placeholder="City"
                    value={quoteForm.city}
                    onChange={(e) => handleFormChange('city', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                  <select 
                    value={quoteForm.state}
                    onChange={(e) => handleFormChange('state', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option>Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <input 
                    type="text" 
                    placeholder="Zip"
                    value={quoteForm.zip}
                    onChange={(e) => handleFormChange('zip', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                  <textarea 
                    placeholder="Tell Us About Your Building (optional)"
                    value={quoteForm.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="w-full border rounded px-3 py-2 h-20"
                  />
                </div>
                <div className="flex space-x-2 mt-4">
                  <button 
                    onClick={closeModal}
                    className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      alert('Quote request submitted!');
                      closeModal();
                    }}
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}

            {modalType === 'share' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Share your creation</h2>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Who would you like to share with? (email)"
                    className="w-full border rounded px-3 py-2"
                  />
                  <input 
                    type="text" 
                    placeholder="Your first name"
                    className="w-full border rounded px-3 py-2"
                  />
                  <input 
                    type="text" 
                    placeholder="Your last name"
                    className="w-full border rounded px-3 py-2"
                  />
                  <input 
                    type="email" 
                    placeholder="Your email address"
                    className="w-full border rounded px-3 py-2"
                  />
                  <textarea 
                    placeholder="Notes (optional)"
                    className="w-full border rounded px-3 py-2 h-20"
                  />
                </div>
                <div className="flex space-x-2 mt-4">
                  <button 
                    onClick={closeModal}
                    className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      alert('Design shared successfully!');
                      closeModal();
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    Share
                  </button>
                </div>
              </div>
            )}

            {modalType === 'save' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Nice looking building!</h2>
                <p className="mb-4">Email my saved design</p>
                <div className="space-y-3">
                  <textarea 
                    placeholder="Notes (optional)"
                    className="w-full border rounded px-3 py-2 h-20"
                  />
                </div>
                <div className="flex space-x-2 mt-4">
                  <button 
                    onClick={closeModal}
                    className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      alert('Design saved successfully!');
                      closeModal();
                    }}
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    Save
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