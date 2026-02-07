import zipfile
import os
import sys

def package_project():
    source_dir = os.path.dirname(os.path.abspath(__file__))
    output_filename = os.path.join(source_dir, 'input-a11y-offline.zip')

    print(f"Packaging {source_dir} to {output_filename}...")

    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Files to include
        include_extensions = ['.html', '.js', '.css', '.md', '.txt', '.py', '.bat', '.sh']
        exclude_dirs = ['__pycache__', 'venv', '.git', '.idea', 'node_modules']

        for root, dirs, files in os.walk(source_dir):
            # Exclude directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, source_dir)

                # Filter extensions or specific files
                _, ext = os.path.splitext(file)
                if ext in include_extensions or file in ['LICENSE', 'requirements.txt']:
                    # Ensure we don't zip the zip itself
                    if file == os.path.basename(output_filename):
                        continue
                    if 'package_release.py' in file:
                         continue

                    print(f"Adding {rel_path}")
                    zipf.write(file_path, rel_path)

    print(f"Package created: {output_filename}")

if __name__ == "__main__":
    package_project()
