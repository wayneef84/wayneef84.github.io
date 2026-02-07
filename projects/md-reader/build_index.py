import os
import json

# Configuration
ROOT_DIR = "../../" # Relative to projects/md-reader/
OUTPUT_FILE = "projects/md-reader/repo_index.js"
ALLOWED_EXTENSIONS = {
    '.md', '.markdown', '.txt',
    '.csv', '.json', '.xml',
    '.js', '.html', '.css', '.py',
    '.sh', '.bat', '.yaml', '.yml'
}
SKIP_DIRS = {
    '.git', 'node_modules', '__pycache__',
    '.DS_Store', 'dist', 'build', 'coverage'
}

def scan_repo():
    file_list = []

    # Walk the tree starting from repo root
    # Since script is running from root, and we want to index from root
    # We will walk "." but exclude the script itself and output

    start_dir = "."

    for root, dirs, files in os.walk(start_dir):
        # Filter directories in place
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for file in files:
            name, ext = os.path.splitext(file)
            if ext.lower() in ALLOWED_EXTENSIONS:
                path = os.path.join(root, file)

                # Normalize path for web (forward slashes)
                web_path = path.replace("\\", "/")

                # Create relative path for the MD Reader which sits in projects/md-reader/
                # The MD Reader needs "../../" to get to root.
                # If web_path is "./foo.md", relative from md-reader is "../../foo.md"
                # If web_path is "games/foo.md", relative is "../../games/foo.md"

                if web_path.startswith("./"):
                    relative_path = "../../" + web_path[2:]
                else:
                    relative_path = "../../" + web_path

                # Determine Category based on first directory
                parts = web_path.split("/")
                category = "Root"
                if len(parts) > 1 and parts[0] == ".":
                     if len(parts) > 2:
                         category = parts[1].capitalize()
                elif len(parts) > 1:
                    category = parts[0].capitalize()

                # Special casing for known directories for better grouping
                if "games" in web_path:
                    category = "Games"
                    # Try to get subcategory (Game Name)
                    # ./games/snake/... -> Game: Snake
                    try:
                        idx = parts.index("games")
                        if idx + 1 < len(parts):
                            game_name = parts[idx+1].replace("_", " ").title()
                            category = f"Games ({game_name})"
                    except:
                        pass

                elif "docs" in web_path:
                    category = "Documentation"
                elif "projects" in web_path:
                    category = "Projects"

                file_list.append({
                    "name": file,
                    "path": relative_path,
                    "category": category,
                    "type": ext.lower().replace(".", "")
                })

    return file_list

def write_index(file_list):
    content = f"// Auto-generated repository index\nvar REPO_FILES = {json.dumps(file_list, indent=2)};"
    with open(OUTPUT_FILE, "w") as f:
        f.write(content)
    print(f"Indexed {len(file_list)} files to {OUTPUT_FILE}")

if __name__ == "__main__":
    files = scan_repo()
    write_index(files)
