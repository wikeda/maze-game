import * as THREE from 'https://unpkg.com/three@0.159.0/build/three.module.js';
import { Maze } from './maze.js';
import { Player } from './player.js';
import { VirtualJoystick } from './controls.js';
import { Minimap } from './minimap.js';
import { ScoreBoard } from './score.js';
import { UIManager } from './ui.js';

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x252530);
scene.fog = new THREE.FogExp2(0x1a1a20, 0.04);

const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 400);
const clock = new THREE.Clock();

const ui = new UIManager();
const maze = new Maze(20, 20, 4);
const minimap = new Minimap(document.getElementById('minimap'), maze);
const scoreBoard = new ScoreBoard(
  document.getElementById('step-counter'),
  document.getElementById('time-counter')
);

const joystick = new VirtualJoystick(
  document.getElementById('joystick-base'),
  document.getElementById('joystick-thumb')
);

const player = new Player(camera, maze);
let previousCell = player.getCell();
if (previousCell) {
  minimap.markVisited(previousCell);
}

addLights(scene);
const textures = createDungeonTextures();
buildDungeon(scene, maze, textures);

const keyObject = createKey(scene, textures.keyMaterial, maze.cellToWorld(maze.keyCell));
const exitObject = createExit(scene, textures.doorMaterial, maze.cellToWorld(maze.exitCell));

let hasKey = false;
let doorProgress = 0;
let gameCleared = false;
const keyWorldPosition = new THREE.Vector3();
const exitWorldPosition = new THREE.Vector3();
const doorClosedY = exitObject.door.position.y;

function onResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', onResize);
onResize();
ui.hideLoading();

function update(delta) {
  if (gameCleared) {
    scoreBoard.stop();
    return;
  }

  scoreBoard.updateTime();

  const input = joystick.getInput();
  player.update(delta, input);

  const currentCell = player.getCell();
  if (currentCell) {
    minimap.markVisited(currentCell);

    if (!previousCell || currentCell.x !== previousCell.x || currentCell.y !== previousCell.y) {
      scoreBoard.incrementSteps();
      previousCell = currentCell;
      if (currentCell.x === maze.keyCell.x && currentCell.y === maze.keyCell.y) {
        minimap.discoverKey();
      }
      if (currentCell.x === maze.exitCell.x && currentCell.y === maze.exitCell.y) {
        minimap.discoverExit();
      }
    }
  }

  minimap.render(currentCell, maze.keyCell, maze.exitCell);

  if (!hasKey && keyObject.group) {
    keyObject.group.rotation.y += delta * 0.7;
  }

  if (!hasKey && keyObject.mesh) {
    keyObject.mesh.getWorldPosition(keyWorldPosition);
    const distanceToKey = player.getWorldPosition().distanceTo(keyWorldPosition);
    if (distanceToKey < 1.2) {
      hasKey = true;
      scene.remove(keyObject.group);
      minimap.discoverKey();
      ui.flashMessage('鍵を手に入れた！出口が開いた。');
    }
  }

  if (hasKey && doorProgress < 1) {
    doorProgress = Math.min(1, doorProgress + delta * 0.5);
    exitObject.door.position.y = THREE.MathUtils.lerp(doorClosedY, doorClosedY + 2.4, doorProgress);
  }

  if (hasKey && exitObject) {
    const playerPos = player.getWorldPosition();
    exitObject.anchor.getWorldPosition(exitWorldPosition);
    const horizontalDistance = Math.hypot(
      playerPos.x - exitWorldPosition.x,
      playerPos.z - exitWorldPosition.z
    );
    if (horizontalDistance < 1.2) {
      gameCleared = true;
      scoreBoard.stop();
      ui.showMessage(`脱出成功！\n歩数: ${scoreBoard.steps} / 時間: ${formatTime(scoreBoard.elapsed)}`);
    }
  }
}

function animate() {
  const delta = clock.getDelta();
  update(delta);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

function addLights(scene) {
  const ambient = new THREE.AmbientLight(0x444448, 1.2);
  scene.add(ambient);

  const dir = new THREE.DirectionalLight(0xffc873, 0.8);
  dir.position.set(20, 40, 20);
  dir.castShadow = true;
  dir.shadow.mapSize.set(2048, 2048);
  dir.shadow.bias = -0.0001;
  dir.shadow.radius = 8;
  const d = 60;
  dir.shadow.camera.left = -d;
  dir.shadow.camera.right = d;
  dir.shadow.camera.top = d;
  dir.shadow.camera.bottom = -d;
  scene.add(dir);
}

function createDungeonTextures() {
  const wallTexture = createStoneTexture('#4a4a4a', '#3a3a3a');
  wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.repeat.set(1, 1);

  const floorTexture = createStoneFloorTexture();
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(maze.width, maze.height);

  const keyMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd66b,
    emissive: 0xffc53d,
    metalness: 0.6,
    roughness: 0.2,
  });

  const doorTexture = createWoodTexture();
  doorTexture.wrapS = doorTexture.wrapT = THREE.RepeatWrapping;
  doorTexture.repeat.set(1, 1);
  const doorMaterial = new THREE.MeshStandardMaterial({
    map: doorTexture,
    color: 0xffffff,
    roughness: 0.6,
    metalness: 0.1,
  });

  return {
    wallTexture,
    floorTexture,
    keyMaterial,
    doorMaterial,
  };
}

function createStoneTexture(base, accent) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const w = Math.random() * (size / 3) + size / 10;
    const h = Math.random() * (size / 3) + size / 10;
    ctx.strokeRect(x, y, w, h);
  }
  return new THREE.CanvasTexture(canvas);
}

function createStoneFloorTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#2f2f35';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(200, 200, 210, 0.2)';
  ctx.lineWidth = 2;
  const grid = 8;
  for (let x = 0; x <= grid; x++) {
    const pos = (x / grid) * size;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, size);
    ctx.stroke();
  }
  for (let y = 0; y <= grid; y++) {
    const pos = (y / grid) * size;
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(size, pos);
    ctx.stroke();
  }
  return new THREE.CanvasTexture(canvas);
}

function createWoodTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#5d3615');
  gradient.addColorStop(1, '#7a4a23');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(255, 220, 120, 0.25)';
  for (let i = 0; i < 20; i++) {
    const y = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y + Math.random() * 20 - 10);
    ctx.stroke();
  }
  return new THREE.CanvasTexture(canvas);
}

function buildDungeon(scene, maze, textures) {
  const group = new THREE.Group();
  const floorGeometry = new THREE.PlaneGeometry(maze.width * maze.cellSize, maze.height * maze.cellSize, maze.width, maze.height);
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: textures.floorTexture,
    color: 0xffffff,
    roughness: 0.8,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  const wallMaterial = new THREE.MeshStandardMaterial({
    map: textures.wallTexture,
    color: 0xffffff,
    roughness: 0.7,
    metalness: 0.1,
  });

  maze.forEachCell((cell) => {
    const { x, y, walls } = cell;
    const world = maze.cellToWorld(cell);
    const half = maze.cellSize * 0.5;
    const wallHeight = maze.wallHeight;
    const thickness = maze.wallThickness;

    if (walls.N) {
      const mesh = createWallMesh(maze.cellSize, wallHeight, thickness, wallMaterial);
      mesh.position.set(world.x, wallHeight / 2, world.z - half + thickness / 2);
      group.add(mesh);
    }
    if (walls.W) {
      const mesh = createWallMesh(maze.cellSize, wallHeight, thickness, wallMaterial);
      mesh.position.set(world.x - half + thickness / 2, wallHeight / 2, world.z);
      mesh.rotation.y = Math.PI / 2;
      group.add(mesh);
    }
    if (x === maze.width - 1 && walls.E) {
      const mesh = createWallMesh(maze.cellSize, wallHeight, thickness, wallMaterial);
      mesh.position.set(world.x + half - thickness / 2, wallHeight / 2, world.z);
      mesh.rotation.y = Math.PI / 2;
      group.add(mesh);
    }
    if (y === maze.height - 1 && walls.S) {
      const mesh = createWallMesh(maze.cellSize, wallHeight, thickness, wallMaterial);
      mesh.position.set(world.x, wallHeight / 2, world.z + half - thickness / 2);
      group.add(mesh);
    }
  });

  scene.add(group);
  return group;
}

function createWallMesh(width, height, thickness, material) {
  const geometry = new THREE.BoxGeometry(width, height, thickness);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createKey(scene, material, position) {
  const group = new THREE.Group();
  group.position.set(position.x, 0, position.z);

  const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x4c4c58, roughness: 0.9 });
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 0.4, 16), pedestalMat);
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  pedestal.position.y = 0.2;
  group.add(pedestal);

  const keyMesh = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.1, 12, 32), material);
  keyMesh.position.y = 0.8;
  keyMesh.rotation.x = Math.PI / 2;
  keyMesh.castShadow = true;
  group.add(keyMesh);

  const keyBody = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.12), material);
  keyBody.position.set(0.45, 0.8, 0);
  keyBody.castShadow = true;
  group.add(keyBody);

  const glow = new THREE.PointLight(0xffc45d, 1.2, 6, 1.5);
  glow.position.y = 1.2;
  group.add(glow);

  scene.add(group);
  return { group, mesh: keyMesh };
}

function createExit(scene, doorMaterial, position) {
  const anchor = new THREE.Group();
  anchor.position.set(position.x, 0, position.z);

  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x33333a, roughness: 0.8 });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.6, 0.3), frameMaterial);
  frame.position.y = 1.3;
  frame.castShadow = true;
  frame.receiveShadow = true;
  anchor.add(frame);

  const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.18), doorMaterial);
  door.castShadow = true;
  door.receiveShadow = true;
  door.position.set(0, 1.1, 0.15);
  anchor.add(door);

  const light = new THREE.PointLight(0x5bc2ff, 0.5, 5);
  light.position.set(0, 2.4, 0.8);
  anchor.add(light);

  scene.add(anchor);
  return { anchor, door };
}

function formatTime(elapsedMs) {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}
