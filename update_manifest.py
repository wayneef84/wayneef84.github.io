import json
import os

packs_dir = 'games/j/packs'
manifest_path = os.path.join(packs_dir, 'manifest.json')

# Read existing manifest
try:
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
except FileNotFoundError:
    manifest = []

# Create a set of existing paths to avoid duplicates
existing_paths = {item['path'] for item in manifest}

# List all json files in the directory
files = os.listdir(packs_dir)

new_entries = []

for filename in files:
    if filename == 'manifest.json' or not filename.endswith('.json'):
        continue

    file_path = os.path.join(packs_dir, filename)
    relative_path = f"packs/{filename}"

    if relative_path in existing_paths:
        continue

    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
            if 'meta' in data:
                meta = data['meta']
                entry = {
                    "id": meta.get('id', filename.replace('.json', '')),
                    "title": meta.get('title', filename.replace('_', ' ').title()),
                    "path": relative_path
                }
                new_entries.append(entry)
                print(f"Added: {entry['title']} ({filename})")
            else:
                print(f"Skipping {filename}: No 'meta' key found.")
    except Exception as e:
        print(f"Error reading {filename}: {e}")

# Add new entries to manifest
manifest.extend(new_entries)

# Write back to manifest.json
with open(manifest_path, 'w') as f:
    json.dump(manifest, f, indent=4)

print("Manifest updated successfully.")
