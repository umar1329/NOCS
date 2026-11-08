// ========================================================
// READING PROGRESS TRACKER & RECENTLY VIEWED
// ========================================================

const ProgressManager = {
  KEY_COMPLETED: 'cs_completed_topics',
  KEY_RECENT: 'cs_recent_topics',

  getCompleted() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_COMPLETED)) || [];
    } catch {
      return [];
    }
  },

  isCompleted(topicId) {
    return this.getCompleted().includes(topicId);
  },

  toggleComplete(topicId) {
    let list = this.getCompleted();
    const isNow = !list.includes(topicId);
    if (isNow) {
      list.push(topicId);
      showToast('Marked as Completed! Great job!', 'success');
    } else {
      list = list.filter(id => id !== topicId);
      showToast('Marked as Incomplete', 'info');
    }
    localStorage.setItem(this.KEY_COMPLETED, JSON.stringify(list));
    this.updateCompletionButtonState(topicId, isNow);
    this.updateAllProgressUI();
    NavigationManager.updateSidebarIndicators();
  },

  updateCompletionButtonState(topicId, isCompleted) {
    const btn = document.getElementById('btnCompleteTopic');
    if (btn) {
      if (isCompleted) {
        btn.classList.add('completed-active');
        btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>Completed</span>`;
      } else {
        btn.classList.remove('completed-active');
        btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg> <span>Mark as Complete</span>`;
      }
    }
  },

  getOverallProgress() {
    const totalTopics = window.COURSE_DATA.topics.length;
    if (!totalTopics) return 0;
    const completed = this.getCompleted().length;
    return Math.round((completed / totalTopics) * 100);
  },

  getChapterProgress(chapterId) {
    const chap = window.COURSE_DATA.chapters.find(c => c.id === chapterId);
    if (!chap || !chap.topics.length) return 0;
    const completedList = this.getCompleted();
    const count = chap.topics.filter(t => completedList.includes(t.id)).length;
    return Math.round((count / chap.topics.length) * 100);
  },

  updateAllProgressUI() {
    const overall = this.getOverallProgress();
    const bar = document.getElementById('sidebarProgressBarFill');
    const badge = document.getElementById('sidebarProgressPercent');
    if (bar) bar.style.width = `${overall}%`;
    if (badge) badge.innerText = `${overall}%`;

    const homeBar = document.getElementById('homeProgressBarFill');
    const homeVal = document.getElementById('homeProgressPercent');
    if (homeBar) homeBar.style.width = `${overall}%`;
    if (homeVal) homeVal.innerText = `${overall}%`;
  },

  // Recently Viewed Topics (Max 6)
  recordVisit(topicId) {
    try {
      let recents = JSON.parse(localStorage.getItem(this.KEY_RECENT)) || [];
      recents = recents.filter(id => id !== topicId);
      recents.unshift(topicId);
      if (recents.length > 6) recents.pop();
      localStorage.setItem(this.KEY_RECENT, JSON.stringify(recents));
    } catch {}
  },

  getRecentTopics() {
    try {
      const ids = JSON.parse(localStorage.getItem(this.KEY_RECENT)) || [];
      return ids.map(id => window.COURSE_DATA.topics.find(t => t.id === id)).filter(Boolean);
    } catch {
      return [];
    }
  }
};
