// Vanilla JS App Logic for WOS Upgrade Planner v3.0
(function() {
    'use strict';

    // -- State Management --
    var state = {
        activeTab: 'chief-gear',
        materials: JSON.parse(JSON.stringify(Object.assign({}, WOS_DATA.DEFAULT_MATERIALS, WOS_DATA.DEFAULT_SPEEDUPS))),
        chiefGear: JSON.parse(JSON.stringify(WOS_DATA.DEFAULT_CHIEF_GEAR)),
        chiefGearTargets: {
            global: { tier: 'Pink T2', stars: 0 },
            pieces: {}
        },
        charms: JSON.parse(JSON.stringify(WOS_DATA.DEFAULT_CHARMS)),
        charmTargets: {
            global: '11',
            pieces: {}
        },
        heroGear: JSON.parse(JSON.stringify(WOS_DATA.DEFAULT_HERO_GEAR)),
        heroGearTargets: {
            globalLevel: 'E60',
            globalForge: 15,
            pieces: {}
        },
        expanded: {},
        theme: 'dark'
    };

    // Load from localStorage if available
    try {
        var saved = localStorage.getItem('wos_planner_v3_state');
        if (saved) {
            var parsed = JSON.parse(saved);
            state.materials = parsed.materials || state.materials;
            state.chiefGear = parsed.chiefGear || state.chiefGear;
            state.chiefGearTargets = parsed.chiefGearTargets || state.chiefGearTargets;
            state.charms = parsed.charms || state.charms;
            state.charmTargets = parsed.charmTargets || state.charmTargets;
            state.heroGear = parsed.heroGear || state.heroGear;
            state.heroGearTargets = parsed.heroGearTargets || state.heroGearTargets;
            state.theme = parsed.theme || state.theme;
            // dont save expanded state or tab
        }
    } catch(e) { console.warn("Could not load state", e); }

    // Apply initial theme
    if (state.theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    function saveState() {
        try {
            localStorage.setItem('wos_planner_v3_state', JSON.stringify({
                materials: state.materials,
                chiefGear: state.chiefGear,
                chiefGearTargets: state.chiefGearTargets,
                charms: state.charms,
                charmTargets: state.charmTargets,
                heroGear: state.heroGear,
                heroGearTargets: state.heroGearTargets,
                theme: state.theme
            }));
        } catch(e) { console.warn("Could not save state", e); }
    }

    function toggleTheme() {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        if (state.theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        saveState();
    }

    // -- Utils --
    function toggleExpanded(key) {
        state.expanded[key] = !state.expanded[key];
        renderAll();
    }

    function setMaterial(key, val) {
        state.materials[key] = Math.max(0, parseInt(val, 10) || 0);
        saveState();
        renderAll();
    }

    // DOM Helpers
    function el(id) { return document.getElementById(id); }

    function createSelect(options, value, onChange, placeholder) {
        var sel = document.createElement('select');
        if (placeholder) {
            var opt = document.createElement('option');
            opt.value = "";
            opt.textContent = placeholder;
            sel.appendChild(opt);
        }
        for (var i = 0; i < options.length; i++) {
            var opt = document.createElement('option');
            opt.value = typeof options[i] === 'object' ? options[i].value : options[i];
            opt.textContent = typeof options[i] === 'object' ? options[i].label : options[i];
            sel.appendChild(opt);
        }
        sel.value = (value !== undefined && value !== null && value !== "") ? value : "";
        sel.addEventListener('change', onChange);
        return sel;
    }

    function escHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function createInput(type, value, onChange) {
        var inp = document.createElement('input');
        inp.type = type;
        inp.value = value;
        inp.addEventListener('change', onChange);
        return inp;
    }

    // -- Calculation Engine: Charms --
    function getCharmIndex(lv) { return WOS_DATA.CLV.indexOf(lv); }

    function calcCharmSteps(from, to) {
        var fi = getCharmIndex(from), ti = getCharmIndex(to);
        if (fi < 0 || ti <= fi) return [];
        var steps = [];
        for (var i = fi + 1; i <= ti; i++) {
            var lv = WOS_DATA.CLV[i], pv = WOS_DATA.CLV[i - 1], c = WOS_DATA.CD[lv];
            if (c) {
                steps.push({ from: pv, to: lv, g: c.g, d: c.d, j: c.j, sf: WOS_DATA.CD[pv] ? WOS_DATA.CD[pv].s : 0, st: c.s });
            }
        }
        return steps;
    }

    function calcCharmCost(from, to) {
        var steps = calcCharmSteps(from, to);
        var res = { g: 0, d: 0, j: 0, score: 0 };
        for (var i = 0; i < steps.length; i++) {
            res.g += steps[i].g;
            res.d += steps[i].d;
            res.j += steps[i].j;
            res.score += (steps[i].st - steps[i].sf);
        }
        return res;
    }

    // -- Calculation Engine: Hero Gear --
    function getHeroLevelIndex(lv) { return WOS_DATA.HL.indexOf(lv); }

    function parseHeroLevel(lv) {
        if (!lv) return { p: "M", l: 1 };
        return { p: lv.charAt(0), l: parseInt(lv.substring(1), 10) };
    }

    function calcHeroXp(from, to) {
        var fi = getHeroLevelIndex(from), ti = getHeroLevelIndex(to);
        if (fi < 0 || ti <= fi) return 0;
        var t = 0;
        for (var i = fi + 1; i <= ti; i++) {
            var parsed = parseHeroLevel(WOS_DATA.HL[i]);
            if (parsed.p === "M") t += (WOS_DATA.GOLD_XP[parsed.l] || 0);
            else t += (WOS_DATA.EMP_XP[parsed.l] || 0);
        }
        return t;
    }

    function calcHeroGates(from, to) {
        var fp = parseHeroLevel(from), tp = parseHeroLevel(to);
        var mi = 0, mg = 0, gates = [];
        var transmute = (fp.p === "M" && tp.p === "E") ? 2 : 0;

        if (tp.p === "E") {
            var ef = fp.p === "E" ? fp.l : 0;
            WOS_DATA.EMP_GATES.forEach(function(g) {
                if (g.e > ef && g.e <= tp.l) {
                    mi += g.mi; mg += g.mg; gates.push(g);
                }
            });
        }
        return { mi: mi, mg: mg, transmute: transmute, gates: gates };
    }

    function calcForgeCost(from, to) {
        var s = 0, g = 0;
        for (var i = from + 1; i <= to; i++) {
            s += i * 10;
            g += Math.max(0, i - 10);
        }
        return { s: s, g: g };
    }

    // -- Calculation Engine: Chief Gear --
    function getChiefGearIndex(tier, stars) {
        for (var i = 0; i < WOS_DATA.CHIEF_GEAR_COSTS.length; i++) {
            if (WOS_DATA.CHIEF_GEAR_COSTS[i].tier === tier && WOS_DATA.CHIEF_GEAR_COSTS[i].stars === stars) {
                return i;
            }
        }
        return -1;
    }

    function calcChiefGearCost(fromTier, fromStars, toTier, toStars) {
        var fromIdx = getChiefGearIndex(fromTier, fromStars);
        var toIdx = getChiefGearIndex(toTier, toStars);
        var cost = { alloy: 0, polish: 0, plans: 0, amber: 0, steps: 0 };

        if (fromIdx === -1 || toIdx === -1 || fromIdx >= toIdx) return cost;

        for (var i = fromIdx + 1; i <= toIdx; i++) {
            var step = WOS_DATA.CHIEF_GEAR_COSTS[i];
            cost.alloy += step.alloy;
            cost.polish += step.polish;
            cost.plans += step.plans;
            cost.amber += step.amber;
            cost.steps++;
        }
        return cost;
    }

    function checkSetBonus(gearState) {
        var tiers = {};
        for (var key in gearState) {
            var t = gearState[key].tier;
            tiers[t] = (tiers[t] || 0) + 1;
        }
        var bonuses = [];
        for (var t in tiers) {
            if (tiers[t] >= 6) bonuses.push("6-piece " + t + " (ATK+DEF)");
            else if (tiers[t] >= 3) bonuses.push("3-piece " + t + " (DEF)");
        }
        return bonuses;
    }

    // -- Rendering: Chief Gear --
    function renderChiefGear() {
        // Materials
        var matGrid = el('cg-materials');
        matGrid.innerHTML = '';
        var mats = [
            { key: 'designPlans', label: 'Design Plans', color: 'text-blu' },
            { key: 'polishingSolution', label: 'Polish Sol.', color: 'text-yel' },
            { key: 'hardenedAlloy', label: 'Hard. Alloy', color: 'text-pur' }
        ];
        mats.forEach(function(m) {
            var div = document.createElement('div');
            div.className = 'material-item';
            div.innerHTML = '<div class="material-label">' + m.label + '</div>';
            var inp = createInput('number', state.materials[m.key], function(e) { setMaterial(m.key, e.target.value); });
            inp.className = 'material-input ' + m.color;
            div.appendChild(inp);
            matGrid.appendChild(div);
        });

        // Chest Opener
        var opener = el('cg-chest-opener');
        opener.innerHTML = '<div class="flex-between" style="margin-bottom:6px;"><div style="font-size:8px;color:var(--t2);">📦 Chief Gear Chests (1 DP + 4 PS + 400 HA)</div></div>';
        var opFlex = document.createElement('div');
        opFlex.style.display = 'flex'; opFlex.style.alignItems = 'center'; opFlex.style.gap = '6px';
        var chestInp = createInput('number', state.materials.chiefGearMaterialChests, function(e) { setMaterial('chiefGearMaterialChests', e.target.value); });
        chestInp.style.width = '70px';
        var btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = 'OPEN ALL';
        btn.onclick = function() {
            var c = state.materials.chiefGearMaterialChests;
            if (c > 0) {
                setMaterial('designPlans', state.materials.designPlans + c);
                setMaterial('polishingSolution', state.materials.polishingSolution + c * 4);
                setMaterial('hardenedAlloy', state.materials.hardenedAlloy + c * 400);
                setMaterial('chiefGearMaterialChests', 0);
            }
        };
        var resText = document.createElement('div');
        resText.style.fontSize = '8px'; resText.style.color = 'var(--t3)'; resText.style.flex = '1';
        resText.textContent = '+' + state.materials.chiefGearMaterialChests.toLocaleString() + ' DP • +' + (state.materials.chiefGearMaterialChests*4).toLocaleString() + ' PS • +' + (state.materials.chiefGearMaterialChests*400).toLocaleString() + ' HA';

        opFlex.appendChild(chestInp);
        opFlex.appendChild(btn);
        opFlex.appendChild(resText);
        opener.appendChild(opFlex);

        // Global Targets
        var gtGrid = el('cg-global-targets');
        gtGrid.innerHTML = '';
        var tDiv = document.createElement('div'); tDiv.className = 'target-item';
        tDiv.innerHTML = '<div class="target-label">TIER</div>';
        var tSel = createSelect(WOS_DATA.CTIERS, state.chiefGearTargets.global.tier, function(e) {
            state.chiefGearTargets.global.tier = e.target.value; saveState(); renderAll();
        });
        tDiv.appendChild(tSel);

        var sDiv = document.createElement('div'); sDiv.className = 'target-item';
        sDiv.innerHTML = '<div class="target-label">STARS</div>';
        var starOpts = [{value:0,label:'0★'},{value:1,label:'1★'},{value:2,label:'2★'},{value:3,label:'3★'}];
        var sSel = createSelect(starOpts, state.chiefGearTargets.global.stars, function(e) {
            state.chiefGearTargets.global.stars = parseInt(e.target.value, 10); saveState(); renderAll();
        });
        sDiv.appendChild(sSel);

        gtGrid.appendChild(tDiv);
        gtGrid.appendChild(sDiv);

        // Calculate Set Bonuses
        var currBonus = checkSetBonus(state.chiefGear);
        var tgtGearState = {};
        for(var k in state.chiefGear) {
            tgtGearState[k] = {
                tier: state.chiefGearTargets.pieces[k] && state.chiefGearTargets.pieces[k].tier ? state.chiefGearTargets.pieces[k].tier : state.chiefGearTargets.global.tier,
                stars: state.chiefGearTargets.pieces[k] && state.chiefGearTargets.pieces[k].stars !== undefined ? state.chiefGearTargets.pieces[k].stars : state.chiefGearTargets.global.stars
            };
        }
        var tgtBonus = checkSetBonus(tgtGearState);

        // Upgrades List
        var upgList = el('cg-upgrades');
        upgList.innerHTML = '';

        // Bonus summary header
        var bSum = document.createElement('div');
        bSum.className = 'card';
        bSum.innerHTML = '<div style="font-size:10px;color:var(--t2);">Current Bonus: <span class="text-grn">' + (currBonus.length ? currBonus.join(', ') : 'None') + '</span></div>' +
                         '<div style="font-size:10px;color:var(--t2);margin-top:4px;">Target Bonus: <span class="text-acc">' + (tgtBonus.length ? tgtBonus.join(', ') : 'None') + '</span></div>';
        upgList.appendChild(bSum);

        var totalCost = { alloy:0, polish:0, plans:0, amber:0 };

        WOS_DATA.SLOTS.forEach(function(slot) {
            var g = state.chiefGear[slot.slot];
            var tgT = state.chiefGearTargets.pieces[slot.slot] && state.chiefGearTargets.pieces[slot.slot].tier ? state.chiefGearTargets.pieces[slot.slot].tier : state.chiefGearTargets.global.tier;
            var tgS = state.chiefGearTargets.pieces[slot.slot] && state.chiefGearTargets.pieces[slot.slot].stars !== undefined ? state.chiefGearTargets.pieces[slot.slot].stars : state.chiefGearTargets.global.stars;

            var cost = calcChiefGearCost(g.tier, g.stars, tgT, tgS);
            if(cost.steps > 0) {
                totalCost.alloy += cost.alloy;
                totalCost.polish += cost.polish;
                totalCost.plans += cost.plans;
                totalCost.amber += cost.amber;
            }

            var card = document.createElement('div');
            card.className = 'expandable-card troop-' + slot.troop;

            var header = document.createElement('div');
            header.className = 'expandable-header';
            header.onclick = function() { toggleExpanded('cg_' + slot.slot); };

            var hLeft = '<div style="display:flex;align-items:center;gap:8px;">' +
                        '<span style="font-size:16px;">' + slot.icon + '</span>' +
                        '<div>' +
                        '<span style="font-family:\'Anybody\';font-size:12px;font-weight:700;" class="troop-' + slot.troop + '-text">' + slot.slot + '</span>' +
                        '<span style="font-size:9px;color:var(--t3);margin-left:6px;">' + slot.troop + '</span>' +
                        '<div style="font-size:8px;color:var(--t2);margin-top:1px;">' +
                        g.tier + ' ' + g.stars + '★' +
                        (cost.steps > 0 ? ' <span class="text-acc">→ ' + tgT + ' ' + tgS + '★</span>' : '') +
                        '</div></div></div>';

            var hRight = '<div style="display:flex;align-items:center;gap:6px;"><div class="text-right">';
            if (cost.steps > 0) {
                hRight += '<div style="font-size:8px;color:var(--t3);">' + (cost.alloy/1000).toFixed(0) + 'k A / ' + cost.polish + ' P / ' + cost.plans + ' DP' + (cost.amber ? ' / ' + cost.amber + ' L' : '') + '</div>';
            } else {
                hRight += '<div style="font-size:8px;color:var(--t3);">Maxed to Target</div>';
            }
            hRight += '</div><button class="xb ' + (state.expanded['cg_' + slot.slot] ? 'active' : '') + '">▾</button></div>';

            header.innerHTML = hLeft + hRight;
            card.appendChild(header);

            if (state.expanded['cg_' + slot.slot]) {
                var content = document.createElement('div');
                content.className = 'expandable-content active';

                // Current Config
                var curDiv = document.createElement('div');
                curDiv.style.background = 'rgba(0,0,0,0.2)'; curDiv.style.borderRadius = '8px'; curDiv.style.padding = '8px'; curDiv.style.marginBottom = '6px';
                curDiv.innerHTML = '<div style="font-size:7px;color:var(--t3);letter-spacing:1px;margin-bottom:4px;">CURRENT</div>';
                var curGrid = document.createElement('div'); curGrid.className = 'grid-2';

                var ctDiv = document.createElement('div'); ctDiv.innerHTML = '<div style="font-size:6px;color:var(--t3);">TIER</div>';
                var ctSel = createSelect(WOS_DATA.CTIERS, g.tier, function(e) { state.chiefGear[slot.slot].tier = e.target.value; saveState(); renderAll(); });
                ctDiv.appendChild(ctSel); curGrid.appendChild(ctDiv);

                var csDiv = document.createElement('div'); csDiv.innerHTML = '<div style="font-size:6px;color:var(--t3);">STARS</div>';
                var csSel = createSelect(starOpts, g.stars, function(e) { state.chiefGear[slot.slot].stars = parseInt(e.target.value, 10); saveState(); renderAll(); });
                csDiv.appendChild(csSel); curGrid.appendChild(csDiv);

                curDiv.appendChild(curGrid);

                // Target Config
                var tgtDiv = document.createElement('div');
                tgtDiv.innerHTML = '<div style="font-size:7px;color:var(--acc);letter-spacing:1px;margin-top:6px;margin-bottom:4px;">TARGET (blank = global)</div>';
                var tgtGrid = document.createElement('div'); tgtGrid.className = 'grid-2';

                var ttDiv = document.createElement('div'); ttDiv.innerHTML = '<div style="font-size:6px;color:var(--t3);">TIER</div>';
                var ttSel = createSelect(WOS_DATA.CTIERS, state.chiefGearTargets.pieces[slot.slot] ? state.chiefGearTargets.pieces[slot.slot].tier : "", function(e) {
                    if(!state.chiefGearTargets.pieces[slot.slot]) state.chiefGearTargets.pieces[slot.slot] = {};
                    state.chiefGearTargets.pieces[slot.slot].tier = e.target.value || undefined; saveState(); renderAll();
                }, "(" + state.chiefGearTargets.global.tier + ")");
                ttDiv.appendChild(ttSel); tgtGrid.appendChild(ttDiv);

                var tsDiv = document.createElement('div'); tsDiv.innerHTML = '<div style="font-size:6px;color:var(--t3);">STARS</div>';
                var tsSel = createSelect(starOpts, state.chiefGearTargets.pieces[slot.slot] && state.chiefGearTargets.pieces[slot.slot].stars !== undefined ? state.chiefGearTargets.pieces[slot.slot].stars : "", function(e) {
                    if(!state.chiefGearTargets.pieces[slot.slot]) state.chiefGearTargets.pieces[slot.slot] = {};
                    state.chiefGearTargets.pieces[slot.slot].stars = e.target.value === "" ? undefined : parseInt(e.target.value, 10); saveState(); renderAll();
                }, "(" + state.chiefGearTargets.global.stars + "★)");
                tsDiv.appendChild(tsSel); tgtGrid.appendChild(tsDiv);

                tgtDiv.appendChild(tgtGrid);
                curDiv.appendChild(tgtDiv);
                content.appendChild(curDiv);

                card.appendChild(content);
            }
            upgList.appendChild(card);
        });

        // Totals summary at bottom
        var tSum = document.createElement('div');
        tSum.className = 'card';
        tSum.innerHTML = '<div style="font-size:10px;font-weight:700;margin-bottom:6px;">TOTAL COST (All Pieces)</div>' +
            '<div class="grid-2">' +
            '<div class="text-center p-pill" style="background:var(--s2);"><div class="text-t3">Alloy</div><div class="text-pur">' + totalCost.alloy.toLocaleString() + '</div></div>' +
            '<div class="text-center p-pill" style="background:var(--s2);"><div class="text-t3">Polish</div><div class="text-yel">' + totalCost.polish.toLocaleString() + '</div></div>' +
            '<div class="text-center p-pill" style="background:var(--s2);"><div class="text-t3">Plans</div><div class="text-blu">' + totalCost.plans.toLocaleString() + '</div></div>' +
            '<div class="text-center p-pill" style="background:var(--s2);"><div class="text-t3">Amber</div><div class="text-acc">' + totalCost.amber.toLocaleString() + '</div></div>' +
            '</div>';
        if(totalCost.amber > 0) {
            tSum.innerHTML += '<div style="font-size:8px;color:var(--t2);margin-top:4px;text-align:center;">Amber requires ' + (totalCost.amber * 10) + ' Design Plans (10:1)</div>';
        }
        upgList.appendChild(tSum);
    }

    // -- Rendering: Charms --
    function renderCharms() {
        var matGrid = el('charm-materials');
        matGrid.innerHTML = '';
        var mats = [
            { key: 'charmGuides', label: 'Guides', color: 'text-grn' },
            { key: 'charmDesigns', label: 'Designs', color: 'text-yel' },
            { key: 'jewelSecrets', label: 'Jewel Sec.', color: 'text-pur' }
        ];
        mats.forEach(function(m) {
            var div = document.createElement('div');
            div.className = 'material-item';
            div.innerHTML = '<div class="material-label">' + m.label + '</div>';
            var inp = createInput('number', state.materials[m.key], function(e) { setMaterial(m.key, e.target.value); });
            inp.className = 'material-input ' + m.color;
            div.appendChild(inp);
            matGrid.appendChild(div);
        });

        var gtGrid = el('charm-global-targets');
        gtGrid.innerHTML = '';
        var tDiv = document.createElement('div'); tDiv.className = 'target-item';
        tDiv.innerHTML = '<div class="target-label">TARGET LEVEL</div>';
        var tSel = createSelect(WOS_DATA.CLV, state.charmTargets.global, function(e) {
            state.charmTargets.global = e.target.value; saveState(); renderAll();
        });
        tDiv.appendChild(tSel);
        gtGrid.appendChild(tDiv);

        var upgList = el('charm-upgrades');
        upgList.innerHTML = '';

        var totalCost = { g: 0, d: 0, j: 0, score: 0, bs: 0, as: 0 };

        WOS_DATA.SLOTS.forEach(function(slot) {
            var cData = [];
            for (var i = 1; i <= 3; i++) {
                var k = slot.slot + '_' + i;
                var cur = state.charms[k] || "1";
                var tgt = state.charmTargets.pieces[k] || state.charmTargets.global;
                var cost = getCharmIndex(tgt) > getCharmIndex(cur) ? calcCharmCost(cur, tgt) : { g: 0, d: 0, j: 0, score: 0 };
                var bs = WOS_DATA.CD[cur] ? WOS_DATA.CD[cur].s : 0;
                var as = getCharmIndex(tgt) > getCharmIndex(cur) ? (WOS_DATA.CD[tgt] ? WOS_DATA.CD[tgt].s : 0) : bs;
                cData.push({ k: k, n: i, cur: cur, tgt: tgt, cost: cost, bs: bs, as: as });

                totalCost.g += cost.g;
                totalCost.d += cost.d;
                totalCost.j += cost.j;
                totalCost.score += cost.score;
                totalCost.bs += bs;
                totalCost.as += as;
            }

            var slotBs = cData[0].bs + cData[1].bs + cData[2].bs;
            var slotAs = cData[0].as + cData[1].as + cData[2].as;
            var slotG = cData[0].cost.g + cData[1].cost.g + cData[2].cost.g;
            var slotD = cData[0].cost.d + cData[1].cost.d + cData[2].cost.d;
            var hasUpg = slotG > 0 || slotD > 0;

            var card = document.createElement('div');
            card.className = 'expandable-card troop-' + slot.troop;

            var header = document.createElement('div');
            header.className = 'expandable-header';
            header.onclick = function() { toggleExpanded('ch_' + slot.slot); };

            var hLeft = '<div style="display:flex;align-items:center;gap:8px;">' +
                        '<span style="font-size:16px;">' + slot.icon + '</span>' +
                        '<div>' +
                        '<span style="font-family:\'Anybody\';font-size:12px;font-weight:700;" class="troop-' + slot.troop + '-text">' + slot.slot + '</span>' +
                        '<span style="font-size:9px;color:var(--t3);margin-left:6px;">' + slot.troop + '</span>' +
                        '</div></div>';

            var hRight = '<div style="display:flex;align-items:center;gap:6px;"><div class="text-right">';
            hRight += '<div style="font-size:10px;"><span style="color:var(--t2);">' + slotBs.toFixed(1) + '%</span>';
            if (hasUpg) hRight += '<span style="color:var(--t3);margin:0 3px;">→</span><span class="troop-' + slot.troop + '-text" style="font-weight:600;">' + slotAs.toFixed(1) + '%</span>';
            hRight += '</div>';
            if (hasUpg) hRight += '<div style="font-size:7px;color:var(--t3);">' + slotG + 'G / ' + slotD + 'D</div>';
            hRight += '</div><button class="xb ' + (state.expanded['ch_' + slot.slot] ? 'active' : '') + '">▾</button></div>';

            header.innerHTML = hLeft + hRight;
            card.appendChild(header);

            if (state.expanded['ch_' + slot.slot]) {
                var content = document.createElement('div');
                content.className = 'expandable-content active';

                cData.forEach(function(c) {
                    var chDiv = document.createElement('div');
                    chDiv.style.background = 'rgba(0,0,0,0.25)'; chDiv.style.borderRadius = '8px'; chDiv.style.padding = '8px'; chDiv.style.marginBottom = '4px';

                    var row = document.createElement('div');
                    row.style.display = 'grid'; row.style.gridTemplateColumns = '24px 1fr 1fr'; row.style.gap = '4px'; row.style.alignItems = 'center';
                    row.innerHTML = '<div style="font-family:\'Anybody\';font-size:10px;font-weight:700;">C' + c.n + '</div>';

                    var curCol = document.createElement('div');
                    curCol.innerHTML = '<div style="font-size:6px;color:var(--t3);">CURRENT</div>';
                    var curSel = createSelect(WOS_DATA.CLV, c.cur, function(e) { state.charms[c.k] = e.target.value; saveState(); renderAll(); });
                    curCol.appendChild(curSel); row.appendChild(curCol);

                    var tgtCol = document.createElement('div');
                    tgtCol.innerHTML = '<div style="font-size:6px;color:var(--t3);">TARGET</div>';
                    var tgtSel = createSelect(WOS_DATA.CLV, state.charmTargets.pieces[c.k] ? state.charmTargets.pieces[c.k] : "", function(e) {
                        state.charmTargets.pieces[c.k] = e.target.value || undefined; saveState(); renderAll();
                    }, "Global (" + state.charmTargets.global + ")");
                    tgtCol.appendChild(tgtSel); row.appendChild(tgtCol);

                    chDiv.appendChild(row);

                    var bRow = document.createElement('div');
                    bRow.style.display = 'flex'; bRow.style.justifyContent = 'space-between'; bRow.style.marginTop = '3px'; bRow.style.fontSize = '9px';
                    bRow.innerHTML = '<span style="color:var(--t2);">' + c.bs + '% → <span class="troop-' + slot.troop + '-text" style="font-weight:600;">' + c.as + '%</span></span>';
                    if (c.cost.g > 0 || c.cost.d > 0) {
                        bRow.innerHTML += '<span style="color:var(--t3);">' + c.cost.g + 'G / ' + c.cost.d + 'D' + (c.cost.j > 0 ? ' / ' + c.cost.j + 'J' : '') + '</span>';
                    }
                    chDiv.appendChild(bRow);

                    content.appendChild(chDiv);
                });

                card.appendChild(content);
            }
            upgList.appendChild(card);
        });

        // Totals summary
        var tSum = document.createElement('div');
        tSum.className = 'card';
        tSum.innerHTML = '<div class="grid-3" style="text-align:center;align-items:center;margin-bottom:8px;">' +
            '<div><div style="font-size:7px;color:var(--t3);">BEFORE</div><div style="font-family:\'Anybody\';font-size:16px;font-weight:800;color:var(--t2);">' + totalCost.bs.toFixed(1) + '%</div></div>' +
            '<div style="color:var(--acc);font-size:14px;">→</div>' +
            '<div><div style="font-size:7px;color:var(--t3);">AFTER</div><div style="font-family:\'Anybody\';font-size:16px;font-weight:800;color:var(--grn);">' + totalCost.as.toFixed(1) + '%</div></div>' +
            '</div>' +
            '<div class="grid-3">' +
            '<div class="text-center p-pill" style="background:var(--s2);"><div class="text-t3">Guides</div><div class="text-grn">' + totalCost.g.toLocaleString() + '</div></div>' +
            '<div class="text-center p-pill" style="background:var(--s2);"><div class="text-t3">Designs</div><div class="text-yel">' + totalCost.d.toLocaleString() + '</div></div>' +
            '<div class="text-center p-pill" style="background:var(--s2);"><div class="text-t3">Jewels</div><div class="text-pur">' + totalCost.j.toLocaleString() + '</div></div>' +
            '</div>' +
            '<div style="margin-top:8px;padding:6px;background:rgba(255,104,56,0.1);border-radius:6px;text-align:center;">' +
            '<div style="font-size:8px;color:var(--acc);text-transform:uppercase;letter-spacing:1px;">SvS Points (Day 3/4)</div>' +
            '<div style="font-family:\'Anybody\';font-size:14px;font-weight:700;color:#fff;">+' + (totalCost.score * WOS_DATA.SVS_RATES.charmScore).toLocaleString() + ' pts</div>' +
            '</div>';
        upgList.appendChild(tSum);
    }

    // -- Rendering: Plan, SvS, Compare --
    function getTotals() {
        // Chief Gear
        var cg = { alloy:0, polish:0, plans:0, amber:0 };
        WOS_DATA.SLOTS.forEach(function(slot) {
            var g = state.chiefGear[slot.slot];
            var tgT = state.chiefGearTargets.pieces[slot.slot] && state.chiefGearTargets.pieces[slot.slot].tier ? state.chiefGearTargets.pieces[slot.slot].tier : state.chiefGearTargets.global.tier;
            var tgS = state.chiefGearTargets.pieces[slot.slot] && state.chiefGearTargets.pieces[slot.slot].stars !== undefined ? state.chiefGearTargets.pieces[slot.slot].stars : state.chiefGearTargets.global.stars;
            var c = calcChiefGearCost(g.tier, g.stars, tgT, tgS);
            if(c.steps > 0) { cg.alloy += c.alloy; cg.polish += c.polish; cg.plans += c.plans; cg.amber += c.amber; }
        });

        // Charms
        var ch = { g:0, d:0, j:0, score:0 };
        WOS_DATA.SLOTS.forEach(function(slot) {
            for (var i = 1; i <= 3; i++) {
                var k = slot.slot + '_' + i;
                var cur = state.charms[k] || "1";
                var tgt = state.charmTargets.pieces[k] || state.charmTargets.global;
                if(getCharmIndex(tgt) > getCharmIndex(cur)) {
                    var c = calcCharmCost(cur, tgt);
                    ch.g += c.g; ch.d += c.d; ch.j += c.j; ch.score += c.score;
                }
            }
        });

        // Hero Gear
        var hg = { xp:0, mi:0, mg:0, st:0 };
        WOS_DATA.TROOPS.forEach(function(type) {
            WOS_DATA.PCS.forEach(function(piece) {
                var k = type + '_' + piece;
                var cur = state.heroGear[k];
                var tLv = state.heroGearTargets.pieces[k] && state.heroGearTargets.pieces[k].level ? state.heroGearTargets.pieces[k].level : state.heroGearTargets.globalLevel;
                var tFg = state.heroGearTargets.pieces[k] && state.heroGearTargets.pieces[k].forge !== undefined ? state.heroGearTargets.pieces[k].forge : state.heroGearTargets.globalForge;

                var tp = parseHeroLevel(tLv);
                if (getHeroLevelIndex(tLv) > getHeroLevelIndex(cur.level)) {
                    hg.xp += calcHeroXp(cur.level, tLv);
                    var gc = calcHeroGates(cur.level, tLv);
                    hg.mi += gc.mi; hg.mg += gc.mg + gc.transmute;
                }
                var minForge = tFg;
                if (tp.p === "E" && cur.forge < 11) minForge = Math.max(minForge, 11);
                if (cur.forge < minForge) {
                    var fc = calcForgeCost(cur.forge, minForge);
                    hg.st += fc.s; hg.mg += fc.g;
                }
            });
        });

        return { cg: cg, ch: ch, hg: hg };
    }

    function renderPlan() {
        var pContainer = el('plan-summary');
        pContainer.innerHTML = '';
        var t = getTotals();

        // Chief Gear Phase
        var cgCard = document.createElement('div');
        cgCard.className = 'card';
        cgCard.style.borderColor = 'rgba(255,104,56,0.2)'; cgCard.style.background = 'rgba(255,104,56,0.03)';
        var cgHasUpg = t.cg.alloy > 0 || t.cg.polish > 0 || t.cg.plans > 0;
        cgCard.innerHTML = '<div style="font-family:\'Anybody\';font-size:12px;font-weight:800;color:var(--acc);letter-spacing:1px;">🛡️ CHIEF GEAR PLAN</div>';
        if (cgHasUpg) {
            var aSh = t.cg.alloy > state.materials.hardenedAlloy;
            var pSh = t.cg.polish > state.materials.polishingSolution;
            var dpSh = t.cg.plans + (t.cg.amber * 10) > state.materials.designPlans;
            cgCard.innerHTML += '<div class="grid-3" style="margin-top:8px;">' +
                '<div class="text-center p-pill" style="background:var(--s2);"><div class="text-t3">Alloy</div><div class="' + (aSh ? 'text-red' : 'text-grn') + '">' + t.cg.alloy.toLocaleString() + '</div></div>' +
                '<div class="text-center p-pill" style="background:var(--s2);"><div class="text-t3">Polish</div><div class="' + (pSh ? 'text-red' : 'text-grn') + '">' + t.cg.polish.toLocaleString() + '</div></div>' +
                '<div class="text-center p-pill" style="background:var(--s2);"><div class="text-t3">Plans (+Amber)</div><div class="' + (dpSh ? 'text-red' : 'text-grn') + '">' + (t.cg.plans + t.cg.amber * 10).toLocaleString() + '</div></div>' +
                '</div>';
        } else {
            cgCard.innerHTML += '<div style="font-size:10px;color:var(--t3);margin-top:4px;">No upgrades planned.</div>';
        }
        pContainer.appendChild(cgCard);

        // Charms Phase
        var chCard = document.createElement('div');
        chCard.className = 'card';
        chCard.style.borderColor = 'rgba(240,180,41,0.2)'; chCard.style.background = 'rgba(240,180,41,0.03)';
        var chHasUpg = t.ch.g > 0 || t.ch.d > 0 || t.ch.j > 0;
        chCard.innerHTML = '<div style="font-family:\'Anybody\';font-size:12px;font-weight:800;color:var(--yel);letter-spacing:1px;">✨ CHARMS PLAN</div>';
        if (chHasUpg) {
            var gSh = t.ch.g > state.materials.charmGuides;
            var dSh = t.ch.d > state.materials.charmDesigns;
            var jSh = t.ch.j > state.materials.jewelSecrets;
            chCard.innerHTML += '<div class="grid-3" style="margin-top:8px;">' +
                '<div class="text-center p-pill" style="background:var(--s2);"><div class="text-t3">Guides</div><div class="' + (gSh ? 'text-red' : 'text-grn') + '">' + t.ch.g.toLocaleString() + '</div></div>' +
                '<div class="text-center p-pill" style="background:var(--s2);"><div class="text-t3">Designs</div><div class="' + (dSh ? 'text-red' : 'text-grn') + '">' + t.ch.d.toLocaleString() + '</div></div>' +
                '<div class="text-center p-pill" style="background:var(--s2);"><div class="text-t3">Jewels</div><div class="' + (jSh ? 'text-red' : 'text-grn') + '">' + t.ch.j.toLocaleString() + '</div></div>' +
                '</div>';
        } else {
            chCard.innerHTML += '<div style="font-size:10px;color:var(--t3);margin-top:4px;">No upgrades planned.</div>';
        }
        pContainer.appendChild(chCard);

        // Hero Gear Phase
        var hgCard = document.createElement('div');
        hgCard.className = 'card';
        hgCard.style.borderColor = 'rgba(34,211,167,0.2)'; hgCard.style.background = 'rgba(34,211,167,0.03)';
        var hgHasUpg = t.hg.xp > 0 || t.hg.mi > 0 || t.hg.mg > 0 || t.hg.st > 0;
        hgCard.innerHTML = '<div style="font-family:\'Anybody\';font-size:12px;font-weight:800;color:var(--grn);letter-spacing:1px;">⚔️ HERO GEAR PLAN</div>';
        if (hgHasUpg) {
            var availXp = (state.materials.enhancementXP100 * 100000) + (state.materials.enhancementXP10 * 10000) + (state.materials.luckyHeroGearChests * 69);
            var xSh = t.hg.xp > availXp;
            var mSh = t.hg.mi > state.materials.mithril;
            var mgSh = t.hg.mg > state.materials.mythicHeroGear;
            hgCard.innerHTML += '<div class="grid-3" style="margin-top:8px;">' +
                '<div class="text-center p-pill" style="background:var(--s2);"><div class="text-t3">XP Needed</div><div class="' + (xSh ? 'text-red' : 'text-grn') + '">' + (t.hg.xp/1000).toFixed(0) + 'k</div></div>' +
                '<div class="text-center p-pill" style="background:var(--s2);"><div class="text-t3">Mithril</div><div class="' + (mSh ? 'text-red' : 'text-grn') + '">' + t.hg.mi.toLocaleString() + '</div></div>' +
                '<div class="text-center p-pill" style="background:var(--s2);"><div class="text-t3">Mythic Gear</div><div class="' + (mgSh ? 'text-red' : 'text-grn') + '">' + t.hg.mg.toLocaleString() + '</div></div>' +
                '</div>';
        } else {
            hgCard.innerHTML += '<div style="font-size:10px;color:var(--t3);margin-top:4px;">No upgrades planned.</div>';
        }
        pContainer.appendChild(hgCard);
    }

    function renderSvS() {
        var sContainer = el('svs-scoring');
        sContainer.innerHTML = '';
        var t = getTotals();

        var ptsCharm = t.ch.score * WOS_DATA.SVS_RATES.charmScore;
        var ptsMithril = t.hg.mi * WOS_DATA.SVS_RATES.mithril;
        var ptsXp = t.hg.xp * WOS_DATA.SVS_RATES.enhancementXP;
        var ptsTotal = ptsCharm + ptsMithril + ptsXp;

        var scoreHtml = '<div class="card" style="text-align:center;">' +
            '<div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:1px;">Total Estimated SvS Points</div>' +
            '<div style="font-family:\'Anybody\';font-size:24px;font-weight:900;color:var(--acc);margin:8px 0;">' + ptsTotal.toLocaleString() + '</div>' +
            '<div style="font-size:8px;color:var(--t2);">Based only on planned upgrades</div>' +
            '</div>';

        scoreHtml += '<div class="section-title">POINT BREAKDOWN</div>';

        scoreHtml += '<div class="card">' +
            '<div class="flex-between" style="border-bottom:1px solid var(--bd);padding-bottom:6px;margin-bottom:6px;">' +
            '<span style="font-weight:700;color:var(--yel);">✨ Charms (Day 3/4)</span><span style="font-weight:700;">' + ptsCharm.toLocaleString() + '</span>' +
            '</div>' +
            '<div class="flex-between" style="border-bottom:1px solid var(--bd);padding-bottom:6px;margin-bottom:6px;">' +
            '<span style="font-weight:700;color:var(--blu);">💎 Mithril (Day 4)</span><span style="font-weight:700;">' + ptsMithril.toLocaleString() + '</span>' +
            '</div>' +
            '<div class="flex-between">' +
            '<span style="font-weight:700;color:var(--t1);">🟢 Enhancement XP (Day 4)</span><span style="font-weight:700;">' + ptsXp.toLocaleString() + '</span>' +
            '</div>' +
            '</div>';

        scoreHtml += '<div class="section-title">OTHER POTENTIAL POINTS (Not in plan)</div>';
        var ops = [
            { l: 'Books of Knowledge', q: state.materials.booksOfKnowledge, r: 60, d: 'Day 2' },
            { l: 'Fire Crystals (Bldg)', q: state.materials.fireCrystals, r: WOS_DATA.SVS_RATES.fireCrystalsBuilding, d: 'Day 1' },
            { l: 'Advanced Wild Marks', q: state.materials.advancedWildMarks, r: WOS_DATA.SVS_RATES.advancedWildMarks, d: 'Day 3' },
            { l: 'General Speedups', q: state.materials.general, r: WOS_DATA.SVS_RATES.speedups, d: 'Any' }
        ];

        var opCard = '<div class="card">';
        ops.forEach(function(o, i) {
            opCard += '<div class="flex-between" style="' + (i<ops.length-1?'border-bottom:1px solid var(--bd);padding-bottom:6px;margin-bottom:6px;':'') + '">' +
                '<span><span style="color:var(--t2);font-size:8px;margin-right:4px;">[' + o.d + ']</span>' + o.l + ' (' + o.q.toLocaleString() + ')</span><span style="color:var(--t3);">' + (o.q * o.r).toLocaleString() + '</span>' +
                '</div>';
        });
        opCard += '</div>';

        sContainer.innerHTML = scoreHtml + opCard;
    }

    function renderCompare() {
        var cContainer = el('compare-section');
        cContainer.innerHTML = '';

        var compCount = 2;
        if (!state.competitors) {
            state.competitors = [];
            for(var i=0; i<compCount; i++) {
                state.competitors.push({
                    name: 'Competitor ' + (i+1),
                    chiefGear: JSON.parse(JSON.stringify(WOS_DATA.DEFAULT_CHIEF_GEAR)),
                    charms: JSON.parse(JSON.stringify(WOS_DATA.DEFAULT_CHARMS)),
                    heroGear: JSON.parse(JSON.stringify(WOS_DATA.DEFAULT_HERO_GEAR))
                });
            }
        }

        var wrapper = document.createElement('div');

        var headerHTML = '<div class="grid-3" style="margin-bottom:10px;text-align:center;align-items:end;">' +
            '<div><div style="font-family:\'Anybody\';font-size:14px;color:var(--acc);">You</div></div>';

        for(var i=0; i<compCount; i++) {
            headerHTML += '<div><input type="text" id="comp_name_' + i + '" value="' + escHtml(state.competitors[i].name) + '" style="font-family:\'Anybody\';font-size:12px;font-weight:700;text-align:center;padding:4px;border-bottom:1px solid var(--bd2);border-radius:0;background:transparent;" placeholder="Competitor ' + (i+1) + '" /></div>';
        }
        headerHTML += '</div>';
        wrapper.innerHTML += headerHTML;

        // Render Chief Gear Compare
        var cgHTML = '<div class="section-title">CHIEF GEAR COMPARISON</div><div class="card">';
        WOS_DATA.SLOTS.forEach(function(slot) {
            var myG = state.chiefGear[slot.slot];
            cgHTML += '<div class="flex-between" style="border-bottom:1px solid var(--bd);padding:4px 0;margin-bottom:4px;">' +
                '<span style="width:33%;font-size:10px;" class="troop-' + slot.troop + '-text">' + slot.icon + ' ' + slot.slot + '<br><span style="color:var(--t1);">' + myG.tier + ' ' + myG.stars + '★</span></span>';

            for(var i=0; i<compCount; i++) {
                var cG = state.competitors[i].chiefGear[slot.slot];
                var tSelId = 'comp_' + i + '_cg_t_' + slot.slot;
                var sSelId = 'comp_' + i + '_cg_s_' + slot.slot;

                var tOpts = ''; WOS_DATA.CTIERS.forEach(function(t){ tOpts += '<option value="'+t+'"' + (t===cG.tier?' selected':'') + '>'+t+'</option>'; });
                var sOpts = ''; [0,1,2,3].forEach(function(s){ sOpts += '<option value="'+s+'"' + (s===cG.stars?' selected':'') + '>'+s+'★</option>'; });

                cgHTML += '<div style="width:33%;text-align:center;"><select id="'+tSelId+'" style="font-size:9px;padding:2px;margin-bottom:2px;">'+tOpts+'</select><select id="'+sSelId+'" style="font-size:9px;padding:2px;">'+sOpts+'</select></div>';
            }
            cgHTML += '</div>';
        });
        cgHTML += '</div>';
        wrapper.innerHTML += cgHTML;

        // Render Charms Compare
        var chHTML = '<div class="section-title">CHARMS COMPARISON (Average Level)</div><div class="card">';
        WOS_DATA.SLOTS.forEach(function(slot) {
            var myAvg = 0;
            for(var x=1; x<=3; x++) myAvg += parseFloat(state.charms[slot.slot + '_' + x] || 1);
            myAvg = (myAvg / 3).toFixed(1);

            chHTML += '<div class="flex-between" style="border-bottom:1px solid var(--bd);padding:4px 0;margin-bottom:4px;">' +
                '<span style="width:33%;font-size:10px;" class="troop-' + slot.troop + '-text">' + slot.icon + ' ' + slot.slot + '<br><span style="color:var(--t1);">Avg: ' + myAvg + '</span></span>';

            for(var i=0; i<compCount; i++) {
                var cAvg = 0;
                for(var x=1; x<=3; x++) cAvg += parseFloat(state.competitors[i].charms[slot.slot + '_' + x] || 1);
                cAvg = (cAvg / 3).toFixed(1);

                var diff = parseFloat(myAvg) - parseFloat(cAvg);
                var diffHtml = diff >= 0 ? '<span class="text-grn">+' + diff.toFixed(1) + '</span>' : '<span class="text-red">' + diff.toFixed(1) + '</span>';

                chHTML += '<div style="width:33%;text-align:center;font-size:10px;color:var(--t2);">Avg: ' + cAvg + '<br>' + diffHtml + '</div>';
            }
            chHTML += '</div>';
        });
        chHTML += '</div>';
        wrapper.innerHTML += chHTML;

        // Render Hero Gear Compare
        var hgHTML = '<div class="section-title">HERO GEAR COMPARISON (Level / Forge)</div><div class="card">';
        WOS_DATA.TROOPS.forEach(function(type) {
            WOS_DATA.PCS.forEach(function(piece) {
                var k = type + '_' + piece;
                var myH = state.heroGear[k];
                hgHTML += '<div class="flex-between" style="border-bottom:1px solid var(--bd);padding:4px 0;margin-bottom:4px;">' +
                    '<span style="width:33%;font-size:9px;" class="troop-' + type + '-text">' + WOS_DATA.TI[type] + ' ' + piece + '<br><span style="color:var(--t1);">' + myH.level + ' / F' + myH.forge + '</span></span>';

                for(var i=0; i<compCount; i++) {
                    var cH = state.competitors[i].heroGear[k];
                    var lSelId = 'comp_' + i + '_hg_l_' + k;
                    var fSelId = 'comp_' + i + '_hg_f_' + k;

                    var hlOpts = '';
                    for (var x = 1; x <= 100; x++) hlOpts += '<option value="M'+x+'"'+(cH.level==='M'+x?' selected':'')+'>M'+x+'</option>';
                    for (var x = 0; x <= 100; x++) hlOpts += '<option value="E'+x+'"'+(cH.level==='E'+x?' selected':'')+'>E'+x+'</option>';

                    var fgOpts = '';
                    for (var x = 0; x <= 20; x++) fgOpts += '<option value="'+x+'"'+(cH.forge==x?' selected':'')+'>'+x+'</option>';

                    hgHTML += '<div style="width:33%;text-align:center;"><select id="'+lSelId+'" style="font-size:8px;padding:2px;margin-bottom:2px;">'+hlOpts+'</select><select id="'+fSelId+'" style="font-size:8px;padding:2px;">'+fgOpts+'</select></div>';
                }
                hgHTML += '</div>';
            });
        });
        hgHTML += '</div>';
        wrapper.innerHTML += hgHTML;

        cContainer.appendChild(wrapper);

        // Bind events
        setTimeout(function() {
            for(var i=0; i<compCount; i++) {
                (function(idx) {
                    var nInp = el('comp_name_' + idx);
                    if(nInp) nInp.onchange = function(e) { state.competitors[idx].name = e.target.value; saveState(); };

                    WOS_DATA.SLOTS.forEach(function(slot) {
                        var tSel = el('comp_' + idx + '_cg_t_' + slot.slot);
                        if(tSel) tSel.onchange = function(e) { state.competitors[idx].chiefGear[slot.slot].tier = e.target.value; saveState(); renderAll(); };
                        var sSel = el('comp_' + idx + '_cg_s_' + slot.slot);
                        if(sSel) sSel.onchange = function(e) { state.competitors[idx].chiefGear[slot.slot].stars = parseInt(e.target.value,10); saveState(); renderAll(); };
                    });

                    WOS_DATA.TROOPS.forEach(function(type) {
                        WOS_DATA.PCS.forEach(function(piece) {
                            var k = type + '_' + piece;
                            var lSel = el('comp_' + idx + '_hg_l_' + k);
                            if(lSel) lSel.onchange = function(e) { state.competitors[idx].heroGear[k].level = e.target.value; saveState(); renderAll(); };
                            var fSel = el('comp_' + idx + '_hg_f_' + k);
                            if(fSel) fSel.onchange = function(e) { state.competitors[idx].heroGear[k].forge = parseInt(e.target.value,10); saveState(); renderAll(); };
                        });
                    });
                })(i);
            }
        }, 0);
    }

    // -- Rendering: Hero Gear --
    function renderHeroGear() {
        var matGrid = el('hg-materials');
        matGrid.innerHTML = '';
        var mats = [
            { key: 'essenceStones', label: 'Essence Stones', color: 'text-pur' },
            { key: 'mithril', label: 'Mithril', color: 'text-blu' },
            { key: 'mythicHeroGear', label: 'Mythic Gear', color: 'text-red' }
        ];
        mats.forEach(function(m) {
            var div = document.createElement('div');
            div.className = 'material-item';
            div.innerHTML = '<div class="material-label">' + m.label + '</div>';
            var inp = createInput('number', state.materials[m.key], function(e) { setMaterial(m.key, e.target.value); });
            inp.className = 'material-input ' + m.color;
            div.appendChild(inp);
            matGrid.appendChild(div);
        });

        // Add XP Sources
        var xpGrid = document.createElement('div');
        xpGrid.className = 'grid-3';
        xpGrid.style.marginTop = '6px';
        xpGrid.style.marginBottom = '8px';

        var xpMats = [
            { key: 'enhancementXP100', label: 'XP (100k)', color: 'text-t1', mult: 100000 },
            { key: 'enhancementXP10', label: 'XP (10k)', color: 'text-t1', mult: 10000 },
            { key: 'luckyHeroGearChests', label: 'Lucky Chests', color: 'text-yel', mult: 69 } // Avg 69 XP per chest (90%*60 + 10%*150)
        ];
        var totalAvailableXp = 0;

        xpMats.forEach(function(m) {
            var div = document.createElement('div');
            div.className = 'material-item';
            div.innerHTML = '<div class="material-label">' + m.label + '</div>';
            var inp = createInput('number', state.materials[m.key], function(e) { setMaterial(m.key, e.target.value); });
            inp.className = 'material-input ' + m.color;
            div.appendChild(inp);
            xpGrid.appendChild(div);
            totalAvailableXp += state.materials[m.key] * m.mult;
        });

        var matSection = el('tab-hero-gear');
        var oldXpGrid = el('hg-xp-sources');
        if(oldXpGrid) oldXpGrid.remove();
        xpGrid.id = 'hg-xp-sources';
        matGrid.parentNode.insertBefore(xpGrid, matGrid.nextSibling);

        var gtGrid = el('hg-global-targets');
        gtGrid.innerHTML = '';
        var lDiv = document.createElement('div'); lDiv.className = 'target-item';
        lDiv.innerHTML = '<div class="target-label">LEVEL / EMP</div>';
        var hlOpts = [];
        for (var i = 1; i <= 100; i++) hlOpts.push({ value: "M" + i, label: "M" + i });
        for (var i = 0; i <= 100; i++) hlOpts.push({ value: "E" + i, label: "E" + i });
        var lSel = createSelect(hlOpts, state.heroGearTargets.globalLevel, function(e) {
            state.heroGearTargets.globalLevel = e.target.value; saveState(); renderAll();
        });
        lDiv.appendChild(lSel);

        var fDiv = document.createElement('div'); fDiv.className = 'target-item';
        fDiv.innerHTML = '<div class="target-label">FORGE LEVEL</div>';
        var fInp = createInput('number', state.heroGearTargets.globalForge, function(e) {
            state.heroGearTargets.globalForge = Math.min(20, Math.max(0, parseInt(e.target.value, 10) || 0)); saveState(); renderAll();
        });
        fDiv.appendChild(fInp);

        gtGrid.appendChild(lDiv);
        gtGrid.appendChild(fDiv);

        var upgList = el('hg-upgrades');
        upgList.innerHTML = '';

        var totalReq = { xp: 0, mi: 0, mg: 0, st: 0 };

        WOS_DATA.TROOPS.forEach(function(type) {
            var tData = { xp: 0, mi: 0, mg: 0, st: 0, html: '' };

            WOS_DATA.PCS.forEach(function(piece) {
                var k = type + '_' + piece;
                var cur = state.heroGear[k];
                var tLv = state.heroGearTargets.pieces[k] && state.heroGearTargets.pieces[k].level ? state.heroGearTargets.pieces[k].level : state.heroGearTargets.globalLevel;
                var tFg = state.heroGearTargets.pieces[k] && state.heroGearTargets.pieces[k].forge !== undefined ? state.heroGearTargets.pieces[k].forge : state.heroGearTargets.globalForge;

                var cp = parseHeroLevel(cur.level);
                var tp = parseHeroLevel(tLv);

                var xp = getHeroLevelIndex(tLv) > getHeroLevelIndex(cur.level) ? calcHeroXp(cur.level, tLv) : 0;
                var gc = getHeroLevelIndex(tLv) > getHeroLevelIndex(cur.level) ? calcHeroGates(cur.level, tLv) : { mi: 0, mg: 0, transmute: 0, gates: [] };

                var minForge = tFg;
                if (tp.p === "E" && cur.forge < 11) minForge = Math.max(minForge, 11);
                var fc = cur.forge < minForge ? calcForgeCost(cur.forge, minForge) : { s: 0, g: 0 };

                tData.xp += xp;
                tData.mi += gc.mi;
                tData.mg += gc.mg + gc.transmute + fc.g;
                tData.st += fc.s;

                var isE = cp.p === "E";
                var needsT = cp.p === "M" && tp.p === "E";

                var pCard = document.createElement('div');
                pCard.style.background = 'rgba(0,0,0,0.25)'; pCard.style.borderRadius = '8px'; pCard.style.padding = '8px'; pCard.style.marginBottom = '5px';

                var pHeader = '<div class="flex-between" style="margin-bottom:6px;">' +
                              '<div style="font-family:\'Anybody\';font-size:11px;font-weight:700;">' + piece + '</div>' +
                              '<span class="p-pill" style="background:' + (isE ? 'rgba(240,180,41,0.15)' : 'rgba(167,139,250,0.15)') + ';color:' + (isE ? 'var(--yel)' : 'var(--pur)') + ';">' + (isE ? 'Legendary' : 'Mythic') + ' • ' + cur.level + '</span>' +
                              '</div>';

                var pGrid = '<div class="grid-3" style="margin-bottom:6px;">';
                pGrid += '<div><div style="font-size:6px;color:var(--t3);">CURRENT LV</div><select id="sel_curlv_' + k + '" style="font-size:10px;padding:3px;"></select></div>';
                pGrid += '<div><div style="font-size:6px;color:var(--acc);">TARGET LV</div><select id="sel_tgtlv_' + k + '" style="font-size:10px;padding:3px;color:' + (state.heroGearTargets.pieces[k] && state.heroGearTargets.pieces[k].level ? '#fff' : 'var(--t3)') + ';"></select></div>';
                pGrid += '<div><div style="font-size:6px;color:var(--t3);">FORGE</div><div class="grid-2" style="gap:2px;">' +
                         '<div><div style="font-size:5px;color:var(--t3);">CUR</div><select id="sel_curfg_' + k + '" style="font-size:9px;padding:2px;"></select></div>' +
                         '<div><div style="font-size:5px;color:var(--acc);">TGT</div><input id="inp_tgtfg_' + k + '" type="number" placeholder="' + state.heroGearTargets.globalForge + '" value="' + (state.heroGearTargets.pieces[k] && state.heroGearTargets.pieces[k].forge !== undefined ? state.heroGearTargets.pieces[k].forge : '') + '" style="font-size:9px;padding:2px;"/></div>' +
                         '</div></div></div>';

                var pills = '<div style="display:flex;gap:3px;flex-wrap:wrap;">';
                if (xp > 0) pills += '<span class="p-pill" style="background:rgba(192,208,224,0.1);color:var(--t1);">' + xp.toLocaleString() + ' XP</span>';
                if (needsT) pills += '<span class="p-pill" style="background:rgba(240,180,41,0.15);color:var(--yel);">Transmute: 2G (needs F11+)</span>';
                if (gc.mi > 0) pills += '<span class="p-pill" style="background:rgba(78,168,222,0.15);color:var(--blu);">' + gc.mi + 'M + ' + gc.mg + 'G gates</span>';
                if (fc.s > 0) pills += '<span class="p-pill" style="background:rgba(167,139,250,0.15);color:var(--pur);">Forge→' + minForge + ': ' + fc.s + 'st + ' + fc.g + 'G</span>';
                pills += '</div>';

                var details = '';
                if (gc.gates.length > 0 || fc.s > 0 || needsT) {
                    details += '<div style="margin-top:4px;"><button class="xb" style="font-size:9px;" onclick="document.getElementById(\'hg_det_' + k + '\').classList.toggle(\'active\')">▾ details</button>';
                    details += '<div id="hg_det_' + k + '" class="expandable-content" style="margin-top:4px;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;">';
                    if (fc.s > 0) {
                        details += '<div style="margin-bottom:6px;"><div style="font-size:7px;color:var(--pur);letter-spacing:1px;margin-bottom:3px;">FORGE ' + cur.forge + ' → ' + minForge + '</div>';
                        var cs = 0, cg = 0;
                        for (var f = cur.forge + 1; f <= minForge; f++) {
                            cs += f * 10; cg += Math.max(0, f - 10);
                            details += '<div style="display:grid;grid-template-columns:50px 1fr 1fr;gap:3px;font-size:8px;padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.02);"><span style="color:var(--t1);font-weight:600;">F' + f + '</span><span style="color:var(--pur);">' + (f*10) + 'st' + (Math.max(0, f-10) > 0 ? ' + ' + Math.max(0, f-10) + 'G' : '') + '</span><span style="color:var(--t3);text-align:right;">Σ' + cs + 'st / ' + cg + 'G</span></div>';
                        }
                        details += '</div>';
                    }
                    if (needsT) details += '<div style="font-size:8px;color:var(--yel);margin-bottom:4px;">⚡ Transmute at M100 + Forge 11+: 2 Mythic Gear</div>';
                    if (gc.gates.length > 0) {
                        details += '<div><div style="font-size:7px;color:var(--blu);letter-spacing:1px;margin-bottom:3px;">EMP GATES</div>';
                        var cm = 0, ccg = 0;
                        gc.gates.forEach(function(g) {
                            cm += g.mi; ccg += g.mg;
                            details += '<div style="display:grid;grid-template-columns:50px 1fr 1fr;gap:3px;font-size:8px;padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.02);"><span style="color:var(--t1);font-weight:600;">E' + g.e + '</span><span style="color:var(--blu);">' + g.mi + 'M + ' + g.mg + 'G</span><span style="color:var(--t3);text-align:right;">Σ' + cm + 'M / ' + ccg + 'G</span></div>';
                        });
                        details += '</div>';
                    }
                    details += '</div></div>';
                }

                pCard.innerHTML = pHeader + pGrid + pills + details;
                tData.html += pCard.outerHTML;

                // Bind events later via setTimeout since we are building HTML strings
                setTimeout(function() {
                    var sCurLv = el('sel_curlv_' + k);
                    if(sCurLv) {
                        hlOpts.forEach(function(o) { var op = new Option(o.label, o.value); sCurLv.add(op); });
                        sCurLv.value = cur.level;
                        sCurLv.onchange = function(e) { state.heroGear[k].level = e.target.value; saveState(); renderAll(); };
                    }
                    var sTgtLv = el('sel_tgtlv_' + k);
                    if(sTgtLv) {
                        sTgtLv.add(new Option("Global (" + state.heroGearTargets.globalLevel + ")", ""));
                        hlOpts.forEach(function(o) { var op = new Option(o.label, o.value); sTgtLv.add(op); });
                        sTgtLv.value = state.heroGearTargets.pieces[k] && state.heroGearTargets.pieces[k].level ? state.heroGearTargets.pieces[k].level : "";
                        sTgtLv.onchange = function(e) {
                            if(!state.heroGearTargets.pieces[k]) state.heroGearTargets.pieces[k] = {};
                            state.heroGearTargets.pieces[k].level = e.target.value || undefined; saveState(); renderAll();
                        };
                    }
                    var sCurFg = el('sel_curfg_' + k);
                    if(sCurFg) {
                        for(var j=0; j<=20; j++) sCurFg.add(new Option(j, j));
                        sCurFg.value = cur.forge;
                        sCurFg.onchange = function(e) { state.heroGear[k].forge = parseInt(e.target.value, 10); saveState(); renderAll(); };
                    }
                    var sTgtFg = el('inp_tgtfg_' + k);
                    if(sTgtFg) {
                        sTgtFg.onchange = function(e) {
                            if(!state.heroGearTargets.pieces[k]) state.heroGearTargets.pieces[k] = {};
                            state.heroGearTargets.pieces[k].forge = e.target.value === "" ? undefined : Math.min(20, Math.max(0, parseInt(e.target.value, 10) || 0)); saveState(); renderAll();
                        };
                    }
                }, 0);
            });

            totalReq.xp += tData.xp;
            totalReq.mi += tData.mi;
            totalReq.mg += tData.mg;
            totalReq.st += tData.st;

            var card = document.createElement('div');
            card.className = 'expandable-card troop-' + type;

            var header = document.createElement('div');
            header.className = 'expandable-header';
            header.onclick = function() { toggleExpanded('hg_' + type); };

            var hLeft = '<span style="font-family:\'Anybody\';font-size:12px;font-weight:800;" class="troop-' + type + '-text">' + WOS_DATA.TI[type] + ' ' + type + '</span>';
            var hRight = '<div style="display:flex;align-items:center;gap:6px;"><div style="font-size:8px;color:var(--t3);text-align:right;">';
            if (tData.xp > 0) hRight += '<span>' + (tData.xp/1000).toFixed(0) + 'K XP</span>';
            if (tData.mi > 0) hRight += '<span> • ' + tData.mi + 'M</span>';
            if (tData.mg > 0) hRight += '<span> • ' + tData.mg + 'G</span>';
            if (tData.st > 0) hRight += '<span> • ' + tData.st + 'st</span>';
            hRight += '</div><button class="xb ' + (state.expanded['hg_' + type] ? 'active' : '') + '">▾</button></div>';

            header.innerHTML = hLeft + hRight;
            card.appendChild(header);

            if (state.expanded['hg_' + type]) {
                var content = document.createElement('div');
                content.className = 'expandable-content active';
                content.innerHTML = tData.html;
                card.appendChild(content);
            }
            upgList.appendChild(card);
        });

        // Totals summary
        var tSum = document.createElement('div');
        tSum.className = 'card';
        var xpShort = totalReq.xp > totalAvailableXp;
        tSum.innerHTML = '<div class="grid-2" style="margin-bottom:6px;">' +
            '<div style="text-align:center;padding:5px 3px;background:var(--s2);border-radius:6px;">' +
            '<div style="font-size:7px;color:var(--t3);">XP Needed vs Available</div>' +
            '<div style="font-size:11px;font-weight:700;color:' + (xpShort ? 'var(--red)' : 'var(--grn)') + ';margin-top:1px;">' + totalReq.xp.toLocaleString() + ' <span style="font-size:8px;color:var(--t3);font-weight:400;">/ ' + totalAvailableXp.toLocaleString() + '</span></div>' +
            '</div>' +
            '<div style="text-align:center;padding:5px 3px;background:var(--s2);border-radius:6px;">' +
            '<div style="font-size:7px;color:var(--t3);">Ess. Stones</div>' +
            '<div style="font-size:11px;font-weight:700;color:' + (totalReq.st > state.materials.essenceStones ? 'var(--red)' : 'var(--grn)') + ';margin-top:1px;">' + totalReq.st.toLocaleString() + ' <span style="font-size:8px;color:var(--t3);font-weight:400;">/ ' + state.materials.essenceStones + '</span></div>' +
            '</div></div>' +
            '<div class="grid-2">' +
            '<div style="text-align:center;padding:5px 3px;background:var(--s2);border-radius:6px;">' +
            '<div style="font-size:7px;color:var(--t3);">Mithril</div>' +
            '<div style="font-size:11px;font-weight:700;color:' + (totalReq.mi > state.materials.mithril ? 'var(--red)' : 'var(--grn)') + ';margin-top:1px;">' + totalReq.mi.toLocaleString() + ' <span style="font-size:8px;color:var(--t3);font-weight:400;">/ ' + state.materials.mithril + '</span></div>' +
            '</div>' +
            '<div style="text-align:center;padding:5px 3px;background:var(--s2);border-radius:6px;">' +
            '<div style="font-size:7px;color:var(--t3);">Mythic Gear</div>' +
            '<div style="font-size:11px;font-weight:700;color:' + (totalReq.mg > state.materials.mythicHeroGear ? 'var(--red)' : 'var(--grn)') + ';margin-top:1px;">' + totalReq.mg.toLocaleString() + ' <span style="font-size:8px;color:var(--t3);font-weight:400;">/ ' + state.materials.mythicHeroGear + '</span></div>' +
            '</div></div>' +
            '<div style="margin-top:8px;padding:6px;background:rgba(78,168,222,0.1);border-radius:6px;text-align:center;">' +
            '<div style="font-size:8px;color:var(--blu);text-transform:uppercase;letter-spacing:1px;">SvS Points (Day 4)</div>' +
            '<div style="font-family:\'Anybody\';font-size:14px;font-weight:700;color:#fff;">+' + ((totalReq.mi * WOS_DATA.SVS_RATES.mithril) + (totalReq.xp * WOS_DATA.SVS_RATES.enhancementXP)).toLocaleString() + ' pts</div>' +
            '<div style="font-size:8px;color:var(--t2);margin-top:2px;">(Mithril & Enhancement XP only)</div>' +
            '</div>';
        upgList.appendChild(tSum);
    }

    // -- App Init --
    function renderTabs() {
        var btns = document.querySelectorAll('.tab-btn');
        var panes = document.querySelectorAll('.tab-pane');
        for (var i = 0; i < btns.length; i++) {
            if (btns[i].dataset.tab === state.activeTab) {
                btns[i].classList.add('active');
            } else {
                btns[i].classList.remove('active');
            }
        }
        for (var i = 0; i < panes.length; i++) {
            if (panes[i].id === 'tab-' + state.activeTab) {
                panes[i].classList.add('active');
            } else {
                panes[i].classList.remove('active');
            }
        }
    }

    function setupEventListeners() {
        var btns = document.querySelectorAll('.tab-btn');
        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener('click', function(e) {
                state.activeTab = e.target.dataset.tab;
                renderAll();
            });
        }

        var themeBtn = el('theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', toggleTheme);
        }
    }

    function renderAll() {
        renderTabs();
        if (state.activeTab === 'chief-gear') renderChiefGear();
        // Render tabs based on active state
        if (state.activeTab === 'charms') renderCharms();
        if (state.activeTab === 'hero-gear') renderHeroGear();
        if (state.activeTab === 'plan') renderPlan();
        if (state.activeTab === 'svs') renderSvS();
        if (state.activeTab === 'compare') renderCompare();
    }

    window.addEventListener('DOMContentLoaded', function() {
        setupEventListeners();
        renderAll();
    });

})();
