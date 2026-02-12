import json
import re
import os

def parse_projects_js():
    try:
        with open('js/projects.js', 'r') as f:
            content = f.read()

        # Extract the projects array
        match = re.search(r'var projects = \[(.*?)\];', content, re.DOTALL)
        if not match:
            return []

        projects_str = match.group(1)

        # Parse each object roughly
        # This is a hacky parser because the JS might contain comments and isn't strict JSON
        entries = []

        # Split by }, { to find objects
        # Improve regex to capture properties
        # simpler: find all { ... } blocks

        object_pattern = re.compile(r'\{([^\}]+)\}')
        objects = object_pattern.findall(projects_str)

        for obj_str in objects:
            entry = {}

            # Extract name
            name_match = re.search(r'name:\s*"([^"]+)"', obj_str)
            if name_match:
                entry['term'] = name_match.group(1)

            # Extract description
            desc_match = re.search(r'description:\s*"([^"]+)"', obj_str)
            if desc_match:
                entry['definition'] = desc_match.group(1)

            # Extract category to use as tag
            cat_match = re.search(r'category:\s*"([^"]+)"', obj_str)
            if cat_match:
                entry['category'] = "Project (" + cat_match.group(1) + ")"

            if 'term' in entry:
                entries.append(entry)

        return entries
    except Exception as e:
        print(f"Error parsing projects.js: {e}")
        return []

def parse_agents_md():
    entries = []
    try:
        with open('AGENTS.md', 'r') as f:
            lines = f.readlines()

        # Parse Agent Table
        in_table = False
        for line in lines:
            if "| **" in line and "** |" in line:
                parts = [p.strip() for p in line.split('|')]
                # Parts: ['', '**Name**', '`ID`', 'Role', ...]
                if len(parts) > 3:
                    name_raw = parts[1].replace('**', '')
                    role = parts[3]
                    desc = parts[4] if len(parts) > 4 else ""

                    entries.append({
                        "term": name_raw,
                        "definition": f"{role}. Key strengths: {desc}.",
                        "category": "Agent"
                    })

        # Add general terms
        entries.append({
            "term": "F.O.N.G.",
            "definition": "The foundational architecture for the family digital archive. Stands for 'Founding & Forging' (Legacy) or 'Fong Family Arcade' (Modern).",
            "category": "Protocol"
        })

        entries.append({
            "term": "The Conjugators",
            "definition": "The collective name for the three AI agents (Claude, Gemini, Jules) that co-maintain the repository.",
            "category": "Protocol"
        })

        return entries
    except Exception as e:
        print(f"Error parsing AGENTS.md: {e}")
        return []

def parse_readme_md():
    entries = []
    try:
        with open('README.md', 'r') as f:
            content = f.read()

        # Extract Tech Stack
        if "## 🚀 Technology Stack" in content:
            tech_section = content.split("## 🚀 Technology Stack")[1].split("##")[0]

            # Parse list items
            for line in tech_section.split('\n'):
                line = line.strip()
                if line.startswith('- **'):
                    parts = line.split('**')
                    if len(parts) >= 3:
                        term = parts[1]
                        defin = parts[2].strip().lstrip(':').strip()
                        entries.append({
                            "term": term,
                            "definition": defin,
                            "category": "Technology"
                        })
                elif line.startswith('- '):
                    # simpler list
                    item = line[2:]
                    if ' - ' in item:
                        t, d = item.split(' - ', 1)
                        entries.append({
                            "term": t.strip(),
                            "definition": d.strip(),
                            "category": "Technology"
                        })
                    elif '(' in item and ')' in item:
                         t = item.split('(')[0].strip()
                         d = item
                         entries.append({
                            "term": t,
                            "definition": d,
                            "category": "Technology"
                         })

        return entries
    except Exception as e:
        print(f"Error parsing README.md: {e}")
        return []

def main():
    all_entries = []
    all_entries.extend(parse_projects_js())
    all_entries.extend(parse_agents_md())
    all_entries.extend(parse_readme_md())

    # Sort by term
    all_entries.sort(key=lambda x: x['term'].lower())

    # Remove duplicates
    unique_entries = []
    seen = set()
    for e in all_entries:
        if e['term'] not in seen:
            unique_entries.append(e)
            seen.add(e['term'])

    output = {
        "title": "F.O.N.G. Encyclopedia",
        "description": "A comprehensive guide to the repository, its projects, and its maintainers.",
        "entries": unique_entries
    }

    os.makedirs('projects/encyclopedia/data', exist_ok=True)

    with open('projects/encyclopedia/data/content.json', 'w') as f:
        json.dump(output, f, indent=2)

    print(f"Generated {len(unique_entries)} entries.")

if __name__ == "__main__":
    main()
