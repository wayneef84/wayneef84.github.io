import Engine from './core/Engine.js';
import Scene from './core/Scene.js';
import InputManager from './input/InputManager.js';
import AudioManager from './audio/AudioManager.js';
import CanvasRenderer from './graphics/CanvasRenderer.js';
import AssetLoader from './assets/AssetLoader.js';
import MathUtils from './utils/MathUtils.js';
import Physics from './utils/Physics.js';
import Timer from './utils/Timer.js';

export default {
    Engine,
    Scene,
    InputManager,
    AudioManager,
    CanvasRenderer,
    AssetLoader,
    Utils: {
        Math: MathUtils,
        Physics,
        Timer
    }
};
