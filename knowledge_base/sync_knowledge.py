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

def parse_markdown(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Get H1 as module title
    h1_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if not h1_match:
        return None
    
    module_title = h1_match.group(1).strip()
    
    # Simple extraction of metadata from top of file if it exists, or defaults
    description = "Educational module about " + module_title
    category = "Neuroanatomy"
    expertise = "Practitioner"
    image_url = "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800"
    read_time = "15 mins read"

    # Split by H2
    sections = []
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
