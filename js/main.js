/**
 * メインゲームクラス
 */
class Game {
    constructor() {
        this.scene = null;
        this.renderer = null;
        this.mazeData = null;
        this.mazeObjects = [];
        
        this.isInitialized = false;
        this.isRunning = false;
        
        this.initialize();
    }
    
    /**
     * ゲームを初期化
     */
    async initialize() {
        try {
            console.log('ゲームを初期化中...');
            
            // Three.js環境をセットアップ
            this.setupThreeJS();
            
            // システムを初期化
            this.initializeSystems();
            
            // 迷路を生成
            await this.generateMaze();
            
            // 迷路を3Dシーンに追加
            this.createMaze3D();
            
            // ゲームループを開始
            this.startGameLoop();
            
            this.isInitialized = true;
            console.log('ゲーム初期化完了');
            
        } catch (error) {
            console.error('ゲーム初期化エラー:', error);
            if (uiSystem) {
                uiSystem.showError('ゲームの初期化に失敗しました');
            }
        }
    }
    
    /**
     * Three.js環境をセットアップ
     */
    setupThreeJS() {
        // シーンを作成
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a); // 暗いダンジョン色
        
        // レンダラーを作成
        const canvas = document.getElementById('gameCanvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // ライティングを設定
        this.setupLighting();
        
        // リサイズイベント
        window.addEventListener('resize', () => {
            this.onResize();
        });
    }
    
    /**
     * ライティングを設定（ダンジョン風）
     */
    setupLighting() {
        // 環境光（暗めに設定）
        const ambientLight = new THREE.AmbientLight(0x202020, 0.3);
        this.scene.add(ambientLight);
        
        // 指向性ライト（ダンジョン風の暖色系）
        const directionalLight = new THREE.DirectionalLight(0xFFE4B5, 0.6);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
        
        // 追加の暖色系ライト
        const warmLight = new THREE.PointLight(0xFFA500, 0.5, 30);
        warmLight.position.set(5, 5, 5);
        this.scene.add(warmLight);
    }
    
    /**
     * システムを初期化
     */
    initializeSystems() {
        // 各システムを初期化
        scoreSystem = new ScoreSystem();
        mazeGenerator = new MazeGenerator();
        minimapSystem = new MinimapSystem();
        uiSystem = new UISystem();
        controlSystem = new ControlSystem();
    }
    
    /**
     * 迷路を生成
     */
    async generateMaze() {
        console.log('迷路を生成中...');
        
        // 迷路を生成
        mazeGenerator.generate();
        this.mazeData = mazeGenerator.getMazeData();
        
        // ミニマップにデータを設定
        minimapSystem.setMazeData(this.mazeData);
        
        console.log('迷路生成完了');
    }
    
    /**
     * 3D迷路を作成
     */
    createMaze3D() {
        // 既存の迷路オブジェクトを削除
        this.clearMaze3D();
        
        // 迷路の3Dオブジェクトを作成
        this.createWalls();
        this.createFloor();
        this.createKey();
        this.createExit();
        
        // プレイヤーを作成
        player = new Player(this.scene, this.mazeData);
        
        console.log('3D迷路作成完了');
    }
    
    /**
     * 迷路オブジェクトをクリア
     */
    clearMaze3D() {
        this.mazeObjects.forEach(obj => {
            this.scene.remove(obj);
        });
        this.mazeObjects = [];
    }
    
    /**
     * 壁を作成（コリドーベース）
     */
    createWalls() {
        const wallGeometry = new THREE.BoxGeometry(1, 2.5, 1);
        const wallMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4a4a4a,
            map: this.createStoneTexture()
        });
        
        // 2Dベースの迷路データを使用
        for (let z = 0; z < this.mazeData.height; z++) {
            for (let x = 0; x < this.mazeData.width; x++) {
                if (this.mazeData.maze[z][x] === 0) { // 壁
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(x, 1.25, z);
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.scene.add(wall);
                    this.mazeObjects.push(wall);
                }
            }
        }
    }
    
    /**
     * 床を作成（石畳風、コリドーベース）
     */
    createFloor() {
        const floorGeometry = new THREE.PlaneGeometry(this.mazeData.width, this.mazeData.height);
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x696969,
            map: this.createStoneFloorTexture()
        });
        
        // 2Dベースなので床は1つだけ
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(
            this.mazeData.width / 2 - 0.5,
            0,
            this.mazeData.height / 2 - 0.5
        );
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.mazeObjects.push(floor);
    }
    
    /**
     * 鍵を作成（ダンジョン風）
     */
    createKey() {
        if (!this.mazeData.keyPosition) return;
        
        // 鍵の台座を作成
        const pedestalGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 8);
        const pedestalMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
        pedestal.position.set(
            this.mazeData.keyPosition.x,
            this.mazeData.keyPosition.y + 0.25,
            this.mazeData.keyPosition.z
        );
        pedestal.castShadow = true;
        this.scene.add(pedestal);
        this.mazeObjects.push(pedestal);
        
        // 鍵を作成
        const keyGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8);
        const keyMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        
        const key = new THREE.Mesh(keyGeometry, keyMaterial);
        key.position.set(
            this.mazeData.keyPosition.x,
            this.mazeData.keyPosition.y + 0.7,
            this.mazeData.keyPosition.z
        );
        key.castShadow = true;
        this.scene.add(key);
        this.mazeObjects.push(key);
        
        // 鍵の周りに光る効果を追加
        this.addKeyGlow(this.mazeData.keyPosition.x, this.mazeData.keyPosition.y + 0.7, this.mazeData.keyPosition.z);
    }
    
    /**
     * 出口を作成（ダンジョン風の扉）
     */
    createExit() {
        if (!this.mazeData.exitPosition) return;
        
        // 扉の枠を作成
        const frameGeometry = new THREE.BoxGeometry(1.2, 2.5, 0.2);
        const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(
            this.mazeData.exitPosition.x,
            this.mazeData.exitPosition.y + 1.25,
            this.mazeData.exitPosition.z
        );
        frame.castShadow = true;
        this.scene.add(frame);
        this.mazeObjects.push(frame);
        
        // 扉を作成
        const doorGeometry = new THREE.BoxGeometry(0.8, 2, 0.1);
        const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(
            this.mazeData.exitPosition.x,
            this.mazeData.exitPosition.y + 1,
            this.mazeData.exitPosition.z
        );
        door.castShadow = true;
        this.scene.add(door);
        this.mazeObjects.push(door);
        
        // 扉の装飾を追加
        this.addDoorDecoration(this.mazeData.exitPosition.x, this.mazeData.exitPosition.y + 1, this.mazeData.exitPosition.z);
    }
    
    /**
     * 石のテクスチャを作成
     */
    createStoneTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // 石の模様を描画
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(0, 0, 64, 64);
        
        ctx.fillStyle = '#3a3a3a';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 64;
            const y = Math.random() * 64;
            const size = Math.random() * 8 + 2;
            ctx.fillRect(x, y, size, size);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }
    
    /**
     * 石畳のテクスチャを作成
     */
    createStoneFloorTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // 石畳の模様を描画
        ctx.fillStyle = '#696969';
        ctx.fillRect(0, 0, 128, 128);
        
        // 石の境界線
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 2;
        for (let x = 0; x < 128; x += 32) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 128);
            ctx.stroke();
        }
        for (let y = 0; y < 128; y += 32) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(128, y);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8);
        return texture;
    }
    
    /**
     * 鍵の光る効果を追加
     */
    addKeyGlow(x, y, z) {
        const glowGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFD700,
            transparent: true,
            opacity: 0.3
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(x, y, z);
        this.scene.add(glow);
        this.mazeObjects.push(glow);
    }
    
    /**
     * 扉の装飾を追加
     */
    addDoorDecoration(x, y, z) {
        // 扉の取っ手
        const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(x + 0.3, y, z + 0.06);
        handle.rotation.z = Math.PI / 2;
        this.scene.add(handle);
        this.mazeObjects.push(handle);
        
        // 扉の装飾的な模様
        const decorationGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.05);
        const decorationMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        
        const decoration = new THREE.Mesh(decorationGeometry, decorationMaterial);
        decoration.position.set(x, y, z + 0.05);
        this.scene.add(decoration);
        this.mazeObjects.push(decoration);
    }
    
    /**
     * ゲームループを開始
     */
    startGameLoop() {
        this.isRunning = true;
        this.gameLoop();
    }
    
    /**
     * ゲームループ
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        // コントロールを更新
        if (controlSystem) {
            controlSystem.update();
        }
        
        // レンダリング
        if (this.renderer && this.scene && player) {
            this.renderer.render(this.scene, player.camera);
        }
        
        // 次のフレームを要求
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * リサイズ処理
     */
    onResize() {
        if (this.renderer && player) {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            player.camera.aspect = width / height;
            player.camera.updateProjectionMatrix();
            
            this.renderer.setSize(width, height);
        }
        
        if (minimapSystem) {
            minimapSystem.onResize();
        }
        
        if (controlSystem) {
            controlSystem.onResize();
        }
    }
    
    /**
     * ゲームをリスタート
     */
    async restart() {
        console.log('ゲームをリスタート中...');
        
        // スコアをリセット
        if (scoreSystem) {
            scoreSystem.reset();
        }
        
        // プレイヤーをリセット
        if (player) {
            player.reset();
        }
        
        // コントロールをリセット
        if (controlSystem) {
            controlSystem.reset();
        }
        
        // 新しい迷路を生成
        await this.generateMaze();
        this.createMaze3D();
        
        // ミニマップをリセット
        if (minimapSystem) {
            minimapSystem.setMazeData(this.mazeData);
        }
        
        console.log('ゲームリスタート完了');
    }
    
    /**
     * ゲームを停止
     */
    stop() {
        this.isRunning = false;
    }
}

// ゲームインスタンスを作成
let game;

// ページ読み込み完了後にゲームを開始
window.addEventListener('load', () => {
    game = new Game();
    window.game = game; // グローバルアクセス用
});
