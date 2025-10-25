/**
 * スコア管理システム
 */
class ScoreSystem {
    constructor() {
        this.startTime = null;
        this.stepCount = 0;
        this.isRunning = false;
        
        // DOM要素
        this.stepCountElement = document.getElementById('stepCount');
        this.timeDisplayElement = document.getElementById('timeDisplay');
        this.finalStepsElement = document.getElementById('finalSteps');
        this.finalTimeElement = document.getElementById('finalTime');
        
        // 初期化
        this.reset();
    }
    
    /**
     * スコアシステムを開始
     */
    start() {
        if (!this.isRunning) {
            this.startTime = Date.now();
            this.isRunning = true;
            this.updateTimeDisplay();
        }
    }
    
    /**
     * スコアシステムを停止
     */
    stop() {
        this.isRunning = false;
    }
    
    /**
     * スコアシステムをリセット
     */
    reset() {
        this.startTime = null;
        this.stepCount = 0;
        this.isRunning = false;
        this.updateDisplay();
    }
    
    /**
     * 歩数を増加
     */
    incrementStep() {
        this.stepCount++;
        this.updateStepDisplay();
    }
    
    /**
     * 現在の経過時間を取得（ミリ秒）
     */
    getElapsedTime() {
        if (!this.startTime) return 0;
        return Date.now() - this.startTime;
    }
    
    /**
     * 時間表示を更新
     */
    updateTimeDisplay() {
        if (!this.isRunning) return;
        
        const elapsed = this.getElapsedTime();
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timeDisplayElement.textContent = timeString;
        
        // 次のフレームで再実行
        requestAnimationFrame(() => this.updateTimeDisplay());
    }
    
    /**
     * 歩数表示を更新
     */
    updateStepDisplay() {
        this.stepCountElement.textContent = this.stepCount;
    }
    
    /**
     * 全ての表示を更新
     */
    updateDisplay() {
        this.updateStepDisplay();
        this.updateTimeDisplay();
    }
    
    /**
     * 最終スコアを表示
     */
    showFinalScore() {
        this.stop();
        
        const elapsed = this.getElapsedTime();
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.finalStepsElement.textContent = this.stepCount;
        this.finalTimeElement.textContent = timeString;
    }
    
    /**
     * スコアデータを取得
     */
    getScoreData() {
        return {
            steps: this.stepCount,
            time: this.getElapsedTime(),
            timeString: this.getTimeString()
        };
    }
    
    /**
     * 時間を文字列として取得
     */
    getTimeString() {
        const elapsed = this.getElapsedTime();
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// グローバルインスタンス
let scoreSystem;



