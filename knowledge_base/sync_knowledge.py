import os
import re
import json
import requests

# Configuration - should be set via environment variables in production
# For now, we'll use the values we have or placeholders
SUPABASE_URL = os.environ.get('VITE_SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

def parse_markdown(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Get H1 as module title
    h1_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if not h1_match:
        return None
    
    module_title = h1_match.group(1).strip()
    
    # Split by H2
    sections = []
    # Find all H2 headers and the content until the next H2 or end of file
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
        'sections': sections
    }

def sync_to_supabase(module_data):
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("Missing Supabase credentials. Skipping API sync.")
        return False

    # This is a conceptual implementation of what the script would do via HTTP
    # Since we are an agent with execute_sql access, we can generate the SQL directly
    return True

def generate_sql(module_data):
    title = module_data['title'].replace("'", "''")
    
    sql = [f"-- Syncing module: {title}"]
    # Get module_id
    sql.append(f"DO $$")
    sql.append(f"DECLARE v_module_id UUID;")
    sql.append(f"BEGIN")
    sql.append(f"  SELECT id INTO v_module_id FROM public.modules WHERE title = '{title}';")
    sql.append(f"  IF v_module_id IS NOT NULL THEN")
    sql.append(f"    DELETE FROM public.module_content WHERE module_id = v_module_id;")
    
    for section in module_data['sections']:
        sec_title = section['title'].replace("'", "''")
        sec_content = section['content'].replace("'", "''")
        sql.append(f"    INSERT INTO public.module_content (module_id, section_title, section_order, content_md)")
        sql.append(f"    VALUES (v_module_id, '{sec_title}', {section['order']}, '{sec_content}');")
    
    sql.append(f"  END IF;")
    sql.append(f"END $$;")
    return "\n".join(sql)

if __name__ == "__main__":
    knowledge_dir = 'knowledge_base'
    all_sql = []
    
    for filename in os.listdir(knowledge_dir):
        if filename.endswith('.md') and filename not in ['core_concepts.md', 'advanced_frontiers.md', 'neuroplasticity.md']:
            file_path = os.path.join(knowledge_dir, filename)
            data = parse_markdown(file_path)
            if data:
                print(f"Parsed {data['title']} with {len(data['sections'])} sections.")
                all_sql.append(generate_sql(data))
    
    with open('knowledge_base/sync.sql', 'w', encoding='utf-8') as f:
        f.write("\n\n".join(all_sql))
    
    print("Generated knowledge_base/sync.sql")
