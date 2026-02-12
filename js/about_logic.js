
// State to track expanded nodes
var expandedState = {};

function initAboutSection() {
    console.log("Initializing About Section...");
    renderSidebar();
    renderGeneralAbout();

    // Attach event listener to Expand/Collapse All button
    var toggleAllBtn = document.getElementById('sidebar-toggle-all');
    if (toggleAllBtn) {
        toggleAllBtn.addEventListener('click', function() {
            var isExpand = toggleAllBtn.dataset.state === 'collapsed';
            toggleSidebar(isExpand);
            toggleAllBtn.dataset.state = isExpand ? 'expanded' : 'collapsed';
            toggleAllBtn.textContent = isExpand ? 'Collapse All' : 'Expand All';
        });
    }
}

function renderSidebar() {
    var sidebar = document.getElementById('about-tree');
    if (!sidebar) return;

    sidebar.innerHTML = '';
    var ul = document.createElement('ul');
    ul.className = 'tree-root';

    var members = Object.keys(teamData);
    var m, memberKey, memberLi, yearUl, logs, years, y, yearKey, yearLi, monthUl, months, mo, monthKey, monthLi, dayUl, days, d, dayKey, dayLi;

    for (m = 0; m < members.length; m++) {
        memberKey = members[m];
        memberLi = createTreeNode(memberKey, 'member', memberKey);
        yearUl = document.createElement('ul');
        yearUl.className = 'tree-children';

        // Add click handler to show member profile (use IIFE to capture memberKey)
        (function(key) {
            memberLi.querySelector('.tree-content').addEventListener('click', function(e) {
                e.stopPropagation();
                renderTeamSection(key);
            });
        })(memberKey);

        logs = teamData[memberKey].logs;
        years = Object.keys(logs).sort(function(a, b) { return b - a; });

        for (y = 0; y < years.length; y++) {
            yearKey = years[y];
            yearLi = createTreeNode(yearKey, 'year', memberKey + '-' + yearKey);
            monthUl = document.createElement('ul');
            monthUl.className = 'tree-children';

            months = Object.keys(logs[yearKey]).sort(function(a, b) { return b - a; });

            for (mo = 0; mo < months.length; mo++) {
                monthKey = months[mo];
                monthLi = createTreeNode(monthKey, 'month', memberKey + '-' + yearKey + '-' + monthKey);
                dayUl = document.createElement('ul');
                dayUl.className = 'tree-children';

                days = Object.keys(logs[yearKey][monthKey]).sort(function(a, b) { return b - a; });

                for (d = 0; d < days.length; d++) {
                    dayKey = days[d];
                    dayLi = createTreeNode(dayKey, 'day', memberKey + '-' + yearKey + '-' + monthKey + '-' + dayKey);
                    // Clicking a day scrolls to that specific log entry (use IIFE)
                    (function(mk, yk, mok, dk) {
                        dayLi.querySelector('.tree-content').addEventListener('click', function(e) {
                            e.stopPropagation();
                            renderTeamSection(mk);
                            setTimeout(function() {
                                var el = document.getElementById('log-' + yk + '-' + mok + '-' + dk);
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 100);
                        });
                    })(memberKey, yearKey, monthKey, dayKey);
                    dayUl.appendChild(dayLi);
                }

                if (days.length > 0) {
                    monthLi.appendChild(dayUl);
                    monthUl.appendChild(monthLi);
                }
            }

            if (months.length > 0) {
                yearLi.appendChild(monthUl);
                yearUl.appendChild(yearLi);
            }
        }

        if (years.length > 0) {
            memberLi.appendChild(yearUl);
        }
        ul.appendChild(memberLi);
    }

    sidebar.appendChild(ul);

    // Default: Expand Members and Years, Collapse Months and Days
    setInitialExpansion();
}

function setInitialExpansion() {
    var members = document.querySelectorAll('.tree-node-container.type-member');
    var i;
    for (i = 0; i < members.length; i++) members[i].classList.remove('collapsed');

    var years = document.querySelectorAll('.tree-node-container.type-year');
    for (i = 0; i < years.length; i++) years[i].classList.remove('collapsed');

    var months = document.querySelectorAll('.tree-node-container.type-month');
    for (i = 0; i < months.length; i++) months[i].classList.add('collapsed');

    var days = document.querySelectorAll('.tree-node-container.type-day');
    for (i = 0; i < days.length; i++) days[i].classList.add('collapsed');

    // Reset toggle button state
    var toggleAllBtn = document.getElementById('sidebar-toggle-all');
    if (toggleAllBtn) {
        toggleAllBtn.dataset.state = 'collapsed';
        toggleAllBtn.textContent = 'Expand All';
    }
}

function createTreeNode(label, type, id) {
    var li = document.createElement('li');
    li.className = 'tree-node-container type-' + type;

    var div = document.createElement('div');
    div.className = 'tree-content';
    div.dataset.id = id;

    // Toggle Icon
    var icon = document.createElement('span');
    icon.className = 'tree-toggle';
    icon.innerHTML = '&#9654;'; // ▶ Will rotate with CSS

    var text = document.createElement('span');
    text.className = 'tree-label';
    text.textContent = label;

    div.appendChild(icon);
    div.appendChild(text);

    div.addEventListener('click', function() {
        // Toggle expansion
        var parentLi = this.parentElement;
        parentLi.classList.toggle('collapsed');
    });

    li.appendChild(div);
    return li;
}

function toggleSidebar(expand) {
    var nodes = document.querySelectorAll('.tree-node-container');
    var i;
    for (i = 0; i < nodes.length; i++) {
        if (expand) {
            nodes[i].classList.remove('collapsed');
        } else {
            nodes[i].classList.add('collapsed');
        }
    }
}

function renderGeneralAbout() {
    var content = document.getElementById('about-content');
    if (!content) return;

    content.innerHTML =
        '<article class="about-article fade-in">' +
            '<h1>About F.O.N.G.</h1>' +
            '<p class="lead">A Personal Portfolio &amp; Experimental Sandbox.</p>' +
            '<div class="team-grid">' +
                '<div class="team-card" onclick="renderTeamSection(\'Wayne\')">' +
                    '<div class="avatar">&#x1F468;&#x200D;&#x1F4BC;</div>' +
                    '<h3>Wayne</h3>' +
                    '<p>Program Lead</p>' +
                '</div>' +
                '<div class="team-card" onclick="renderTeamSection(\'Jules\')">' +
                    '<div class="avatar">&#x1F468;&#x200D;&#x1F4BB;</div>' +
                    '<h3>Jules</h3>' +
                    '<p>Lead Integrator</p>' +
                '</div>' +
                '<div class="team-card" onclick="renderTeamSection(\'Claude\')">' +
                    '<div class="avatar">&#x1F3D7;&#xFE0F;</div>' +
                    '<h3>Claude</h3>' +
                    '<p>Systems Engineer</p>' +
                '</div>' +
                '<div class="team-card" onclick="renderTeamSection(\'Gemini\')">' +
                    '<div class="avatar">&#x1F9E0;</div>' +
                    '<h3>Gemini</h3>' +
                    '<p>Strategy &amp; Data</p>' +
                '</div>' +
            '</div>' +
            '<div class="general-text">' +
                '<p>' +
                    'Welcome to the <strong>Federated Online Network of Games (F.O.N.G.)</strong>. ' +
                    'This project represents a collaboration between human intent and artificial intelligence execution.' +
                '</p>' +
                '<p>' +
                    'Our <span class="tiny-hypothesis" title="All things are made of atoms - Richard Feynman">Hypothesis</span> is that ' +
                    'structured collaboration between specialized LLM agents can produce production-grade software ' +
                    'with minimal human friction.' +
                '</p>' +
            '</div>' +
        '</article>';
}

function renderTeamSection(memberKey) {
    var content = document.getElementById('about-content');
    if (!content) return;

    var member = teamData[memberKey];
    if (!member) return;

    var html =
        '<article class="member-profile fade-in">' +
            '<header class="profile-header">' +
                '<button class="back-btn" onclick="renderGeneralAbout()">&#8592; Back</button>' +
                '<h1>' + memberKey + '</h1>' +
                '<div class="role-badge">' + member.role + '</div>' +
                '<div class="archetype"><em>' + (member.archetype || '') + '</em></div>' +
            '</header>' +
            '<section class="bio-section">' +
                '<p>' + member.bio + '</p>' +
            '</section>';

    if (member.reflections && member.reflections.length > 0) {
        html += '<section class="reflections-section"><h3>Reflections</h3><div class="reflection-grid">';
        var r, i;
        for (i = 0; i < member.reflections.length; i++) {
            r = member.reflections[i];
            html +=
                '<div class="reflection-card">' +
                    '<strong>' + r.subject + '</strong>' +
                    '<p>' + r.thought + '</p>' +
                '</div>';
        }
        html += '</div></section>';
    }

    html += '<section class="logs-section"><h3>Contribution Log</h3><div class="timeline">';

    // Logs
    var years = Object.keys(member.logs).sort(function(a, b) { return b - a; });
    var y, yearKey, months, mo, monthKey, days, d, dayKey, entries, e, entry;

    for (y = 0; y < years.length; y++) {
        yearKey = years[y];
        months = Object.keys(member.logs[yearKey]).sort(function(a, b) { return b - a; });
        for (mo = 0; mo < months.length; mo++) {
            monthKey = months[mo];
            days = Object.keys(member.logs[yearKey][monthKey]).sort(function(a, b) { return b - a; });
            for (d = 0; d < days.length; d++) {
                dayKey = days[d];
                entries = member.logs[yearKey][monthKey][dayKey];
                for (e = 0; e < entries.length; e++) {
                    entry = entries[e];
                    html +=
                        '<div class="log-entry" id="log-' + yearKey + '-' + monthKey + '-' + dayKey + '">' +
                            '<div class="log-meta">' +
                                '<span class="log-date">' + yearKey + '-' + monthKey + '-' + dayKey + '</span>' +
                            '</div>' +
                            '<div class="log-body">' +
                                '<h4>' + entry.title + '</h4>' +
                                '<div class="log-text">' + entry.content + '</div>' +
                            '</div>' +
                        '</div>';
                }
            }
        }
    }

    html += '</div></section></article>';
    content.innerHTML = html;
}
