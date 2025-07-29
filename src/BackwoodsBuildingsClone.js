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
    porchDepth: "4'",
    porchOverhang: "12\"",
    material: "Steel",
    grid: false,
    shutters: false,
    enclosed: false,
    postMiter: false,
    postWrap: false,
    posts: false
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
    builder: '',
    notes: ''
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
      [feature]: !prev[feature]
    }));
  };

  const handleFormChange = (field, value) => {
    setQuoteForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Exact Sidebar from target website */}
      <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
        {/* Header with logo placeholder */}
        <div className="p-4 border-b border-gray-300">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">Backwoods Buildings & Truss LLC.</div>
            <div className="text-sm text-gray-600">3D Designer</div>
          </div>
        </div>

        {/* Building Info Display */}
        <div className="p-4 border-b border-gray-300 bg-gray-50">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">To Building Center:</div>
            <div className="text-sm font-mono">0 ft. 0 in.</div>
            
            <div className="text-sm text-gray-600 mb-1 mt-2">To North Wall:</div>
            <div className="text-sm font-mono">0 ft. 0 in.</div>
            
            <div className="text-sm text-gray-600 mb-1 mt-2">Center to Ground:</div>
            <div className="text-sm font-mono">0 ft. 0 in.</div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs text-gray-600">W</div>
              <div className="text-sm font-mono">{buildingConfig.width} ft.</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">D</div>
              <div className="text-sm font-mono">{buildingConfig.depth} ft.</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">H</div>
              <div className="text-sm font-mono">{buildingConfig.height} ft.</div>
            </div>
          </div>
        </div>

        {/* Size Controls */}
        <div className="p-4 border-b border-gray-300">
          <h3 className="font-semibold text-gray-800 mb-3">Size</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700 w-20">Width:</label>
              <input 
                type="range"
                min="8"
                max="40"
                value={buildingConfig.width}
                onChange={(e) => handleConfigChange('width', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm w-12">{buildingConfig.width}'</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700 w-20">Depth:</label>
              <input 
                type="range"
                min="8"
                max="40"
                value={buildingConfig.depth}
                onChange={(e) => handleConfigChange('depth', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm w-12">{buildingConfig.depth}'</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700 w-20">Height:</label>
              <input 
                type="range"
                min="7"
                max="12"
                value={buildingConfig.height}
                onChange={(e) => handleConfigChange('height', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm w-12">{buildingConfig.height}'</span>
            </div>
          </div>
        </div>

        {/* Ceiling Height */}
        <div className="p-4 border-b border-gray-300">
          <h3 className="font-semibold text-gray-800 mb-2">Ceiling Height</h3>
          <div className="grid grid-cols-5 gap-1">
            {["7' 0\"", "7' 6\"", "8' 0\"", "8' 6\"", "9' 0\""].map(height => (
              <button
                key={height}
                onClick={() => handleConfigChange('ceilingHeight', height)}
                className={`text-xs py-1 px-1 border rounded ${
                  buildingConfig.ceilingHeight === height 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {height}
              </button>
            ))}
          </div>
        </div>

        {/* Porch Depth */}
        <div className="p-4 border-b border-gray-300">
          <h3 className="font-semibold text-gray-800 mb-2">Porch Depth</h3>
          <div className="grid grid-cols-5 gap-1">
            {["2'", "4'", "6'", "8'", "10'"].map(depth => (
              <button
                key={depth}
                onClick={() => handleConfigChange('porchDepth', depth)}
                className={`text-xs py-1 px-1 border rounded ${
                  buildingConfig.porchDepth === depth 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {depth}
              </button>
            ))}
          </div>
        </div>

        {/* Porch Overhang */}
        <div className="p-4 border-b border-gray-300">
          <h3 className="font-semibold text-gray-800 mb-2">Porch Overhang</h3>
          <div className="grid grid-cols-2 gap-1">
            {["12\"", "24\""].map(overhang => (
              <button
                key={overhang}
                onClick={() => handleConfigChange('porchOverhang', overhang)}
                className={`text-xs py-1 px-2 border rounded ${
                  buildingConfig.porchOverhang === overhang 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {overhang}
              </button>
            ))}
          </div>
        </div>

        {/* Material */}
        <div className="p-4 border-b border-gray-300">
          <h3 className="font-semibold text-gray-800 mb-2">Material</h3>
          <div className="grid grid-cols-2 gap-1">
            {["Steel", "Half Wood", "Wood", "Drywall"].map(material => (
              <button
                key={material}
                onClick={() => handleConfigChange('material', material)}
                className={`text-xs py-1 px-2 border rounded ${
                  buildingConfig.material === material 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {material}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="p-4 border-b border-gray-300">
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'grid', label: 'Grid' },
              { key: 'shutters', label: 'Shutters' },
              { key: 'enclosed', label: 'Enclosed' },
              { key: 'postMiter', label: 'Post Miter' },
              { key: 'postWrap', label: 'Post Wrap' },
              { key: 'posts', label: 'Posts' }
            ].map(feature => (
              <button
                key={feature.key}
                onClick={() => handleFeatureToggle(feature.key)}
                className={`text-xs py-2 px-2 border rounded ${
                  buildingConfig[feature.key] 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {feature.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rotate Buttons */}
        <div className="p-4 border-b border-gray-300">
          <div className="grid grid-cols-2 gap-2">
            <button className="text-xs py-2 px-2 bg-gray-200 text-gray-700 border border-gray-300 rounded hover:bg-gray-300">
              Rotate ↻
            </button>
            <button className="text-xs py-2 px-2 bg-gray-200 text-gray-700 border border-gray-300 rounded hover:bg-gray-300">
              Rotate ↺
            </button>
          </div>
        </div>

        {/* Door Swing */}
        <div className="p-4 border-b border-gray-300">
          <div className="grid grid-cols-2 gap-2">
            <button className="text-xs py-2 px-2 bg-gray-200 text-gray-700 border border-gray-300 rounded hover:bg-gray-300">
              Door Swing
            </button>
            <button className="text-xs py-2 px-2 bg-blue-500 text-white border border-blue-500 rounded hover:bg-blue-600">
              Update
            </button>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="flex-1"></div>
      </div>

      {/* Main 3D Viewer */}
      <div className="flex-1 relative">
        <div ref={mountRef} className="w-full h-screen" />
        
        {/* Instructions Overlay */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded">
          <h3 className="font-semibold mb-2">3D Designer Instructions:</h3>
          <ul className="text-sm space-y-1">
            <li>1. Click or touch and drag to rotate.</li>
            <li>2. Scroll or pinch to zoom in and out.</li>
            <li>3. Right Click or 3 finger swipe to move.</li>
            <li>4. Click or touch on doors and windows for additional options.</li>
          </ul>
          <p className="text-xs mt-2 text-gray-300">3D configurators by ON THE Z</p>
        </div>

        {/* Company Info */}
        <div className="absolute bottom-4 right-4 text-right text-sm text-gray-600">
          <div className="font-semibold">Backwoods Buildings & Truss LLC.</div>
          <div>(555) 123-4567</div>
        </div>

        {/* Top Right Buttons */}
        <div className="absolute top-4 right-4 space-y-2">
          <button 
            onClick={() => openModal('quote')}
            className="block w-32 bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-700"
          >
            Request Quote
          </button>
          <button 
            onClick={() => openModal('share')}
            className="block w-32 bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700"
          >
            Share
          </button>
          <button 
            onClick={() => openModal('save')}
            className="block w-32 bg-gray-600 text-white py-2 px-4 rounded text-sm hover:bg-gray-700"
          >
            Save
          </button>
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
                  <textarea 
                    placeholder="Notes (optional)"
                    value={quoteForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
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
                <h2 className="text-xl font-bold mb-4">Save Design</h2>
                <p className="mb-4">Email my saved design</p>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Email address"
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