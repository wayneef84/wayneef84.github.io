// Strict ES5 Syntax for WOS Upgrade Planner Data

var WOS_DATA = {
    DEFAULT_MATERIALS: {
        charmGuides: 3992, charmDesigns: 6203, jewelSecrets: 0,
        designPlans: 3581, polishingSolution: 8696, hardenedAlloy: 838847, lunarAmber: 0,
        mithril: 70, essenceStones: 812, mythicHeroGear: 36,
        enhancementXP100: 470, enhancementXP10: 1,
        luckyHeroGearChests: 2012, chiefGearMaterialChests: 2061, gearBoostCustomChests: 50,
        booksOfKnowledge: 105610, fireCrystals: 6702, fireCrystalShards: 16190,
        diamonds: 967964, mythicGeneralShards: 1147,
        advancedWildMarks: 144, commonWildMarks: 205, tamingManual: 653, energizingPotion: 99,
        mysteryBadge: 3771, s4Widgets: 127
    },

    DEFAULT_CHIEF_GEAR: {
        Chest: { tier: "Pink T1", stars: 3, troop: "Infantry" },
        Legs: { tier: "Pink T1", stars: 3, troop: "Infantry" },
        Ring: { tier: "Pink T1", stars: 1, troop: "Marksman" },
        Offhand: { tier: "Pink T1", stars: 0, troop: "Marksman" },
        Helm: { tier: "Pink T1", stars: 0, troop: "Lancer" },
        Neck: { tier: "Pink T1", stars: 0, troop: "Lancer" }
    },

    DEFAULT_CHARMS: {
        Chest_1: "6.3", Chest_2: "6.3", Chest_3: "6.3",
        Legs_1: "10.3", Legs_2: "7.3", Legs_3: "6.3",
        Ring_1: "5.3", Ring_2: "5.3", Ring_3: "5.3",
        Offhand_1: "9.3", Offhand_2: "9.3", Offhand_3: "8.3",
        Helm_1: "5.3", Helm_2: "5.3", Helm_3: "5.3",
        Neck_1: "8.3", Neck_2: "6.3", Neck_3: "5.3"
    },

    DEFAULT_HERO_GEAR: {
        Infantry_Goggles: { level: "E12", forge: 11 },
        Infantry_Gloves: { level: "E100", forge: 15 },
        Infantry_Belt: { level: "E79", forge: 15 },
        Infantry_Boots: { level: "E20", forge: 11 },
        Marksman_Goggles: { level: "E39", forge: 12 },
        Marksman_Boots: { level: "E59", forge: 13 },
        Marksman_Gloves: { level: "M100", forge: 5 },
        Marksman_Belt: { level: "M100", forge: 10 },
        Lancer_Goggles: { level: "E39", forge: 12 },
        Lancer_Boots: { level: "E59", forge: 13 },
        Lancer_Gloves: { level: "M100", forge: 5 },
        Lancer_Belt: { level: "M100", forge: 10 }
    },

    DEFAULT_SPEEDUPS: {
        general: 247224, troopTraining: 61693, construction: 84737,
        research: 34423, learning: 9915, troopHealing: 84760
    },

    SVS_RATES: {
        charmScore: 70, // pts per charm score point
        mithril: 144000,
        enhancementXP: 36,
        speedups: 30, // per minute
        fireCrystalsBuilding: 2000,
        fireCrystalsResearch: 1000,
        fireCrystalShards: 1000,
        mythicHeroShards: 3040,
        advancedWildMarks: 5000,
        commonWildMarks: 1000,
        luckyWheelSpins: 8000
    },

    // Chief Gear Cost Table
    CHIEF_GEAR_COSTS: [
        { tier: "Green", stars: 0, alloy: 1500, polish: 15, plans: 0, amber: 0, power: 224400 },
        { tier: "Green", stars: 1, alloy: 3800, polish: 40, plans: 0, amber: 0, power: 306000 },
        { tier: "Blue", stars: 0, alloy: 7000, polish: 70, plans: 0, amber: 0, power: 408000 },
        { tier: "Blue", stars: 1, alloy: 9700, polish: 95, plans: 0, amber: 0, power: 510000 },
        { tier: "Blue", stars: 2, alloy: 0, polish: 0, plans: 45, amber: 0, power: 612000 },
        { tier: "Blue", stars: 3, alloy: 0, polish: 0, plans: 50, amber: 0, power: 714000 },
        { tier: "Purple", stars: 0, alloy: 0, polish: 0, plans: 60, amber: 0, power: 816000 },
        { tier: "Purple", stars: 1, alloy: 0, polish: 0, plans: 70, amber: 0, power: 885360 },
        { tier: "Purple", stars: 2, alloy: 6500, polish: 65, plans: 40, amber: 0, power: 954720 },
        { tier: "Purple", stars: 3, alloy: 8000, polish: 80, plans: 50, amber: 0, power: 1024080 },
        { tier: "Purple T1", stars: 0, alloy: 10000, polish: 95, plans: 60, amber: 0, power: 1093440 },
        { tier: "Purple T1", stars: 1, alloy: 11000, polish: 110, plans: 70, amber: 0, power: 1162800 },
        { tier: "Purple T1", stars: 2, alloy: 13000, polish: 130, plans: 85, amber: 0, power: 1232160 },
        { tier: "Purple T1", stars: 3, alloy: 15000, polish: 160, plans: 100, amber: 0, power: 1301520 },
        { tier: "Gold", stars: 0, alloy: 22000, polish: 220, plans: 40, amber: 0, power: 1362720 },
        { tier: "Gold", stars: 1, alloy: 23000, polish: 230, plans: 40, amber: 0, power: 1423920 },
        { tier: "Gold", stars: 2, alloy: 25000, polish: 250, plans: 45, amber: 0, power: 1485120 },
        { tier: "Gold", stars: 3, alloy: 26000, polish: 260, plans: 45, amber: 0, power: 1546320 },
        { tier: "Gold T1", stars: 0, alloy: 28000, polish: 280, plans: 45, amber: 0, power: 1607520 },
        { tier: "Gold T1", stars: 1, alloy: 30000, polish: 300, plans: 55, amber: 0, power: 1668720 },
        { tier: "Gold T1", stars: 2, alloy: 32000, polish: 320, plans: 55, amber: 0, power: 1729920 },
        { tier: "Gold T1", stars: 3, alloy: 35000, polish: 340, plans: 55, amber: 0, power: 1791120 },
        { tier: "Gold T2", stars: 0, alloy: 38000, polish: 390, plans: 55, amber: 0, power: 1852320 },
        { tier: "Gold T2", stars: 1, alloy: 43000, polish: 430, plans: 75, amber: 0, power: 1913520 },
        { tier: "Gold T2", stars: 2, alloy: 45000, polish: 460, plans: 80, amber: 0, power: 1974720 },
        { tier: "Gold T2", stars: 3, alloy: 48000, polish: 500, plans: 85, amber: 0, power: 2040000 },
        { tier: "Pink", stars: 0, alloy: 50000, polish: 530, plans: 85, amber: 10, power: 2142000 },
        { tier: "Pink", stars: 1, alloy: 52000, polish: 560, plans: 90, amber: 10, power: 2244000 },
        { tier: "Pink", stars: 2, alloy: 54000, polish: 590, plans: 95, amber: 10, power: 2346000 },
        { tier: "Pink", stars: 3, alloy: 56000, polish: 620, plans: 100, amber: 10, power: 2448000 },
        { tier: "Pink T1", stars: 0, alloy: 59000, polish: 670, plans: 110, amber: 15, power: 2550000 },
        { tier: "Pink T1", stars: 1, alloy: 61000, polish: 700, plans: 115, amber: 15, power: 2652000 },
        { tier: "Pink T1", stars: 2, alloy: 63000, polish: 730, plans: 120, amber: 15, power: 2754000 },
        { tier: "Pink T1", stars: 3, alloy: 65000, polish: 760, plans: 125, amber: 15, power: 2856000 },
        { tier: "Pink T2", stars: 0, alloy: 68000, polish: 810, plans: 135, amber: 20, power: 2958000 },
        { tier: "Pink T2", stars: 1, alloy: 70000, polish: 840, plans: 140, amber: 20, power: 3060000 },
        { tier: "Pink T2", stars: 2, alloy: 72000, polish: 870, plans: 145, amber: 20, power: 3162000 },
        { tier: "Pink T2", stars: 3, alloy: 74000, polish: 900, plans: 150, amber: 20, power: 3264000 },
        { tier: "Pink T3", stars: 0, alloy: 77000, polish: 950, plans: 160, amber: 25, power: 3366000 },
        { tier: "Pink T3", stars: 1, alloy: 80000, polish: 990, plans: 165, amber: 25, power: 3468000 },
        { tier: "Pink T3", stars: 2, alloy: 83000, polish: 1030, plans: 170, amber: 25, power: 3570000 },
        { tier: "Pink T3", stars: 3, alloy: 86000, polish: 1070, plans: 180, amber: 25, power: 3672000 }
    ],

    // Charm Data
    CLV: [
        "1","2","3","4","4.1","4.2","4.3","5","5.1","5.2","5.3","6",
        "6.1","6.2","6.3","7","7.1","7.2","7.3","8","8.1","8.2","8.3","9",
        "9.1","9.2","9.3","10","10.1","10.2","10.3","11","11.1","11.2","11.3","12",
        "12.1","12.2","12.3","13","13.1","13.2","13.3","14","14.1","14.2","14.3","15",
        "15.1","15.2","15.3","16"
    ],

    CD: {
        "1":{g:5,d:5,j:0,s:9},"2":{g:40,d:15,j:0,s:12},"3":{g:60,d:40,j:0,s:16},
        "4":{g:80,d:100,j:0,s:19},"4.1":{g:25,d:50,j:0,s:20.5},"4.2":{g:25,d:50,j:0,s:22},
        "4.3":{g:25,d:50,j:0,s:23.5},"5":{g:25,d:50,j:0,s:25},"5.1":{g:30,d:75,j:0,s:26.25},
        "5.2":{g:30,d:75,j:0,s:27.5},"5.3":{g:30,d:75,j:0,s:28.75},"6":{g:30,d:75,j:0,s:30},
        "6.1":{g:35,d:100,j:0,s:31.25},"6.2":{g:35,d:100,j:0,s:32.5},"6.3":{g:35,d:100,j:0,s:33.75},
        "7":{g:35,d:100,j:0,s:35},"7.1":{g:50,d:100,j:0,s:36.25},"7.2":{g:50,d:100,j:0,s:37.5},
        "7.3":{g:50,d:100,j:0,s:38.75},"8":{g:50,d:100,j:0,s:40},"8.1":{g:75,d:100,j:0,s:41.25},
        "8.2":{g:75,d:100,j:0,s:42.5},"8.3":{g:75,d:100,j:0,s:43.75},"9":{g:75,d:100,j:0,s:45},
        "9.1":{g:105,d:105,j:0,s:46.25},"9.2":{g:105,d:105,j:0,s:47.5},"9.3":{g:105,d:105,j:0,s:48.75},
        "10":{g:105,d:105,j:0,s:50},"10.1":{g:140,d:105,j:0,s:51.25},"10.2":{g:140,d:105,j:0,s:52.5},
        "10.3":{g:140,d:105,j:0,s:53.75},"11":{g:140,d:105,j:0,s:55},
        "11.1":{g:145,d:113,j:4,s:57.25},"11.2":{g:145,d:113,j:4,s:59.5},
        "11.3":{g:145,d:112,j:4,s:61.75},"12":{g:145,d:112,j:3,s:64},
        "12.1":{g:145,d:113,j:8,s:66.25},"12.2":{g:145,d:113,j:8,s:68.5},
        "12.3":{g:145,d:112,j:7,s:70.75},"13":{g:145,d:112,j:7,s:73},
        "13.1":{g:150,d:125,j:12,s:75.25},"13.2":{g:150,d:125,j:11,s:77.5},
        "13.3":{g:150,d:125,j:11,s:79.75},"14":{g:150,d:125,j:11,s:82},
        "14.1":{g:150,d:125,j:18,s:84.25},"14.2":{g:150,d:125,j:18,s:86.5},
        "14.3":{g:150,d:125,j:17,s:88.75},"15":{g:150,d:125,j:17,s:91},
        "15.1":{g:163,d:138,j:25,s:93.25},"15.2":{g:163,d:138,j:25,s:95.5},
        "15.3":{g:162,d:137,j:25,s:97.75},"16":{g:162,d:137,j:25,s:100}
    },

    // Hero Gear Data
    EMP_GATES: [
        { e: 20, mi: 10, mg: 3 }, { e: 40, mi: 20, mg: 5 }, { e: 60, mi: 30, mg: 5 },
        { e: 80, mi: 40, mg: 10 }, { e: 100, mi: 50, mg: 10 }
    ],

    GOLD_XP: {},
    EMP_XP: {}
};

// Populate GOLD_XP
(function() {
    var i;
    for (i = 1; i <= 20; i++) WOS_DATA.GOLD_XP[i] = 10;
    var v21 = [110,115,120,125,130,135,140,145,150,160,170,180,190,200,210,220,230,240,250,270];
    for (i = 0; i < 20; i++) WOS_DATA.GOLD_XP[21 + i] = v21[i];
    var v41 = [290,310,330,350,370,390,410,430,450,470,490,510,530,550,570,590,610,630,650,680];
    for (i = 0; i < 20; i++) WOS_DATA.GOLD_XP[41 + i] = v41[i];
    var v61 = [710,740,770,800,830,860,890,920,950,990,1030,1070,1110,1150,1190,1230,1270,1310,1350,1400];
    for (i = 0; i < 20; i++) WOS_DATA.GOLD_XP[61 + i] = v61[i];
    var v81 = [1450,1500,1550,1600,1650,1700,1750,1800,1850,1910,1950,2000,2050,2100,2150,2200,2250,2300,2350,2400];
    for (i = 0; i < 20; i++) WOS_DATA.GOLD_XP[81 + i] = v81[i];
})();

// Populate EMP_XP
(function() {
    var i;
    WOS_DATA.EMP_XP[1] = 0;
    for (i = 2; i <= 19; i++) WOS_DATA.EMP_XP[i] = 2500 + (i - 2) * 50;
    WOS_DATA.EMP_XP[20] = 0;
    for (i = 21; i <= 39; i++) WOS_DATA.EMP_XP[i] = 3500 + (i - 21) * 50;
    WOS_DATA.EMP_XP[40] = 0;
    for (i = 41; i <= 59; i++) WOS_DATA.EMP_XP[i] = 4450 + (i - 41) * 50;
    WOS_DATA.EMP_XP[60] = 0;
    for (i = 61; i <= 79; i++) WOS_DATA.EMP_XP[i] = 5500 + (i - 61) * 100;
    WOS_DATA.EMP_XP[80] = 0;
    for (i = 81; i <= 99; i++) WOS_DATA.EMP_XP[i] = 7500 + (i - 81) * 100;
    WOS_DATA.EMP_XP[100] = 0;
})();

WOS_DATA.HL = [];
(function() {
    for (var i = 1; i <= 100; i++) WOS_DATA.HL.push("M" + i);
    for (var i = 0; i <= 100; i++) WOS_DATA.HL.push("E" + i);
})();

WOS_DATA.CTIERS = ["Green","Blue","Purple","Gold","Red T1","Red T2","Red T3","Red T4","Pink T1","Pink T2","Pink T3","Pink T4"];
WOS_DATA.SLOTS = [
    { slot:"Chest", icon:"🧥", troop:"Infantry" },
    { slot:"Legs", icon:"👖", troop:"Infantry" },
    { slot:"Ring", icon:"💍", troop:"Marksman" },
    { slot:"Offhand", icon:"🦯", troop:"Marksman" },
    { slot:"Helm", icon:"⛑️", troop:"Lancer" },
    { slot:"Neck", icon:"⌚", troop:"Lancer" }
];
WOS_DATA.TROOPS = ["Infantry","Marksman","Lancer"];
WOS_DATA.TI = { Infantry:"🛡️", Marksman:"🏹", Lancer:"🗡️" };
WOS_DATA.PCS = ["Goggles","Gloves","Belt","Boots"];
