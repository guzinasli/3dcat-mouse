import * as THREE from 'three';
import { GameState, Mouse, Position, GameConfig } from '../types/game';
import { AudioManager } from './AudioManager';

export class Game3D {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private cat: THREE.Mesh;
  private mice: Map<string, THREE.Mesh> = new Map();
  private gameState: GameState;
  private config: GameConfig;
  private audioManager: AudioManager;
  private keys: Set<string> = new Set();
  private lastMouseSpawn = 0;
  private animationId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.audioManager = new AudioManager();
    this.config = {
      maxLives: 3,
      mouseSpawnRate: 2000,
      mouseSpeed: 2,
      mouseLifespan: 5000,
      levelUpScore: 10,
      maxMiceOnScreen: 8
    };

    this.gameState = {
      isPlaying: false,
      isGameOver: false,
      score: 0,
      lives: this.config.maxLives,
      level: 1,
      mice: []
    };

    // Initialize Three.js
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    
    this.setupScene();
    this.createCat();
    this.setupControls();
    this.setupEventListeners();
  }

  private setupScene() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x87CEEB); // Sky blue background
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Create environment
    this.createEnvironment();
    this.setupLighting();

    // Position camera
    this.camera.position.set(0, 15, 15);
    this.camera.lookAt(0, 0, 0);
  }

  private createEnvironment() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 }); // Light green
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Garden elements
    this.createGardenElements();
  }

  private createGardenElements() {
    // Colorful flowers
    const flowerColors = [0xFF69B4, 0xFF6347, 0xFFD700, 0x9370DB, 0x00CED1];
    
    for (let i = 0; i < 15; i++) {
      const flowerGeometry = new THREE.SphereGeometry(0.3, 8, 8);
      const flowerMaterial = new THREE.MeshLambertMaterial({ 
        color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
      });
      const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
      
      flower.position.set(
        (Math.random() - 0.5) * 18,
        0.3,
        (Math.random() - 0.5) * 18
      );
      flower.castShadow = true;
      this.scene.add(flower);
    }

    // Bushes
    for (let i = 0; i < 8; i++) {
      const bushGeometry = new THREE.SphereGeometry(0.8, 12, 12);
      const bushMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Forest green
      const bush = new THREE.Mesh(bushGeometry, bushMaterial);
      
      bush.position.set(
        (Math.random() - 0.5) * 16,
        0.8,
        (Math.random() - 0.5) * 16
      );
      bush.castShadow = true;
      this.scene.add(bush);
    }
  }

  private setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    this.scene.add(directionalLight);
  }

  private createCat() {
    // Cat body
    const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.2, 4, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B35 }); // Orange
    this.cat = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.cat.position.set(0, 0.8, 0);
    this.cat.castShadow = true;

    // Cat head
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B35 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0.8, 0);
    head.castShadow = true;
    this.cat.add(head);

    // Cat ears
    const earGeometry = new THREE.ConeGeometry(0.15, 0.3, 8);
    const earMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B35 });
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.25, 1.1, 0);
    leftEar.castShadow = true;
    this.cat.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.25, 1.1, 0);
    rightEar.castShadow = true;
    this.cat.add(rightEar);

    // Cat tail
    const tailGeometry = new THREE.CylinderGeometry(0.1, 0.05, 1.5);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.set(0, 0.3, -0.8);
    tail.rotation.x = Math.PI / 4;
    tail.castShadow = true;
    this.cat.add(tail);

    this.scene.add(this.cat);
  }

  private createMouse(id: string, position: Position): THREE.Mesh {
    // Mouse body
    const bodyGeometry = new THREE.CapsuleGeometry(0.15, 0.4, 4, 8);
    const mouseColors = [0xFF69B4, 0x32CD32, 0x1E90FF, 0xFFD700, 0xFF6347];
    const color = mouseColors[Math.floor(Math.random() * mouseColors.length)];
    const bodyMaterial = new THREE.MeshLambertMaterial({ color });
    const mouse = new THREE.Mesh(bodyGeometry, bodyMaterial);
    mouse.position.set(position.x, position.y, position.z);
    mouse.castShadow = true;

    // Mouse head
    const headGeometry = new THREE.SphereGeometry(0.12, 12, 12);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 0.2, 0);
    mouse.add(head);

    // Mouse ears
    const earGeometry = new THREE.SphereGeometry(0.06, 8, 8);
    const leftEar = new THREE.Mesh(earGeometry, bodyMaterial);
    leftEar.position.set(-0.08, 0.25, 0);
    mouse.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, bodyMaterial);
    rightEar.position.set(0.08, 0.25, 0);
    mouse.add(rightEar);

    // Mouse tail
    const tailGeometry = new THREE.CylinderGeometry(0.02, 0.01, 0.5);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.set(0, -0.1, -0.25);
    tail.rotation.x = -Math.PI / 6;
    mouse.add(tail);

    this.scene.add(mouse);
    this.mice.set(id, mouse);
    
    return mouse;
  }

  private setupControls() {
    window.addEventListener('keydown', (event) => {
      this.keys.add(event.code);
      
      // Enable audio on first user interaction
      if (this.audioManager && this.gameState.isPlaying) {
        this.audioManager.startBackgroundMusic();
      }
    });

    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
    });
  }

  private setupEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private updateCatMovement() {
    if (!this.gameState.isPlaying) return;

    const moveSpeed = 0.15;
    let moved = false;

    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) {
      this.cat.position.z -= moveSpeed;
      moved = true;
    }
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) {
      this.cat.position.z += moveSpeed;
      moved = true;
    }
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) {
      this.cat.position.x -= moveSpeed;
      this.cat.rotation.y = Math.PI / 2;
      moved = true;
    }
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) {
      this.cat.position.x += moveSpeed;
      this.cat.rotation.y = -Math.PI / 2;
      moved = true;
    }

    // Keep cat within bounds
    this.cat.position.x = Math.max(-9, Math.min(9, this.cat.position.x));
    this.cat.position.z = Math.max(-9, Math.min(9, this.cat.position.z));

    // Add walking animation
    if (moved) {
      this.cat.position.y = 0.8 + Math.sin(Date.now() * 0.01) * 0.1;
    }
  }

  private spawnMouse() {
    if (!this.gameState.isPlaying || this.gameState.mice.length >= this.config.maxMiceOnScreen) return;

    const id = Math.random().toString(36).substr(2, 9);
    const spawnRadius = 8;
    const angle = Math.random() * Math.PI * 2;
    const position: Position = {
      x: Math.cos(angle) * spawnRadius,
      y: 0.2,
      z: Math.sin(angle) * spawnRadius
    };

    const velocity: Position = {
      x: (Math.random() - 0.5) * this.config.mouseSpeed,
      y: 0,
      z: (Math.random() - 0.5) * this.config.mouseSpeed
    };

    const mouse: Mouse = {
      id,
      position,
      velocity,
      timeToLive: this.config.mouseLifespan,
      caught: false
    };

    this.gameState.mice.push(mouse);
    this.createMouse(id, position);
  }

  private updateMice(deltaTime: number) {
    this.gameState.mice = this.gameState.mice.filter(mouse => {
      const mesh = this.mice.get(mouse.id);
      if (!mesh) return false;

      // Update position
      mouse.position.x += mouse.velocity.x * deltaTime * 0.001;
      mouse.position.z += mouse.velocity.z * deltaTime * 0.001;
      
      // Bounce off boundaries
      if (Math.abs(mouse.position.x) > 8) {
        mouse.velocity.x *= -1;
        mouse.position.x = Math.sign(mouse.position.x) * 8;
      }
      if (Math.abs(mouse.position.z) > 8) {
        mouse.velocity.z *= -1;
        mouse.position.z = Math.sign(mouse.position.z) * 8;
      }

      mesh.position.set(mouse.position.x, mouse.position.y, mouse.position.z);
      
      // Add scurrying animation
      mesh.position.y = 0.2 + Math.sin(Date.now() * 0.02 + mouse.position.x) * 0.05;
      mesh.rotation.y = Math.atan2(mouse.velocity.x, mouse.velocity.z);

      // Update time to live
      mouse.timeToLive -= deltaTime;

      // Check if mouse should be removed
      if (mouse.timeToLive <= 0 && !mouse.caught) {
        this.scene.remove(mesh);
        this.mice.delete(mouse.id);
        this.gameState.lives--;
        this.audioManager.playSound('loseLife');
        return false;
      }

      if (mouse.caught) {
        this.scene.remove(mesh);
        this.mice.delete(mouse.id);
        return false;
      }

      return true;
    });
  }

  private checkCollisions() {
    this.gameState.mice.forEach(mouse => {
      if (mouse.caught) return;

      const distance = Math.sqrt(
        Math.pow(this.cat.position.x - mouse.position.x, 2) +
        Math.pow(this.cat.position.z - mouse.position.z, 2)
      );

      if (distance < 1.2) { // Collision threshold
        mouse.caught = true;
        this.gameState.score++;
        this.audioManager.playSound('catch');
        
        // Create catch effect
        this.createCatchEffect(mouse.position);
      }
    });
  }

  private createCatchEffect(position: Position) {
    // Simple particle effect
    for (let i = 0; i < 10; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.02, 4, 4);
      const particleMaterial = new THREE.MeshBasicMaterial({ 
        color: Math.random() * 0xffffff,
        transparent: true,
        opacity: 0.8
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      particle.position.set(position.x, position.y + 0.5, position.z);
      this.scene.add(particle);

      // Animate particle
      const velocity = {
        x: (Math.random() - 0.5) * 0.2,
        y: Math.random() * 0.3 + 0.1,
        z: (Math.random() - 0.5) * 0.2
      };

      const animateParticle = () => {
        particle.position.x += velocity.x;
        particle.position.y += velocity.y;
        particle.position.z += velocity.z;
        velocity.y -= 0.01; // Gravity
        
        particleMaterial.opacity -= 0.02;
        
        if (particleMaterial.opacity <= 0) {
          this.scene.remove(particle);
          particleGeometry.dispose();
          particleMaterial.dispose();
        } else {
          requestAnimationFrame(animateParticle);
        }
      };
      
      animateParticle();
    }
  }

  private updateDifficulty() {
    const newLevel = Math.floor(this.gameState.score / this.config.levelUpScore) + 1;
    if (newLevel > this.gameState.level) {
      this.gameState.level = newLevel;
      // Increase difficulty
      this.config.mouseSpawnRate = Math.max(800, this.config.mouseSpawnRate - 100);
      this.config.mouseSpeed = Math.min(4, this.config.mouseSpeed + 0.2);
      this.config.maxMiceOnScreen = Math.min(12, this.config.maxMiceOnScreen + 1);
    }
  }

  private gameLoop = (currentTime: number) => {
    if (!this.gameState.isPlaying) return;

    const deltaTime = 16; // Assume 60fps

    this.updateCatMovement();
    this.updateMice(deltaTime);
    this.checkCollisions();
    this.updateDifficulty();

    // Spawn mice
    if (currentTime - this.lastMouseSpawn > this.config.mouseSpawnRate) {
      this.spawnMouse();
      this.lastMouseSpawn = currentTime;
    }

    // Check game over
    if (this.gameState.lives <= 0) {
      this.gameState.isPlaying = false;
      this.gameState.isGameOver = true;
      this.audioManager.stopBackgroundMusic();
    }

    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  startGame() {
    this.gameState.isPlaying = true;
    this.gameState.isGameOver = false;
    this.gameState.score = 0;
    this.gameState.lives = this.config.maxLives;
    this.gameState.level = 1;
    this.gameState.mice = [];
    this.lastMouseSpawn = 0;

    // Reset config
    this.config.mouseSpawnRate = 2000;
    this.config.mouseSpeed = 2;
    this.config.maxMiceOnScreen = 8;

    // Clear existing mice
    this.mice.forEach((mesh, id) => {
      this.scene.remove(mesh);
    });
    this.mice.clear();

    // Reset cat position
    this.cat.position.set(0, 0.8, 0);
    this.cat.rotation.y = 0;

    this.audioManager.startBackgroundMusic();
    this.animationId = requestAnimationFrame(this.gameLoop);
  }

  restartGame() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.startGame();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  getGameState(): GameState {
    return { ...this.gameState };
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.audioManager.stopBackgroundMusic();
    this.renderer.dispose();
  }
}