/**
 * ミニマップシステム
 */
class MinimapSystem {
    constructor() {
        this.canvas = document.getElementById('minimapCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 8;
        this.width = 0;
        this.height = 0;
        this.explored = [];
        this.mazeData = null;
        
        // 色設定
        this.colors = {
            unexplored: 'rgba(50, 50, 50, 0.3)',
            explored: 'rgba(100, 150, 255, 0.7)',
            wall: 'rgba(80, 80, 80, 0.9)',
            player: 'rgba(255, 0, 0, 1)',
            key: 'rgba(255, 215, 0, 1)',
            exit: 'rgba(0, 255, 0, 1)',
            start: 'rgba(255, 255, 255, 1)'
        };
        
        this.setupCanvas();
    }
    
    /**
     * キャンバスの設定
     */
    setupCanvas() {
        this.width = this.canvas.width = this.canvas.offsetWidth;
        this.height = this.canvas.height = this.canvas.offsetHeight;
    }
    
    /**
     * 迷路データを設定
     */
    setMazeData(mazeData) {
        this.mazeData = mazeData;
        this.initializeExplored();
        this.drawMinimap();
    }
    
    /**
     * 探索済みエリアを初期化
     */
    initializeExplored() {
        if (!this.mazeData) return;
        
        this.explored = [];
        for (let y = 0; y < this.mazeData.depth; y++) {
            this.explored[y] = [];
            for (let z = 0; z < this.mazeData.height; z++) {
                this.explored[y][z] = [];
                for (let x = 0; x < this.mazeData.width; x++) {
                    this.explored[y][z][x] = false;
                }
            }
        }
    }
    
    /**
     * プレイヤーの位置を更新
     */
    updatePlayerPosition(x, y, z) {
        if (!this.mazeData || !this.isValidPosition(x, y, z)) return;
        
        // 現在位置と周囲を探索済みにする
        this.explored[y][z][x] = true;
        
        // 隣接するセルも探索済みにする（視界内）
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                const nx = x + dx;
                const nz = z + dz;
                if (this.isValidPosition(nx, y, nz)) {
                    this.explored[y][nz][nx] = true;
                }
            }
        }
        
        this.drawMinimap();
    }
    
    /**
     * 位置が有効かチェック
     */
    isValidPosition(x, y, z) {
        if (!this.mazeData) return false;
        return x >= 0 && x < this.mazeData.width &&
               y >= 0 && y < this.mazeData.depth &&
               z >= 0 && z < this.mazeData.height;
    }
    
    /**
     * ミニマップを描画
     */
    drawMinimap() {
        if (!this.mazeData) return;
        
        // キャンバスをクリア
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 迷路のサイズに応じてセルサイズを調整
        const maxSize = Math.max(this.mazeData.width, this.mazeData.height);
        this.cellSize = Math.min(this.width, this.height) / (maxSize + 2);
        
        // オフセットを計算（中央に配置）
        const offsetX = (this.width - this.mazeData.width * this.cellSize) / 2;
        const offsetY = (this.height - this.mazeData.height * this.cellSize) / 2;
        
        // 迷路を描画
        for (let y = 0; y < this.mazeData.depth; y++) {
            for (let z = 0; z < this.mazeData.height; z++) {
                for (let x = 0; x < this.mazeData.width; x++) {
                    this.drawCell(x, y, z, offsetX, offsetY);
                }
            }
        }
    }
    
    /**
     * セルを描画
     */
    drawCell(x, y, z, offsetX, offsetY) {
        const screenX = offsetX + x * this.cellSize;
        const screenY = offsetY + z * this.cellSize;
        
        // 壁の場合
        if (this.mazeData.maze[y][z][x] === 0) {
            this.ctx.fillStyle = this.colors.wall;
            this.ctx.fillRect(screenX, screenY, this.cellSize, this.cellSize);
            return;
        }
        
        // 通路の場合
        if (this.mazeData.maze[y][z][x] === 1) {
            // 探索済みかどうかで色を変える
            if (this.explored[y][z][x]) {
                this.ctx.fillStyle = this.colors.explored;
            } else {
                this.ctx.fillStyle = this.colors.unexplored;
            }
            
            this.ctx.fillRect(screenX, screenY, this.cellSize, this.cellSize);
            
            // 特別なアイテムを描画
            this.drawSpecialItems(x, y, z, screenX, screenY);
        }
    }
    
    /**
     * 特別なアイテムを描画
     */
    drawSpecialItems(x, y, z, screenX, screenY) {
        const centerX = screenX + this.cellSize / 2;
        const centerY = screenY + this.cellSize / 2;
        const radius = this.cellSize / 4;
        
        // 開始地点
        if (x === this.mazeData.startPosition.x && 
            y === this.mazeData.startPosition.y && 
            z === this.mazeData.startPosition.z) {
            this.ctx.fillStyle = this.colors.start;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 鍵（探索済みの場合のみ）
        if (this.mazeData.keyPosition && 
            x === this.mazeData.keyPosition.x && 
            y === this.mazeData.keyPosition.y && 
            z === this.mazeData.keyPosition.z &&
            this.explored[y][z][x]) {
            this.ctx.fillStyle = this.colors.key;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 出口（探索済みの場合のみ）
        if (this.mazeData.exitPosition && 
            x === this.mazeData.exitPosition.x && 
            y === this.mazeData.exitPosition.y && 
            z === this.mazeData.exitPosition.z &&
            this.explored[y][z][x]) {
            this.ctx.fillStyle = this.colors.exit;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    /**
     * プレイヤーの位置を描画
     */
    drawPlayer(x, y, z) {
        if (!this.mazeData || !this.isValidPosition(x, y, z)) return;
        
        const maxSize = Math.max(this.mazeData.width, this.mazeData.height);
        const cellSize = Math.min(this.width, this.height) / (maxSize + 2);
        const offsetX = (this.width - this.mazeData.width * cellSize) / 2;
        const offsetY = (this.height - this.mazeData.height * cellSize) / 2;
        
        const screenX = offsetX + x * cellSize;
        const screenY = offsetY + z * cellSize;
        const centerX = screenX + cellSize / 2;
        const centerY = screenY + cellSize / 2;
        const radius = cellSize / 3;
        
        // プレイヤーの位置を描画
        this.ctx.fillStyle = this.colors.player;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // プレイヤーの周りに光る効果
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    /**
     * ミニマップを更新（プレイヤー位置を含む）
     */
    update(playerX, playerY, playerZ) {
        this.updatePlayerPosition(playerX, playerY, playerZ);
        this.drawPlayer(playerX, playerY, playerZ);
    }
    
    /**
     * リサイズ時の処理
     */
    onResize() {
        this.setupCanvas();
        if (this.mazeData) {
            this.drawMinimap();
        }
    }
}

// グローバルインスタンス
let minimapSystem;



