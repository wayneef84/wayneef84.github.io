document.addEventListener('DOMContentLoaded', () => {
    console.log("Project TI-tanium: System Ready");

    const simEngine = new SimEngine('screen');
    const emuAdapter = new EmuAdapter();
    const uiManager = new UIManager(simEngine, emuAdapter);

    simEngine.init();
    uiManager.init();

    // Expose for debugging
    window.tiTanium = { simEngine, emuAdapter, uiManager };
});
