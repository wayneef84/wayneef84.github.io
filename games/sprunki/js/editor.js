/**
 * SprunkiEditor - Character Creator Modal (ES5)
 */
var SprunkiEditor = (function () {

    function injectHTML() {
        var div = document.createElement('div');
        div.className = 'modal-overlay';
        div.id = 'editorModal';
        div.innerHTML =
            '<div class="modal">' +
                '<h2>Create Sprunki</h2>' +
                '<div class="preview-container">' +
                    '<img id="previewImg" src="" class="preview-img" alt="Preview">' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>Name</label>' +
                    '<input type="text" id="editName" placeholder="e.g. My Cool Beat">' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>Type</label>' +
                    '<select id="editType">' +
                        '<option value="beats">Beats</option>' +
                        '<option value="effects">Effects</option>' +
                        '<option value="melodies">Melodies</option>' +
                        '<option value="vocals">Vocals</option>' +
                    '</select>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>Image URL</label>' +
                    '<input type="text" id="editImg" placeholder="https://...">' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>Crop (X, Y, Scale)</label>' +
                    '<div class="crop-controls">' +
                        '<input type="range" id="cropX" min="0" max="100" value="50" title="X Position">' +
                        '<input type="range" id="cropY" min="0" max="100" value="50" title="Y Position">' +
                        '<input type="range" id="cropScale" min="1" max="5" step="0.1" value="1" title="Scale">' +
                    '</div>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>Audio URL</label>' +
                    '<input type="text" id="editAudio" placeholder="https://... (.wav/.mp3)">' +
                '</div>' +
                '<div class="btn-row">' +
                    '<button class="btn btn-secondary" id="btnCancelEdit">Cancel</button>' +
                    '<button class="btn btn-primary" id="btnSaveEdit">Save Character</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(div);
    }

    function bindEvents() {
        document.getElementById('btnCancelEdit').onclick = function () { close(); };
        document.getElementById('btnSaveEdit').onclick = function () { save(); };

        var imgInput = document.getElementById('editImg');
        var preview = document.getElementById('previewImg');

        imgInput.addEventListener('input', function () {
            preview.src = imgInput.value || '';
        });

        var updateCrop = function () {
            var x = document.getElementById('cropX').value;
            var y = document.getElementById('cropY').value;
            var s = document.getElementById('cropScale').value;

            preview.style.setProperty('--crop-x', x + '%');
            preview.style.setProperty('--crop-y', y + '%');
            preview.style.setProperty('--crop-scale', s);
        };

        var cropIds = ['cropX', 'cropY', 'cropScale'];
        for (var i = 0; i < cropIds.length; i++) {
            document.getElementById(cropIds[i]).addEventListener('input', updateCrop);
        }
    }

    function open() {
        document.getElementById('editorModal').classList.add('active');
    }

    function close() {
        document.getElementById('editorModal').classList.remove('active');
        clearForm();
    }

    function clearForm() {
        document.getElementById('editName').value = '';
        document.getElementById('editImg').value = '';
        document.getElementById('editAudio').value = '';
        document.getElementById('previewImg').src = '';
        document.getElementById('cropX').value = 50;
        document.getElementById('cropY').value = 50;
        document.getElementById('cropScale').value = 1;
    }

    function save() {
        var name = document.getElementById('editName').value;
        var type = document.getElementById('editType').value;
        var img = document.getElementById('editImg').value;
        var audio = document.getElementById('editAudio').value;

        if (!name || !img || !audio) {
            alert('Please fill all fields');
            return;
        }

        var charData = {
            id: 'custom_' + Date.now(),
            name: name,
            type: type,
            img: img,
            audio: audio,
            pack_id: 'custom',
            custom: true,
            crop: {
                x: document.getElementById('cropX').value,
                y: document.getElementById('cropY').value,
                scale: document.getElementById('cropScale').value
            }
        };

        window.CustomSprunkiManager.saveCharacter(charData);
        alert('Character Saved! Reloading...');
        location.reload();
    }

    // Initialize on load
    injectHTML();
    bindEvents();

    return {
        open: open,
        close: close
    };
})();

window.SprunkiEditor = SprunkiEditor;
