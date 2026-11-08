import json
import re
import os
import html

# Load the raw shared conversation
with open('share_data.json', 'r', encoding='utf-8') as f:
    raw_data = json.load(f)

messages = raw_data['data']['biz_data']['messages']
chapter_msgs = [3, 5, 7, 9, 11, 13, 15, 17, 19]

chapter_meta = [
    {
        "id": "ch1",
        "number": 1,
        "title": "Introduction to Software Development",
        "desc": "Foundations of software engineering, SDLC models (Waterfall, Agile), project planning & management, UML diagrams, design patterns, testing, debugging, and development tools."
    },
    {
        "id": "ch2",
        "number": 2,
        "title": "Python Programming",
        "desc": "Comprehensive Python programming from fundamentals to OOP, control structures, functions, modules, data structures (lists, tuples, dicts), exception handling, and debugging."
    },
    {
        "id": "ch3",
        "number": 3,
        "title": "Algorithms and Problem Solving",
        "desc": "Computational problem solving, algorithm design paradigms (Divide & Conquer, Greedy, Dynamic Programming, Backtracking), Big O complexity analysis, sorting, searching, and graph algorithms."
    },
    {
        "id": "ch4",
        "number": 4,
        "title": "Computational Structures",
        "desc": "Core computational data structures including Linear Structures (Arrays, Lists, Stacks, Queues) and Non-Linear Structures (Trees, Binary Trees, BSTs, Graphs) with operations and applications."
    },
    {
        "id": "ch5",
        "number": 5,
        "title": "Data Analytics",
        "desc": "Descriptive statistics, central tendency, dispersion, probability, data collection & preparation, cleaning, statistical modeling, and data visualization tools."
    },
    {
        "id": "ch6",
        "number": 6,
        "title": "Emerging Technologies",
        "desc": "Exploration of modern computing frontiers: Cloud Computing architectures & deployment models, and Blockchain technology, cryptocurrencies, smart contracts, and real-world implications."
    },
    {
        "id": "ch7",
        "number": 7,
        "title": "Legal and Ethical Aspects of Computing System",
        "desc": "Digital law and ethics: Terms of Service, privacy and security threats, malware prevention, the digital divide, social impacts of technology, and digital citizenship."
    },
    {
        "id": "ch8",
        "number": 8,
        "title": "Online Research and Digital Literacy",
        "desc": "Digital research methodologies, evaluating information credibility, academic research databases, research ethics, and intellectual property (patents, copyrights, trademarks, trade secrets)."
    },
    {
        "id": "ch9",
        "number": 9,
        "title": "Entrepreneurship in Digital Age",
        "desc": "Digital entrepreneurship: Design Thinking framework, business model generation, business plans, market research, pitching, digital marketing, business finance, storytelling, and innovation."
    }
]

def clean_inline(text):
    parts = re.split(r'(`[^`]+`)', text)
    res = []
    for p in parts:
        if p.startswith('`') and p.endswith('`'):
            code_content = html.escape(p[1:-1])
            res.append(f'<code class="inline-code">{code_content}</code>')
        else:
            esc = html.escape(p)
            esc = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', esc)
            esc = re.sub(r'\*(.+?)\*', r'<em>\1</em>', esc)
            res.append(esc)
    return ''.join(res)

def render_table(tlines):
    if len(tlines) < 2:
        return '\n'.join(tlines)
    rows = [l.strip().strip('|').split('|') for l in tlines if l.strip()]
    header = [c.strip() for c in rows[0]]
    body_start = 1
    if len(rows) > 1 and all(set(c.strip()) <= {'-', ':', ' '} for c in rows[1]):
        body_start = 2
    
    out = ['<div class="table-responsive"><table class="content-table"><thead><tr>']
    for col in header:
        out.append(f'<th>{clean_inline(col)}</th>')
    out.append('</tr></thead><tbody>')
    for r in rows[body_start:]:
        out.append('<tr>')
        for col in r:
            out.append(f'<td>{clean_inline(col.strip())}</td>')
        out.append('</tr>')
    out.append('</tbody></table></div>')
    return ''.join(out)

def markdown_to_html(md_text, topic_id=""):
    lines = md_text.split('\n')
    html_out = []
    in_code = False
    code_lang = ""
    code_lines = []
    in_table = False
    table_lines = []
    in_ul = False
    in_ol = False
    subtopic_counter = 0

    def close_lists():
        nonlocal in_ul, in_ol
        res = []
        if in_ul:
            res.append('</ul>')
            in_ul = False
        if in_ol:
            res.append('</ol>')
            in_ol = False
        return res

    i = 0
    while i < len(lines):
        line = lines[i]

        # Code block
        if line.strip().startswith('```'):
            if in_code:
                code_text = '\n'.join(code_lines)
                code_escaped = html.escape(code_text)
                lang_label = code_lang.upper() if code_lang else 'CODE'
                html_out.append(f'''
<div class="code-block-wrapper">
    <div class="code-header">
        <span class="code-lang">{lang_label}</span>
        <button class="btn-copy-code" onclick="copyCodeSnippet(this)" title="Copy Code">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy</span>
        </button>
    </div>
    <pre><code class="language-{code_lang}">{code_escaped}</code></pre>
</div>''')
                in_code = False
                code_lines = []
                code_lang = ""
            else:
                html_out.extend(close_lists())
                in_code = True
                code_lang = line.strip()[3:].strip()
                code_lines = []
            i += 1
            continue

        if in_code:
            code_lines.append(line)
            i += 1
            continue

        # Tables
        if line.strip().startswith('|') and line.strip().endswith('|'):
            html_out.extend(close_lists())
            table_lines.append(line)
            i += 1
            continue
        else:
            if table_lines:
                html_out.append(render_table(table_lines))
                table_lines = []

        stripped = line.strip()

        if not stripped:
            html_out.extend(close_lists())
            i += 1
            continue

        if stripped in ('---', '***', '___'):
            html_out.extend(close_lists())
            html_out.append('<hr class="content-divider">')
            i += 1
            continue

        # Headings
        if stripped.startswith('#'):
            html_out.extend(close_lists())
            h_match = re.match(r'^(#{1,6})\s+(.+)$', stripped)
            if h_match:
                level = len(h_match.group(1))
                htitle = h_match.group(2).strip()
                subtopic_counter += 1
                sub_anchor = f"{topic_id}-sec-{subtopic_counter}"
                
                tag = f"h{min(level + 1, 6)}"
                cls = f"topic-subtopic-h{min(level + 1, 6)}"

                html_out.append(f'''
<{tag} id="{sub_anchor}" class="{cls} subtopic-heading" data-heading-text="{html.escape(htitle)}">
    <span class="heading-text">{clean_inline(htitle)}</span>
    <div class="heading-actions no-print">
        <button class="btn-action-icon btn-copy-subtopic" onclick="copySubtopicContent('{sub_anchor}')" title="Copy this section">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy</span>
        </button>
        <button class="btn-action-icon btn-share-subtopic" onclick="shareSubtopicLink('{sub_anchor}', '{html.escape(htitle)}')" title="Share this section">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            <span>Share</span>
        </button>
    </div>
</{tag}>''')
                i += 1
                continue

        # Blockquote
        if stripped.startswith('>'):
            html_out.extend(close_lists())
            quote_text = stripped.lstrip('> ').strip()
            html_out.append(f'<blockquote class="content-blockquote"><p>{clean_inline(quote_text)}</p></blockquote>')
            i += 1
            continue

        # Callouts
        c_match = re.match(r'^\*\*(Definition|Important|Note|Example|Warning|Caution|Key Point|Key Principle|Concept):\*\*\s*(.*)$', stripped, re.I)
        if c_match:
            callout_type = c_match.group(1).lower().replace(' ', '-')
            callout_title = c_match.group(1)
            content_part = c_match.group(2)
            html_out.extend(close_lists())
            html_out.append(f'''
<div class="callout callout-{callout_type}">
    <div class="callout-header">
        <span class="callout-badge">{callout_title}</span>
    </div>
    <div class="callout-body">
        <p>{clean_inline(content_part)}</p>
    </div>
</div>''')
            i += 1
            continue

        # Question / Answer layout (e.g. Q1:, MCQ, Answer:)
        qa_match = re.match(r'^\*\*(Q\d+[\.:]|Question \d+[\.:]|MCQ \d+[\.:])\*\*\s*(.*)$', stripped, re.I)
        if qa_match:
            q_label = qa_match.group(1)
            q_text = qa_match.group(2)
            html_out.extend(close_lists())
            html_out.append(f'''
<div class="exercise-question-card">
    <div class="question-header">
        <span class="question-badge">{q_label}</span>
        <span class="question-prompt">{clean_inline(q_text)}</span>
    </div>
''')
            # Look ahead for Answer: or Explanation:
            i += 1
            inner_lines = []
            while i < len(lines):
                if lines[i].strip().startswith('**Q') or lines[i].strip().startswith('### ') or lines[i].strip().startswith('## ') or lines[i].strip().startswith('---'):
                    break
                inner_lines.append(lines[i])
                i += 1
            # Render inner lines
            sub_html = markdown_to_html('\n'.join(inner_lines), topic_id=f"{topic_id}-qa")
            html_out.append(f'<div class="question-body">{sub_html}</div></div>')
            continue

        # Lists
        ul_match = re.match(r'^[\*\-\+]\s+(.+)$', stripped)
        if ul_match:
            if not in_ul:
                html_out.extend(close_lists())
                html_out.append('<ul class="content-list">')
                in_ul = True
            html_out.append(f'<li>{clean_inline(ul_match.group(1))}</li>')
            i += 1
            continue

        ol_match = re.match(r'^\d+\.\s+(.+)$', stripped)
        if ol_match:
            if not in_ol:
                html_out.extend(close_lists())
                html_out.append('<ol class="content-numbered-list">')
                in_ol = True
            html_out.append(f'<li>{clean_inline(ol_match.group(1))}</li>')
            i += 1
            continue

        # Plain paragraph
        html_out.extend(close_lists())
        html_out.append(f'<p class="content-paragraph">{clean_inline(stripped)}</p>')
        i += 1

    html_out.extend(close_lists())
    if table_lines:
        html_out.append(render_table(table_lines))

    return '\n'.join(html_out)


def extract_subtopics_meta(md_text, topic_id):
    """Finds all subtopic headings inside the markdown."""
    subtopics = []
    lines = md_text.split('\n')
    counter = 0
    for l in lines:
        stripped = l.strip()
        if stripped.startswith('### ') or stripped.startswith('#### ') or stripped.startswith('##### '):
            counter += 1
            m = re.match(r'^(#{3,5})\s+(.+)$', stripped)
            if m:
                level = len(m.group(1))
                title = m.group(2).strip()
                # extract number if present, e.g. 1.2.1
                num_m = re.match(r'^([\d\.]+)\s+(.+)$', title)
                if num_m:
                    num_str = num_m.group(1)
                    title_str = num_m.group(2)
                else:
                    num_str = f"{counter}"
                    title_str = title
                subtopics.append({
                    "id": f"{topic_id}-sec-{counter}",
                    "level": level,
                    "number": num_str,
                    "title": title_str,
                    "rawTitle": title
                })
    return subtopics

def parse_all_chapters():
    os.makedirs('data', exist_ok=True)
    os.makedirs('js', exist_ok=True)
    os.makedirs('css', exist_ok=True)

    all_chapters = []
    all_topics = []
    search_index = []

    total_subtopics_count = 0

    for idx, m_idx in enumerate(chapter_msgs):
        chap_num = idx + 1
        meta = chapter_meta[idx]
        frag = messages[m_idx]['fragments'][0] if messages[m_idx]['fragments'][0]['type'] == 'RESPONSE' else messages[m_idx]['fragments'][1]
        raw_text = frag['content']

        # Split raw text by major sections '## '
        raw_sections = raw_text.split('\n## ')
        
        chap_topics = []
        topic_counter = 0

        # We will iterate through raw sections
        for s_idx, sec in enumerate(raw_sections):
            lines = sec.strip().split('\n')
            sec_header = lines[0].strip()
            sec_body = '\n'.join(lines[1:]).strip()

            if not sec_body and len(lines) == 1:
                continue

            # Skip preamble before Chapter 1
            if 'Lahore Board' in sec_header or 'TABLE OF CONTENTS' in sec_header or 'Understood' in sec_header:
                continue

            # If section B, it has many individual topics!
            if sec_header.startswith('B. Complete Topic-Wise Notes'):
                # Split Section B into individual topics based on '### '
                sub_secs = re.split(r'\n(?=###\s+)', sec_body)
                for b_sec in sub_secs:
                    b_lines = b_sec.strip().split('\n')
                    if not b_lines or not b_lines[0].startswith('### '):
                        continue
                    b_header = b_lines[0].replace('### ', '').strip()
                    b_body = '\n'.join(b_lines[1:]).strip()
                    
                    topic_counter += 1
                    t_id = f"ch{chap_num}-t{topic_counter}"
                    
                    # Extract topic number and clean title
                    t_num_m = re.match(r'^([\d\.]+)\s+(.+)$', b_header)
                    if t_num_m:
                        t_num = t_num_m.group(1)
                        t_title = t_num_m.group(2)
                    else:
                        t_num = f"{chap_num}.{topic_counter}"
                        t_title = b_header

                    subtopics = extract_subtopics_meta(b_body, t_id)
                    total_subtopics_count += len(subtopics)

                    html_content = markdown_to_html(b_body, topic_id=t_id)

                    topic_obj = {
                        "id": t_id,
                        "chapterId": meta["id"],
                        "chapterNumber": chap_num,
                        "chapterTitle": meta["title"],
                        "topicNumber": t_num,
                        "title": t_title,
                        "fullTitle": f"{t_num} {t_title}",
                        "subtopics": subtopics,
                        "markdown": b_body,
                        "html": html_content,
                        "wordCount": len(b_body.split()),
                        "readingTime": max(1, round(len(b_body.split()) / 180))
                    }
                    chap_topics.append(topic_obj)
                    all_topics.append(topic_obj)

                    # Add to search index
                    search_index.append({
                        "id": t_id,
                        "chapterNumber": chap_num,
                        "chapterTitle": meta["title"],
                        "topicNumber": t_num,
                        "title": t_title,
                        "type": "topic",
                        "contentPreview": b_body[:300].replace('\n', ' ')
                    })

                    for sub in subtopics:
                        search_index.append({
                            "id": t_id,
                            "anchor": sub["id"],
                            "chapterNumber": chap_num,
                            "chapterTitle": meta["title"],
                            "topicNumber": sub["number"],
                            "title": sub["title"],
                            "type": "subtopic",
                            "contentPreview": f"{meta['title']} > {t_title} > {sub['title']}"
                        })

                continue

            # Skip Section F if it has no content
            if sec_header.startswith('F.') and ('does not contain' in sec_body or len(sec_body) < 120):
                continue

            # Standard Sections (A, C, D, E, F, G, H, I, J)
            topic_counter += 1
            t_id = f"ch{chap_num}-t{topic_counter}"

            # Format section header nicely
            # e.g. "A. Chapter Introduction" -> "Chapter Introduction & Overview"
            t_num = sec_header.split('.')[0].strip()
            clean_sec_title = sec_header
            if '.' in sec_header:
                clean_sec_title = sec_header.split('.', 1)[1].strip()

            subtopics = extract_subtopics_meta(sec_body, t_id)
            total_subtopics_count += len(subtopics)

            html_content = markdown_to_html(sec_body, topic_id=t_id)

            topic_obj = {
                "id": t_id,
                "chapterId": meta["id"],
                "chapterNumber": chap_num,
                "chapterTitle": meta["title"],
                "topicNumber": t_num,
                "title": clean_sec_title,
                "fullTitle": f"{sec_header}",
                "subtopics": subtopics,
                "markdown": sec_body,
                "html": html_content,
                "wordCount": len(sec_body.split()),
                "readingTime": max(1, round(len(sec_body.split()) / 180))
            }
            chap_topics.append(topic_obj)
            all_topics.append(topic_obj)

            search_index.append({
                "id": t_id,
                "chapterNumber": chap_num,
                "chapterTitle": meta["title"],
                "topicNumber": t_num,
                "title": clean_sec_title,
                "type": "section",
                "contentPreview": sec_body[:300].replace('\n', ' ')
            })

            for sub in subtopics:
                search_index.append({
                    "id": t_id,
                    "anchor": sub["id"],
                    "chapterNumber": chap_num,
                    "chapterTitle": meta["title"],
                    "topicNumber": sub["number"],
                    "title": sub["title"],
                    "type": "subtopic",
                    "contentPreview": f"{meta['title']} > {clean_sec_title} > {sub['title']}"
                })

        # Save chapter object
        chap_obj = {
            "id": meta["id"],
            "number": chap_num,
            "title": meta["title"],
            "description": meta["desc"],
            "topicsCount": len(chap_topics),
            "subtopicsCount": sum(len(t["subtopics"]) for t in chap_topics),
            "topics": [
                {
                    "id": t["id"],
                    "topicNumber": t["topicNumber"],
                    "title": t["title"],
                    "fullTitle": t["fullTitle"],
                    "subtopicsCount": len(t["subtopics"]),
                    "wordCount": t["wordCount"],
                    "readingTime": t["readingTime"]
                } for t in chap_topics
            ]
        }
        all_chapters.append(chap_obj)

    # Save to JSON files
    with open('data/chapters.json', 'w', encoding='utf-8') as f:
        json.dump(all_chapters, f, indent=2, ensure_ascii=False)

    with open('data/topics.json', 'w', encoding='utf-8') as f:
        json.dump(all_topics, f, indent=2, ensure_ascii=False)

    with open('data/search-index.json', 'w', encoding='utf-8') as f:
        json.dump(search_index, f, indent=2, ensure_ascii=False)

    stats = {
        "totalChapters": len(all_chapters),
        "totalTopics": len(all_topics),
        "totalSubtopics": total_subtopics_count,
        "totalWords": sum(t["wordCount"] for t in all_topics)
    }

    with open('data/stats.json', 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2)

    # Save data.js with window.COURSE_DATA for 100% offline file:// compatibility
    with open('js/data.js', 'w', encoding='utf-8') as f:
        f.write("window.COURSE_DATA = {\n")
        f.write(f"  stats: {json.dumps(stats, ensure_ascii=False)},\n")
        f.write(f"  chapters: {json.dumps(all_chapters, ensure_ascii=False)},\n")
        f.write(f"  topics: {json.dumps(all_topics, ensure_ascii=False)},\n")
        f.write(f"  searchIndex: {json.dumps(search_index, ensure_ascii=False)}\n")
        f.write("};\n")

    print(f"Generated successfully!")
    print(f"Total Chapters: {stats['totalChapters']}")
    print(f"Total Topics: {stats['totalTopics']}")
    print(f"Total Subtopics: {stats['totalSubtopics']}")
    print(f"Total Words: {stats['totalWords']}")

parse_all_chapters()
