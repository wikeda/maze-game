export class UIManager {
  constructor() {
    this.loading = document.getElementById('loading');
    this.messagePanel = document.getElementById('message-panel');
  }

  hideLoading() {
    if (this.loading) {
      this.loading.style.display = 'none';
    }
  }

  showMessage(text) {
    if (!this.messagePanel) return;
    this.messagePanel.textContent = text;
    this.messagePanel.style.display = 'block';
  }

  hideMessage() {
    if (!this.messagePanel) return;
    this.messagePanel.style.display = 'none';
  }

  flashMessage(text, duration = 2000) {
    this.showMessage(text);
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeout = setTimeout(() => this.hideMessage(), duration);
  }
}
