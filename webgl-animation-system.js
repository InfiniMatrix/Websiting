/**
 * IAA Solutions - Advanced WebGL Neural Network Animation
 * This script creates interactive, high-performance neural network animations
 * using WebGL for accelerated graphics rendering.
 */

class WebGLNeuralNetwork {
  constructor(container, options = {}) {
    // Get container element
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
      
    if (!this.container) {
      console.warn('WebGL neural network container not found');
      return;
    }
    
    // Default configuration options
    this.options = {
      nodeCount: 150,
      connectionDistance: 120,
      nodeColor: [0.31, 0.27, 0.9, 1.0], // Primary neural blue
      connectionColor: [0.31, 0.27, 0.9, 0.15], // Semi-transparent neural blue
      glowColor: [0.4, 0.35, 0.95, 0.3], // Neural glow
      nodeSize: 2.5,
      speed: 0.5,
      interactive: true,
      pulseEffect: true,
      adaptivePerformance: true,
      theme: 'light', // 'light' or 'dark'
      dataFlowEffect: true,
      ...options
    };
    
    // Initialize state
    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;
    this.time = 0;
    this.nodes = [];
    this.mouse = { x: 0, y: 0, active: false };
    this.isVisible = true;
    this.shouldRender = true;
    this.performanceLevel = 'high';
    
    // Initialize WebGL
    this.initWebGL();
    
    // Check for performance issues and adapt
    if (this.options.adaptivePerformance) {
      this.checkPerformance();
    }
    
    // Create nodes data
    this.createNodes();
    
    // Set up event handlers
    this.setupEventListeners();
    
    // Start animation loop
    this.resize();
    this.animate();
  }
  
  /**
   * Initialize WebGL context and set up shaders
   */
  initWebGL() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('ai-webgl-canvas');
    this.container.appendChild(this.canvas);
    
    // Get WebGL context (try WebGL 2 first, then fallback to WebGL 1)
    this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    
    if (!this.gl) {
      console.error('WebGL not supported. Falling back to Canvas rendering.');
      this.fallbackToCanvas();
      return;
    }
    
    // Set up shader programs
    this.setupShaders();
    
    // Create buffers for nodes and connections
    this.createBuffers();
  }
  
  /**
   * Set up WebGL shaders for nodes and connections
   */
  setupShaders() {
    // Node Vertex Shader
    const nodeVertexShaderSource = `
      attribute vec2 aPosition;
      attribute float aSize;
      
      uniform vec2 uResolution;
      uniform float uTime;
      
      varying float vSize;
      
      void main() {
        vSize = aSize;
        
        // Convert from pixel space to clip space
        vec2 position = aPosition / uResolution * 2.0 - 1.0;
        position.y *= -1.0;
        
        gl_Position = vec4(position, 0.0, 1.0);
        gl_PointSize = aSize * (1.0 + 0.2 * sin(uTime * 0.001 + aPosition.x + aPosition.y));
      }
    `;
    
    // Node Fragment Shader
    const nodeFragmentShaderSource = `
      precision mediump float;
      
      uniform vec4 uNodeColor;
      uniform vec4 uGlowColor;
      uniform float uTime;
      
      varying float vSize;
      
      void main() {
        // Calculate distance from center of point
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center) * 2.0;
        
        // Create soft circle with glow
        float circle = smoothstep(1.0, 0.0, dist);
        float glow = smoothstep(1.5, 0.5, dist) * 0.5;
        
        // Pulse effect based on time
        float pulse = 0.05 * sin(uTime * 0.001 + vSize);
        
        // Combine colors
        vec4 color = mix(uGlowColor, uNodeColor, circle);
        
        // Apply alpha
        float alpha = (circle + glow * (0.5 + pulse)) * color.a;
        
        gl_FragColor = vec4(color.rgb, alpha);
      }
    `;
    
    // Connection Vertex Shader
    const connectionVertexShaderSource = `
      attribute vec2 aPosition;
      
      uniform vec2 uResolution;
      uniform float uTime;
      
      void main() {
        // Convert from pixel space to clip space
        vec2 position = aPosition / uResolution * 2.0 - 1.0;
        position.y *= -1.0;
        
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;
    
    // Connection Fragment Shader
    const connectionFragmentShaderSource = `
      precision mediump float;
      
      uniform vec4 uConnectionColor;
      uniform float uTime;
      
      void main() {
        gl_FragColor = uConnectionColor;
      }
    `;
    
    // Compile shaders
    this.nodeProgram = this.createShaderProgram(nodeVertexShaderSource, nodeFragmentShaderSource);
    this.connectionProgram = this.createShaderProgram(connectionVertexShaderSource, connectionFragmentShaderSource);
    
    // Get attribute and uniform locations for node program
    this.nodeProgram.aPosition = this.gl.getAttribLocation(this.nodeProgram, 'aPosition');
    this.nodeProgram.aSize = this.gl.getAttribLocation(this.nodeProgram, 'aSize');
    this.nodeProgram.uResolution = this.gl.getUniformLocation(this.nodeProgram, 'uResolution');
    this.nodeProgram.uTime = this.gl.getUniformLocation(this.nodeProgram, 'uTime');
    this.nodeProgram.uNodeColor = this.gl.getUniformLocation(this.nodeProgram, 'uNodeColor');
    this.nodeProgram.uGlowColor = this.gl.getUniformLocation(this.nodeProgram, 'uGlowColor');
    
    // Get attribute and uniform locations for connection program
    this.connectionProgram.aPosition = this.gl.getAttribLocation(this.connectionProgram, 'aPosition');
    this.connectionProgram.uResolution = this.gl.getUniformLocation(this.connectionProgram, 'uResolution');
    this.connectionProgram.uTime = this.gl.getUniformLocation(this.connectionProgram, 'uTime');
    this.connectionProgram.uConnectionColor = this.gl.getUniformLocation(this.connectionProgram, 'uConnectionColor');
  }
  
  /**
   * Create and compile a WebGL shader program
   */
  createShaderProgram(vertexSource, fragmentSource) {
    const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(vertexShader, vertexSource);
    this.gl.compileShader(vertexShader);
    
    if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
      console.error('Vertex shader compilation failed:', this.gl.getShaderInfoLog(vertexShader));
      return null;
    }
    
    const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fragmentShader, fragmentSource);
    this.gl.compileShader(fragmentShader);
    
    if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
      console.error('Fragment shader compilation failed:', this.gl.getShaderInfoLog(fragmentShader));
      return null;
    }
    
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Shader program linking failed:', this.gl.getProgramInfoLog(program));
      return null;
    }
    
    return program;
  }
  
  /**
   * Create WebGL buffers for nodes and connections
   */
  createBuffers() {
    // Node position buffer
    this.nodePositionBuffer = this.gl.createBuffer();
    
    // Node size buffer
    this.nodeSizeBuffer = this.gl.createBuffer();
    
    // Connection position buffer
    this.connectionPositionBuffer = this.gl.createBuffer();
  }
  
  /**
   * Initialize node data
   */
  createNodes() {
    this.nodes = [];
    const count = this.adjustNodeCountForPerformance();
    
    for (let i = 0; i < count; i++) {
      this.nodes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * this.options.speed,
        vy: (Math.random() - 0.5) * this.options.speed,
        size: Math.random() * this.options.nodeSize + 1.5,
        originalSize: Math.random() * this.options.nodeSize + 1.5,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }
  
  /**
   * Set up event listeners for interaction and visibility
   */
  setupEventListeners() {
    // Resize handler
    window.addEventListener('resize', this.resize.bind(this));
    
    // Mouse interaction
    if (this.options.interactive) {
      this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
      this.container.addEventListener('mouseleave', () => {
        this.mouse.active = false;
      });
      this.container.addEventListener('mouseenter', () => {
        this.mouse.active = true;
      });
      
      // Touch support
      this.container.addEventListener('touchmove', this.handleTouchMove.bind(this));
      this.container.addEventListener('touchstart', this.handleTouchMove.bind(this));
      this.container.addEventListener('touchend', () => {
        this.mouse.active = false;
      });
    }
    
    // Optimize by pausing animation when not visible
    if ('IntersectionObserver' in window) {
      this.visibilityObserver = new IntersectionObserver((entries) => {
        this.isVisible = entries[0].isIntersecting;
      }, {
        rootMargin: '100px'
      });
      
      this.visibilityObserver.observe(this.container);
    }
    
    // Pause animation when tab is not active
    document.addEventListener('visibilitychange', () => {
      this.shouldRender = document.visibilityState === 'visible';
    });
  }
  
  /**
   * Handle mouse movement for interaction
   */
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
    this.mouse.active = true;
  }
  
  /**
   * Handle touch movement for interaction
   */
  handleTouchMove(e) {
    if (e.touches.length > 0) {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.touches[0].clientX - rect.left;
      this.mouse.y = e.touches[0].clientY - rect.top;
      this.mouse.active = true;
      e.preventDefault();
    }
  }
  
  /**
   * Resize the WebGL canvas to match container dimensions
   */
  resize() {
    // Get current dimensions
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    
    // Set canvas size accounting for pixel ratio
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    
    // Adjust WebGL viewport
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    
    // Reset node positions for new dimensions
    this.nodes.forEach(node => {
      node.x = Math.random() * this.width;
      node.y = Math.random() * this.height;
    });
  }
  
  /**
   * Check device capabilities and adjust settings for performance
   */
  checkPerformance() {
    // Check for low-end devices
    const isLowEndDevice = 
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
    
    // Check for mid-range devices
    const isMidRangeDevice =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 6) ||
      /iPad|Android Tablet/i.test(navigator.userAgent) ||
      (window.matchMedia && window.matchMedia('(max-width: 1024px)').matches);
    
    // Adjust settings based on device capabilities
    if (isLowEndDevice) {
      this.performanceLevel = 'low';
      this.options.nodeCount = Math.floor(this.options.nodeCount * 0.3);
      this.options.connectionDistance = Math.floor(this.options.connectionDistance * 0.7);
      this.options.speed *= 0.7;
      this.options.dataFlowEffect = false;
    } else if (isMidRangeDevice) {
      this.performanceLevel = 'medium';
      this.options.nodeCount = Math.floor(this.options.nodeCount * 0.6);
      this.options.connectionDistance = Math.floor(this.options.connectionDistance * 0.8);
    }
    
    // Test WebGL performance with a benchmark
    this.runWebGLBenchmark();
  }
  
  /**
   * Run a quick WebGL benchmark to test rendering performance
   */
  runWebGLBenchmark() {
    // Simple benchmark: render 1000 points and measure time
    const benchmarkStart = performance.now();
    
    // Create temporary benchmark data
    const tempNodes = [];
    for (let i = 0; i < 1000; i++) {
      tempNodes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 3
      });
    }
    
    // Create position data for benchmark
    const positionData = new Float32Array(tempNodes.length * 2);
    const sizeData = new Float32Array(tempNodes.length);
    
    tempNodes.forEach((node, i) => {
      positionData[i * 2] = node.x;
      positionData[i * 2 + 1] = node.y;
      sizeData[i] = node.size;
    });
    
    // Bind position buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodePositionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positionData, this.gl.STATIC_DRAW);
    
    // Bind size buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeSizeBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, sizeData, this.gl.STATIC_DRAW);
    
    // Use shader program
    this.gl.useProgram(this.nodeProgram);
    
    // Set uniforms
    this.gl.uniform2f(this.nodeProgram.uResolution, this.width, this.height);
    this.gl.uniform1f(this.nodeProgram.uTime, 0);
    this.gl.uniform4fv(this.nodeProgram.uNodeColor, this.options.nodeColor);
    this.gl.uniform4fv(this.nodeProgram.uGlowColor, this.options.glowColor);
    
    // Draw points
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodePositionBuffer);
    this.gl.vertexAttribPointer(this.nodeProgram.aPosition, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.nodeProgram.aPosition);
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeSizeBuffer);
    this.gl.vertexAttribPointer(this.nodeProgram.aSize, 1, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.nodeProgram.aSize);
    
    this.gl.drawArrays(this.gl.POINTS, 0, tempNodes.length);
    
    // Force WebGL to complete operations
    this.gl.finish();
    
    // Calculate benchmark time
    const benchmarkTime = performance.now() - benchmarkStart;
    
    // Further adjust settings based on benchmark results
    if (benchmarkTime > 10) {
      // Slow rendering, downgrade performance
      if (this.performanceLevel === 'high') {
        this.performanceLevel = 'medium';
        this.options.nodeCount = Math.floor(this.options.nodeCount * 0.7);
      } else if (this.performanceLevel === 'medium') {
        this.performanceLevel = 'low';
        this.options.nodeCount = Math.floor(this.options.nodeCount * 0.5);
        this.options.dataFlowEffect = false;
      }
    }
  }
  
  /**
   * Adjust node count based on performance level
   */
  adjustNodeCountForPerformance() {
    // Base count from options
    let nodeCount = this.options.nodeCount;
    
    // Adjust based on screen size
    const screenArea = this.width * this.height;
    const referenceArea = 1920 * 1080; // Reference screen size
    const sizeRatio = Math.min(1, screenArea / referenceArea);
    
    nodeCount = Math.floor(nodeCount * sizeRatio);
    
    // Apply performance level adjustment
    if (this.performanceLevel === 'low') {
      nodeCount = Math.min(nodeCount, 50);
    } else if (this.performanceLevel === 'medium') {
      nodeCount = Math.min(nodeCount, 100);
    }
    
    return nodeCount;
  }
  
  /**
   * Update node positions and interactions
   */
  updateNodes() {
    this.nodes.forEach(node => {
      // Update position
      node.x += node.vx;
      node.y += node.vy;
      
      // Boundary checks
      if (node.x < 0 || node.x > this.width) {
        node.vx *= -1;
        node.x = Math.max(0, Math.min(this.width, node.x));
      }
      
      if (node.y < 0 || node.y > this.height) {
        node.vy *= -1;
        node.y = Math.max(0, Math.min(this.height, node.y));
      }
      
      // Apply pulse effect
      if (this.options.pulseEffect) {
        const pulseRate = 0.002;
        const pulseAmount = 0.2;
        node.size = node.originalSize * (1 + pulseAmount * Math.sin(this.time * pulseRate + node.pulseOffset));
      }
      
      // Mouse interaction
      if (this.mouse.active) {
        const dx = this.mouse.x - node.x;
        const dy = this.mouse.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = this.options.connectionDistance * 1.5;
        
        if (distance < maxDistance) {
          // Calculate influence factor (stronger when closer)
          const influence = (1 - distance / maxDistance) * 0.05;
          
          // Move nodes towards or away from mouse based on options
          const repelFactor = -1; // Negative for repel, positive for attract
          node.vx += dx * influence * repelFactor;
          node.vy += dy * influence * repelFactor;
          
          // Limit velocity
          const maxVelocity = this.options.speed * 2;
          const velocityMagnitude = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
          
          if (velocityMagnitude > maxVelocity) {
            const scale = maxVelocity / velocityMagnitude;
            node.vx *= scale;
            node.vy *= scale;
          }
        }
      }
    });
  }
  
  /**
   * Prepare node data for rendering
   */
  prepareNodeData() {
    // Create arrays for position and size data
    const positionData = new Float32Array(this.nodes.length * 2);
    const sizeData = new Float32Array(this.nodes.length);
    
    // Fill arrays with node data
    this.nodes.forEach((node, i) => {
      positionData[i * 2] = node.x;
      positionData[i * 2 + 1] = node.y;
      sizeData[i] = node.size;
    });
    
    // Update WebGL buffers
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodePositionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positionData, this.gl.DYNAMIC_DRAW);
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeSizeBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, sizeData, this.gl.DYNAMIC_DRAW);
    
    return {
      count: this.nodes.length
    };
  }
  
  /**
   * Prepare connection data for rendering
   */
  prepareConnectionData() {
    // Get connection distance threshold
    const connectionDistance = this.options.connectionDistance;
    
    // Arrays to store connection data
    const connections = [];
    
    // Find connections between nodes
    for (let i = 0; i < this.nodes.length; i++) {
      const nodeA = this.nodes[i];
      
      // Check connections with other nodes
      for (let j = i + 1; j < this.nodes.length; j++) {
        const nodeB = this.nodes[j];
        
        // Calculate distance between nodes
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Create connection if within threshold
        if (distance < connectionDistance) {
          connections.push(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
        }
      }
      
      // Connect to mouse if active
      if (this.mouse.active) {
        const dx = this.mouse.x - nodeA.x;
        const dy = this.mouse.y - nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < connectionDistance * 1.5) {
          connections.push(nodeA.x, nodeA.y, this.mouse.x, this.mouse.y);
        }
      }
    }
    
    // Convert to Float32Array for WebGL
    const connectionData = new Float32Array(connections);
    
    // Update WebGL buffer with connection data
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.connectionPositionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, connectionData, this.gl.DYNAMIC_DRAW);
    
    return {
      count: connections.length / 2
    };
  }
  
  /**
   * Render nodes using WebGL
   */
  renderNodes(nodeData) {
    // Use node shader program
    this.gl.useProgram(this.nodeProgram);
    
    // Set uniforms
    this.gl.uniform2f(this.nodeProgram.uResolution, this.width, this.height);
    this.gl.uniform1f(this.nodeProgram.uTime, this.time);
    this.gl.uniform4fv(this.nodeProgram.uNodeColor, this.options.nodeColor);
    this.gl.uniform4fv(this.nodeProgram.uGlowColor, this.options.glowColor);
    
    // Enable attributes
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodePositionBuffer);
    this.gl.vertexAttribPointer(this.nodeProgram.aPosition, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.nodeProgram.aPosition);
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeSizeBuffer);
    this.gl.vertexAttribPointer(this.nodeProgram.aSize, 1, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.nodeProgram.aSize);
    
    // Enable point size (for WebGL 1)
    if (this.gl.getParameter(this.gl.ALIASED_POINT_SIZE_RANGE)[1] < 1.0) {
      console.warn('WebGL implementation does not support point sizes > 1.0');
    }
    
    // Enable blending for smooth points
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    
    // Draw nodes as points
    this.gl.drawArrays(this.gl.POINTS, 0, nodeData.count);
    
    // Disable attributes
    this.gl.disableVertexAttribArray(this.nodeProgram.aPosition);
    this.gl.disableVertexAttribArray(this.nodeProgram.aSize);
  }
  
  /**
   * Render connections using WebGL
   */
  renderConnections(connectionData) {
    // Use connection shader program
    this.gl.useProgram(this.connectionProgram);
    
    // Set uniforms
    this.gl.uniform2f(this.connectionProgram.uResolution, this.width, this.height);
    this.gl.uniform1f(this.connectionProgram.uTime, this.time);
    this.gl.uniform4fv(this.connectionProgram.uConnectionColor, this.options.connectionColor);
    
    // Enable attributes
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.connectionPositionBuffer);
    this.gl.vertexAttribPointer(this.connectionProgram.aPosition, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.connectionProgram.aPosition);
    
    // Enable blending for transparent lines
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    
    // Set line width (note: WebGL has limited line width support)
    this.gl.lineWidth(1.0);
    
    // Draw connections as lines
    this.gl.drawArrays(this.gl.LINES, 0, connectionData.count);
    
    // Disable attributes
    this.gl.disableVertexAttribArray(this.connectionProgram.aPosition);
  }
  
  /**
   * Clear the WebGL canvas
   */
  clear() {
    // Set clear color based on theme
    if (this.options.theme === 'dark') {
      this.gl.clearColor(0.05, 0.05, 0.1, 1.0);
    } else {
      this.gl.clearColor(1.0, 1.0, 1.0, 0.0);
    }
    
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
  
  /**
   * Main animation loop
   */
  animate() {
    // Request next frame
    requestAnimationFrame(this.animate.bind(this));
    
    // Skip rendering if not visible or should not render
    if (!this.isVisible || !this.shouldRender) {
      return;
    }
    
    // Update time
    this.time = performance.now();
    
    // Update node positions
    this.updateNodes();
    
    // Prepare data for rendering
    const nodeData = this.prepareNodeData();
    const connectionData = this.prepareConnectionData();
    
    // Clear canvas
    this.clear();
    
    // Render connections first (behind nodes)
    this.renderConnections(connectionData);
    
    // Render nodes on top
    this.renderNodes(nodeData);
  }
  
  /**
   * Fallback to Canvas rendering if WebGL is not available
   */
  fallbackToCanvas() {
    // Clean up any WebGL context
    if (this.gl) {
      this.gl = null;
    }
    
    // Get 2D context instead
    this.ctx = this.canvas.getContext('2d');
    
    // Override animation method to use Canvas
    this.animate = this.animateCanvas.bind(this);
    
    // Adjust options for better performance with Canvas
    this.options.nodeCount = Math.min(this.options.nodeCount, 50);
    this.options.connectionDistance = Math.min(this.options.connectionDistance, 100);
    
    // Create nodes for Canvas rendering
    this.createNodes();
    
    console.log('Using Canvas fallback for neural network animation');
  }
  
  /**
   * Animation loop for Canvas fallback
   */
  animateCanvas() {
    // Request next frame
    requestAnimationFrame(this.animateCanvas.bind(this));
    
    // Skip rendering if not visible
    if (!this.isVisible || !this.shouldRender) {
      return;
    }
    
    // Update time
    this.time = performance.now();
    
    // Update node positions
    this.updateNodes();
    
    // Clear canvas
    if (this.options.theme === 'dark') {
      this.ctx.fillStyle = 'rgba(13, 13, 25, 1)';
    } else {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    }
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw connections
    this.ctx.strokeStyle = `rgba(${this.options.connectionColor[0] * 255}, ${this.options.connectionColor[1] * 255}, ${this.options.connectionColor[2] * 255}, ${this.options.connectionColor[3]})`;
    this.ctx.lineWidth = 1;
    
    for (let i = 0; i < this.nodes.length; i++) {
      const nodeA = this.nodes[i];
      
      // Check connections with other nodes
      for (let j = i + 1; j < this.nodes.length; j++) {
        const nodeB = this.nodes[j];
        
        // Calculate distance
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Draw connection if within threshold
        if (distance < this.options.connectionDistance) {
          // Calculate opacity based on distance
          const opacity = 1 - (distance / this.options.connectionDistance);
          
          this.ctx.beginPath();
          this.ctx.moveTo(nodeA.x, nodeA.y);
          this.ctx.lineTo(nodeB.x, nodeB.y);
          this.ctx.globalAlpha = opacity * this.options.connectionColor[3];
          this.ctx.stroke();
        }
      }
      
      // Connect to mouse if active
      if (this.mouse.active) {
        const dx = this.mouse.x - nodeA.x;
        const dy = this.mouse.y - nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.options.connectionDistance * 1.5) {
          // Calculate opacity based on distance
          const opacity = 1 - (distance / (this.options.connectionDistance * 1.5));
          
          this.ctx.beginPath();
          this.ctx.moveTo(nodeA.x, nodeA.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.globalAlpha = opacity * this.options.connectionColor[3] * 1.5;
          this.ctx.stroke();
        }
      }
    }
    
    // Draw nodes
    const nodeColor = `rgb(${this.options.nodeColor[0] * 255}, ${this.options.nodeColor[1] * 255}, ${this.options.nodeColor[2] * 255})`;
    const glowColor = `rgba(${this.options.glowColor[0] * 255}, ${this.options.glowColor[1] * 255}, ${this.options.glowColor[2] * 255}, ${this.options.glowColor[3]})`;
    
    this.nodes.forEach(node => {
      // Apply glow effect
      const glowSize = node.size * 2;
      const gradient = this.ctx.createRadialGradient(
        node.x, node.y, node.size / 2,
        node.x, node.y, glowSize
      );
      
      gradient.addColorStop(0, nodeColor);
      gradient.addColorStop(0.5, glowColor);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.globalAlpha = 0.6;
      this.ctx.fill();
      
      // Draw node
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      this.ctx.fillStyle = nodeColor;
      this.ctx.globalAlpha = 1;
      this.ctx.fill();
    });
    
    // Reset global alpha
    this.ctx.globalAlpha = 1;
  }
  
  /**
   * Update animation options at runtime
   */
  updateOptions(newOptions) {
    this.options = {
      ...this.options,
      ...newOptions
    };
    
    // Recreate nodes if node count changed
    if (newOptions.nodeCount !== undefined) {
      this.createNodes();
    }
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    // Stop animation
    this.shouldRender = false;
    
    // Remove event listeners
    window.removeEventListener('resize', this.resize.bind(this));
    
    if (this.options.interactive) {
      this.container.removeEventListener('mousemove', this.handleMouseMove.bind(this));
      this.container.removeEventListener('mouseleave', () => {
        this.mouse.active = false;
      });
      this.container.removeEventListener('mouseenter', () => {
        this.mouse.active = true;
      });
      
      this.container.removeEventListener('touchmove', this.handleTouchMove.bind(this));
      this.container.removeEventListener('touchstart', this.handleTouchMove.bind(this));
      this.container.removeEventListener('touchend', () => {
        this.mouse.active = false;
      });
    }
    
    // Stop observing visibility
    if (this.visibilityObserver) {
      this.visibilityObserver.disconnect();
    }
    
    // Remove canvas from DOM
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    // Delete WebGL resources
    if (this.gl) {
      // Delete buffers
      this.gl.deleteBuffer(this.nodePositionBuffer);
      this.gl.deleteBuffer(this.nodeSizeBuffer);
      this.gl.deleteBuffer(this.connectionPositionBuffer);
      
      // Delete programs
      this.gl.deleteProgram(this.nodeProgram);
      this.gl.deleteProgram(this.connectionProgram);
    }
  }
}

/**
 * Initialize the WebGL Neural Network when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  // Find all neural network containers
  const containers = document.querySelectorAll('.ai-webgl-container');
  
  containers.forEach(container => {
    // Get options from data attributes
    const options = {
      nodeCount: parseInt(container.dataset.nodeCount) || 150,
      connectionDistance: parseInt(container.dataset.connectionDistance) || 120,
      nodeSize: parseFloat(container.dataset.nodeSize) || 2.5,
      speed: parseFloat(container.dataset.speed) || 0.5,
      pulseEffect: container.dataset.pulseEffect !== 'false',
      interactive: container.dataset.interactive !== 'false',
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    };
    
    // Parse colors if provided
    if (container.dataset.nodeColor) {
      try {
        options.nodeColor = JSON.parse(container.dataset.nodeColor);
      } catch (e) {
        console.warn('Invalid node color format, using default');
      }
    }
    
    if (container.dataset.connectionColor) {
      try {
        options.connectionColor = JSON.parse(container.dataset.connectionColor);
      } catch (e) {
        console.warn('Invalid connection color format, using default');
      }
    }
    
    // Initialize neural network
    const neuralNetwork = new WebGLNeuralNetwork(container, options);
    
    // Store reference to neural network instance on container
    container.neuralNetwork = neuralNetwork;
  });
  
  // Update theme when it changes
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === 'class') {
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        // Update all neural networks
        document.querySelectorAll('.ai-webgl-container').forEach(container => {
          if (container.neuralNetwork) {
            container.neuralNetwork.updateOptions({
              theme: isDarkMode ? 'dark' : 'light'
            });
          }
        });
      }
    });
  });
  
  observer.observe(document.documentElement, { attributes: true });
});

/**
 * Scroll Animation System
 * Handles all animated elements that appear on scroll
 */
class AIScrollAnimations {
  constructor() {
    this.animatedElements = {
      '.ai-fade-in': { observed: false },
      '.ai-slide-in-left': { observed: false },
      '.ai-slide-in-right': { observed: false },
      '.ai-scale-in': { observed: false }
    };
    
    // Create observer
    this.observer = new IntersectionObserver(this.handleIntersect.bind(this), {
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    });
    
    // Initialize
    this.init();
  }
  
  init() {
    // Observe all animation elements
    Object.keys(this.animatedElements).forEach(selector => {
      if (!this.animatedElements[selector].observed) {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach(element => {
          this.observer.observe(element);
        });
        
        this.animatedElements[selector].observed = true;
      }
    });
  }
  
  handleIntersect(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Stop observing after animation is triggered
        this.observer.unobserve(entry.target);
      }
    });
  }
  
  // Method to refresh observers (for dynamically added elements)
  refresh() {
    Object.keys(this.animatedElements).forEach(selector => {
      this.animatedElements[selector].observed = false;
    });
    
    this.init();
  }
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if ('IntersectionObserver' in window) {
    window.aiScrollAnimations = new AIScrollAnimations();
  } else {
    // Fallback for browsers without IntersectionObserver
    Object.keys({
      '.ai-fade-in': true,
      '.ai-slide-in-left': true,
      '.ai-slide-in-right': true,
      '.ai-scale-in': true
    }).forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        element.classList.add('visible');
      });
    });
  }
  
  // Initialize UI components
  initAIComponents();
  
  function initAIComponents() {
  // Initialize mobile navigation
  const mobileNavToggle = document.querySelector('.ai-mobile-nav-toggle');
  const navLinks = document.querySelector('.ai-nav-links');
  
  if (mobileNavToggle && navLinks) {
    mobileNavToggle.addEventListener('click', () => {
      mobileNavToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNavToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }
  
  // Initialize back to top button
  const backToTop = document.querySelector('.ai-back-to-top');
  
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
    
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Initialize header scroll effects
  const header = document.querySelector('.ai-header');
  
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
  
  // Initialize dark mode toggle
  const darkModeToggle = document.querySelector('.ai-dark-mode-toggle');
  
  if (darkModeToggle) {
    // Check for saved preference
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    
    // Apply initial dark mode if preferred
    if (darkModePreference) {
      document.documentElement.classList.add('dark');
    }
    
    // Toggle dark mode when clicked
    darkModeToggle.addEventListener('click', () => {
      const isDarkMode = document.documentElement.classList.toggle('dark');
      localStorage.setItem('darkMode', isDarkMode);
    });
  }
}