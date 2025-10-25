/**
 * UI制御システム
 */
class UISystem {
    constructor() {
        this.elements = {
            instructions: document.getElementById('instructions'),
            keyStatus: document.getElementById('keyStatus'),
            clearScreen: document.getElementById('clearScreen'),
            restartButton: document.getElementById('restartButton')
        };
        
        this.initialize();
    }
    
    /**
     * UIシステムを初期化
     */
    initialize() {
        this.setupEventListeners();
        this.showInstructions();
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // リスタートボタン
        this.elements.restartButton.addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    /**
     * 説明を表示
     */
    showInstructions() {
        this.elements.instructions.classList.remove('hidden');
        this.elements.keyStatus.classList.add('hidden');
        this.elements.clearScreen.classList.add('hidden');
    }
    
    /**
     * 鍵ステータスを更新
     */
    updateKeyStatus(hasKey) {
        if (hasKey) {
            this.elements.instructions.classList.add('hidden');
            this.elements.keyStatus.classList.remove('hidden');
        } else {
            this.elements.instructions.classList.remove('hidden');
            this.elements.keyStatus.classList.add('hidden');
        }
    }
    
    /**
     * クリア画面を表示
     */
    showClearScreen() {
        this.elements.clearScreen.classList.remove('hidden');
        
        // スコアを表示
        if (scoreSystem) {
            scoreSystem.showFinalScore();
        }
    }
    
    /**
     * ゲームをリスタート
     */
    restartGame() {
        this.elements.clearScreen.classList.add('hidden');
        this.showInstructions();
        
        // ゲームをリスタート
        if (window.restartGame) {
            window.restartGame();
        }
    }
    
    /**
     * ローディング表示
     */
    showLoading() {
        // ローディング画面を表示（必要に応じて実装）
        console.log('ゲームを読み込み中...');
    }
    
    /**
     * エラー表示
     */
    showError(message) {
        console.error('ゲームエラー:', message);
        alert('エラーが発生しました: ' + message);
    }
}

// グローバルインスタンス
let uiSystem;

// グローバル関数（他のファイルから呼び出し用）
window.updateKeyStatus = function(hasKey) {
    if (uiSystem) {
        uiSystem.updateKeyStatus(hasKey);
    }
};

window.showClearScreen = function() {
    if (uiSystem) {
        uiSystem.showClearScreen();
    }
};

window.restartGame = function() {
    if (window.game && window.game.restart) {
        window.game.restart();
    }
};



