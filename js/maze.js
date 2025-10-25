export class Maze {
  constructor(width = 20, height = 20, cellSize = 4) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.wallThickness = Math.max(0.4, cellSize * 0.22);
    this.wallHeight = 2.5;
    this.grid = [];
    this._buildGrid();
    this._generate();
    this._placeKeyAndExit();
  }

  _buildGrid() {
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        row.push({
          x,
          y,
          visited: false,
          walls: { N: true, S: true, E: true, W: true },
        });
      }
      this.grid.push(row);
    }
  }

  _generate() {
    const stack = [];
    const start = this.grid[0][0];
    start.visited = true;
    stack.push(start);

    const directions = [
      { key: 'N', dx: 0, dy: -1, opposite: 'S' },
      { key: 'S', dx: 0, dy: 1, opposite: 'N' },
      { key: 'E', dx: 1, dy: 0, opposite: 'W' },
      { key: 'W', dx: -1, dy: 0, opposite: 'E' },
    ];

    while (stack.length) {
      const current = stack[stack.length - 1];
      const neighbors = directions
        .map((dir) => {
          const nx = current.x + dir.dx;
          const ny = current.y + dir.dy;
          if (this._inBounds(nx, ny) && !this.grid[ny][nx].visited) {
            return { cell: this.grid[ny][nx], dir };
          }
          return null;
        })
        .filter(Boolean);

      if (!neighbors.length) {
        stack.pop();
        continue;
      }

      const { cell: next, dir } = neighbors[Math.floor(Math.random() * neighbors.length)];
      current.walls[dir.key] = false;
      next.walls[dir.opposite] = false;
      next.visited = true;
      stack.push(next);
    }

    // Reset visited flags for gameplay use
    for (const row of this.grid) {
      for (const cell of row) {
        cell.visited = false;
      }
    }
  }

  _placeKeyAndExit() {
    // 開始位置をランダムに選択
    const startX = Math.floor(Math.random() * this.width);
    const startY = Math.floor(Math.random() * this.height);
    this.startCell = this.grid[startY][startX];
    
    const distancesFromStart = this._calculateDistances(this.startCell);
    this.keyCell = this._farthestCell(distancesFromStart);
    const distancesFromKey = this._calculateDistances(this.keyCell);
    this.exitCell = this._farthestCell(distancesFromKey, this.keyCell);
  }

  _calculateDistances(fromCell) {
    const distances = Array.from({ length: this.height }, () => Array(this.width).fill(Infinity));
    const queue = [];
    distances[fromCell.y][fromCell.x] = 0;
    queue.push(fromCell);

    const deltas = [
      { key: 'N', dx: 0, dy: -1 },
      { key: 'S', dx: 0, dy: 1 },
      { key: 'E', dx: 1, dy: 0 },
      { key: 'W', dx: -1, dy: 0 },
    ];

    while (queue.length) {
      const cell = queue.shift();
      const distance = distances[cell.y][cell.x];

      for (const d of deltas) {
        if (cell.walls[d.key]) continue;
        const nx = cell.x + d.dx;
        const ny = cell.y + d.dy;
        if (!this._inBounds(nx, ny)) continue;
        if (distances[ny][nx] <= distance + 1) continue;
        distances[ny][nx] = distance + 1;
        queue.push(this.grid[ny][nx]);
      }
    }

    return distances;
  }

  _farthestCell(distances, ignoreCell = null) {
    let farthest = this.grid[0][0];
    let farDistance = -1;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (ignoreCell && ignoreCell.x === x && ignoreCell.y === y) continue;
        const d = distances[y][x];
        if (d > farDistance && d < Infinity) {
          farDistance = d;
          farthest = this.grid[y][x];
        }
      }
    }
    return farthest;
  }

  _inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  cellToWorld(cell) {
    const originX = -this.width * this.cellSize * 0.5;
    const originZ = -this.height * this.cellSize * 0.5;
    return {
      x: originX + cell.x * this.cellSize + this.cellSize * 0.5,
      z: originZ + cell.y * this.cellSize + this.cellSize * 0.5,
    };
  }

  worldToCell(x, z) {
    const originX = -this.width * this.cellSize * 0.5;
    const originZ = -this.height * this.cellSize * 0.5;
    const cx = Math.floor((x - originX) / this.cellSize);
    const cy = Math.floor((z - originZ) / this.cellSize);
    if (!this._inBounds(cx, cy)) {
      return null;
    }
    return this.grid[cy][cx];
  }

  isWalkable(x, z, radius = 0.3) {
    const cell = this.worldToCell(x, z);
    if (!cell) return false;

    const originX = -this.width * this.cellSize * 0.5 + cell.x * this.cellSize;
    const originZ = -this.height * this.cellSize * 0.5 + cell.y * this.cellSize;
    const localX = x - originX;
    const localZ = z - originZ;
    const size = this.cellSize;
    const pad = this.wallThickness * 0.5 + radius;

    if (localX < pad && cell.walls.W) return false;
    if (localX > size - pad && cell.walls.E) return false;
    if (localZ < pad && cell.walls.N) return false;
    if (localZ > size - pad && cell.walls.S) return false;

    // Check neighbor walls when close to border without wall for smoother collision
    if (localX < radius) {
      const neighbor = this._neighbor(cell, -1, 0);
      if (neighbor && neighbor.walls.E) return false;
    }
    if (localX > size - radius) {
      const neighbor = this._neighbor(cell, 1, 0);
      if (neighbor && neighbor.walls.W) return false;
    }
    if (localZ < radius) {
      const neighbor = this._neighbor(cell, 0, -1);
      if (neighbor && neighbor.walls.S) return false;
    }
    if (localZ > size - radius) {
      const neighbor = this._neighbor(cell, 0, 1);
      if (neighbor && neighbor.walls.N) return false;
    }

    return true;
  }

  _neighbor(cell, dx, dy) {
    const nx = cell.x + dx;
    const ny = cell.y + dy;
    if (!this._inBounds(nx, ny)) return null;
    return this.grid[ny][nx];
  }

  forEachCell(callback) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        callback(this.grid[y][x]);
      }
    }
  }
}
