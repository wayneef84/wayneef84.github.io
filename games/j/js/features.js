/**
 * J-Engine Feature Extensions
 * Additional features: Sidebar, Main Menu, Mute, Category Management
 */

(function() {
    'use strict';

    // State
    var isMuted = localStorage.getItem('j_muted') === 'true';
    var categoryOrder = JSON.parse(localStorage.getItem('j_category_order') || '[]');
    var sidebarOpen = false;

    // DOM Elements
    var dom = {
        sidebar: document.getElementById('categorySidebar'),
        sidebarToggle: document.getElementById('sidebarToggle'),
        categoryList: document.getElementById('categoryList'),
        packSelector: document.getElementById('packSelector'),
        menuBtn: document.getElementById('menuBtn'),
        mainMenu: document.getElementById('mainMenu'),
        closeMenuBtn: document.getElementById('closeMenuBtn'),
        resetRecordsBtn: document.getElementById('resetRecordsBtn'),
        exportDataBtn: document.getElementById('exportDataBtn'),
        importDataBtn: document.getElementById('importDataBtn'),
        categoryOrderList: document.getElementById('categoryOrderList'),
        muteBtn: document.getElementById('muteBtn'),
        historyTop: document.getElementById('historyTop')
    };

    // Initialize
    function init() {
        // Mute button
        if (dom.muteBtn) {
            dom.muteBtn.textContent = isMuted ? '\uD83D\uDD07' : '\uD83D\uDD0A';
            dom.muteBtn.classList.toggle('muted', isMuted);
            dom.muteBtn.addEventListener('click', toggleMute);
        }

        // Sidebar toggle
        if (dom.sidebarToggle) {
            dom.sidebarToggle.addEventListener('click', toggleSidebar);
        }

        // Main menu
        if (dom.menuBtn) {
            dom.menuBtn.addEventListener('click', openMainMenu);
        }

        if (dom.closeMenuBtn) {
            dom.closeMenuBtn.addEventListener('click', closeMainMenu);
        }

        // Reset records
        if (dom.resetRecordsBtn) {
            dom.resetRecordsBtn.addEventListener('click', resetAllRecords);
        }

        // Export/Import
        if (dom.exportDataBtn) {
            dom.exportDataBtn.addEventListener('click', exportData);
        }

        if (dom.importDataBtn) {
            dom.importDataBtn.addEventListener('click', importData);
        }

        // Make this available globally
        window.JFeatures = {
            populateCategories: populateCategories,
            populateCategoryOrder: populateCategoryOrder,
            moveHistoryToTop: moveHistoryToTop,
            isMuted: function() { return isMuted; }
        };
    }

    // Mute functionality
    function toggleMute() {
        isMuted = !isMuted;
        localStorage.setItem('j_muted', isMuted);
        dom.muteBtn.textContent = isMuted ? '\uD83D\uDD07' : '\uD83D\uDD0A';
        dom.muteBtn.classList.toggle('muted', isMuted);

        // Stop any ongoing speech
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }

    // Sidebar functionality
    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
        dom.sidebar.classList.toggle('collapsed', !sidebarOpen);
        dom.packSelector.classList.toggle('sidebar-open', sidebarOpen);
    }

    // Populate categories in sidebar
    function populateCategories(manifest) {
        if (!dom.categoryList || !manifest.groups) return;

        var categories = manifest.groups;
        var html = '<div class="category-item active" data-category="all">' +
                   '<span>All Categories</span>' +
                   '<span class="count">' + manifest.packs.length + '</span>' +
                   '</div>';

        categories.forEach(function(cat) {
            var count = manifest.packs.filter(function(p) {
                return p.category === cat.id;
            }).length;

            html += '<div class="category-item" data-category="' + cat.id + '">' +
                    '<span>' + cat.name + '</span>' +
                    '<span class="count">' + count + '</span>' +
                    '</div>';
        });

        dom.categoryList.innerHTML = html;

        // Add click handlers
        dom.categoryList.querySelectorAll('.category-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var category = this.getAttribute('data-category');
                filterByCategory(category);

                // Update active state
                dom.categoryList.querySelectorAll('.category-item').forEach(function(i) {
                    i.classList.remove('active');
                });
                this.classList.add('active');
            });
        });
    }

    // Filter packs by category
    function filterByCategory(categoryId) {
        var packCards = document.querySelectorAll('.pack-card');
        packCards.forEach(function(card) {
            if (categoryId === 'all') {
                card.style.display = '';
            } else {
                var packCategory = card.getAttribute('data-category');
                card.style.display = (packCategory === categoryId) ? '' : 'none';
            }
        });
    }

    // Main menu
    function openMainMenu() {
        dom.mainMenu.classList.remove('hidden');
        populateCategoryOrder();
    }

    function closeMainMenu() {
        dom.mainMenu.classList.add('hidden');
    }

    // Reset all records
    function resetAllRecords() {
        if (confirm('Are you sure you want to delete ALL game records? This cannot be undone!')) {
            // Clear all localStorage keys related to game records
            var keys = Object.keys(localStorage);
            keys.forEach(function(key) {
                if (key.startsWith('j_history_') || key.startsWith('j_best_')) {
                    localStorage.removeItem(key);
                }
            });

            alert('All records have been reset!');
            closeMainMenu();

            // Refresh the page to update UI
            window.location.reload();
        }
    }

    // Export data
    function exportData() {
        var data = {};
        var keys = Object.keys(localStorage);

        keys.forEach(function(key) {
            if (key.startsWith('j_')) {
                data[key] = localStorage.getItem(key);
            }
        });

        var json = JSON.stringify(data, null, 2);
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'j-quiz-data-' + new Date().toISOString().split('T')[0] + '.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Import data
    function importData() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';

        input.onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;

            var reader = new FileReader();
            reader.onload = function(event) {
                try {
                    var data = JSON.parse(event.target.result);

                    if (confirm('Import data? This will overwrite existing records.')) {
                        Object.keys(data).forEach(function(key) {
                            localStorage.setItem(key, data[key]);
                        });

                        alert('Data imported successfully!');
                        window.location.reload();
                    }
                } catch (err) {
                    alert('Error importing data: Invalid file format');
                }
            };

            reader.readAsText(file);
        };

        input.click();
    }

    // Populate category order list for reordering
    function populateCategoryOrder() {
        if (!dom.categoryOrderList) return;

        // Get categories from manifest
        var categories = window.MANIFEST ? window.MANIFEST.groups : [];
        if (!categories || categories.length === 0) return;

        var html = '';
        categories.forEach(function(cat, index) {
            html += '<div class="category-order-item" data-id="' + cat.id + '" draggable="true">' +
                    '<span class="drag-handle">&#x2630;</span>' +
                    '<span class="name">' + cat.name + '</span>' +
                    '</div>';
        });

        dom.categoryOrderList.innerHTML = html;

        // Add drag and drop handlers
        var items = dom.categoryOrderList.querySelectorAll('.category-order-item');
        items.forEach(function(item) {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('drop', handleDrop);
            item.addEventListener('dragend', handleDragEnd);
        });
    }

    // Drag and drop handlers
    var dragSrcEl = null;

    function handleDragStart(e) {
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
        this.style.opacity = '0.4';
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        if (dragSrcEl !== this) {
            dragSrcEl.innerHTML = this.innerHTML;
            this.innerHTML = e.dataTransfer.getData('text/html');
        }

        return false;
    }

    function handleDragEnd(e) {
        this.style.opacity = '1';

        // Save new order
        var items = dom.categoryOrderList.querySelectorAll('.category-order-item');
        var newOrder = [];
        items.forEach(function(item) {
            newOrder.push(item.getAttribute('data-id'));
        });

        localStorage.setItem('j_category_order', JSON.stringify(newOrder));
    }

    // Move history to top of setup modal
    function moveHistoryToTop(packFile) {
        if (!dom.historyTop) return;

        var historyKey = 'j_history_' + packFile;
        var history = JSON.parse(localStorage.getItem(historyKey) || '[]');

        if (history.length === 0) {
            dom.historyTop.innerHTML = '';
            return;
        }

        // Show last 3 records
        var recent = history.slice(-3).reverse();
        var html = '<label class="setup-label">Recent Records</label>';

        recent.forEach(function(record) {
            var date = new Date(record.timestamp).toLocaleDateString();
            var percent = Math.round((record.correct / record.total) * 100);

            html += '<div class="history-item">' +
                    '<span class="score">' + record.correct + '/' + record.total + ' (' + percent + '%)</span>' +
                    '<span class="date">' + date + '</span>' +
                    '</div>';
        });

        dom.historyTop.innerHTML = html;
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
