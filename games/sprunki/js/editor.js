class SprunkiEditorManager {
    constructor() {
        this.injectHTML();
        this.bindEvents();
    }

    injectHTML() {
        const div = document.createElement('div');
        div.className = 'modal-overlay';
        div.id = 'editorModal';
        div.innerHTML = `
            <div class="modal">
                <h2>Create Sprunki</h2>

                <div class="form-group">
                    <label>Load from Existing (Optional)</label>
                    <select id="assetPicker" style="background: #333; color: white; padding: 5px; width: 100%;">
                        <option value="">-- Select Base --</option>
                    </select>
                </div>

                <div class="preview-container">
                    <img id="previewImg" src="" class="preview-img" alt="Preview" style="display: none;">
                    <div id="previewPlaceholder" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#555;">No Image</div>
                </div>

                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="editName" placeholder="e.g. My Cool Beat">
                </div>

                <div class="form-group">
                    <label>Type</label>
                    <select id="editType">
                        <option value="beats">Beats</option>
                        <option value="effects">Effects</option>
                        <option value="melodies">Melodies</option>
                        <option value="vocals">Vocals</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Image URL</label>
                    <input type="text" id="editImg" placeholder="https://... or relative path">
                </div>

                <div class="form-group">
                    <label>Crop (X, Y, Scale)</label>
                    <div class="crop-controls">
                        <input type="range" id="cropX" min="0" max="100" value="50" title="X Position">
                        <input type="range" id="cropY" min="0" max="100" value="50" title="Y Position">
                        <input type="range" id="cropScale" min="1" max="5" step="0.1" value="1" title="Scale">
                    </div>
                </div>

                <div class="form-group">
                    <label>Audio URL</label>
                    <input type="text" id="editAudio" placeholder="https://... (.wav/.mp3)">
                </div>

                <div class="btn-row">
                    <button class="btn btn-secondary" id="btnCancelEdit">Cancel</button>
                    <button class="btn btn-primary" id="btnSaveEdit">Save Character</button>
                </div>
            </div>
        `;
        document.body.appendChild(div);
    }

    bindEvents() {
        document.getElementById('btnCancelEdit').onclick = () => this.close();
        document.getElementById('btnSaveEdit').onclick = () => this.save();

        // Asset Picker Logic
        const picker = document.getElementById('assetPicker');
        picker.onchange = () => {
            const charId = picker.value;
            if (!charId || !config) return;

            const char = config.characters.find(c => c.id === charId);
            if (char) {
                // Determine path. If it's a built-in char, path is usually relative to pack base.
                // But config.characters just has "img/b01.svg".
                // We need the FULL relative path from index.html.
                // We can find the pack and get base_path.
                const pack = config.packs.find(p => p.id === char.pack_id);
                const basePath = pack ? pack.base_path : '';

                // Helper to clean path
                const resolve = (p) => {
                    if (p.startsWith('http') || p.startsWith('data:')) return p;
                    // If it starts with ../ it might be tricky depending on where we are.
                    // Sprunki index is in games/sprunki/.
                    // Pack base "./assets/..." works.
                    return basePath + p;
                };

                document.getElementById('editImg').value = resolve(char.img);
                document.getElementById('editAudio').value = resolve(char.audio);
                document.getElementById('editName').value = char.name + " (Remix)";
                document.getElementById('editType').value = char.type;

                // Trigger preview update
                this.updatePreview();
            }
        };

        // Live Preview
        const imgInput = document.getElementById('editImg');
        imgInput.addEventListener('input', () => this.updatePreview());

        // Crop Controls
        const updateCrop = () => {
            const x = document.getElementById('cropX').value;
            const y = document.getElementById('cropY').value;
            const s = document.getElementById('cropScale').value;

            const preview = document.getElementById('previewImg');
            preview.style.setProperty('--crop-x', `${x}%`);
            preview.style.setProperty('--crop-y', `${y}%`);
            preview.style.setProperty('--crop-scale', s);
        };

        ['cropX', 'cropY', 'cropScale'].forEach(id => {
            document.getElementById(id).addEventListener('input', updateCrop);
        });
    }

    populateAssetPicker() {
        const picker = document.getElementById('assetPicker');
        // Clear except first
        picker.innerHTML = '<option value="">-- Select Base --</option>';

        if (!config || !config.characters) return;

        // Sort by pack then name
        config.characters.forEach(char => {
            if (char.custom) return; // Don't allow picking from other customs to avoid circular issues or complexity
            const opt = document.createElement('option');
            opt.value = char.id;
            opt.textContent = `[${char.pack_id}] ${char.name}`;
            picker.appendChild(opt);
        });
    }

    updatePreview() {
        const imgInput = document.getElementById('editImg');
        const preview = document.getElementById('previewImg');
        const placeholder = document.getElementById('previewPlaceholder');

        const src = imgInput.value.trim();

        if (!src) {
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
            return;
        }

        preview.onload = () => {
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        };

        preview.onerror = () => {
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
            placeholder.textContent = "Image Not Found";
        };

        preview.src = src;
    }

    open() {
        document.getElementById('editorModal').classList.add('active');
        this.populateAssetPicker();
    }

    close() {
        document.getElementById('editorModal').classList.remove('active');
        this.clearForm();
    }

    clearForm() {
        document.getElementById('assetPicker').value = '';
        document.getElementById('editName').value = '';
        document.getElementById('editImg').value = '';
        document.getElementById('editAudio').value = '';
        this.updatePreview();

        // Reset crop
        document.getElementById('cropX').value = 50;
        document.getElementById('cropY').value = 50;
        document.getElementById('cropScale').value = 1;
    }

    async save() {
        const name = document.getElementById('editName').value;
        const type = document.getElementById('editType').value;
        const img = document.getElementById('editImg').value;
        const audio = document.getElementById('editAudio').value;

        if (!name || !img || !audio) {
            alert('Please fill all fields');
            return;
        }

        const charData = {
            id: `custom_${Date.now()}`,
            name, type, img, audio, pack_id: 'custom',
            custom: true,
            crop: {
                x: document.getElementById('cropX').value,
                y: document.getElementById('cropY').value,
                scale: document.getElementById('cropScale').value
            }
        };

        await window.CustomSprunkiManager.saveCharacter(charData);
        alert('Character Saved! Reloading...');
        location.reload();
    }
}

window.SprunkiEditor = new SprunkiEditorManager();
