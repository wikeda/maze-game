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

  showMessage(text, callback = null) {
    if (!this.messagePanel) return;
    this.messagePanel.textContent = text;
    this.messagePanel.style.display = 'block';
    
    // Remove previous event listener
    const prevOnclick = this.messagePanel.onclick;
    
    if (callback) {
      this.messagePanel.style.cursor = 'pointer';
      this.messagePanel.style.pointerEvents = 'auto';
      this.messagePanel.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.hideMessage();
        callback();
      };
    } else {
      this.messagePanel.style.cursor = 'default';
      this.messagePanel.style.pointerEvents = 'none';
      this.messagePanel.onclick = null;
    }
  }

  hideMessage() {
    if (!this.messagePanel) return;
    this.messagePanel.style.display = 'none';
    this.messagePanel.style.cursor = 'default';
    this.messagePanel.style.pointerEvents = 'none';
    this.messagePanel.onclick = null;
  }

  flashMessage(text, duration = 2000) {
    this.showMessage(text);
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeout = setTimeout(() => this.hideMessage(), duration);
  }
}
