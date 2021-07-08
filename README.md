# pixi-heaven

[![Build](https://github.com/pixijs/pixi-heaven/workflows/Build/badge.svg)](https://github.com/pixijs/pixi-heaven/actions?query=workflow%3A%22Build%22) [![npm version](https://badge.fury.io/js/%40pixi%2Fpixi-heaven.svg)](https://badge.fury.io/js/%40pixi%2Fpixi-heaven)

This is heaven for sprites. Want to color them better? Wanna use advanced colors? Its all here!

Works with PixiJS v6

For v5 please see [v5.x branch](https://github.com/gameofbombs/pixi-heaven/tree/v5.x), npm version `0.2.3`
For v4 please see [v4.x branch](https://github.com/gameofbombs/pixi-heaven/tree/v4.x), npm version `0.1.21`

[Examples](https://pixijs.github.io/examples/#/plugin-heaven/invert.js)

Done:

* Advanced color modes
* Polygon packing
* Mesh with trimmed textures

### Migration

To use es6 modules in IDE, its better to have distinct class names. That's why `PIXI.heaven.Sprite` is now `SpriteH`, same with `SimpleMeshH` and `BitmapTextH`

### How to use

Just add `pixi-heaven.js` file in your build.

```js
import { SpriteH } from 'pixi-heaven';

var sprite = new SpriteH();
// good old sprite tint
sprite.color.setLight(0.5, 1.0, 0.5);

// dark tint - new feature
sprite.color.setDark(0.2, 0.2, 0.2);

// change single component, useful for tweening
sprite.color.darkG = 0.1;
```

Or convert PIXI sprite. In that case, make sure that you actually use heaven Sprite somewhere, or it'll be tree-shaken away.

```js
import { Sprite } from 'pixi.js';

var sprite = new Sprite(someTexture);

// pixi vanilla way, optional
sprite.tint = 0x80ff80;

// activate the plugin!
sprite.convertToHeaven();
```

Useful example: invert the colors

```js
sprite.color.setLight(0, 0, 0);
sprite.color.setDark(1, 1, 1);
```

Make whole sprite of one color:

```js
sprite.tint = 0xffaacc;
sprite.color.dark[0] = sprite.color.light[0];
sprite.color.dark[1] = sprite.color.light[1];
sprite.color.dark[2] = sprite.color.light[2];
//dont forget to invalidate, after you changed dark DIRECTLY
sprite.color.invalidate();
```

### Meshes

Heaven meshes `SimpleMeshH` can be used with trimmed textures.

Unfortunately, meshes cant be converted, you have to create mesh instead of `PIXI.SimpleMesh`

That adds extra shader switched, and disables batching, but it shows correct result!

To switch it off, set

```js
import {settings, CLAMP_OPTIONS} from 'pixi-heaven';
// Default, PixiJS vanilla mode
settings.MESH_CLAMP = heaven.CLAMP_OPTIONS.NEVER;
```

To always use the trimmed texture shader, set

```js
import {settings, CLAMP_OPTIONS} from 'pixi-heaven';
// Default, PixiJS vanilla mode
settings.MESH_CLAMP = CLAMP_OPTIONS.ALWAYS;
```

Mesh batching works the same way as in pixi.

```js
PIXI.Mesh.BATCHABLE_SIZE = 1000; // bigger meshes now are batched too!
PIXI.Mesh.BATCHABLE_SIZE = 1; // or not.
```

### How to use with spine

This plugin enables light-dark tint of spine >= `3.6`.

Mixin can be applied to any spine prototype class: SpineBase, Spine or your own extended class. Usually its applied to SpineBase.

Light-dark tint works like in sprites.

```js
import {SpineBase} from '@pixi-spine/base';
import {applySpineMixin} from 'pixi-heaven';

applySpineMixin(SpineBase.prototype);

spine = new Spine();
spine.color.setLight(0.5, 1.0, 0.5);
spine.color.setDark(0.2, 0.2, 0.2);
```

### batch ADD blending mode with NORMAL

This feature comes from unity spine runtime - ADD can be emulated by NORMAL with zero tint alpha.
It reduces number of batches and drawcalls.

```js
import {settings} from 'pixi-heaven';
settings.BLEND_ADD_UNITY = true;
```

### Animation

Thanks to @finscn, unlike pixiJS vanilla  `AnimatedSprite`, here animation is a component:

```js
import {AnimationState} from 'pixi-heaven';

new AnimationState(frames).bind(sprite);
sprite.animState.gotoAndStop(2);
```

It still uses `PIXI.Ticker.shared` if you dont specify `autoUpdate=false`.
It will be stopped and destroyed with the bound element.

### How to mask sprites with sprites

Plugin adds special renderer that has faster masks than just `sprite.mask`. It also works on heaven meshes.

```js
import {SpriteH} from 'pixi-heaven';

sprite = new SpriteH();
sprite.maskSprite = sprite2; //set it
sprite.pluginName = 'batchMasked'; //enable special plugin rendering
sprite2.renderable = false; //turn off rendering
```

Batching works with spine, just enable maskSprite in any sprite or mesh of spine instance,
all `pluginName`'s will be adjusted automagically.

Look at [Spine file](https://github.com/gameofbombs/pixi-heaven/blob/master/src/z_spine/Spine.ts) to see
how it actually works.

## Vanilla JS, UMD build

All pixiJS v6 plugins has special `umd` build suited for vanilla.
Navigate `pixi-heaven` npm package, take `dist/pixi-heaven.umd.js` file.

```html
<script src='lib/pixi.js'></script>
<script src='lib/pixi-heaven.umd.js'></script>
```

all classes can be accessed through `PIXI.heaven` package.

## Building

You will need to have [node][node] setup on your machine.

Then you can install dependencies and build:

```bash
npm i
npm run build
```

That will output the built distributables to `./dist`.

[node]:             https://nodejs.org/
[typescript]:       https://www.typescriptlang.org/
