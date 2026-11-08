import json
import os

print("="*60)
print("TESTING COMPLETE FLAT EDUCATIONAL WEBSITE")
print("="*60)

# Check no subfolders exist
subdirs = [d for d in os.listdir('.') if os.path.isdir(d)]
assert len(subdirs) == 0, f"Found subdirectories: {subdirs}"
print(f"[PASS] Verified: Zero subdirectories in CS folder! All files are direct.")

# 1. Verify JSON and JS data
with open('chapters.json', 'r', encoding='utf-8') as f:
    chapters = json.load(f)
with open('topics.json', 'r', encoding='utf-8') as f:
    topics = json.load(f)
with open('stats.json', 'r', encoding='utf-8') as f:
    stats = json.load(f)
with open('search-index.json', 'r', encoding='utf-8') as f:
    search_index = json.load(f)

print(f"[PASS] Loaded {len(chapters)} Chapters")
print(f"[PASS] Loaded {len(topics)} Dedicated Topics")
print(f"[PASS] Loaded {stats['totalSubtopics']} Subtopics")
print(f"[PASS] Search index has {len(search_index)} searchable entries")

# Check required flat files
required_files = [
    'index.html',
    'style.css',
    'components.css',
    'responsive.css',
    'print.css',
    'data.js',
    'app.js',
    'navigation.js',
    'search.js',
    'copy-share.js',
    'bookmarks.js',
    'progress.js',
    'theme.js',
    'chapters.json',
    'topics.json',
    'stats.json',
    'search-index.json'
]
for i in range(1, 10):
    required_files.append(f'chapter-{i}.html')

for rf in required_files:
    assert os.path.exists(rf), f"Missing required file: {rf}"
    size = os.path.getsize(rf)
    assert size > 0, f"File {rf} is empty!"
    print(f"[PASS] {rf} ({size:,} bytes)")

# Verify index.html references flat files
with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

assert 'css/' not in index_content, "index.html still contains css/ prefix!"
assert 'js/' not in index_content, "index.html still contains js/ prefix!"
print("[PASS] index.html correctly references all flat files without subdirectories.")

print("\nALL FLAT STRUCTURE CHECKS PASSED PERFECTLY!")
