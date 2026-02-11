
// State to track expanded nodes
const expandedState = {};

function initAboutSection() {
    console.log("Initializing About Section...");
    renderSidebar();
    // Default to showing General About or the first team member?
    // The prompt implies a "General About" section first.
    renderGeneralAbout();

    // Attach event listener to Expand/Collapse All button
    const toggleAllBtn = document.getElementById('sidebar-toggle-all');
    if (toggleAllBtn) {
        toggleAllBtn.addEventListener('click', () => {
            const isExpand = toggleAllBtn.dataset.state === 'collapsed';
            toggleSidebar(isExpand);
            toggleAllBtn.dataset.state = isExpand ? 'expanded' : 'collapsed';
            toggleAllBtn.textContent = isExpand ? 'Collapse All' : 'Expand All';
        });
    }
}

function renderSidebar() {
    const sidebar = document.getElementById('about-tree');
    if (!sidebar) return;

    sidebar.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'tree-root';

    // Order: Wayne, Jules, Claude, Gemini (as per prompt order in "Team Cards")
    // Or maybe just keys? Prompt says "Hierarchy must be LLM Name > Year > Month > Day"
    // Let's use the keys from teamData, but maybe prioritize a specific order if needed.
    // For now, Object.keys is fine.
    const members = Object.keys(teamData);

    members.forEach(member => {
        const memberLi = createTreeNode(member, 'member', member);
        const yearUl = document.createElement('ul');
        yearUl.className = 'tree-children';

        // Add click handler to show member profile
        memberLi.querySelector('.tree-content').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent toggling if we just want to view profile?
            // Actually, clicking the name should probably toggle AND show profile.
            // Let's separate the toggle arrow from the label if possible, or just have one action.
            // Common pattern: Click arrow to toggle, click text to view.
            renderTeamSection(member);
        });

        const logs = teamData[member].logs;
        const years = Object.keys(logs).sort((a, b) => b - a); // Descending

        years.forEach(year => {
            const yearLi = createTreeNode(year, 'year', `${member}-${year}`);
            const monthUl = document.createElement('ul');
            monthUl.className = 'tree-children';

            const months = Object.keys(logs[year]).sort((a, b) => b - a);

            months.forEach(month => {
                const monthLi = createTreeNode(month, 'month', `${member}-${year}-${month}`);
                const dayUl = document.createElement('ul');
                dayUl.className = 'tree-children';

                const days = Object.keys(logs[year][month]).sort((a, b) => b - a);

                days.forEach(day => {
                   const dayLi = createTreeNode(day, 'day', `${member}-${year}-${month}-${day}`);
                   // Clicking a day scrolls to that specific log entry?
                   dayLi.querySelector('.tree-content').addEventListener('click', (e) => {
                       e.stopPropagation();
                       renderTeamSection(member);
                       // TODO: Scroll to specific date
                       setTimeout(() => {
                           const el = document.getElementById(`log-${year}-${month}-${day}`);
                           if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                       }, 100);
                   });
                   dayUl.appendChild(dayLi);
                });

                if (days.length > 0) {
                    monthLi.appendChild(dayUl);
                    monthUl.appendChild(monthLi);
                }
            });

            if (months.length > 0) {
                yearLi.appendChild(monthUl);
                yearUl.appendChild(yearLi);
            }
        });

        if (years.length > 0) {
            memberLi.appendChild(yearUl);
        }
        ul.appendChild(memberLi);
    });

    sidebar.appendChild(ul);

    // Default: Expand Members and Years, Collapse Months and Days
    setInitialExpansion();
}

function setInitialExpansion() {
    const members = document.querySelectorAll('.tree-node-container.type-member');
    members.forEach(node => node.classList.remove('collapsed'));

    const years = document.querySelectorAll('.tree-node-container.type-year');
    years.forEach(node => node.classList.remove('collapsed'));

    const months = document.querySelectorAll('.tree-node-container.type-month');
    months.forEach(node => node.classList.add('collapsed'));

    const days = document.querySelectorAll('.tree-node-container.type-day');
    days.forEach(node => node.classList.add('collapsed'));

    // Reset toggle button state to "Expand All" since we have hidden items
    const toggleAllBtn = document.getElementById('sidebar-toggle-all');
    if (toggleAllBtn) {
        toggleAllBtn.dataset.state = 'collapsed';
        toggleAllBtn.textContent = 'Expand All';
    }
}

function createTreeNode(label, type, id) {
    const li = document.createElement('li');
    li.className = `tree-node-container type-${type}`;

    const div = document.createElement('div');
    div.className = 'tree-content';
    div.dataset.id = id;

    // Toggle Icon
    const icon = document.createElement('span');
    icon.className = 'tree-toggle';
    icon.innerHTML = '▶'; // Will rotate with CSS

    const text = document.createElement('span');
    text.className = 'tree-label';
    text.textContent = label;

    div.appendChild(icon);
    div.appendChild(text);

    div.addEventListener('click', function(e) {
        // Toggle expansion
        const parentLi = this.parentElement;
        parentLi.classList.toggle('collapsed');
        // Update state logic if needed
    });

    li.appendChild(div);
    return li;
}

function toggleSidebar(expand) {
    const nodes = document.querySelectorAll('.tree-node-container');
    nodes.forEach(node => {
        if (expand) {
            node.classList.remove('collapsed');
        } else {
            node.classList.add('collapsed');
        }
    });
}

function renderGeneralAbout() {
    const content = document.getElementById('about-content');
    if (!content) return;

    content.innerHTML = `
        <article class="about-article fade-in">
            <h1>About F.O.N.G.</h1>
            <p class="lead">A Personal Portfolio & Experimental Sandbox.</p>

            <div class="team-grid">
                <div class="team-card" onclick="renderTeamSection('Wayne')">
                    <div class="avatar">👨‍💼</div>
                    <h3>Wayne</h3>
                    <p>Program Lead</p>
                </div>
                <div class="team-card" onclick="renderTeamSection('Jules')">
                    <div class="avatar">👨‍💻</div>
                    <h3>Jules</h3>
                    <p>Lead Integrator</p>
                </div>
                <div class="team-card" onclick="renderTeamSection('Claude')">
                    <div class="avatar">🏗️</div>
                    <h3>Claude</h3>
                    <p>Systems Engineer</p>
                </div>
                 <div class="team-card" onclick="renderTeamSection('Gemini')">
                    <div class="avatar">🧠</div>
                    <h3>Gemini</h3>
                    <p>Strategy & Data</p>
                </div>
            </div>

            <div class="general-text">
                <p>
                    Welcome to the <strong>Federated Online Network of Games (F.O.N.G.)</strong>.
                    This project represents a collaboration between human intent and artificial intelligence execution.
                </p>
                <p>
                    Our <span class="tiny-hypothesis" title="All things are made of atoms — Richard Feynman">Hypothesis</span> is that
                    structured collaboration between specialized LLM agents can produce production-grade software
                    with minimal human friction.
                </p>
            </div>
        </article>
    `;
}

function renderTeamSection(memberKey) {
    const content = document.getElementById('about-content');
    if (!content) return;

    const member = teamData[memberKey];
    if (!member) return;

    let html = `
        <article class="member-profile fade-in">
            <header class="profile-header">
                <button class="back-btn" onclick="renderGeneralAbout()">← Back</button>
                <h1>${memberKey}</h1>
                <div class="role-badge">${member.role}</div>
                <div class="archetype"><em>${member.archetype || ''}</em></div>
            </header>

            <section class="bio-section">
                <p>${member.bio}</p>
            </section>
    `;

    if (member.reflections && member.reflections.length > 0) {
        html += `<section class="reflections-section"><h3>Reflections</h3><div class="reflection-grid">`;
        member.reflections.forEach(r => {
            html += `
                <div class="reflection-card">
                    <strong>${r.subject}</strong>
                    <p>${r.thought}</p>
                </div>
            `;
        });
        html += `</div></section>`;
    }

    html += `<section class="logs-section"><h3>Contribution Log</h3><div class="timeline">`;

    // Logs
    const years = Object.keys(member.logs).sort((a, b) => b - a);
    years.forEach(year => {
        const months = Object.keys(member.logs[year]).sort((a, b) => b - a);
        months.forEach(month => {
            const days = Object.keys(member.logs[year][month]).sort((a, b) => b - a);
            days.forEach(day => {
                const entries = member.logs[year][month][day];
                entries.forEach(entry => {
                    html += `
                        <div class="log-entry" id="log-${year}-${month}-${day}">
                            <div class="log-meta">
                                <span class="log-date">${year}-${month}-${day}</span>
                            </div>
                            <div class="log-body">
                                <h4>${entry.title}</h4>
                                <div class="log-text">${entry.content}</div>
                            </div>
                        </div>
                    `;
                });
            });
        });
    });

    html += `</div></section></article>`;
    content.innerHTML = html;
}
