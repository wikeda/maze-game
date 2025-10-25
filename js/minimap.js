export class Minimap {
  constructor(canvas, maze) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.maze = maze;
    this.padding = 8;
    this.scale = (this.canvas.width - this.padding * 2) / Math.max(maze.logicalWidth, maze.logicalHeight);
    this.visited = Array.from({ length: maze.logicalHeight }, () => Array(maze.logicalWidth).fill(false));
    this.discovered = { key: false, exit: true }; // Exit always visible, key hidden until found
    this.baseLayer = document.createElement('canvas');
    this.baseLayer.width = this.canvas.width;
    this.baseLayer.height = this.canvas.height;
    this._drawBaseLayer();
  }

  _drawBaseLayer() {
    const ctx = this.baseLayer.getContext('2d');
    ctx.clearRect(0, 0, this.baseLayer.width, this.baseLayer.height);
    ctx.fillStyle = 'rgba(8, 10, 14, 0.95)';
    ctx.fillRect(0, 0, this.baseLayer.width, this.baseLayer.height);

    const offset = this.padding;
    
    // 外枠だけを描画
    ctx.strokeStyle = 'rgba(120, 130, 145, 0.65)';
    ctx.lineWidth = 2;
    const width = this.maze.logicalWidth * this.scale;
    const height = this.maze.logicalHeight * this.scale;
    ctx.beginPath();
    // 上
    ctx.moveTo(offset, offset);
    ctx.lineTo(offset + width, offset);
    // 右
    ctx.moveTo(offset + width, offset);
    ctx.lineTo(offset + width, offset + height);
    // 下
    ctx.moveTo(offset + width, offset + height);
    ctx.lineTo(offset, offset + height);
    // 左
    ctx.moveTo(offset, offset + height);
    ctx.lineTo(offset, offset);
    ctx.stroke();
  }

  markVisited(cell) {
    if (!cell) return;
    this.visited[cell.y][cell.x] = true;
    
    // 通路を通ったとき、両隣の壁も表示
    const directions = [
      { dx: -1, dy: 0 }, // Left
      { dx: 1, dy: 0 },  // Right
      { dx: 0, dy: -1 }, // Top
      { dx: 0, dy: 1 },  // Bottom
    ];
    
    for (const dir of directions) {
      const nx = cell.x + dir.dx;
      const ny = cell.y + dir.dy;
      if (nx >= 0 && nx < this.maze.logicalWidth && ny >= 0 && ny < this.maze.logicalHeight) {
        this.visited[ny][nx] = true;
      }
    }
  }

  discoverKey() {
    this.discovered.key = true;
  }

  discoverExit() {
    this.discovered.exit = true;
  }

  render(playerCell, keyCell, exitCell) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.baseLayer, 0, 0);

    const offset = this.padding;
    
    // 探索済みエリアの壁を描画（濃いグレー）
    ctx.fillStyle = 'rgba(120, 120, 130, 0.95)';
    for (let y = 0; y < this.maze.logicalHeight; y++) {
      for (let x = 0; x < this.maze.logicalWidth; x++) {
        if (!this.visited[y][x]) continue;
        
        const cell = this.maze.grid[y][x];
        if (cell.isWall) {
          const posX = offset + x * this.scale;
          const posY = offset + y * this.scale;
          ctx.fillRect(posX + 0.5, posY + 0.5, this.scale - 1, this.scale - 1);
        }
      }
    }
    
    // ゴールの位置を常に表示（鍵は見つけるまで非表示）
    if (this.discovered.exit && exitCell) {
      this._drawMarker(exitCell, 'rgba(92, 213, 116, 0.4)');
    }
    
    // 探索済みエリア（通路 - 明るい青）
    for (let y = 0; y < this.maze.logicalHeight; y++) {
      for (let x = 0; x < this.maze.logicalWidth; x++) {
        if (!this.visited[y][x]) continue;
        
        const cell = this.maze.grid[y][x];
        if (!cell.isWall) {
          const posX = offset + x * this.scale;
          const posY = offset + y * this.scale;
          ctx.fillStyle = 'rgba(120, 180, 220, 0.65)';
          ctx.fillRect(posX + 1, posY + 1, this.scale - 2, this.scale - 2);
        }
      }
    }

    // 鍵とゴールの位置を明るく表示（探索済みの場合）
    if (this.discovered.key && keyCell) {
      this._drawMarker(keyCell, '#f1c94d');
    }
    if (this.discovered.exit && exitCell) {
      this._drawMarker(exitCell, '#5cd574');
    }

    if (playerCell) {
      const posX = offset + playerCell.x * this.scale + this.scale / 2;
      const posY = offset + playerCell.y * this.scale + this.scale / 2;
      
      // プレイヤーの向きを取得（yaw）
      const yaw = playerCell.yaw || 0;
      const triangleSize = this.scale * 0.3;
      
      ctx.save();
      ctx.translate(posX, posY);
      ctx.rotate(yaw); // プレイヤーの向きに回転
      
      ctx.fillStyle = '#ff5151';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // 三角形を描画（下向き - 先端を進行方向に）
      ctx.moveTo(0, triangleSize); // 頂点（下向き）
      ctx.lineTo(-triangleSize * 0.6, -triangleSize * 0.4); // 左上
      ctx.lineTo(triangleSize * 0.6, -triangleSize * 0.4); // 右上
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      ctx.restore();
    }
  }

  _drawMarker(cell, color) {
    const ctx = this.ctx;
    const offset = this.padding;
    const posX = offset + cell.x * this.scale + this.scale / 2;
    const posY = offset + cell.y * this.scale + this.scale / 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(posX, posY, this.scale * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}
