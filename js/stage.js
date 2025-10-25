export class StageManager {
  constructor() {
    this.currentStage = 1;
    this.maxStage = 5;
    this.stageConfig = {
      1: { 
        size: 3, 
        name: 'Stage 1',
        skyColor: 0x87ceeb,  // スカイブルー
        wallColor: '#B0D8E8',  // 明るい青系の壁
        floorColor: '#87CEEB'  // 空と同じスカイブルーの床
      },
      2: { 
        size: 4, 
        name: 'Stage 2',
        skyColor: 0x4ade80,  // エメラルドグリーン
        wallColor: '#7BDEA3',  // 明るい緑系の壁
        floorColor: '#4ADE80'  // 空と同じ緑の床
      },
      3: { 
        size: 5, 
        name: 'Stage 3',
        skyColor: 0xfb923c,  // オレンジ
        wallColor: '#FFB366',  // 明るいオレンジ系の壁
        floorColor: '#FB923C'  // 空と同じオレンジの床

      },
      4: { 
        size: 6, 
        name: 'Stage 4',
        skyColor: 0xff6b6b,  // サルモンレッド
        wallColor: '#FF8E8E',  // 明るい赤系の壁
        floorColor: '#FF6B6B'  // 空と同じ赤の床

      },
      5: { 
        size: 8, 
        name: 'Stage 5',
        skyColor: 0xa78bfa,  // パープル
        wallColor: '#C9B7FB',  // 明るい紫系の壁
        floorColor: '#A78BFA'  // 空と同じ紫の床
      },
    };
  }

  getStageConfig(stage) {
    return this.stageConfig[stage] || this.stageConfig[1];
  }

  getCurrentStageConfig() {
    return this.getStageConfig(this.currentStage);
  }

  nextStage() {
    if (this.currentStage < this.maxStage) {
      this.currentStage++;
      return true;
    }
    return false;
  }

  reset() {
    this.currentStage = 1;
  }

  isLastStage() {
    return this.currentStage >= this.maxStage;
  }
}
