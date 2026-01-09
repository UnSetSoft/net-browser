export class HistoryManager {
  static getHistory() {
    const history = localStorage.getItem('history');
    return history ? JSON.parse(history) : [];
  }

  static addEntry(title, url, favicon) {
    if (!url || url.startsWith('browser://')) return; // Don't track internal pages

    const history = this.getHistory();
    // Remove if duplicate exists at the top (latest) to avoid spam
    if (history.length > 0 && history[0].url === url) {
      return history;
    }

    const newEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: title || url,
      url,
      favicon,
      timestamp: new Date().toISOString()
    };

    // Keep only last 1000 entries
    const updated = [newEntry, ...history].slice(0, 1000);
    localStorage.setItem('history', JSON.stringify(updated));
    return updated;
  }

  static deleteEntry(id) {
    const history = this.getHistory();
    // Ensure both IDs are compared as strings to avoid type mismatches (number vs string)
    const updated = history.filter(item => String(item.id) !== String(id));
    localStorage.setItem('history', JSON.stringify(updated));
    return updated;
  }

  static clearHistory() {
    localStorage.removeItem('history');
    return [];
  }
}
