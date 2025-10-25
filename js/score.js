export class ScoreBoard {
  constructor(stepElement, timeElement) {
    this.stepElement = stepElement;
    this.timeElement = timeElement;
    this.steps = 0;
    this.startTime = performance.now();
    this.elapsed = 0;
    this.active = true;
    this._updateDisplay();
  }

  reset() {
    this.steps = 0;
    this.startTime = performance.now();
    this.elapsed = 0;
    this.active = true;
    this._updateDisplay();
  }

  incrementSteps() {
    if (!this.active) return;
    this.steps += 1;
    this._updateDisplay();
  }

  updateTime() {
    if (!this.active) return;
    this.elapsed = performance.now() - this.startTime;
    this._updateDisplay();
  }

  stop() {
    this.active = false;
  }

  _updateDisplay() {
    if (this.stepElement) {
      this.stepElement.textContent = `歩数: ${this.steps}`;
    }
    if (this.timeElement) {
      const totalSeconds = Math.floor(this.elapsed / 1000);
      const minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, '0');
      const seconds = (totalSeconds % 60).toString().padStart(2, '0');
      this.timeElement.textContent = `時間: ${minutes}:${seconds}`;
    }
  }
}
