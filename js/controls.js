/**
 * コントロールシステム（スマートフォン最適化）
 */
class ControlSystem {
    constructor() {
        this.isPointerLocked = false;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // ジョイスティック関連
        this.joystick = {
            element: document.getElementById('joystick'),
            knob: document.getElementById('joystickKnob'),
            isActive: false,
            centerX: 0,
            centerY: 0,
            knobX: 0,
            knobY: 0,
            maxDistance: 40
        };
        
        // 移動状態
        this.movement = {
            forward: 0,
            right: 0,
            up: 0
        };
        
        this.initialize();
    }
    
    /**
     * コントロールシステムを初期化
     */
    initialize() {
        this.setupJoystick();
        this.setupTouchControls();
        this.setupKeyboardControls();
        this.setupPointerLock();
        
        // リサイズイベント
        window.addEventListener('resize', () => {
            this.onResize();
        });
    }
    
    /**
     * ジョイスティックを設定
     */
    setupJoystick() {
        const joystick = this.joystick;
        
        // ジョイスティックの中心位置を計算
        this.updateJoystickCenter();
        
        // タッチイベント
        joystick.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.onJoystickStart(e.touches[0]);
        });
        
        joystick.element.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.onJoystickMove(e.touches[0]);
        });
        
        joystick.element.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.onJoystickEnd();
        });
        
        // マウスイベント（デスクトップ用）
        joystick.element.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.onJoystickStart(e);
        });
        
        joystick.element.addEventListener('mousemove', (e) => {
            if (joystick.isActive) {
                e.preventDefault();
                this.onJoystickMove(e);
            }
        });
        
        joystick.element.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.onJoystickEnd();
        });
    }
    
    /**
     * ジョイスティックの中心位置を更新
     */
    updateJoystickCenter() {
        const rect = this.joystick.element.getBoundingClientRect();
        this.joystick.centerX = rect.left + rect.width / 2;
        this.joystick.centerY = rect.top + rect.height / 2;
    }
    
    /**
     * ジョイスティック開始
     */
    onJoystickStart(event) {
        this.joystick.isActive = true;
        this.joystick.knob.style.transition = 'none';
    }
    
    /**
     * ジョイスティック移動
     */
    onJoystickMove(event) {
        if (!this.joystick.isActive) return;
        
        const rect = this.joystick.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = event.clientX - centerX;
        const deltaY = event.clientY - centerY;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance <= this.joystick.maxDistance) {
            this.joystick.knobX = deltaX;
            this.joystick.knobY = deltaY;
        } else {
            const angle = Math.atan2(deltaY, deltaX);
            this.joystick.knobX = Math.cos(angle) * this.joystick.maxDistance;
            this.joystick.knobY = Math.sin(angle) * this.joystick.maxDistance;
        }
        
        this.updateJoystickKnob();
        this.updateMovement();
    }
    
    /**
     * ジョイスティック終了
     */
    onJoystickEnd() {
        this.joystick.isActive = false;
        this.joystick.knobX = 0;
        this.joystick.knobY = 0;
        this.joystick.knob.style.transition = 'all 0.2s ease';
        this.updateJoystickKnob();
        this.updateMovement();
    }
    
    /**
     * ジョイスティックノブを更新
     */
    updateJoystickKnob() {
        this.joystick.knob.style.transform = `translate(calc(-50% + ${this.joystick.knobX}px), calc(-50% + ${this.joystick.knobY}px))`;
    }
    
    /**
     * 移動状態を更新
     */
    updateMovement() {
        const normalizedX = this.joystick.knobX / this.joystick.maxDistance;
        const normalizedY = this.joystick.knobY / this.joystick.maxDistance;
        
        this.movement.forward = -normalizedY;
        this.movement.right = normalizedX;
        this.movement.up = 0;
    }
    
    /**
     * タッチコントロールを設定
     */
    setupTouchControls() {
        const canvas = document.getElementById('gameCanvas');
        
        // 視点変更用のタッチドラッグ
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                this.isDragging = true;
                this.lastMouseX = e.touches[0].clientX;
                this.lastMouseY = e.touches[0].clientY;
            }
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDragging && e.touches.length === 1) {
                const deltaX = e.touches[0].clientX - this.lastMouseX;
                const deltaY = e.touches[0].clientY - this.lastMouseY;
                
                if (player) {
                    player.rotate(deltaY, deltaX);
                }
                
                this.lastMouseX = e.touches[0].clientX;
                this.lastMouseY = e.touches[0].clientY;
            }
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isDragging = false;
        });
    }
    
    /**
     * キーボードコントロールを設定
     */
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.movement.forward = 1;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.movement.forward = -1;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.movement.right = -1;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.movement.right = 1;
                    break;
                case 'Space':
                    this.movement.up = 1;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.movement.up = -1;
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.movement.forward = 0;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.movement.forward = 0;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.movement.right = 0;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.movement.right = 0;
                    break;
                case 'Space':
                    this.movement.up = 0;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.movement.up = 0;
                    break;
            }
        });
    }
    
    /**
     * ポインターロックを設定
     */
    setupPointerLock() {
        const canvas = document.getElementById('gameCanvas');
        
        canvas.addEventListener('click', () => {
            if (!this.isPointerLocked) {
                canvas.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === canvas;
        });
        
        // マウス移動で視点変更
        document.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked) {
                const deltaX = e.movementX;
                const deltaY = e.movementY;
                
                if (player) {
                    player.rotate(deltaY, deltaX);
                }
            }
        });
    }
    
    /**
     * 移動を更新
     */
    update() {
        if (player) {
            player.move(
                this.movement.forward,
                this.movement.right,
                this.movement.up
            );
        }
    }
    
    /**
     * リサイズ時の処理
     */
    onResize() {
        this.updateJoystickCenter();
    }
    
    /**
     * コントロールをリセット
     */
    reset() {
        this.movement.forward = 0;
        this.movement.right = 0;
        this.movement.up = 0;
        
        this.joystick.isActive = false;
        this.joystick.knobX = 0;
        this.joystick.knobY = 0;
        this.updateJoystickKnob();
    }
}

// グローバルインスタンス
let controlSystem;



