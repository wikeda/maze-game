import * as THREE from 'https://unpkg.com/three@0.159.0/build/three.module.js';

export class Player {
  constructor(camera, maze) {
    this.camera = camera;
    this.maze = maze;
    this.position = new THREE.Vector3();
    this.yaw = Math.PI / 2; // face south by default
    this.speed = 3.2;
    this.turnSpeed = Math.PI;
    this.radius = 0.35;
    this.eyeHeight = 1.6;
    this.reset();
  }

  reset() {
    const start = this.maze.cellToWorld(this.maze.startCell);
    this.position.set(start.x, this.eyeHeight, start.z);
    this.yaw = Math.PI / 2;
    this._updateCamera();
  }

  update(delta, input) {
    let moved = false;

    if (input.turn) {
      this.yaw -= input.turn * this.turnSpeed * delta;
    }

    const forwardVector = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const moveDistance = this.speed * delta * input.forward;

    if (Math.abs(moveDistance) > 0.0001) {
      const dx = forwardVector.x * moveDistance;
      const dz = forwardVector.z * moveDistance;
      moved = this._tryMove(dx, dz);
    }

    this._updateCamera();
    return moved;
  }

  _tryMove(dx, dz) {
    const targetX = this.position.x + dx;
    const targetZ = this.position.z + dz;

    if (this.maze.isWalkable(targetX, targetZ, this.radius)) {
      this.position.x = targetX;
      this.position.z = targetZ;
      return true;
    }

    let moved = false;
    if (this.maze.isWalkable(this.position.x + dx, this.position.z, this.radius)) {
      this.position.x += dx;
      moved = true;
    }
    if (this.maze.isWalkable(this.position.x, this.position.z + dz, this.radius)) {
      this.position.z += dz;
      moved = true;
    }
    return moved;
  }

  _updateCamera() {
    this.camera.position.copy(this.position);
    const target = new THREE.Vector3(
      this.position.x + Math.sin(this.yaw),
      this.position.y,
      this.position.z + Math.cos(this.yaw)
    );
    this.camera.lookAt(target);
  }

  getCell() {
    return this.maze.worldToCell(this.position.x, this.position.z);
  }

  getWorldPosition() {
    return this.position.clone();
  }

  getDirection() {
    return new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
  }
}
