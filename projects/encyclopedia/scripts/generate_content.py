import json
import re
import os

# --- Helper Functions ---
def clean_text(text):
    if not text:
        return ""
    return text.strip().replace('`', '')

# --- Parsers ---

def parse_projects_js():
    try:
        with open('js/projects.js', 'r') as f:
            content = f.read()

        match = re.search(r'var projects = \[(.*?)\];', content, re.DOTALL)
        if not match:
            return []

        projects_str = match.group(1)
        object_pattern = re.compile(r'\{([^\}]+)\}')
        objects = object_pattern.findall(projects_str)

        entries = []
        for obj_str in objects:
            entry = {}
            name_match = re.search(r'name:\s*"([^"]+)"', obj_str)
            if name_match:
                entry['term'] = name_match.group(1)

            desc_match = re.search(r'description:\s*"([^"]+)"', obj_str)
            if desc_match:
                entry['definition'] = desc_match.group(1)

            cat_match = re.search(r'category:\s*"([^"]+)"', obj_str)
            if cat_match:
                entry['category'] = "Project"

            tags_match = re.search(r'tags:\s*\["([^"]+)"\]', obj_str)
            if tags_match:
                entry['tags'] = [tags_match.group(1)]

            if 'term' in entry:
                entries.append(entry)
        return entries
    except Exception as e:
        print(f"Error parsing projects.js: {e}")
        return []

def parse_agents_md():
    entries = []
    try:
        if not os.path.exists('AGENTS.md'): return []
        with open('AGENTS.md', 'r') as f:
            lines = f.readlines()

        for line in lines:
            if "| **" in line and "** |" in line:
                parts = [p.strip() for p in line.split('|')]
                if len(parts) > 3:
                    name_raw = parts[1].replace('**', '')
                    role = parts[3]
                    desc = parts[4] if len(parts) > 4 else ""
                    entries.append({
                        "term": name_raw,
                        "definition": f"{role}. Key strengths: {desc}.",
                        "category": "Agent"
                    })

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
        if not os.path.exists('README.md'): return []
        with open('README.md', 'r') as f:
            content = f.read()

        if "## 🚀 Technology Stack" in content:
            tech_section = content.split("## 🚀 Technology Stack")[1].split("##")[0]
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
        return entries
    except Exception as e:
        print(f"Error parsing README.md: {e}")
        return []

def parse_projects_md():
    # Enrich project entries with Dates and Types
    entries = []
    try:
        if not os.path.exists('PROJECTS.md'): return []
        with open('PROJECTS.md', 'r') as f:
            lines = f.readlines()

        for line in lines:
            if "| **" in line:
                # | **Name** | `Path` | Type | Summary | Date |
                parts = [p.strip() for p in line.split('|')]
                if len(parts) >= 6:
                    name = parts[1].replace('**', '')
                    path = clean_text(parts[2])
                    ptype = parts[3]
                    summary = parts[4]
                    date = parts[5]

                    entries.append({
                        "term": name,
                        "definition": summary,
                        "category": "Project",
                        "description": f"Type: {ptype}. Created: {date}. Path: {path}"
                    })
        return entries
    except Exception as e:
        print(f"Error parsing PROJECTS.md: {e}")
        return []

def parse_info_md():
    entries = []
    try:
        if not os.path.exists('INFO.md'): return []
        with open('INFO.md', 'r') as f:
            content = f.read()

        # Registry Version
        reg_ver = re.search(r'Registry Version:\*\* ([\d\.]+)', content)
        if reg_ver:
            entries.append({
                "term": "F.O.N.G. Registry",
                "definition": f"Central project registry (v{reg_ver.group(1)}) maintained by Root Claude.",
                "category": "Protocol"
            })

        # Update Policy
        if "## Update Policy" in content:
            entries.append({
                "term": "Update Policy",
                "definition": "The repository uses Semantic Versioning with opt-in upgrades for shared libraries.",
                "category": "Policy"
            })

        # Parse Library Registry
        if "## Library Registry" in content:
            lib_section = content.split("## Library Registry")[1].split("##")[0]
            for line in lib_section.split('\n'):
                if "|" in line and "`" in line and "---" not in line:
                    parts = [p.strip() for p in line.split('|')]
                    if len(parts) > 2:
                        lib = clean_text(parts[1])
                        ver = clean_text(parts[2].replace('**', ''))
                        entries.append({
                            "term": f"Library: {lib}",
                            "definition": f"Shared library currently at version {ver}.",
                            "category": "Technology"
                        })

        return entries
    except Exception as e:
        print(f"Error parsing INFO.md: {e}")
        return []

def parse_url_parameters_md():
    entries = []
    try:
        if not os.path.exists('URL_PARAMETERS.md'): return []
        with open('URL_PARAMETERS.md', 'r') as f:
            content = f.read()

        entries.append({
            "term": "URL Parameters",
            "definition": "System for deep linking to specific content in F.O.N.G. games (e.g., specific letters or words).",
            "category": "Technology",
            "description": "Supports `pack`, `letter`, `word`, `id`, and `game` parameters."
        })

        if "## Letter Tracing" in content:
            entries.append({
                "term": "Letter Tracing URLs",
                "definition": "Deep linking for the Tracing game.",
                "category": "Feature",
                "description": "Example: `index.html?pack=lowercase&letter=e` loads the lowercase pack and selects 'e'."
            })

        if "## Words Game" in content:
            entries.append({
                "term": "Words Game URLs",
                "definition": "Deep linking for the Words game.",
                "category": "Feature",
                "description": "Supports predefined words (`?word=Mom`) and custom ad-hoc words (`?id=custom&word=Test`)."
            })

        return entries
    except Exception as e:
        print(f"Error parsing URL_PARAMETERS.md: {e}")
        return []

def parse_license_audit_md():
    entries = []
    try:
        if not os.path.exists('LICENSE_AUDIT.md'): return []
        with open('LICENSE_AUDIT.md', 'r') as f:
            lines = f.readlines()

        for line in lines:
            # | `path` | **Name** | License | ...
            if "| `games/" in line or "| `projects/" in line:
                parts = [p.strip() for p in line.split('|')]
                if len(parts) >= 4:
                    name = parts[2].replace('**', '')
                    license = parts[3]
                    entries.append({
                        "term": f"Lib: {name}",
                        "definition": f"Third-party library used in the repository.",
                        "category": "Legal",
                        "description": f"License: {license}."
                    })

        entries.append({
            "term": "MIT License",
            "definition": "The primary open-source license for the F.O.N.G. repository.",
            "category": "Legal"
        })

        return entries
    except Exception as e:
        print(f"Error parsing LICENSE_AUDIT.md: {e}")
        return []

def main():
    all_entries = []

    # 1. Projects (Base)
    projects = parse_projects_js()
    # 2. Projects Metadata (Enrichment)
    projects_meta = parse_projects_md()

    # Merge Project Metadata into Projects
    # Create a map of normalized term -> entry
    project_map = {p['term'].lower(): p for p in projects}

    for meta in projects_meta:
        key = meta['term'].lower()
        if key in project_map:
            # Enrich existing
            if 'description' in meta:
                # Append to existing desc if any
                curr = project_map[key].get('definition', '')
                project_map[key]['description'] = meta['description'] # Use meta description as extended info
        else:
            # Add new if not in projects.js (rare but possible)
            all_entries.append(meta)

    all_entries.extend(projects)

    # 3. Agents
    all_entries.extend(parse_agents_md())

    # 4. Tech Stack
    all_entries.extend(parse_readme_md())

    # 5. Registry/Info
    all_entries.extend(parse_info_md())

    # 6. URL Params
    all_entries.extend(parse_url_parameters_md())

    # 7. Licenses
    all_entries.extend(parse_license_audit_md())

    # Sort
    all_entries.sort(key=lambda x: x['term'].lower())

    # Dedup by Term
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
