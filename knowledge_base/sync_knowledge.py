import os
import re
import json
import requests
from supabase import create_client, Client

# Configuration - should be set via environment variables
SUPABASE_URL = os.environ.get('SUPABASE_URL') or os.environ.get('VITE_SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Warning: Missing Supabase credentials. Script will only parse files.")
    supabase: Client = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Metadata from constants.ts
MODULE_METADATA = {
    "Prefrontal Cortex Synthesis": {"category": "Neuroanatomy", "expertise": "Practitioner", "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAX-I9GoYGWxxH5u-WDZfkverd7sBcrdRFw5SMIFVbcbFjJNU6ua1h3TXFaDAQ7KOkPd5gMaSdrTXZbb_Wv-GMKqzMGyQAuSmyN8UaWkFhCxrc4hi031Ct4QCzEPQkka9y-DRtCeW86toX1FZeL27VW6ZP_QytMmad3H9v-G2oZw3D69D8H6IquU1GsjCkmjVV_oks1RS6HK0oGvqTHSnVcxyHt493m93gc_Tpc70-O1tXdMV4NPvgELFxglDL6b16HCtNVa25FGVo", "read_time": "12 mins read", "description": "A comprehensive look at executive function regulation through the lens of modern connectivity mapping."},
    "Bayesian Inference Models": {"category": "Computational", "expertise": "Expert", "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuD01a97ejCpwS8UU5BQogY28YZ8ojgntR7e7P94-W61ctJqMzy9KBonBo038wSniM8IMx8uFeiBTN2oMaQEwnc63oLEaZ-bxt6yy2Cknbsu-oriQxhSfMmoXpDvECXa4r4zhW5j08ABoXwCt_RMnDnSEtyA35RAQQC4RPEONQ-HBmStXl-a-yZX_nNCopEI_JrFkRMiD-pY82ElAf6YcILfGjkjZLwRtHmIAKcP4rp23xjG8ZKd0k3cOkvL8jQx0oDJLOfQXWSynGo", "read_time": "25 mins read", "description": "How probabilistic modeling predicts sensory perception and motor control in complex environmental states."},
    "fMRI Protocol Basics": {"category": "Methods", "expertise": "Novice", "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuARoQzCDMjoEGixktInclp5bk4NuggHUedO8vZS3HPTmZOFzVDGPknGCQWzBWW_up8COPyZrMxr7UsXyX0gwflo--HziTNm-ObloYL6RGIfz04bAJ68vLnCFWzwGU_E5zTS9o73FydYZ1OZQUImMICqt2GBKN3GKWcZRpp1tTOV8WNC3ftXY-svo0sqzQCATJbYa-PnkKuWH_RG7rX1gKynuIbRTZhnCC78lupbAk6nGE5Xm-ligWkRJcR1fyVuX9jrFVpz-BD2Ygs", "read_time": "8 mins read", "description": "A beginner-friendly guide to experimental design and initial data cleaning for functional neuroimaging."},
    "Cognitive Load Theory": {"category": "Psychology", "expertise": "Practitioner", "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAGw8eSfdM6ig4cdutozUjMmzYNJ27utbPankUvID8mdsSIEzxHDIaXsOl8xsSvj-nFCAS-O5b_sAfOqDeUcVo68XD6fuuxEcq8islQntALhFi-d3HRmNaxxojuYgKyyZqjKLyYQSo-G2Cd-Uv2v2qjjGwRBPKbzRBv7Cn7MaGcUeiusfRuKeiErYw4qrA8zV-21oTuNn8a8FDyYKq_cIZ3ERQs3uYbMOjkusYV8lPNkuKVyvLZ1bzRnuDRSHKGcZE3ZH2tjngTtCU", "read_time": "15 mins read", "description": "Analyzing the relationship between working memory capacity and instructional design efficiency."},
    "Hippocampal Neurogenesis": {"category": "Neuroanatomy", "expertise": "Expert", "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBlD65-tFVnddScEFV2TrMxN0yR3iPc9KAm14Mh-ZdkHyUy_SQlBcxky4QzSnfPj3lsPYvseuRLsgw9WH5uADRthjYP57km-MUFYBwKr6KgHnI5YV8ZXjXv-ZtZMX1Q6mYHZ5q3R4GhqZewy3SYFFJwiVGcNFCz40Zb3H7KTSiXWS1sZVWmLKYmt7AnFr82PWvdpUxJd8MXgy368clSUn43wtnKJuj3dZUJKbgyzYlunkJkinwRH2TAuNQROZonxDqS0_pdpsIg_V4", "read_time": "40 mins read", "description": "Advanced study on the biological mechanisms of adult neuron formation and memory consolidation."},
    "Introduction to Neurofeedback": {"category": "Therapeutics", "expertise": "Novice", "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCK7YN18eAeLEdwxTZ-J8Zg1DhStYVpseTRfuLol3HLZrUChzoPbMc7WZ3mvDkHnh0TULgt6ZfOm9Cx7boPftP58TFyXE4zyYoP0q4TyjdFUs2cZMIEYlG_cdU7Sh4g_g2KvoKP9tgZmJnWI7ol2hTHl44iSKWVdOC6Y4-rPf_wwWvyYk9zfdIc1PQcUTpamtsuDf5cJUf3WWrTe8e3X9s1a59IbT9SphdaszUi6tyhzQ9TOTVNTmD5x51sGPDq7-eK1hwMKLsEY5w", "read_time": "10 mins read", "description": "Understanding the basics of EEG-driven therapeutic interventions for anxiety and sleep regulation."},
    # Large knowledge-base files
    "Core Concepts in Neuroscience: From Synaptic Mechanisms to Neuroethics": {"category": "Neuroanatomy", "expertise": "Expert", "image_url": "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800", "read_time": "25 mins read", "description": "A comprehensive survey of neuroanatomy, synaptic plasticity, neuroimaging methods, computational models, and neuroethics for the advanced learner."},
    "Advanced Frontiers in Neuroscience: From Quantum Biology to Synthetic Neural Networks": {"category": "Neuroanatomy", "expertise": "Scholar", "image_url": "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800", "read_time": "30 mins read", "description": "Cutting-edge topics spanning ultra-high-field neuroimaging, single-cell RNA sequencing, organoid intelligence, neuromorphic computing, and quantum brain hypotheses."},
    "Neuroplasticity: Mechanisms, Modulation, and Modern Interventions": {"category": "Neuroanatomy", "expertise": "Expert", "image_url": "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=800", "read_time": "35 mins read", "description": "From LTP molecular cascades to psychoplastogens and TMS protocols: a deep dive into how the brain rewires itself and how we can harness that capacity."},
    # DBS and Optogenetics files
    "Deep Brain Stimulation: Mechanisms & Network Therapy": {"category": "Therapeutics", "expertise": "Expert", "image_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800", "read_time": "20 mins read", "description": "An exploration of DBS as a multimodal intervention targeting circuit-level pathological oscillations through network-wide modulation."},
    "Precision Optogenetics & Neural Circuit Mapping": {"category": "Methods", "expertise": "Scholar", "image_url": "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800", "read_time": "18 mins read", "description": "A masterclass in high-resolution circuit dissection, from intersectional targeting to holographic photostimulation."},
}

def parse_markdown(file_path):
    # Open with utf-8-sig to handle BOM; normalise CRLF to LF
    with open(file_path, 'r', encoding='utf-8-sig', errors='replace') as f:
        content = f.read().replace('\r\n', '\n').replace('\r', '\n')

    # Get H1 as module title
    h1_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if not h1_match:
        return None
    
    # Check for title map or exact match
    module_title_raw = h1_match.group(1).strip()
    
    # Simple extraction of metadata from top of file if it exists, or defaults
    meta = MODULE_METADATA.get(module_title_raw)
    
    # If not exactly matching the title in the file, check if filename matches any key
    if not meta:
        base_name = os.path.basename(file_path).replace('.md', '')
        meta = MODULE_METADATA.get(base_name)
        if meta:
            module_title = base_name
        else:
            module_title = module_title_raw
    else:
        module_title = module_title_raw
        
    intro_pattern = r'^#\s+.*?\n+(.*?)(?=\n##\s+|\Z)'
    intro_match = re.search(intro_pattern, content, re.MULTILINE | re.DOTALL)
    intro_text = intro_match.group(1).strip() if intro_match else ""

    if meta:
        description = meta["description"]
        category = meta["category"]
        expertise = meta["expertise"]
        image_url = meta["image_url"]
        read_time = meta["read_time"]
    else:
        # Strip markdown tokens from the intro text before using as description
        clean_intro = re.sub(r'^#{1,6}\s+', '', intro_text, flags=re.MULTILINE)  # headings
        clean_intro = re.sub(r'[*_]{1,3}(.*?)[*_]{1,3}', r'\1', clean_intro)    # bold/italic
        clean_intro = re.sub(r'`[^`]+`', '', clean_intro)                         # inline code
        clean_intro = re.sub(r'^[-*+]\s+', '', clean_intro, flags=re.MULTILINE)   # list markers
        clean_intro = re.sub(r'^>\s*', '', clean_intro, flags=re.MULTILINE)        # blockquotes
        clean_intro = re.sub(r'\s+', ' ', clean_intro).strip()                    # collapse whitespace
        description = clean_intro[:200] + "..." if len(clean_intro) > 200 else clean_intro
        if not description:
            description = "Educational module about " + module_title
        category = "Neuroanatomy"
        expertise = "Expert"  # Default to Expert so they show up easily
        image_url = "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800"
        read_time = "15 mins read"

    # Split by H2
    sections = []
    
    if intro_text:
        sections.append({
            'title': 'Introduction',
            'order': 0,
            'content': intro_text
        })
        
    pattern = r'^##\s+(.+?)\n(.*?)(?=\n##\s+|\Z)'
    matches = re.finditer(pattern, content, re.MULTILINE | re.DOTALL)
    
    for i, match in enumerate(matches):
        sections.append({
            'title': match.group(1).strip(),
            'order': i + 1,
            'content': match.group(2).strip()
        })
    
    return {
        'title': module_title,
        'description': description,
        'category': category,
        'expertise': expertise,
        'image_url': image_url,
        'read_time': read_time,
        'sections': sections
    }

def sync_module(module_data):
    if not supabase:
        return None

    print(f"Syncing module: {module_data['title']}...")
    
    # 1. Upsert Module
    res = supabase.table('modules').upsert({
        'title': module_data['title'],
        'description': module_data['description'],
        'category': module_data['category'],
        'expertise': module_data['expertise'],
        'image_url': module_data['image_url'],
        'read_time': module_data['read_time']
    }, on_conflict='title').execute()
    
    if not res.data:
        print(f"Error upserting module {module_data['title']}")
        return None
        
    module_id = res.data[0]['id']
    
    # 2. Upsert Sections
    for section in module_data['sections']:
        print(f"  Syncing section: {section['title']}...")
        sec_res = supabase.table('module_content').upsert({
            'module_id': module_id,
            'section_title': section['title'],
            'section_order': section['order'],
            'content_md': section['content']
        }, on_conflict='module_id,section_order').execute()
        
        if sec_res.data:
            section_id = sec_res.data[0]['id']
            trigger_embedding(section_id)

def trigger_embedding(section_id):
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return

    url = f"{SUPABASE_URL}/functions/v1/embed-knowledge"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
    }
    payload = {
        "action": "sync",
        "sectionId": section_id
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            print(f"    Successfully triggered embedding for {section_id}")
        else:
            print(f"    Failed to trigger embedding for {section_id}: {response.text}")
    except Exception as e:
        print(f"    Error triggering embedding: {e}")

if __name__ == "__main__":
    knowledge_dir = 'knowledge_base'
    
    for filename in os.listdir(knowledge_dir):
        if filename.endswith('.md'):
            file_path = os.path.join(knowledge_dir, filename)
            data = parse_markdown(file_path)
            if data:
                sync_module(data)
    
    print("Sync complete.")
