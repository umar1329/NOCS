// ========================================================
// THEME, FONT SIZE, READING WIDTH & FULLSCREEN CONTROLS
// ========================================================

const ThemeManager = {
  init() {
    // 1. Theme (Dark / Light)
    const savedTheme = localStorage.getItem('cs_theme') || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.setTheme(savedTheme);

    // 2. Font Size Scale
    const savedFontSize = parseFloat(localStorage.getItem('cs_font_scale')) || 1.0;
    this.setFontScale(savedFontSize);

    // 3. Reading Width
    const savedWidth = localStorage.getItem('cs_reading_width') || 'normal';
    this.setReadingWidth(savedWidth);
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cs_theme', theme);
    const themeIcon = document.getElementById('themeToggleIcon');
    if (themeIcon) {
      if (theme === 'dark') {
        themeIcon.innerHTML = `<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>`;
      } else {
        themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
      }
    }
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    showToast(`Switched to ${next === 'dark' ? 'Dark Mode' : 'Light Mode'}`, 'info');
  },

  setFontScale(scale) {
    scale = Math.min(Math.max(scale, 0.85), 1.35);
    document.documentElement.style.setProperty('--font-scale', `${scale}rem`);
    localStorage.setItem('cs_font_scale', scale);
  },

  adjustFontSize(delta) {
    const current = parseFloat(localStorage.getItem('cs_font_scale')) || 1.0;
    const next = parseFloat((current + delta).toFixed(2));
    this.setFontScale(next);
    showToast(`Font Size: ${Math.round(next * 100)}%`, 'info');
  },

  resetFontSize() {
    this.setFontScale(1.0);
    showToast('Font Size Reset to 100%', 'info');
  },

  setReadingWidth(widthMode) {
    const widthMap = {
      'compact': '760px',
      'normal': '920px',
      'wide': '1240px'
    };
    const val = widthMap[widthMode] || '920px';
    document.documentElement.style.setProperty('--reading-width', val);
    localStorage.setItem('cs_reading_width', widthMode);
  },

  cycleReadingWidth() {
    const current = localStorage.getItem('cs_reading_width') || 'normal';
    const sequence = ['normal', 'wide', 'compact'];
    const nextIndex = (sequence.indexOf(current) + 1) % sequence.length;
    const next = sequence[nextIndex];
    this.setReadingWidth(next);
    showToast(`Reading Width: ${next.toUpperCase()}`, 'info');
  },

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        showToast('Fullscreen not permitted by browser', 'error');
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
};
