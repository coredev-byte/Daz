import { EventBus } from './core/events.js';
import { Loop } from './engine/loop.js';
import { Input } from './engine/input.js';
import { Renderer } from './engine/renderer.js';
import { Camera } from './engine/camera.js';
import { Assets } from './engine/assets.js';
import { Scenes } from './engine/scenes.js';
import { Debug } from './engine/debug.js';
import { palette } from '../assets/palette/test.js';
import { tileDefs } from '../assets/tiles/ground.js';
import { BootScene } from './scenes/boot.js';
import { LabScene } from './scenes/lab.js';
import { TestScene } from './scenes/test.js';
import { Sprites } from './engine/sprites.js';
import { hero } from '../assets/characters/hero/index.js';

// Raiz de composição: único lugar que conhece todos os módulos e os liga.
const canvas = document.getElementById('game');
const c = { bus: new EventBus(), renderer: new Renderer(canvas), input: new Input(canvas), camera: new Camera(), assets: new Assets(palette) };
for (const [id, def] of Object.entries(tileDefs)) c.assets.define(id, 'boot', def);
c.scenes = new Scenes(c);
c.family = hero; c.sprites = new Sprites(hero);
c.go = { lab: () => c.scenes.replace(new LabScene()), map: () => c.scenes.replace(new TestScene()) };
c.loop = new Loop({
  update: (dt, tick) => { c.scenes.update(dt, tick); c.bus.flush(); c.input.endTick(); },
  render: alpha => {
    c.debug.update(c.input);
    c.renderer.frame(ctx => { c.scenes.draw(c.renderer, alpha); c.debug.draw(ctx); });
    c.debug.text(); c.input.endFrame();
  },
});
c.debug = new Debug(c.loop);
c.debug.add('FPS', () => c.loop.fps.toFixed(0));
c.debug.add('tick', () => c.loop.tick);
c.debug.add('tela', () => `${c.renderer.scale}x · ${c.renderer.w}×${c.renderer.h}`);
c.debug.add('cena', () => c.scenes.top?.constructor.name);
canvas.addEventListener('pointerdown', e => { if (e.clientX < 56 && e.clientY < 56) c.debug.on = !c.debug.on; });
c.scenes.push(new BootScene());
c.loop.start();
