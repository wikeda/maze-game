export class StageManager {
  constructor() {
    this.currentStage = 1;
    this.maxStage = 5;
    this.stageConfig = {
      1: { size: 8, name: 'Stage 1' },
      2: { size: 10, name: 'Stage 2' },
      3: { size: 12, name: 'Stage 3' },
      4: { size: 15, name: 'Stage 4' },
      5: { size: 20, name: 'Stage 5' },
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
