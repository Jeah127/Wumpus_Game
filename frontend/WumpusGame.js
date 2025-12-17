import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, ScrollView, Animated } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { Asset } from 'expo-asset';
import styles from './assets/styles/wumpusgame.style';

// ============= CHILD COMPONENTS =============

const GameStats = ({ position, direction, score }) => {
  const getDirectionText = () => {
    switch (direction) {
      case 0: return { icon: '→', text: 'East' };
      case 90: return { icon: '↑', text: 'North' };
      case 180: return { icon: '←', text: 'West' };
      case 270: return { icon: '↓', text: 'South' };
      default: return { icon: '', text: '' };
    }
  };

  const dir = getDirectionText();

  return (
    <View style={styles.gameStats}>
      <View style={styles.statCard}>
        <Text style={styles.statIcon}>📍</Text>
        <View style={styles.statContent}>
          <Text style={styles.statLabel}>Position</Text>
          <Text style={styles.statValue}>({position.x + 1}, {position.y + 1})</Text>
        </View>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statIcon}>{dir.icon}</Text>
        <View style={styles.statContent}>
          <Text style={styles.statLabel}>Facing</Text>
          <Text style={styles.statValue}>{dir.text}</Text>
        </View>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statIcon}>⭐</Text>
        <View style={styles.statContent}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
      </View>
    </View>
  );
};

const StatusBar = ({ hasGold, hasArrow, isAlive, exitReached }) => {
  return (
    <View style={styles.statusBar}>
      <View style={[styles.statusItem, hasGold && styles.statusItemActive]}>
        <Text style={styles.statusIcon}>✨</Text>
        <Text style={styles.statusText}>Gold</Text>
      </View>
      <View style={[styles.statusItem, hasArrow && styles.statusItemActive]}>
        <Text style={styles.statusIcon}>🏹</Text>
        <Text style={styles.statusText}>Arrow</Text>
      </View>
      <View style={[styles.statusItem, styles.statusItemActive]}>
        <Text style={styles.statusIcon}>
          {exitReached ? '🏁' : isAlive ? '💚' : '💀'}
        </Text>
        <Text style={styles.statusText}>
          {exitReached ? 'Victory' : isAlive ? 'Alive' : 'Dead'}
        </Text>
      </View>
    </View>
  );
};

const PerceptsDisplay = ({ percepts }) => {
  const activePercepts = [];
  if (percepts.stench) activePercepts.push({ icon: '👃', text: 'Stench' });
  if (percepts.breeze) activePercepts.push({ icon: '💨', text: 'Breeze' });
  if (percepts.glitter) activePercepts.push({ icon: '✨', text: 'Glitter' });
  if (percepts.bump) activePercepts.push({ icon: '🧱', text: 'Bump' });
  if (percepts.scream) activePercepts.push({ icon: '😱', text: 'Scream' });

  return (
    <View style={styles.perceptsContainer}>
      <Text style={styles.perceptsTitle}>Senses</Text>
      <View style={styles.perceptsGrid}>
        {activePercepts.length > 0 ? (
          activePercepts.map((percept, idx) => (
            <View key={idx} style={styles.perceptChip}>
              <Text style={styles.perceptIcon}>{percept.icon}</Text>
              <Text style={styles.perceptText}>{percept.text}</Text>
            </View>
          ))
        ) : (
          <View style={styles.perceptChip}>
            <Text style={styles.perceptText}>All Clear</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const MessageBox = ({ message }) => {
  return (
    <View style={styles.messageContainer}>
      <ScrollView style={styles.messageScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.messageText}>{message}</Text>
      </ScrollView>
    </View>
  );
};

const WelcomeModal = ({ onDismiss }) => {
  return (
    <View style={styles.welcomeOverlay}>
      <View style={styles.welcomeModal}>
        <Text style={styles.welcomeTitle}>🎮 Wumpus World</Text>
        <Text style={styles.welcomeDescription}>
          Navigate the cave, find the gold, and escape alive!
        </Text>
        <TouchableOpacity onPress={onDismiss} style={styles.welcomeButton}>
          <Text style={styles.welcomeButtonText}>Start Adventure</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ControlPanel = ({ 
  onTurnLeft, 
  onMoveForward, 
  onTurnRight, 
  onGrab, 
  onShoot, 
  onClimb, 
  hasArrow,
  disabled 
}) => {
  return (
    <View style={styles.controlPanel}>
      <View style={styles.movementControls}>
        <TouchableOpacity 
          style={[styles.controlBtn, styles.turnBtn, disabled && styles.disabledBtn]} 
          onPress={onTurnLeft}
          disabled={disabled}
        >
          <Text style={styles.controlIcon}>↺</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.controlBtn, styles.forwardBtn, disabled && styles.disabledBtn]} 
          onPress={onMoveForward}
          disabled={disabled}
        >
          <Text style={styles.controlIcon}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.controlBtn, styles.turnBtn, disabled && styles.disabledBtn]} 
          onPress={onTurnRight}
          disabled={disabled}
        >
          <Text style={styles.controlIcon}>↻</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionControls}>
        <TouchableOpacity 
          style={[styles.actionBtn, disabled && styles.disabledBtn]} 
          onPress={onGrab}
          disabled={disabled}
        >
          <Text style={styles.actionIcon}>👋</Text>
          <Text style={styles.actionText}>Grab</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, (!hasArrow || disabled) && styles.disabledBtn]} 
          onPress={onShoot}
          disabled={!hasArrow || disabled}
        >
          <Text style={styles.actionIcon}>🏹</Text>
          <Text style={styles.actionText}>Shoot</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, disabled && styles.disabledBtn]} 
          onPress={onClimb}
          disabled={disabled}
        >
          <Text style={styles.actionIcon}>🪜</Text>
          <Text style={styles.actionText}>Climb</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const GameGrid = ({ onContextCreate }) => {
  return (
    <View style={styles.gameGridContainer}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />
    </View>
  );
};

// ============= MAIN COMPONENT =============

const WumpusGame = ({ onExit }) => {
  const GRID_SIZE = 4;
  const CELL_SIZE = 2;
  
  const AGENT_IMAGE = require('./assets/Boo_-_Monster_s_Inc_-removebg-preview.png');
  const MONSTER_IMAGE = require('./assets/download__2_-removebg-preview.png');

  const [gameWorld, setGameWorld] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [gameState, setGameState] = useState({
    playerPos: { x: 0, y: 0 },
    direction: 0,
    hasGold: false,
    hasArrow: true,
    isAlive: true,
    exitReached: false,
    score: 0,
    message: 'Welcome to Wumpus World! Navigate carefully.',
  });

  const [percepts, setPercepts] = useState({
    stench: false,
    breeze: false,
    glitter: false,
    bump: false,
    scream: false,
  });

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const playerRef = useRef(null);
  const rendererRef = useRef(null);
  const monsterRef = useRef(null);

  useEffect(() => {
    const world = generateWorld();
    setGameWorld(world);
    updatePercepts(world, 0, 0);
  }, []);

const restartGame = () => {
  // Reset game state
  setGameState({
    playerPos: { x: 0, y: 0 },
    direction: 0,
    hasGold: false,
    hasArrow: true,
    isAlive: true,
    exitReached: false,
    score: 0,
    message: 'Game restarted! Navigate carefully.',
  });

  // Reset percepts
  setPercepts({
    stench: false,
    breeze: false,
    glitter: false,
    bump: false,
    scream: false,
  });

  // Reset player position and visibility in 3D scene
  if (playerRef.current) {
    playerRef.current.position.set(0.5 * CELL_SIZE, 0, 0.5 * CELL_SIZE);
    playerRef.current.rotation.y = 0;
    playerRef.current.visible = true;
  }

  // Clear the scene of old game objects
  if (sceneRef.current) {
    const objectsToRemove = sceneRef.current.children.filter(child => 
      child.userData.type === 'monster' || 
      child.userData.type === 'pit' || 
      child.userData.type === 'gold'
    );
    objectsToRemove.forEach(obj => sceneRef.current.remove(obj));
  }

  // Generate new world
  const world = generateWorld();
  setGameWorld(world);
  updatePercepts(world, 0, 0);

  // Add new game objects to the scene
  if (sceneRef.current && world) {
    addGameObjectsToScene(world);
  }
};

  const generateWorld = () => {
    const world = {
      monster: null,
      pits: [],
      gold: null,
      monsterAlive: true,
    };

    do {
      world.monster = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (world.monster.x === 0 && world.monster.y === 0);

    for (let i = 0; i < 3; i++) {
      let pit;
      do {
        pit = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        };
      } while (
        (pit.x === 0 && pit.y === 0) ||
        (pit.x === world.monster.x && pit.y === world.monster.y) ||
        world.pits.some(p => p.x === pit.x && p.y === pit.y)
      );
      world.pits.push(pit);
    }

    do {
      world.gold = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (world.gold.x === 0 && world.gold.y === 0);

    console.log('World generated:', world);
    return world;
  };

  const getAdjacentCells = (x, y) => {
    const adjacent = [];
    const directions = [
      { dx: 0, dy: 1 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: -1, dy: 0 },
    ];

    directions.forEach(({ dx, dy }) => {
      const newX = x + dx;
      const newY = y + dy;
      if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
        adjacent.push({ x: newX, y: newY });
      }
    });

    return adjacent;
  };

  const updatePercepts = (world, x, y) => {
    if (!world) return;

    const newPercepts = {
      stench: false,
      breeze: false,
      glitter: false,
      bump: false,
      scream: false,
    };

    if (world.monsterAlive) {
      const adjacentToMonster = getAdjacentCells(world.monster.x, world.monster.y);
      newPercepts.stench = adjacentToMonster.some(cell => cell.x === x && cell.y === y);
    }

    newPercepts.breeze = world.pits.some(pit => {
      const adjacentToPit = getAdjacentCells(pit.x, pit.y);
      return adjacentToPit.some(cell => cell.x === x && cell.y === y);
    });

    newPercepts.glitter = world.gold && world.gold.x === x && world.gold.y === y;

    setPercepts(newPercepts);
  };

  const loadTexture = async (asset) => {
    try {
      const [loadedAsset] = await Asset.loadAsync(asset);
      const texture = new THREE.Texture();
      
      const image = new Image();
      image.src = loadedAsset.localUri || loadedAsset.uri;
      image.onload = () => {
        texture.image = image;
        texture.needsUpdate = true;
      };
      
      return texture;
    } catch (error) {
      console.log('Failed to load texture:', error);
      return null;
    }
  };

  const addGameObjectsToScene = async (world) => {
    if (!sceneRef.current || !world) return;

    const scene = sceneRef.current;

    // Add Monster
    if (world.monster) {
      const monsterGroup = new THREE.Group();
      
      const monsterTexture = await loadTexture(MONSTER_IMAGE);
      
      if (monsterTexture) {
        const monsterGeometry = new THREE.PlaneGeometry(0.8, 1);
        const monsterMaterial = new THREE.MeshBasicMaterial({ 
          map: monsterTexture,
          transparent: true,
          side: THREE.DoubleSide
        });
        const monsterMesh = new THREE.Mesh(monsterGeometry, monsterMaterial);
        monsterMesh.position.y = 0.5;
        monsterGroup.add(monsterMesh);
        
        const dangerGlow = new THREE.Mesh(
          new THREE.CircleGeometry(0.6, 32),
          new THREE.MeshBasicMaterial({
            color: 0xef4444,
            transparent: true,
            opacity: 0.4
          })
        );
        dangerGlow.rotation.x = -Math.PI / 2;
        dangerGlow.position.y = 0.05;
        monsterGroup.add(dangerGlow);
      } else {
        const monsterBody = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.5),
          new THREE.MeshStandardMaterial({ 
            color: 0xdc2626,
            emissive: 0x991b1b,
            roughness: 0.3,
            metalness: 0.7,
          })
        );
        monsterBody.position.y = 0.5;
        monsterBody.castShadow = true;
        monsterGroup.add(monsterBody);

        const eye1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        eye1.position.set(-0.18, 0.65, 0.35);
        monsterGroup.add(eye1);
        
        const eye2 = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        eye2.position.set(0.18, 0.65, 0.35);
        monsterGroup.add(eye2);
      }
      
      monsterGroup.position.set(
        (world.monster.x + 0.5) * CELL_SIZE,
        0,
        (world.monster.y + 0.5) * CELL_SIZE
      );
      monsterGroup.userData = { type: 'monster' };
      scene.add(monsterGroup);
      monsterRef.current = monsterGroup;
    }

    // Add pits
    world.pits.forEach(pit => {
      const pitGroup = new THREE.Group();
      
      const pitHole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.5, 0.2, 32),
        new THREE.MeshStandardMaterial({ 
          color: 0x0c0a09,
          emissive: 0x7c2d12,
          roughness: 0.2,
        })
      );
      pitHole.position.y = 0.01;
      pitGroup.add(pitHole);
      
      const dangerRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.75, 0.05, 16, 32),
        new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: 0.6
        })
      );
      dangerRing.rotation.x = -Math.PI / 2;
      dangerRing.position.y = 0.1;
      pitGroup.add(dangerRing);
      
      pitGroup.position.set(
        (pit.x + 0.5) * CELL_SIZE,
        0,
        (pit.y + 0.5) * CELL_SIZE
      );
      pitGroup.userData = { type: 'pit' };
      scene.add(pitGroup);
    });

    // Add gold
    if (world.gold) {
      const goldGroup = new THREE.Group();
      
      const goldMesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.3, 0),
        new THREE.MeshStandardMaterial({ 
          color: 0xfbbf24,
          emissive: 0xf59e0b,
          metalness: 1,
          roughness: 0.1,
        })
      );
      goldMesh.position.y = 0.5;
      goldMesh.castShadow = true;
      goldGroup.add(goldMesh);
      
      const shine = new THREE.Mesh(
        new THREE.CircleGeometry(0.4, 32),
        new THREE.MeshBasicMaterial({
          color: 0xfef08a,
          transparent: true,
          opacity: 0.5
        })
      );
      shine.rotation.x = -Math.PI / 2;
      shine.position.y = 0.05;
      goldGroup.add(shine);
      
      goldGroup.position.set(
        (world.gold.x + 0.5) * CELL_SIZE,
        0,
        (world.gold.y + 0.5) * CELL_SIZE
      );
      goldGroup.userData = { type: 'gold' };
      scene.add(goldGroup);
    }
  };

  const onContextCreate = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(0x0a0e27);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    scene.fog = new THREE.Fog(0x0a0e27, 10, 50);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.5, 900);
    camera.position.set(GRID_SIZE * CELL_SIZE / 2, GRID_SIZE * CELL_SIZE * 1.2, GRID_SIZE * CELL_SIZE * 1.0);
    camera.lookAt(GRID_SIZE * CELL_SIZE / 2, 0, GRID_SIZE * CELL_SIZE / 2);
    cameraRef.current = camera;

    const ambientLight = new THREE.AmbientLight(0x4a5568, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x60a5fa, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xfbbf24, 0.6, 30);
    pointLight.position.set(GRID_SIZE * CELL_SIZE / 2, 5, GRID_SIZE * CELL_SIZE / 2);
    scene.add(pointLight);

    // Create floor with modern gradient effect
    const floorGeometry = new THREE.PlaneGeometry(GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf8f9fa,
      roughness: 0.7,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(GRID_SIZE * CELL_SIZE / 2, 0, GRID_SIZE * CELL_SIZE / 2);
    floor.receiveShadow = true;
    scene.add(floor);

    // Create modern grid lines
    const GAP_SIZE = 0.1; // Small gap between cells (adjust 0.05 to 0.2 as needed)

    for (let i = 0; i <= GRID_SIZE; i++) {
      const material = new THREE.LineBasicMaterial({ 
        color: 0x3b82f6, 
        opacity: 0.3, 
        transparent: true,
      });
      
      // Horizontal lines - with small inset for gap effect
      const hGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(GAP_SIZE, 0.05, i * CELL_SIZE),
        new THREE.Vector3(GRID_SIZE * CELL_SIZE - GAP_SIZE, 0.05, i * CELL_SIZE),
      ]);
      const hLine = new THREE.Line(hGeometry, material);
      scene.add(hLine);
      
      // Vertical lines - with small inset for gap effect
      const vGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i * CELL_SIZE, 0.05, GAP_SIZE),
        new THREE.Vector3(i * CELL_SIZE, 0.05, GRID_SIZE * CELL_SIZE - GAP_SIZE),
      ]);
      const vLine = new THREE.Line(vGeometry, material);
      scene.add(vLine);
    }
        // Add start cell marker with glow effect
        const startGeometry = new THREE.PlaneGeometry(CELL_SIZE * 0.95, CELL_SIZE * 0.95);
        const startMaterial = new THREE.MeshBasicMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide
        });
        const startMarker = new THREE.Mesh(startGeometry, startMaterial);
        startMarker.rotation.x = -Math.PI / 2;
        startMarker.position.set(0.5 * CELL_SIZE, 0.02, 0.5 * CELL_SIZE);
        scene.add(startMarker);

    // Create sleek walls
    const wallHeight = 2;
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xE3DAC9,
      roughness: 0.4,
      metalness: 0.6,
    });

    const northWall = new THREE.Mesh(
      new THREE.BoxGeometry(GRID_SIZE * CELL_SIZE + 0.4, wallHeight, 0.4),
      wallMaterial
    );
    northWall.position.set(GRID_SIZE * CELL_SIZE / 2, wallHeight / 2, -0.2);
    northWall.castShadow = true;
    scene.add(northWall);

    const southWall = new THREE.Mesh(
      new THREE.BoxGeometry(GRID_SIZE * CELL_SIZE + 0.4, wallHeight, 0.4),
      wallMaterial
    );
    southWall.position.set(GRID_SIZE * CELL_SIZE / 2, wallHeight / 2, GRID_SIZE * CELL_SIZE + 0.2);
    southWall.castShadow = true;
    scene.add(southWall);

    const westWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, wallHeight, GRID_SIZE * CELL_SIZE + 0.4),
      wallMaterial
    );
    westWall.position.set(-0.2, wallHeight / 2, GRID_SIZE * CELL_SIZE / 2);
    westWall.castShadow = true;
    scene.add(westWall);

    const eastWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, wallHeight, GRID_SIZE * CELL_SIZE + 0.4),
      wallMaterial
    );
    eastWall.position.set(GRID_SIZE * CELL_SIZE + 0.2, wallHeight / 2, GRID_SIZE * CELL_SIZE / 2);
    eastWall.castShadow = true;
    scene.add(eastWall);

    // Create player with custom image
    const playerGroup = new THREE.Group();
    
    const agentTexture = await loadTexture(AGENT_IMAGE);
    
    if (agentTexture) {
      const agentGeometry = new THREE.PlaneGeometry(0.8, 1);
      const agentMaterial = new THREE.MeshBasicMaterial({ 
        map: agentTexture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const agentMesh = new THREE.Mesh(agentGeometry, agentMaterial);
      agentMesh.position.y = 0.5;
      playerGroup.add(agentMesh);
      
      // Add glow effect
      const glowGeometry = new THREE.CircleGeometry(0.5, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.3
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = 0.05;
      playerGroup.add(glow);
    } else {
      const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 32);
      const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3b82f6,
        metalness: 0.3,
        roughness: 0.4,
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.35;
      body.castShadow = true;
      playerGroup.add(body);

      const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
      const headMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x60a5fa,
        metalness: 0.2,
        roughness: 0.3,
      });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.y = 0.7;
      head.castShadow = true;
      playerGroup.add(head);
    }

    playerGroup.position.set(0.5 * CELL_SIZE, 0, 0.5 * CELL_SIZE);
    scene.add(playerGroup);
    playerRef.current = playerGroup;

    // Wait for world generation
    const waitForWorld = setInterval(async () => {
      if (gameWorld) {
        clearInterval(waitForWorld);
        await addGameObjectsToScene(gameWorld);
      }
    }, 100);

    // Animation loop with smooth effects
    let time = 0;
    const render = () => {
      requestAnimationFrame(render);
      time += 0.01;

      scene.children.forEach(child => {
        if (child.userData.type === 'monster') {
          child.rotation.y = time * 0.5;
          if (child.children[1]) { // Glow effect
            child.children[1].material.opacity = 0.3 + Math.sin(time * 2) * 0.1;
          }
        } else if (child.userData.type === 'gold') {
          child.rotation.y = time;
          if (child.children[0]) {
            child.children[0].position.y = 0.5 + Math.sin(time * 3) * 0.1;
          }
          if (child.children[1]) { // Shine effect
            child.children[1].material.opacity = 0.4 + Math.sin(time * 4) * 0.2;
          }
        } else if (child.userData.type === 'pit') {
          child.rotation.y = -time * 0.3;
          if (child.children[1]) { // Danger ring
            child.children[1].material.opacity = 0.5 + Math.sin(time * 3) * 0.1;
          }
        }
      });

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  const turnLeft = () => {
    if (!gameState.isAlive || gameState.exitReached) return;
    
    const newDirection = (gameState.direction + 90) % 360;
    setGameState(prev => ({ 
      ...prev, 
      direction: newDirection,
      score: prev.score - 1,
      message: 'Turned left'
    }));

    if (playerRef.current) {
      playerRef.current.rotation.y = -newDirection * Math.PI / 180;
    }
  };

  const turnRight = () => {
    if (!gameState.isAlive || gameState.exitReached) return;
    
    const newDirection = (gameState.direction - 90 + 360) % 360;
    setGameState(prev => ({ 
      ...prev, 
      direction: newDirection,
      score: prev.score - 1,
      message: 'Turned right'
    }));

    if (playerRef.current) {
      playerRef.current.rotation.y = -newDirection * Math.PI / 180;
    }
  };

  const moveForward = () => {
    if (!gameState.isAlive || gameState.exitReached || !gameWorld) return;

    let newX = gameState.playerPos.x;
    let newY = gameState.playerPos.y;

    switch (gameState.direction) {
      case 0: newX += 1; break;
      case 90: newY -= 1; break;
      case 180: newX -= 1; break;
      case 270: newY += 1; break;
    }

    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
      setGameState(prev => ({
        ...prev,
        score: prev.score - 1,
        message: '🧱 Bump! You hit a wall!'
      }));
      setPercepts(prev => ({ ...prev, bump: true }));
      setTimeout(() => setPercepts(prev => ({ ...prev, bump: false })), 1000);
      return;
    }

    const inPit = gameWorld.pits.some(pit => pit.x === newX && pit.y === newY);
    if (inPit) {
      setGameState(prev => ({ 
        ...prev, 
        playerPos: { x: newX, y: newY },
        isAlive: false,
        score: prev.score - 1000,
        message: '💀 You fell into a pit! Game Over! Final Score: ' + (prev.score - 1000)
      }));
      if (playerRef.current) {
        playerRef.current.position.set(
          (newX + 0.5) * CELL_SIZE,
          -2,
          (newY + 0.5) * CELL_SIZE
        );
      }
      return;
    }

    if (gameWorld.monsterAlive && gameWorld.monster.x === newX && gameWorld.monster.y === newY) {
      setGameState(prev => ({ 
        ...prev, 
        playerPos: { x: newX, y: newY },
        isAlive: false,
        score: prev.score - 1000,
        message: '💀 The Monster caught you! Game Over! Final Score: ' + (prev.score - 1000)
      }));
      if (playerRef.current) {
        playerRef.current.visible = false;
      }
      return;
    }

    setGameState(prev => ({ 
      ...prev, 
      playerPos: { x: newX, y: newY },
      score: prev.score - 1,
      message: `Moved to (${newX + 1}, ${newY + 1})`
    }));

    if (playerRef.current) {
      playerRef.current.position.set(
        (newX + 0.5) * CELL_SIZE,
        0,
        (newY + 0.5) * CELL_SIZE
      );
    }

    updatePercepts(gameWorld, newX, newY);
  };

  const grab = () => {
    if (!gameState.isAlive || gameState.exitReached || !gameWorld) return;
    if (percepts.glitter && !gameState.hasGold) {
      setGameState(prev => ({ 
        ...prev, 
        hasGold: true,
        score: prev.score + 1000,
        message: '✨ You grabbed the gold! Now return to (1,1) and climb out!'
      }));

      if (sceneRef.current) {
        const goldObj = sceneRef.current.children.find(child => child.userData.type === 'gold');
        if (goldObj) {
          sceneRef.current.remove(goldObj);
        }
      }
    } else {
      setGameState(prev => ({ 
        ...prev, 
        message: 'Nothing to grab here!'
      }));
    }
  };

  const shoot = () => {
    if (!gameState.isAlive || gameState.exitReached || !gameWorld || !gameState.hasArrow) return;
    setGameState(prev => ({ ...prev, hasArrow: false, score: prev.score - 10 }));

    let targetX = gameState.playerPos.x;
    let targetY = gameState.playerPos.y;

    switch (gameState.direction) {
      case 0: targetX += 1; break;
      case 90: targetY -= 1; break;
      case 180: targetX -= 1; break;
      case 270: targetY += 1; break;
    }

    if (gameWorld.monsterAlive && 
        gameWorld.monster.x === targetX && 
        gameWorld.monster.y === targetY) {
      
      setGameWorld(prev => ({ ...prev, monsterAlive: false }));
      setGameState(prev => ({ 
        ...prev, 
        score: prev.score + 1000,
        message: '🎯 Scream! You killed the Monster!'
      }));
      setPercepts(prev => ({ ...prev, scream: true }));
      
      if (sceneRef.current) {
        const monsterObj = sceneRef.current.children.find(child => child.userData.type === 'monster');
        if (monsterObj) {
          sceneRef.current.remove(monsterObj);
        }
      }
      
      setTimeout(() => setPercepts(prev => ({ ...prev, scream: false })), 2000);
    } else {
      setGameState(prev => ({ 
        ...prev, 
        message: '🏹 Arrow missed! No scream heard.'
      }));
    }
  };

  const climb = () => {
    if (!gameState.isAlive || gameState.exitReached) return;
    if (gameState.playerPos.x === 0 && gameState.playerPos.y === 0) {
      if (gameState.hasGold) {
        setGameState(prev => ({ 
          ...prev, 
          exitReached: true,
          score: prev.score + 1000,
          message: `🎉 Victory! You escaped with the gold! Final Score: ${prev.score + 1000}`
        }));
      } else {
        setGameState(prev => ({ 
          ...prev, 
          exitReached: true,
          message: `You escaped but without the gold. Final Score: ${prev.score}`
        }));
      }
    } else {
      setGameState(prev => ({ 
        ...prev, 
        message: 'You can only climb out at the start position (1,1)!'
      }));
    }
  };

return (
  <View style={styles.container}>
    {showWelcome && <WelcomeModal onDismiss={() => setShowWelcome(false)} />}
    
    <View style={{ flex: 1 }}>
      <GameStats 
        position={gameState.playerPos} 
        direction={gameState.direction} 
        score={gameState.score} 
      />
      
      <StatusBar 
        hasGold={gameState.hasGold}
        hasArrow={gameState.hasArrow}
        isAlive={gameState.isAlive}
        exitReached={gameState.exitReached}
      />
      
      <View style={styles.gameGridContainer}>
        <GLView style={styles.glView} onContextCreate={onContextCreate} />
        <View style={styles.gameControlButtons}>
          <TouchableOpacity style={styles.exitIconButton} onPress={onExit}>
            <Text style={styles.exitIcon}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.restartIconButton} onPress={restartGame}>
            <Text style={styles.restartIcon}>↻</Text>
          </TouchableOpacity>
        </View>
      </View>
            
      <PerceptsDisplay percepts={percepts} />
            
      <MessageBox message={gameState.message} />
            
      <ControlPanel 
        onTurnLeft={turnLeft}
        onMoveForward={moveForward}
        onTurnRight={turnRight}
        onGrab={grab}
        onShoot={shoot}
        onClimb={climb}
        hasArrow={gameState.hasArrow}
        disabled={!gameState.isAlive || gameState.exitReached}
      />
      
    </View>
  </View>
);
}

export default WumpusGame;