export class BookmarksManager {
  static getBookmarks() {
    const bookmarks = localStorage.getItem('bookmarks');
    return bookmarks ? JSON.parse(bookmarks) : [];
  }

  static addBookmark(title, url, favicon) {
    const bookmarks = this.getBookmarks();
    if (bookmarks.some(b => b.url === url)) return bookmarks; // No duplicates
    const newBookmark = { id: Date.now(), title, url, favicon };
    const updated = [...bookmarks, newBookmark];
    localStorage.setItem('bookmarks', JSON.stringify(updated));
    return updated;
  }

  static removeBookmark(url) {
    const bookmarks = this.getBookmarks();
    const updated = bookmarks.filter(b => b.url !== url);
    localStorage.setItem('bookmarks', JSON.stringify(updated));
    return updated;
  }

  static isBookmarked(url) {
    const bookmarks = this.getBookmarks();
    return bookmarks.some(b => b.url === url);
  }
}
