export class Minimap {
  constructor(canvas, maze) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.maze = maze;
    this.padding = 8;
    this.scale = (this.canvas.width - this.padding * 2) / this.maze.width;
    this.visited = Array.from({ length: maze.height }, () => Array(maze.width).fill(false));
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
    ctx.beginPath();
    // 上
    ctx.moveTo(offset, offset);
    ctx.lineTo(offset + this.maze.width * this.scale, offset);
    // 右
    ctx.moveTo(offset + this.maze.width * this.scale, offset);
    ctx.lineTo(offset + this.maze.width * this.scale, offset + this.maze.height * this.scale);
    // 下
    ctx.moveTo(offset + this.maze.width * this.scale, offset + this.maze.height * this.scale);
    ctx.lineTo(offset, offset + this.maze.height * this.scale);
    // 左
    ctx.moveTo(offset, offset + this.maze.height * this.scale);
    ctx.lineTo(offset, offset);
    ctx.stroke();
  }

  markVisited(cell) {
    if (!cell) return;
    this.visited[cell.y][cell.x] = true;
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
    
    // 探索済みセルの壁を描画
    ctx.strokeStyle = 'rgba(120, 130, 145, 0.65)';
    ctx.lineWidth = 2;
    for (let y = 0; y < this.maze.height; y++) {
      for (let x = 0; x < this.maze.width; x++) {
        if (!this.visited[y][x]) continue;
        
        const cell = this.maze.grid[y][x];
        const left = offset + x * this.scale;
        const top = offset + y * this.scale;
        const right = left + this.scale;
        const bottom = top + this.scale;

        ctx.beginPath();
        if (cell.walls.N) {
          ctx.moveTo(left, top);
          ctx.lineTo(right, top);
        }
        if (cell.walls.S) {
          ctx.moveTo(left, bottom);
          ctx.lineTo(right, bottom);
        }
        if (cell.walls.W) {
          ctx.moveTo(left, top);
          ctx.lineTo(left, bottom);
        }
        if (cell.walls.E) {
          ctx.moveTo(right, top);
          ctx.lineTo(right, bottom);
        }
        ctx.stroke();
      }
    }
    
    // ゴールの位置を常に表示（鍵は見つけるまで非表示）
    if (this.discovered.exit && exitCell) {
      this._drawMarker(exitCell, 'rgba(92, 213, 116, 0.4)');
    }
    
    // 探索済みエリア
    for (let y = 0; y < this.maze.height; y++) {
      for (let x = 0; x < this.maze.width; x++) {
        if (!this.visited[y][x]) continue;
        const posX = offset + x * this.scale;
        const posY = offset + y * this.scale;
        ctx.fillStyle = 'rgba(70, 130, 190, 0.45)';
        ctx.fillRect(posX + 1, posY + 1, this.scale - 2, this.scale - 2);
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
      ctx.fillStyle = '#ff5151';
      ctx.beginPath();
      ctx.arc(posX, posY, this.scale * 0.2, 0, Math.PI * 2);
      ctx.fill();
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
