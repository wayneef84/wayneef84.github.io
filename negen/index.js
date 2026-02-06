import Engine from './core/Engine.js';
import Scene from './core/Scene.js';
import Entity from './core/Entity.js';
import InputManager from './input/InputManager.js';
import AudioManager from './audio/AudioManager.js';
import CanvasRenderer from './graphics/CanvasRenderer.js';
import ParticleSystem from './graphics/ParticleSystem.js';
import AssetLoader from './assets/AssetLoader.js';
import MathUtils from './utils/MathUtils.js';
import Physics from './utils/Physics.js';
import Timer from './utils/Timer.js';

export default {
    Engine,
    Scene,
    Entity,
    InputManager,
    AudioManager,
    CanvasRenderer,
    ParticleSystem,
    AssetLoader,
    Utils: {
        Math: MathUtils,
        Physics,
        Timer
    }
};
