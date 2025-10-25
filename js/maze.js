/**
 * ランダム迷路生成システム
 * Recursive Backtrackingアルゴリズムを使用
 */
class MazeGenerator {
    constructor(width = 20, height = 20) {
        this.width = width;
        this.height = height;
        this.maze = [];
        this.visited = [];
        this.keyPosition = null;
        this.exitPosition = null;
        this.startPosition = { x: 1, y: 0, z: 1 };
        
        // 方向ベクトル（2Dベース）
        this.directions = [
            { x: 0, z: 1 },   // 北
            { x: 1, z: 0 },   // 東
            { x: 0, z: -1 },  // 南
            { x: -1, z: 0 }   // 西
        ];
    }
    
    /**
     * 迷路を生成（2Dベース）
     */
    generate() {
        console.log('迷路生成を開始...');
        
        // 2次元配列を初期化（0: 壁, 1: 通路）
        this.maze = [];
        for (let z = 0; z < this.height; z++) {
            this.maze[z] = [];
            for (let x = 0; x < this.width; x++) {
                this.maze[z][x] = 0; // 初期状態は全て壁
            }
        }
        
        // 訪問済みフラグを初期化
        this.visited = [];
        for (let z = 0; z < this.height; z++) {
            this.visited[z] = [];
            for (let x = 0; x < this.width; x++) {
                this.visited[z][x] = false;
            }
        }
        
        // Recursive Backtrackingで迷路を生成
        this.carvePassages(this.startPosition.x, this.startPosition.z);
        
        // 鍵と出口を配置
        this.placeKeyAndExit();
        
        console.log('迷路生成完了');
        return this.maze;
    }
    
    /**
     * Recursive Backtrackingアルゴリズム（2Dベース）
     */
    carvePassages(x, z) {
        this.maze[z][x] = 1; // 現在の位置を通路にする
        this.visited[z][x] = true;
        
        // 隣接するセルをランダムな順序で取得
        const neighbors = this.getNeighbors(x, z);
        this.shuffleArray(neighbors);
        
        for (const neighbor of neighbors) {
            const nx = neighbor.x;
            const nz = neighbor.z;
            
            // 隣接セルが未訪問の場合
            if (!this.visited[nz][nx]) {
                // 壁を取り除く
                this.maze[nz][nx] = 1;
                
                // 再帰的に続行
                this.carvePassages(nx, nz);
            }
        }
    }
    
    /**
     * 隣接するセルを取得（2Dベース）
     */
    getNeighbors(x, z) {
        const neighbors = [];
        
        for (const dir of this.directions) {
            const nx = x + dir.x;
            const nz = z + dir.z;
            
            // 境界内かチェック
            if (this.isValidPosition(nx, nz)) {
                neighbors.push({ x: nx, z: nz });
            }
        }
        
        return neighbors;
    }
    
    /**
     * 位置が有効かチェック（2Dベース）
     */
    isValidPosition(x, z) {
        return x >= 0 && x < this.width &&
               z >= 0 && z < this.height;
    }
    
    /**
     * 配列をシャッフル
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    /**
     * 鍵と出口を配置（2Dベース）
     */
    placeKeyAndExit() {
        // 通路のリストを取得
        const passages = this.getPassages();
        
        if (passages.length < 2) {
            console.error('通路が不足しています');
            return;
        }
        
        // 開始地点から離れた場所に鍵を配置
        let keyCandidate;
        let maxDistance = 0;
        
        for (const passage of passages) {
            const distance = this.getDistance(this.startPosition, passage);
            if (distance > maxDistance) {
                maxDistance = distance;
                keyCandidate = passage;
            }
        }
        
        this.keyPosition = keyCandidate;
        
        // 鍵から離れた場所に出口を配置
        let exitCandidate;
        maxDistance = 0;
        
        for (const passage of passages) {
            const distance = this.getDistance(this.keyPosition, passage);
            if (distance > maxDistance) {
                maxDistance = distance;
                exitCandidate = passage;
            }
        }
        
        this.exitPosition = exitCandidate;
        
        console.log('鍵の位置:', this.keyPosition);
        console.log('出口の位置:', this.exitPosition);
    }
    
    /**
     * 通路のリストを取得（2Dベース）
     */
    getPassages() {
        const passages = [];
        
        for (let z = 0; z < this.height; z++) {
            for (let x = 0; x < this.width; x++) {
                if (this.maze[z][x] === 1) {
                    passages.push({ x, y: 0, z });
                }
            }
        }
        
        return passages;
    }
    
    /**
     * 2点間の距離を計算（2Dベース）
     */
    getDistance(pos1, pos2) {
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.z - pos2.z);
    }
    
    /**
     * 指定位置が通路かチェック（2Dベース）
     */
    isPassage(x, z) {
        if (!this.isValidPosition(x, z)) return false;
        return this.maze[z][x] === 1;
    }
    
    /**
     * 指定位置が壁かチェック（2Dベース）
     */
    isWall(x, z) {
        if (!this.isValidPosition(x, z)) return true;
        return this.maze[z][x] === 0;
    }
    
    /**
     * 迷路データを取得（2Dベース）
     */
    getMazeData() {
        return {
            maze: this.maze,
            keyPosition: this.keyPosition,
            exitPosition: this.exitPosition,
            startPosition: this.startPosition,
            width: this.width,
            height: this.height,
            depth: 1 // 2Dベースなので深さは1
        };
    }
}

// グローバルインスタンス
let mazeGenerator;
