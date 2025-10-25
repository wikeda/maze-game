export class StageManager {
  constructor() {
    this.currentStage = 1;
    this.maxStage = 5;
    this.stageConfig = {
      1: { 
        size: 3, 
        name: 'Stage 1',
        skyColor: 0x252530,
        wallColor: '#FFFFFF',
        floorColor: '#FFFFFF'
      },
      2: { 
        size: 4, 
        name: 'Stage 2',
        skyColor: 0x2a2530,
        wallColor: '#5a4a4a',
        floorColor: '#3f2f35'
      },
      3: { 
        size: 5, 
        name: 'Stage 3',
        skyColor: 0x302520,
        wallColor: '#6a3a3a',
        floorColor: '#4f1f25'
      },
      4: { 
        size: 6, 
        name: 'Stage 4',
        skyColor: 0x252030,
        wallColor: '#4a3a5a',
        floorColor: '#2f1f3f'
      },
      5: { 
        size: 8, 
        name: 'Stage 5',
        skyColor: 0x1a1a15,
        wallColor: '#3a2a2a',
        floorColor: '#1f0f15'
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
