// ========================================================
// WEBSITE-WIDE SEARCH SYSTEM WITH CHAPTER GROUPING
// ========================================================

const SearchManager = {
  isOpen: false,

  init() {
    const input = document.getElementById('searchModalInput');
    if (input) {
      input.addEventListener('input', (e) => this.handleSearchInput(e.target.value));
      input.addEventListener('keydown', (e) => this.handleKeyNav(e));
    }

    // Keyboard Shortcuts: Ctrl+K or '/' to open search, Escape to close
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openModal();
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        this.openModal();
      } else if (e.key === 'Escape' && this.isOpen) {
        this.closeModal();
      }
    });

    // Close on backdrop click
    const backdrop = document.getElementById('searchModal');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeModal();
      });
    }
  },

  openModal() {
    const modal = document.getElementById('searchModal');
    if (!modal) return;
    modal.classList.add('open');
    this.isOpen = true;
    const input = document.getElementById('searchModalInput');
    if (input) {
      input.focus();
      input.select();
    }
  },

  closeModal() {
    const modal = document.getElementById('searchModal');
    if (!modal) return;
    modal.classList.remove('open');
    this.isOpen = false;
  },

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '<mark class="highlight-match">$1</mark>');
  },

  handleSearchInput(query) {
    const container = document.getElementById('searchResultsContainer');
    if (!container) return;
    query = query.trim().toLowerCase();

    if (!query) {
      container.innerHTML = `
        <div class="search-empty-state">
          <p>Type keywords to search chapters, topics, subtopics, definitions, and formulas...</p>
        </div>`;
      return;
    }

    const index = window.COURSE_DATA.searchIndex || [];
    const matches = index.filter(item => {
      return item.title.toLowerCase().includes(query) ||
             (item.topicNumber && item.topicNumber.toLowerCase().includes(query)) ||
             (item.contentPreview && item.contentPreview.toLowerCase().includes(query));
    }).slice(0, 30); // Max 30 results

    if (matches.length === 0) {
      container.innerHTML = `
        <div class="search-empty-state">
          <p>No results found for "<strong>${query}</strong>". Try searching for "SDLC", "Agile", "Variables", "Sorting", "Cloud", or "Blockchain".</p>
        </div>`;
      return;
    }

    // Group matches by chapter
    const grouped = {};
    matches.forEach(m => {
      const chNum = m.chapterNumber || 'General';
      if (!grouped[chNum]) {
        grouped[chNum] = {
          chapterTitle: m.chapterTitle,
          items: []
        };
      }
      grouped[chNum].items.push(m);
    });

    let html = '';
    Object.keys(grouped).sort((a,b) => a - b).forEach(chNum => {
      const g = grouped[chNum];
      html += `<div class="search-chapter-group">`;
      html += `<div class="search-chapter-group-title">Chapter ${chNum}: ${g.chapterTitle}</div>`;
      g.items.forEach(item => {
        const highlightedTitle = this.highlightText(item.title, query);
        const highlightedPreview = this.highlightText(item.contentPreview || '', query);
        const anchorParam = item.anchor ? `?subtopic=${item.anchor}` : '';
        const targetUrl = `#/chapter/${item.chapterNumber}/topic/${item.id}${anchorParam}`;

        html += `
          <div class="search-result-item" onclick="SearchManager.selectResult('${targetUrl}')">
            <div class="search-result-title">
              <span style="font-family: var(--font-mono); font-size: 0.85em; color: var(--primary-blue); font-weight: 700; margin-right: 6px;">${item.topicNumber}</span>
              ${highlightedTitle}
            </div>
            <div class="search-result-snippet">${highlightedPreview}</div>
          </div>
        `;
      });
      html += `</div>`;
    });

    container.innerHTML = html;
  },

  selectResult(url) {
    this.closeModal();
    window.location.hash = url;
  },

  handleKeyNav(e) {
    const items = document.querySelectorAll('.search-result-item');
    if (!items.length) return;

    let highlighted = document.querySelector('.search-result-item.highlighted');
    let index = Array.from(items).indexOf(highlighted);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (index < items.length - 1) {
        if (highlighted) highlighted.classList.remove('highlighted');
        items[index + 1].classList.add('highlighted');
        items[index + 1].scrollIntoView({ block: 'nearest' });
      } else if (index === -1) {
        items[0].classList.add('highlighted');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index > 0) {
        if (highlighted) highlighted.classList.remove('highlighted');
        items[index - 1].classList.add('highlighted');
        items[index - 1].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlighted) {
        highlighted.click();
      } else if (items.length > 0) {
        items[0].click();
      }
    }
  }
};
