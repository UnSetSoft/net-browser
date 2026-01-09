export class DownloadsManager {
  static getDownloads() {
    const downloads = localStorage.getItem('downloads');
    return downloads ? JSON.parse(downloads) : [];
  }

  static addDownload(id, filename, path, url, totalBytes) {
    const downloads = this.getDownloads();
    const newDownload = {
      id,
      filename,
      path,
      url,
      totalBytes,
      receivedBytes: 0,
      state: 'progressing', // progressing, completed, cancelled, interrupted
      startTime: Date.now(),
      endTime: null
    };
    const updated = [newDownload, ...downloads].slice(0, 100); // Keep last 100
    localStorage.setItem('downloads', JSON.stringify(updated));
    return updated;
  }

  static updateDownload(id, receivedBytes, state = 'progressing', endTime = null) {
    const downloads = this.getDownloads();
    const updated = downloads.map(d => {
      if (d.id === id) {
        return { 
          ...d, 
          receivedBytes, 
          state, 
          endTime: state === 'completed' || state === 'cancelled' || state === 'interrupted' ? Date.now() : null 
        };
      }
      return d;
    });
    localStorage.setItem('downloads', JSON.stringify(updated));
    return updated;
  }

  static clearDownloads() {
    localStorage.removeItem('downloads');
    return [];
  }
}
