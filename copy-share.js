// ========================================================
// COPY & SHARE SYSTEM WITH CLIPBOARD API & FALLBACKS
// ========================================================

function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = `✓`;
  if (type === 'error') icon = `✕`;
  if (type === 'info') icon = `ℹ`;

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg, 'success');
    }).catch(err => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) {
      showToast(successMsg, 'success');
    } else {
      showToast('Failed to copy text', 'error');
    }
  } catch (err) {
    showToast('Failed to copy text: ' + err, 'error');
  }
}

// 1. Copy Topic
function copyTopicContent(topicId) {
  const topic = window.COURSE_DATA.topics.find(t => t.id === topicId);
  if (!topic) return;
  const fullText = `# ${topic.chapterTitle}\n## ${topic.fullTitle}\n\n${topic.markdown}`;
  copyToClipboard(fullText, 'Topic copied with all content!');
}

// 2. Copy Subtopic
function copySubtopicContent(anchorId) {
  const elem = document.getElementById(anchorId);
  if (!elem) return;
  const heading = elem.getAttribute('data-heading-text') || elem.innerText;
  
  // Find following sibling content until next heading
  let content = [];
  let curr = elem.nextElementSibling;
  while (curr && !curr.classList.contains('subtopic-heading')) {
    content.push(curr.innerText);
    curr = curr.nextElementSibling;
  }
  const text = `### ${heading}\n\n${content.join('\n\n')}`;
  copyToClipboard(text, 'Subtopic content copied!');
}

// 3. Copy Heading Only
function copyHeading(headingText) {
  copyToClipboard(headingText, 'Heading copied!');
}

// 4. Copy Chapter Structure
function copyChapterSummary(chapterId) {
  const chap = window.COURSE_DATA.chapters.find(c => c.id === chapterId);
  if (!chap) return;
  let text = `# Chapter ${chap.number}: ${chap.title}\n${chap.description}\n\nTopics:\n`;
  chap.topics.forEach((t, i) => {
    text += `${i + 1}. ${t.fullTitle} (${t.subtopicsCount} subtopics)\n`;
  });
  copyToClipboard(text, 'Chapter outline copied!');
}

// 5. Copy Code Snippet
function copyCodeSnippet(button) {
  const wrapper = button.closest('.code-block-wrapper');
  if (!wrapper) return;
  const code = wrapper.querySelector('code');
  if (code) {
    copyToClipboard(code.innerText, 'Code snippet copied!');
  }
}

// 6. Share Topic
function shareTopic(topicId, title) {
  const topic = window.COURSE_DATA.topics.find(t => t.id === topicId);
  const shareUrl = `${window.location.origin}${window.location.pathname}#/chapter/${topic.chapterNumber}/topic/${topic.id}`;
  
  if (navigator.share) {
    navigator.share({
      title: `${topic.fullTitle} | Class 11 Computer Science`,
      text: `Read "${topic.fullTitle}" from Class 11 Computer Science notes.`,
      url: shareUrl
    }).catch(err => {
      // User cancelled or share failed -> fallback
      copyToClipboard(shareUrl, 'Link copied to clipboard!');
    });
  } else {
    copyToClipboard(shareUrl, 'Permanent link copied to clipboard!');
  }
}

// 7. Share Subtopic Link
function shareSubtopicLink(anchorId, title) {
  const currentHash = window.location.hash.split('#')[1] || '';
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const shareUrl = `${baseUrl}#${currentHash.split('?')[0]}?subtopic=${anchorId}`;

  if (navigator.share) {
    navigator.share({
      title: `${title} | Class 11 Computer Science`,
      text: `Read section "${title}"`,
      url: shareUrl
    }).catch(() => {
      copyToClipboard(shareUrl, 'Direct subtopic link copied!');
    });
  } else {
    copyToClipboard(shareUrl, 'Direct subtopic link copied!');
  }
}

// 8. Print Topic / Download PDF
function printCurrentTopic() {
  window.print();
}
