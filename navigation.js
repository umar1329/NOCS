// ========================================================
// SIDEBAR & DRAWER NAVIGATION
// ========================================================

const NavigationManager = {
  activeChapterId: null,
  activeTopicId: null,

  renderSidebar() {
    const listContainer = document.getElementById('sidebarNavList');
    if (!listContainer) return;

    const chapters = window.COURSE_DATA.chapters || [];
    let html = '';

    chapters.forEach(chap => {
      html += `
        <li class="sidebar-chapter-item" id="sidebar-chap-${chap.id}">
          <button class="sidebar-chapter-btn" onclick="NavigationManager.toggleChapterExpand('${chap.id}')">
            <span class="chapter-btn-title">
              <span class="chap-num-tag">Ch ${chap.number}</span>
              <span>${chap.title}</span>
            </span>
            <svg class="sidebar-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <ul class="sidebar-topics-sublist" id="sidebar-sublist-${chap.id}">
      `;

      chap.topics.forEach(t => {
        html += `
          <li>
            <a href="#/chapter/${chap.number}/topic/${t.id}" class="sidebar-topic-link" id="sidebar-link-${t.id}">
              <span><span style="font-family: var(--font-mono); font-size: 0.85em; opacity: 0.8; margin-right: 4px;">${t.topicNumber}</span> ${t.title}</span>
              <span class="topic-check-status"></span>
            </a>
          </li>
        `;
      });

      html += `
          </ul>
        </li>
      `;
    });

    listContainer.innerHTML = html;
    this.updateSidebarIndicators();
  },

  toggleChapterExpand(chapId) {
    const item = document.getElementById(`sidebar-chap-${chapId}`);
    if (item) {
      item.classList.toggle('expanded');
    }
  },

  setActive(chapId, topicId) {
    this.activeChapterId = chapId;
    this.activeTopicId = topicId;

    // Clear previous actives
    document.querySelectorAll('.sidebar-chapter-btn').forEach(btn => btn.classList.remove('active-chapter'));
    document.querySelectorAll('.sidebar-topic-link').forEach(link => link.classList.remove('active-topic'));

    if (chapId) {
      const chapItem = document.getElementById(`sidebar-chap-${chapId}`);
      if (chapItem) {
        chapItem.classList.add('expanded');
        const btn = chapItem.querySelector('.sidebar-chapter-btn');
        if (btn) btn.classList.add('active-chapter');
      }
    }

    if (topicId) {
      const link = document.getElementById(`sidebar-link-${topicId}`);
      if (link) {
        link.classList.add('active-topic');
        link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  },

  updateSidebarIndicators() {
    const completed = ProgressManager.getCompleted();
    document.querySelectorAll('.sidebar-topic-link').forEach(link => {
      const id = link.id.replace('sidebar-link-', '');
      if (completed.includes(id)) {
        link.classList.add('completed');
      } else {
        link.classList.remove('completed');
      }
    });
  },

  // Mobile Drawer
  toggleMobileMenu() {
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
      const isOpen = sidebar.classList.contains('open');
      if (isOpen) {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
      } else {
        sidebar.classList.add('open');
        overlay.classList.add('open');
      }
    }
  },

  closeMobileMenu() {
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    }
  }
};
