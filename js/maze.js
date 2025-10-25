export class Maze {
  constructor(width = 20, height = 20, cellSize = 4) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    // Grid is now doubled in size to accommodate wall cells
    this.logicalWidth = width * 2 + 1;
    this.logicalHeight = height * 2 + 1;
    this.wallHeight = 2.5;
    this.grid = [];
    this._buildGrid();
    this._generate();
    this._placeKeyAndExit();
  }

  _buildGrid() {
    for (let y = 0; y < this.logicalHeight; y++) {
      const row = [];
      for (let x = 0; x < this.logicalWidth; x++) {
        row.push({
          x,
          y,
          isWall: true, // Default to wall
          visited: false,
        });
      }
      this.grid.push(row);
    }
  }

  _generate() {
    // Ensure outer boundary walls
    for (let x = 0; x < this.logicalWidth; x++) {
      this.grid[0][x].isWall = true; // Top edge
      this.grid[this.logicalHeight - 1][x].isWall = true; // Bottom edge
    }
    for (let y = 0; y < this.logicalHeight; y++) {
      this.grid[y][0].isWall = true; // Left edge
      this.grid[y][this.logicalWidth - 1].isWall = true; // Right edge
    }

    // Start from a random even coordinate (passage cell) within bounds
    const startX = Math.max(1, Math.min(this.logicalWidth - 2, 2 * Math.floor(Math.random() * this.width) + 1));
    const startY = Math.max(1, Math.min(this.logicalHeight - 2, 2 * Math.floor(Math.random() * this.height) + 1));
    
    const stack = [];
    const start = this.grid[startY][startX];
    start.isWall = false;
    start.visited = true;
    stack.push(start);

    const directions = [
      { dx: 0, dy: -2 },  // North
      { dx: 0, dy: 2 },   // South
      { dx: 2, dy: 0 },   // East
      { dx: -2, dy: 0 },  // West
    ];

    while (stack.length) {
      const current = stack[stack.length - 1];
      const neighbors = directions
        .map((dir) => {
          const nx = current.x + dir.dx;
          const ny = current.y + dir.dy;
          // Check bounds and ensure we're not at edges
          if (this._inBounds(nx, ny) && 
              nx > 0 && nx < this.logicalWidth - 1 && 
              ny > 0 && ny < this.logicalHeight - 1 &&
              this.grid[ny][nx].isWall) {
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
      
      // Carve path: remove wall between current and next
      const wallX = current.x + dir.dx / 2;
      const wallY = current.y + dir.dy / 2;
      this.grid[wallY][wallX].isWall = false;
      
      next.isWall = false;
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
    // Find all passage cells (non-wall cells)
    const passageCells = [];
    for (let y = 0; y < this.logicalHeight; y++) {
      for (let x = 0; x < this.logicalWidth; x++) {
        if (!this.grid[y][x].isWall) {
          passageCells.push(this.grid[y][x]);
        }
      }
    }
    
    // Start from random passage
    const startIdx = Math.floor(Math.random() * passageCells.length);
    this.startCell = passageCells[startIdx];
    
    const distancesFromStart = this._calculateDistances(this.startCell);
    this.keyCell = this._farthestCell(distancesFromStart);
    const distancesFromKey = this._calculateDistances(this.keyCell);
    this.exitCell = this._farthestCell(distancesFromKey, this.keyCell);
  }

  _calculateDistances(fromCell) {
    const distances = Array.from({ length: this.logicalHeight }, () => 
      Array(this.logicalWidth).fill(Infinity)
    );
    const queue = [];
    distances[fromCell.y][fromCell.x] = 0;
    queue.push(fromCell);

    const deltas = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
    ];

    while (queue.length) {
      const cell = queue.shift();
      const distance = distances[cell.y][cell.x];

      for (const d of deltas) {
        const nx = cell.x + d.dx;
        const ny = cell.y + d.dy;
        if (!this._inBounds(nx, ny)) continue;
        if (this.grid[ny][nx].isWall) continue;
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
    for (let y = 0; y < this.logicalHeight; y++) {
      for (let x = 0; x < this.logicalWidth; x++) {
        if (this.grid[y][x].isWall) continue;
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
    return x >= 0 && y >= 0 && x < this.logicalWidth && y < this.logicalHeight;
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
    return !cell.isWall;
  }

  forEachCell(callback) {
    for (let y = 0; y < this.logicalHeight; y++) {
      for (let x = 0; x < this.logicalWidth; x++) {
        callback(this.grid[y][x]);
      }
    }
  }
}
