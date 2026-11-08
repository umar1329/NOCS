// ========================================================
// BOOKMARKS & SAVED TOPICS SYSTEM
// ========================================================

const BookmarksManager = {
  KEY: 'cs_bookmarks',

  getBookmarks() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch {
      return [];
    }
  },

  isBookmarked(topicId) {
    return this.getBookmarks().includes(topicId);
  },

  toggleBookmark(topicId) {
    let list = this.getBookmarks();
    if (list.includes(topicId)) {
      list = list.filter(id => id !== topicId);
      localStorage.setItem(this.KEY, JSON.stringify(list));
      showToast('Removed from Bookmarks', 'info');
      this.updateBookmarkButtonState(topicId, false);
    } else {
      list.push(topicId);
      localStorage.setItem(this.KEY, JSON.stringify(list));
      showToast('Saved to Bookmarks!', 'success');
      this.updateBookmarkButtonState(topicId, true);
    }
    this.updateHeaderBadge();
  },

  updateBookmarkButtonState(topicId, isSaved) {
    const btn = document.getElementById('btnBookmarkTopic');
    if (btn) {
      if (isSaved) {
        btn.classList.add('active');
        btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> <span>Saved</span>`;
      } else {
        btn.classList.remove('active');
        btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> <span>Bookmark</span>`;
      }
    }
  },

  updateHeaderBadge() {
    const badge = document.getElementById('headerSavedCount');
    if (badge) {
      const count = this.getBookmarks().length;
      badge.innerText = count > 0 ? count : '';
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }
};
