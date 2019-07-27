# pixi-heaven

This is heaven for sprites. Want to color them better? Wanna use advanced colors? Its all here!

For v4 please see [v4.x branch](https://github.com/pixijs/pixi-spine/tree/v4.x) and use npm version `0.1.21`

[Examples](https://pixijs.github.io/examples/#/plugin-heaven/invert.js)  

Done:

* Advanced color modes
* Polygon packing
* Mesh with trimmed textures

### Be careful!

It can affect performance. 
Though what is performance, when you game looks like s@#$? 
Spawn fewer objects but make it prettier!

### Integration with pixi-spine

[pixi-spine](https://github.com/pixijs/pixi-spine) is optional, however it is **REQUIRED** by typescript definitions. 

Two ways:

1. `<///reference types="pixi-spine.d.ts"/>`
2. Use `pixi-spine.d.ts` file from `stubs` folder.

In any case, put both `pixi.js` and `pixi-spine.js` before you include heaven in your build.

### How to use

Just add `pixi-heaven.js` file in your build. 

```js
var sprite = new PIXI.heaven.Sprite();
// good old sprite tint
sprite.color.setLight(0.5, 1.0, 0.5);

// dark tint - new feature
sprite.color.setDark(0.2, 0.2, 0.2);

// change single component, useful for tweening
sprite.color.darkG = 0.1;
```

Or convert PIXI sprite.

```js
var sprite = new PIXI.Sprite(someTexture);

// pixi vanilla way, optional
sprite.tint = 0x80ff80;

// activate the plugin!
sprite.convertToHeaven();
```

Note that if you are using TS, sprite type will be changed

```ts
let coloredSprite : PIXI.heaven.Sprite = sprite.convertColors();
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

Heaven meshes `PIXI.heaven.SimpleMesh` can be used with trimmed textures.

Unfortunately, meshes cant be converted, you have to create mesh instead of `PIXI.SimpleMesh`

That adds extra shader switched, and disables batching, but it shows correct result!

To switch it off, set 

```js
// Default, PixiJS vanilla mode
PIXI.heaven.settings.MESH_CLAMP = PIXI.heaven.CLAMP_OPTIONS.NEVER;
```

To always use the trimmed texture shader, set 

```js
// Default, PixiJS vanilla mode
PIXI.heaven.settings.MESH_CLAMP = PIXI.heaven.CLAMP_OPTIONS.ALWAYS;
```

Mesh batching works the same way as in pixi.

```js
PIXI.Mesh.BATCHABLE_SIZE = 1000; // bigger meshes now are batched too!
PIXI.Mesh.BATCHABLE_SIZE = 1; // or not.
```

### How to use with spine

This plugin enables light-dark tint of spine 3.6.

Light-dark tint works like in sprites.

```js
spine = new PIXI.heaven.Spine();
spine.color.setLight(0.5, 1.0, 0.5);
spine.color.setDark(0.2, 0.2, 0.2);
```

### Animation

Thanks to @finscn, unlike pixiJS vanilla  `AnimatedSprite`, here animation is a component:

```js
new PIXI.heaven.AnimationState(frames).bind(sprite);
sprite.animState.gotoAndStop(2);
```

It still uses `PIXI.ticker.shared` if you dont specify `autoUpdate=false`. 
It will be stopped and destroyed with the bound element.

## WebPack and angular

Possible webpack way: 

```js
import * as PIXI from "pixi.js';
window.PIXI = PIXI;
import "pixi-spine";
import "pixi-heaven";
```

Angular:

```ts
import * as PIXI from "pixi.js";
global.PIXI = PIXI;
require("pixi-spine");
require("pixi-projection");
```

## Building

You will need to have [node][node] setup on your machine.

Make sure you have [yarn][yarn] installed:

    npm install -g yarn

Then you can install dependencies and build:

```bash
yarn
yarn build
```

That will output the built distributables to `./dist`.

[node]:             https://nodejs.org/
[typescript]:       https://www.typescriptlang.org/
[yarn]:             https://yarnpkg.com
