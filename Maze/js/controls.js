const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export class VirtualJoystick {
  constructor(baseElement, thumbElement) {
    this.base = baseElement;
    this.thumb = thumbElement;
    this.active = false;
    this.pointerId = null;
    this.offset = { x: 0, y: 0 };
    this.radius = this.base.clientWidth * 0.5;
    this.normalized = { forward: 0, turn: 0 };
    this.keyboard = {
      forward: 0,
      turn: 0,
    };

    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener('resize', () => {
      this.radius = this.base.clientWidth * 0.5;
    });

    this.base.addEventListener('pointerdown', (event) => this._onPointerDown(event));
    window.addEventListener('pointermove', (event) => this._onPointerMove(event));
    window.addEventListener('pointerup', (event) => this._onPointerUp(event));
    window.addEventListener('pointercancel', (event) => this._onPointerUp(event));

    window.addEventListener('keydown', (event) => this._onKey(event, true));
    window.addEventListener('keyup', (event) => this._onKey(event, false));
  }

  _onPointerDown(event) {
    if (this.active) return;
    this.base.setPointerCapture(event.pointerId);
    this.active = true;
    this.pointerId = event.pointerId;
    this._updateOffset(event);
  }

  _onPointerMove(event) {
    if (!this.active || event.pointerId !== this.pointerId) return;
    this._updateOffset(event);
  }

  _onPointerUp(event) {
    if (!this.active || event.pointerId !== this.pointerId) return;
    this.base.releasePointerCapture(event.pointerId);
    this.active = false;
    this.pointerId = null;
    this.offset = { x: 0, y: 0 };
    this.normalized = { forward: 0, turn: 0 };
    this._updateThumb();
  }

  _updateOffset(event) {
    const rect = this.base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const distance = Math.hypot(dx, dy);
    const max = this.radius;

    if (distance > max) {
      const ratio = max / distance;
      this.offset.x = dx * ratio;
      this.offset.y = dy * ratio;
    } else {
      this.offset.x = dx;
      this.offset.y = dy;
    }

    const normalizedX = clamp(this.offset.x / max, -1, 1);
    const normalizedY = clamp(this.offset.y / max, -1, 1);
    this.normalized = {
      forward: -normalizedY,
      turn: normalizedX,
    };

    this._updateThumb();
  }

  _updateThumb() {
    this.thumb.style.transform = `translate(calc(-50% + ${this.offset.x}px), calc(-50% + ${this.offset.y}px))`;
  }

  _onKey(event, pressed) {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.keyboard.forward = pressed ? 1 : this.keyboard.forward === -1 ? -1 : 0;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.keyboard.forward = pressed ? -1 : this.keyboard.forward === 1 ? 1 : 0;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.keyboard.turn = pressed ? -1 : this.keyboard.turn === 1 ? 1 : 0;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.keyboard.turn = pressed ? 1 : this.keyboard.turn === -1 ? -1 : 0;
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  getInput() {
    const forward = this.normalized.forward || this.keyboard.forward;
    const turn = this.normalized.turn || this.keyboard.turn;
    return { forward, turn };
  }
}
