// ========================================================
// CORE APPLICATION ROUTER & PAGE RENDERER
// ========================================================

const App = {
  init() {
    ThemeManager.init();
    BookmarksManager.updateHeaderBadge();
    ProgressManager.updateAllProgressUI();
    SearchManager.init();
    NavigationManager.renderSidebar();

    // Setup Hash Routing
    window.addEventListener('hashchange', () => this.handleRoute());
    
    // Scroll progress bar & Back to Top listener
    window.addEventListener('scroll', () => this.handleScroll());

    const backToTop = document.getElementById('backToTopBtn');
    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Initial Route
    this.handleRoute();
  },

  handleScroll() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    
    const bar = document.getElementById('scrollProgressBar');
    if (bar) bar.style.width = scrolled + '%';

    const backBtn = document.getElementById('backToTopBtn');
    if (backBtn) {
      if (winScroll > 300) {
        backBtn.classList.add('visible');
      } else {
        backBtn.classList.remove('visible');
      }
    }
  },

  handleRoute() {
    NavigationManager.closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'instant' });

    let hash = window.location.hash.slice(1);
    if (!hash || hash === '/') {
      this.renderHome();
      return;
    }

    // Handle query params in hash e.g. #/chapter/1/topic/ch1-t2?subtopic=ch1-t2-sec-1
    let subtopicAnchor = null;
    if (hash.includes('?')) {
      const parts = hash.split('?');
      hash = parts[0];
      const params = new URLSearchParams(parts[1]);
      subtopicAnchor = params.get('subtopic');
    }

    const segments = hash.split('/').filter(Boolean);

    // Route: #/saved
    if (segments[0] === 'saved') {
      this.renderSavedPage();
      return;
    }

    // Route: #/chapter/:chapNum
    if (segments[0] === 'chapter' && segments.length === 2) {
      const chapNum = parseInt(segments[1]);
      this.renderChapterPage(chapNum);
      return;
    }

    // Route: #/chapter/:chapNum/topic/:topicId
    if (segments[0] === 'chapter' && segments[2] === 'topic') {
      const chapNum = parseInt(segments[1]);
      const topicId = segments[3];
      this.renderTopicPage(chapNum, topicId, subtopicAnchor);
      return;
    }

    // Fallback -> Home
    this.renderHome();
  },

  // 1. Render Homepage Dashboard
  renderHome() {
    NavigationManager.setActive(null, null);
    const main = document.getElementById('mainContentInner');
    const stats = window.COURSE_DATA.stats;
    const chapters = window.COURSE_DATA.chapters;
    const recentTopics = ProgressManager.getRecentTopics();

    // Continue reading topic (first incomplete or first recent)
    let continueTopic = null;
    if (recentTopics.length > 0) {
      continueTopic = recentTopics[0];
    } else {
      const completed = ProgressManager.getCompleted();
      continueTopic = window.COURSE_DATA.topics.find(t => !completed.includes(t.id)) || window.COURSE_DATA.topics[0];
    }

    let recentsHtml = '';
    if (recentTopics.length > 0) {
      recentsHtml = recentTopics.map(t => `
        <a href="#/chapter/${t.chapterNumber}/topic/${t.id}" class="recent-item-link">
          <span><strong style="color: var(--primary-blue); font-family: var(--font-mono);">${t.topicNumber}</strong> ${t.title}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${t.readingTime} min</span>
        </a>
      `).join('');
    } else {
      recentsHtml = `<p class="activity-empty">No recently read topics yet. Start exploring below!</p>`;
    }

    let chaptersGridHtml = chapters.map(c => `
      <div class="chapter-card">
        <div class="chapter-card-header">
          <span class="chapter-number-pill">Chapter ${c.number}</span>
          <span class="chapter-topics-badge">${c.topicsCount} Topics</span>
        </div>
        <h3 class="chapter-card-title">${c.title}</h3>
        <p class="chapter-card-desc">${c.description}</p>
        <div class="chapter-card-footer">
          <span style="font-size: 0.78rem; color: var(--text-muted);">${c.subtopicsCount} Subtopics</span>
          <a href="#/chapter/${c.number}" class="chapter-card-link">
            Explore Chapter &rarr;
          </a>
        </div>
      </div>
    `).join('');

    main.innerHTML = `
      <!-- Hero Banner -->
      <section class="dashboard-hero">
        <span class="hero-tag">Punjab Board &middot; Class 11 Computer Science</span>
        <h2 class="hero-title">Master Computer Science with Structured Chapter Notes</h2>
        <p class="hero-subtitle">Comprehensive textbook notes, solved exercise questions, Python code examples, UML diagrams, and high-yield board examination preparation.</p>
        <div class="hero-actions">
          <a href="#/chapter/${continueTopic.chapterNumber}/topic/${continueTopic.id}" class="btn-hero-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>Continue Reading: ${continueTopic.topicNumber} ${continueTopic.title}</span>
          </a>
          <button class="btn-hero-secondary" onclick="SearchManager.openModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span>Search Syllabus</span>
          </button>
        </div>
      </section>

      <!-- Stats Grid -->
      <section class="dashboard-stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
          <div class="stat-info">
            <div class="stat-number">${stats.totalChapters}</div>
            <div class="stat-label">Total Chapters</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
          </div>
          <div class="stat-info">
            <div class="stat-number">${stats.totalTopics}</div>
            <div class="stat-label">Dedicated Topics</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div class="stat-info">
            <div class="stat-number">${stats.totalSubtopics}</div>
            <div class="stat-label">Structured Subtopics</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          </div>
          <div class="stat-info">
            <div class="stat-number" id="homeProgressPercent">${ProgressManager.getOverallProgress()}%</div>
            <div class="stat-label">Course Progress</div>
          </div>
        </div>
      </section>

      <!-- Activity Section -->
      <section class="recent-activity-section">
        <div class="activity-card">
          <div class="activity-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            <span>Recently Viewed Topics</span>
          </div>
          <div class="recent-list">
            ${recentsHtml}
          </div>
        </div>

        <div class="activity-card">
          <div class="activity-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span>Overall Learning Progress</span>
          </div>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            You have completed <strong>${ProgressManager.getCompleted().length}</strong> of <strong>${stats.totalTopics}</strong> topics across all 9 chapters.
          </p>
          <div class="sidebar-progress-bar-wrap" style="height: 10px; background: var(--border-color); border-radius: 6px;">
            <div id="homeProgressBarFill" class="sidebar-progress-bar-fill" style="width: ${ProgressManager.getOverallProgress()}%; background: var(--primary-blue);"></div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 1rem; font-size: 0.82rem;">
            <a href="#/saved" style="color: var(--primary-blue); font-weight: 600;">View Bookmarked Topics &rarr;</a>
          </div>
        </div>
      </section>

      <!-- Chapter Listing Grid -->
      <section class="chapters-section">
        <div class="section-heading-row">
          <div>
            <h3 class="section-heading">Curriculum Chapters</h3>
            <span class="section-subtitle">Select any chapter to view its complete topic breakdown and exam notes</span>
          </div>
        </div>
        <div class="chapters-grid">
          ${chaptersGridHtml}
        </div>
      </section>
    `;
  },

  // 2. Render Dedicated Chapter Page
  renderChapterPage(chapNum) {
    const chap = window.COURSE_DATA.chapters.find(c => c.number === chapNum);
    if (!chap) {
      this.renderHome();
      return;
    }

    NavigationManager.setActive(chap.id, null);
    const main = document.getElementById('mainContentInner');
    const completedList = ProgressManager.getCompleted();
    const chapProgress = ProgressManager.getChapterProgress(chap.id);

    // Prev / Next Chapter navigation
    const prevChap = chapNum > 1 ? chapNum - 1 : null;
    const nextChap = chapNum < 9 ? chapNum + 1 : null;

    let topicsRowsHtml = chap.topics.map(t => {
      const isDone = completedList.includes(t.id);
      return `
        <a href="#/chapter/${chap.number}/topic/${t.id}" class="topic-row-item">
          <div class="topic-row-left">
            <span class="topic-row-num">${t.topicNumber}</span>
            <div>
              <span class="topic-row-title">${t.title}</span>
              <span class="topic-row-subcount">(${t.subtopicsCount} subtopics &middot; ${t.readingTime} min read)</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            ${isDone ? '<span style="font-size: 0.78rem; font-weight: 700; color: var(--success-color); background: var(--success-soft); padding: 3px 8px; border-radius: 4px;">✓ Completed</span>' : '<span style="font-size: 0.78rem; color: var(--text-muted);">Incomplete</span>'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-light);"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </a>
      `;
    }).join('');

    main.innerHTML = `
      <!-- Breadcrumbs -->
      <nav class="breadcrumb-nav">
        <span class="breadcrumb-item"><a href="#/">Home</a></span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item breadcrumb-current">Chapter ${chap.number}</span>
      </nav>

      <!-- Chapter Header Card -->
      <header class="chapter-view-header">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
          <span class="topic-badge-chapter">Chapter ${chap.number}</span>
          <div style="display: flex; gap: 0.5rem;" class="no-print">
            <button class="btn-toolbar" onclick="copyChapterSummary('${chap.id}')" title="Copy Chapter Outline">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy Outline</span>
            </button>
            <button class="btn-toolbar" onclick="printCurrentTopic()" title="Print Chapter">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              <span>Print Chapter</span>
            </button>
          </div>
        </div>

        <h2 class="chapter-view-title">${chap.title}</h2>
        <p class="chapter-view-desc">${chap.description}</p>

        <div class="chapter-stats-banner">
          <div class="chapter-stat-item">
            <span class="chapter-stat-val">${chap.topicsCount}</span>
            <span class="chapter-stat-lbl">Topics</span>
          </div>
          <div class="chapter-stat-item">
            <span class="chapter-stat-val">${chap.subtopicsCount}</span>
            <span class="chapter-stat-lbl">Subtopics</span>
          </div>
          <div class="chapter-stat-item">
            <span class="chapter-stat-val">${chapProgress}%</span>
            <span class="chapter-stat-lbl">Completed</span>
          </div>
        </div>
      </header>

      <!-- Topics List Table -->
      <section class="topics-table-list">
        ${topicsRowsHtml}
      </section>

      <!-- Chapter Pagination -->
      <nav class="topic-pagination-card no-print">
        ${prevChap ? `
          <a href="#/chapter/${prevChap}" class="pagination-btn">
            <span class="pagination-label">&larr; Previous Chapter</span>
            <span class="pagination-title">Chapter ${prevChap}</span>
          </a>
        ` : '<div></div>'}
        ${nextChap ? `
          <a href="#/chapter/${nextChap}" class="pagination-btn next">
            <span class="pagination-label">Next Chapter &rarr;</span>
            <span class="pagination-title">Chapter ${nextChap}</span>
          </a>
        ` : '<div></div>'}
      </nav>
    `;
  },

  // 3. Render Dedicated Topic Page
  renderTopicPage(chapNum, topicId, subtopicAnchor) {
    const topic = window.COURSE_DATA.topics.find(t => t.id === topicId);
    if (!topic) {
      this.renderChapterPage(chapNum);
      return;
    }

    ProgressManager.recordVisit(topic.id);
    NavigationManager.setActive(topic.chapterId, topic.id);

    const main = document.getElementById('mainContentInner');
    const isBookmarked = BookmarksManager.isBookmarked(topic.id);
    const isCompleted = ProgressManager.isCompleted(topic.id);

    // Find Previous and Next Topics in complete syllabus
    const allTopics = window.COURSE_DATA.topics;
    const currentIndex = allTopics.findIndex(t => t.id === topic.id);
    const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
    const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

    // Table of contents items
    let tocHtml = '';
    if (topic.subtopics && topic.subtopics.length > 0) {
      const tocItems = topic.subtopics.map(sub => `
        <li class="toc-item">
          <a href="#/chapter/${chapNum}/topic/${topic.id}?subtopic=${sub.id}">
            <span class="toc-num">${sub.number}</span>
            <span>${sub.title}</span>
          </a>
        </li>
      `).join('');

      tocHtml = `
        <div class="toc-card no-print">
          <div class="toc-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            <span>Table of Contents (${topic.subtopics.length} Sections)</span>
          </div>
          <ul class="toc-list">
            ${tocItems}
          </ul>
        </div>
      `;
    }

    main.innerHTML = `
      <div class="print-watermark">
        <strong>Class 11 Computer Science (Punjab Board / PECTAA Edition)</strong> &mdash; Chapter ${topic.chapterNumber}: ${topic.chapterTitle}
      </div>

      <!-- Breadcrumbs -->
      <nav class="breadcrumb-nav no-print">
        <span class="breadcrumb-item"><a href="#/">Home</a></span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item"><a href="#/chapter/${chapNum}">Chapter ${chapNum}</a></span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item breadcrumb-current">${topic.title}</span>
      </nav>

      <!-- Topic Header Card -->
      <header class="topic-header-card">
        <div class="topic-meta-row">
          <div class="topic-badges">
            <span class="topic-badge-chapter">Chapter ${topic.chapterNumber}</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--accent-teal); font-family: var(--font-mono);">${topic.topicNumber}</span>
          </div>
          <div class="topic-reading-time">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            <span>${topic.readingTime} min read &middot; ${topic.wordCount} words</span>
          </div>
        </div>

        <h1 class="topic-main-title">${topic.fullTitle}</h1>

        <!-- Reading & Action Controls Toolbar -->
        <div class="topic-action-toolbar no-print">
          <div class="toolbar-group">
            <button class="btn-toolbar" onclick="copyTopicContent('${topic.id}')" title="Copy full topic and content">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy Topic</span>
            </button>
            <button class="btn-toolbar" onclick="shareTopic('${topic.id}', '${topic.title}')" title="Share topic link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              <span>Share</span>
            </button>
            <button id="btnBookmarkTopic" class="btn-toolbar ${isBookmarked ? 'active' : ''}" onclick="BookmarksManager.toggleBookmark('${topic.id}')" title="Bookmark topic">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              <span>${isBookmarked ? 'Saved' : 'Bookmark'}</span>
            </button>
            <button id="btnCompleteTopic" class="btn-toolbar ${isCompleted ? 'completed-active' : ''}" onclick="ProgressManager.toggleComplete('${topic.id}')" title="Mark as Completed">
              ${isCompleted ? 
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>Completed</span>' : 
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg> <span>Mark as Complete</span>'
              }
            </button>
          </div>

          <div class="toolbar-group">
            <button class="btn-toolbar" onclick="ThemeManager.adjustFontSize(-0.08)" title="Decrease font size">A-</button>
            <button class="btn-toolbar" onclick="ThemeManager.resetFontSize()" title="Reset font size">A</button>
            <button class="btn-toolbar" onclick="ThemeManager.adjustFontSize(0.08)" title="Increase font size">A+</button>
            <button class="btn-toolbar" onclick="ThemeManager.cycleReadingWidth()" title="Change reading layout width">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
              <span>Width</span>
            </button>
            <button class="btn-toolbar" onclick="ThemeManager.toggleFullscreen()" title="Toggle Fullscreen reading mode">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            </button>
            <button class="btn-toolbar" onclick="printCurrentTopic()" title="Print Topic / Download as PDF">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              <span>PDF / Print</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Table of Contents -->
      ${tocHtml}

      <!-- Main Topic Content Article -->
      <article class="topic-content-body">
        ${topic.html}
      </article>

      <!-- Back to Chapter Button -->
      <div style="margin-bottom: 1.5rem; text-align: center;" class="no-print">
        <a href="#/chapter/${chapNum}" class="btn-toolbar" style="display: inline-flex; padding: 0.6rem 1.25rem; font-weight: 600;">
          &uarr; Back to Chapter ${chapNum} Overview
        </a>
      </div>

      <!-- Previous & Next Navigation Buttons -->
      <nav class="topic-pagination-card no-print">
        ${prevTopic ? `
          <a href="#/chapter/${prevTopic.chapterNumber}/topic/${prevTopic.id}" class="pagination-btn">
            <span class="pagination-label">&larr; Previous Topic</span>
            <span class="pagination-title">${prevTopic.topicNumber} ${prevTopic.title}</span>
          </a>
        ` : '<div></div>'}
        ${nextTopic ? `
          <a href="#/chapter/${nextTopic.chapterNumber}/topic/${nextTopic.id}" class="pagination-btn next">
            <span class="pagination-label">Next Topic &rarr;</span>
            <span class="pagination-title">${nextTopic.topicNumber} ${nextTopic.title}</span>
          </a>
        ` : '<div></div>'}
      </nav>
    `;

    // Handle scroll to subtopic anchor if requested
    if (subtopicAnchor) {
      setTimeout(() => {
        const el = document.getElementById(subtopicAnchor);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
          setTimeout(() => {
            el.style.transition = 'background-color 1s ease';
            el.style.backgroundColor = 'transparent';
          }, 1500);
        }
      }, 100);
    }
  },

  // 4. Render Saved Topics / Bookmarks Page
  renderSavedPage() {
    NavigationManager.setActive(null, null);
    const main = document.getElementById('mainContentInner');
    const bookmarks = BookmarksManager.getBookmarks();
    const savedTopics = bookmarks.map(id => window.COURSE_DATA.topics.find(t => t.id === id)).filter(Boolean);

    let listHtml = '';
    if (savedTopics.length > 0) {
      listHtml = savedTopics.map(t => `
        <div class="saved-topic-card">
          <div>
            <div style="font-size: 0.75rem; color: var(--accent-teal); font-weight: 700; text-transform: uppercase;">
              Chapter ${t.chapterNumber}: ${t.chapterTitle}
            </div>
            <a href="#/chapter/${t.chapterNumber}/topic/${t.id}" style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); display: block; margin-top: 4px;">
              ${t.topicNumber} ${t.title}
            </a>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
              ${t.subtopics.length} subtopics &middot; ${t.readingTime} min read
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <a href="#/chapter/${t.chapterNumber}/topic/${t.id}" class="btn-toolbar" style="color: var(--primary-blue);">Read Now</a>
            <button class="btn-remove-bookmark" onclick="BookmarksManager.toggleBookmark('${t.id}'); App.renderSavedPage();" title="Remove bookmark">
              Remove
            </button>
          </div>
        </div>
      `).join('');
    } else {
      listHtml = `
        <div class="search-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-light); margin-bottom: 1rem;"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">No Bookmarked Topics Yet</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.25rem;">Click the "Bookmark" button on any topic to save it here for fast revision.</p>
          <a href="#/" class="btn-hero-primary" style="display: inline-flex;">Explore Chapters</a>
        </div>
      `;
    }

    main.innerHTML = `
      <nav class="breadcrumb-nav">
        <span class="breadcrumb-item"><a href="#/">Home</a></span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item breadcrumb-current">Saved Bookmarks</span>
      </nav>

      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.85rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem;">Bookmarked Topics</h2>
        <p style="color: var(--text-muted);">Quick access to all your saved topics for board exam preparation.</p>
      </div>

      <div class="saved-topics-list">
        ${listHtml}
      </div>
    `;
  }
};

// Auto-run when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
