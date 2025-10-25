/**
 * プレイヤー制御システム
 */
class Player {
    constructor(scene, mazeData) {
        this.scene = scene;
        this.mazeData = mazeData;
        
        // プレイヤーの位置（2Dベース）
        this.position = {
            x: mazeData.startPosition.x,
            y: 0.5, // 床の上
            z: mazeData.startPosition.z
        };
        
        // プレイヤーの向き
        this.rotation = {
            x: 0,
            y: 0
        };
        
        // 移動速度
        this.moveSpeed = 0.1;
        this.rotationSpeed = 0.02;
        
        // ゲーム状態
        this.hasKey = false;
        this.isGameOver = false;
        
        // 前回の位置（歩数カウント用）
        this.lastPosition = { ...this.position };
        
        this.initialize();
    }
    
    /**
     * プレイヤーを初期化
     */
    initialize() {
        // プレイヤーの3Dオブジェクトを作成
        this.createPlayerObject();
        
        // カメラを設定
        this.setupCamera();
    }
    
    /**
     * プレイヤーの3Dオブジェクトを作成
     */
    createPlayerObject() {
        // プレイヤーの視点はカメラで表現するため、実際のオブジェクトは作成しない
        // 必要に応じて、プレイヤーの位置を示すマーカーなどを追加できる
    }
    
    /**
     * カメラを設定
     */
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, // 視野角
            window.innerWidth / window.innerHeight, // アスペクト比
            0.1, // ニアクリップ
            1000 // ファークリップ
        );
        
        this.updateCameraPosition();
        this.scene.add(this.camera);
    }
    
    /**
     * カメラの位置を更新
     */
    updateCameraPosition() {
        this.camera.position.set(
            this.position.x,
            this.position.y + 0.5, // 目の高さ
            this.position.z
        );
        
        this.camera.rotation.set(
            this.rotation.x,
            this.rotation.y,
            0
        );
    }
    
    /**
     * プレイヤーを移動（2Dベース）
     */
    move(forward, right, up) {
        if (this.isGameOver) return;
        
        // 移動ベクトルを計算（2Dベース）
        const moveVector = new THREE.Vector3(right, 0, -forward);
        
        // プレイヤーの向きに応じて回転
        moveVector.applyEuler(new THREE.Euler(0, this.rotation.y, 0));
        
        // 新しい位置を計算
        const newPosition = {
            x: this.position.x + moveVector.x * this.moveSpeed,
            y: 0.5, // 常に床の上
            z: this.position.z + moveVector.z * this.moveSpeed
        };
        
        // 衝突チェック
        if (this.canMoveTo(newPosition)) {
            this.position = newPosition;
            this.updateCameraPosition();
            
            // 歩数カウント
            this.checkStepCount();
            
            // アイテムとの衝突チェック
            this.checkItemCollisions();
            
            // ミニマップを更新
            if (minimapSystem) {
                minimapSystem.update(
                    Math.floor(this.position.x),
                    0, // 2Dベースなのでyは0
                    Math.floor(this.position.z)
                );
            }
        }
    }
    
    /**
     * プレイヤーを回転
     */
    rotate(deltaX, deltaY) {
        if (this.isGameOver) return;
        
        this.rotation.x -= deltaX * this.rotationSpeed;
        this.rotation.y -= deltaY * this.rotationSpeed;
        
        // 縦回転の制限
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
        
        this.updateCameraPosition();
    }
    
    /**
     * 指定位置に移動可能かチェック（2Dベース）
     */
    canMoveTo(newPosition) {
        // 境界チェック
        if (newPosition.x < 0 || newPosition.x >= this.mazeData.width ||
            newPosition.z < 0 || newPosition.z >= this.mazeData.height) {
            return false;
        }
        
        // 壁との衝突チェック
        const gridX = Math.floor(newPosition.x);
        const gridZ = Math.floor(newPosition.z);
        
        // 現在の位置と新しい位置の間で壁がないかチェック
        const currentGridX = Math.floor(this.position.x);
        const currentGridZ = Math.floor(this.position.z);
        
        // 移動先が壁の場合
        if (this.mazeData.maze[gridZ][gridX] === 0) {
            return false;
        }
        
        // 斜め移動の場合、角の壁チェック
        if (gridX !== currentGridX && gridZ !== currentGridZ) {
            if (this.mazeData.maze[currentGridZ][gridX] === 0 ||
                this.mazeData.maze[gridZ][currentGridX] === 0) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 歩数カウント（2Dベース）
     */
    checkStepCount() {
        const currentGridX = Math.floor(this.position.x);
        const currentGridZ = Math.floor(this.position.z);
        
        const lastGridX = Math.floor(this.lastPosition.x);
        const lastGridZ = Math.floor(this.lastPosition.z);
        
        // グリッド位置が変わった場合
        if (currentGridX !== lastGridX || currentGridZ !== lastGridZ) {
            
            if (scoreSystem) {
                scoreSystem.incrementStep();
            }
            
            this.lastPosition = { ...this.position };
        }
    }
    
    /**
     * アイテムとの衝突チェック（2Dベース）
     */
    checkItemCollisions() {
        const gridX = Math.floor(this.position.x);
        const gridZ = Math.floor(this.position.z);
        
        // 鍵との衝突チェック
        if (!this.hasKey && this.mazeData.keyPosition &&
            gridX === this.mazeData.keyPosition.x &&
            gridZ === this.mazeData.keyPosition.z) {
            
            this.hasKey = true;
            console.log('鍵を取得しました！');
            
            // UIを更新
            if (window.updateKeyStatus) {
                window.updateKeyStatus(true);
            }
        }
        
        // 出口との衝突チェック
        if (this.hasKey && this.mazeData.exitPosition &&
            gridX === this.mazeData.exitPosition.x &&
            gridZ === this.mazeData.exitPosition.z) {
            
            this.isGameOver = true;
            console.log('ゲームクリア！');
            
            // クリア画面を表示
            if (window.showClearScreen) {
                window.showClearScreen();
            }
        }
    }
    
    /**
     * プレイヤーの状態を取得
     */
    getState() {
        return {
            position: { ...this.position },
            rotation: { ...this.rotation },
            hasKey: this.hasKey,
            isGameOver: this.isGameOver
        };
    }
    
    /**
     * プレイヤーをリセット（2Dベース）
     */
    reset() {
        this.position = {
            x: this.mazeData.startPosition.x,
            y: 0.5, // 床の上
            z: this.mazeData.startPosition.z
        };
        
        this.rotation = { x: 0, y: 0 };
        this.hasKey = false;
        this.isGameOver = false;
        this.lastPosition = { ...this.position };
        
        this.updateCameraPosition();
    }
    
    /**
     * 迷路データを更新
     */
    updateMazeData(newMazeData) {
        this.mazeData = newMazeData;
        this.reset();
    }
}

// グローバルインスタンス
let player;
