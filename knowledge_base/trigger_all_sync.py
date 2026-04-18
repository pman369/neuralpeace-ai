import requests
import os
import json

# Configuration
SUPABASE_URL = "https://vebgatsavuxliewemioe.supabase.co"
# Using the key from your .env.local
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlYmdhdHNhdnV4bGlld2VtaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTYxNDc1NSwiZXhwIjoyMDkxMTkwNzU1fQ.ZAJaf0Q7Z-Vp36ZsnEXG83lW1MHagrJ3Cr8HSNsr4NE"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}"
}

section_ids = [
    "fb4c8612-45e0-4740-9753-294025a1e2bf",
    "da9c8942-8350-488f-9a3d-39f28cabb14d",
    "fc8e94a1-0294-4b53-9034-315132711e5a",
    "c0f879f3-3a43-4cdf-9f1a-04f9e4ba14df",
    "25d01139-21e9-43aa-9e05-213aa3370135",
    "30788f47-ff92-48c5-9e64-e777f395d7a0",
    "5668a00c-622e-4428-b4e8-ec6b93f7c17e",
    "01a1fbda-7d14-40d3-989b-f2ed3262df62",
    "7576d486-c62d-4e35-a9ed-494a9b1cc592",
    "1284ea44-84e1-4d27-afde-52a6dd3f8d1b",
    "83bc253f-1ff4-4b96-b9bb-b35e4c0da7f4",
    "5fc36d6a-6913-45df-b25b-f7ff0b25e612",
    "93e29ab1-f075-4677-8078-6f10503b0992",
    "d46fd293-13c3-41c6-8111-86098b9506f6",
    "8bde8fa8-6cb3-4e82-af1c-f436b24fbf8f"
]

print(f"Triggering sync for {len(section_ids)} sections...")

for sid in section_ids:
    payload = {
        "action": "sync",
        "sectionId": sid
    }
    response = requests.post(f"{SUPABASE_URL}/functions/v1/embed-knowledge", headers=headers, json=payload)
    if response.status_code == 200:
        print(f"SUCCESS: Synced section {sid}")
    else:
        print(f"FAILED: Sync {sid}: {response.status_code} - {response.text}")

print("Sync completed.")
