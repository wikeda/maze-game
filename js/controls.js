export class VirtualJoystick {
  constructor(btnUp, btnDown, btnLeft, btnRight) {
    this.buttons = {
      up: btnUp,
      down: btnDown,
      left: btnLeft,
      right: btnRight,
    };
    
    this.input = {
      forward: 0,
      turn: 0,
    };

    this._bindEvents();
  }

  _bindEvents() {
    // 上下ボタン
    this.buttons.up.addEventListener('touchstart', (e) => this._onButtonPress('up', true, e));
    this.buttons.up.addEventListener('touchend', (e) => this._onButtonPress('up', false, e));
    this.buttons.up.addEventListener('touchcancel', (e) => this._onButtonPress('up', false, e));
    
    this.buttons.down.addEventListener('touchstart', (e) => this._onButtonPress('down', true, e));
    this.buttons.down.addEventListener('touchend', (e) => this._onButtonPress('down', false, e));
    this.buttons.down.addEventListener('touchcancel', (e) => this._onButtonPress('down', false, e));
    
    // 左右ボタン
    this.buttons.left.addEventListener('touchstart', (e) => this._onButtonPress('left', true, e));
    this.buttons.left.addEventListener('touchend', (e) => this._onButtonPress('left', false, e));
    this.buttons.left.addEventListener('touchcancel', (e) => this._onButtonPress('left', false, e));
    
    this.buttons.right.addEventListener('touchstart', (e) => this._onButtonPress('right', true, e));
    this.buttons.right.addEventListener('touchend', (e) => this._onButtonPress('right', false, e));
    this.buttons.right.addEventListener('touchcancel', (e) => this._onButtonPress('right', false, e));

    // マウスイベント（デスクトップ）
    this.buttons.up.addEventListener('mousedown', (e) => this._onButtonPress('up', true, e));
    this.buttons.up.addEventListener('mouseup', (e) => this._onButtonPress('up', false, e));
    this.buttons.up.addEventListener('mouseleave', (e) => this._onButtonPress('up', false, e));
    
    this.buttons.down.addEventListener('mousedown', (e) => this._onButtonPress('down', true, e));
    this.buttons.down.addEventListener('mouseup', (e) => this._onButtonPress('down', false, e));
    this.buttons.down.addEventListener('mouseleave', (e) => this._onButtonPress('down', false, e));
    
    this.buttons.left.addEventListener('mousedown', (e) => this._onButtonPress('left', true, e));
    this.buttons.left.addEventListener('mouseup', (e) => this._onButtonPress('left', false, e));
    this.buttons.left.addEventListener('mouseleave', (e) => this._onButtonPress('left', false, e));
    
    this.buttons.right.addEventListener('mousedown', (e) => this._onButtonPress('right', true, e));
    this.buttons.right.addEventListener('mouseup', (e) => this._onButtonPress('right', false, e));
    this.buttons.right.addEventListener('mouseleave', (e) => this._onButtonPress('right', false, e));

    // キーボード
    window.addEventListener('keydown', (event) => this._onKey(event, true));
    window.addEventListener('keyup', (event) => this._onKey(event, false));
  }

  _onButtonPress(button, pressed, event) {
    event.preventDefault();
    
    const btn = this.buttons[button];
    if (pressed) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    switch (button) {
      case 'up':
        this.input.forward = pressed ? 1 : 0;
        break;
      case 'down':
        this.input.forward = pressed ? -1 : (this.input.forward === 1 ? 1 : 0);
        break;
      case 'left':
        this.input.turn = pressed ? -1 : 0;
        break;
      case 'right':
        this.input.turn = pressed ? 1 : (this.input.turn === -1 ? -1 : 0);
        break;
    }
  }

  _onKey(event, pressed) {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.input.forward = pressed ? 1 : (this.input.forward === -1 ? -1 : 0);
        this.buttons.up.classList.toggle('active', pressed);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.input.forward = pressed ? -1 : (this.input.forward === 1 ? 1 : 0);
        this.buttons.down.classList.toggle('active', pressed);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.input.turn = pressed ? -1 : (this.input.turn === 1 ? 1 : 0);
        this.buttons.left.classList.toggle('active', pressed);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.input.turn = pressed ? 1 : (this.input.turn === -1 ? -1 : 0);
        this.buttons.right.classList.toggle('active', pressed);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  getInput() {
    return {
      forward: this.input.forward,
      turn: this.input.turn,
    };
  }
}
